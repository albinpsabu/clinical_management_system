from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsPharmacist

from admin_panel.models import Medicine
from patients.models import Patient
from appointments.models import Appointment
from doctor.models import MedicinePrescription

from .models import (
    MedicineDispensing,
    MedicineBill,
)

from .serializers import (
    MedicineSerializer,
    MedicineStockUpdateSerializer,
    MedicinePrescriptionSerializer,
    MedicineDispensingSerializer,
    MedicineBillSerializer,
)


# ============================================================
# MEDICINE LIST
# GET /pharmacist/medicines/
# ============================================================

class MedicineListView(APIView):
    permission_classes = [IsPharmacist]

    def get(self, request):

        medicines = Medicine.objects.all().order_by("name")

        serializer = MedicineSerializer(
            medicines,
            many=True
        )

        return Response(serializer.data)


# ============================================================
# MEDICINE STOCK UPDATE
# PATCH /pharmacist/medicines/<id>/stock/
# ============================================================

class MedicineStockUpdateView(APIView):
    permission_classes = [IsPharmacist]

    def patch(self, request, pk):

        try:
            medicine = Medicine.objects.get(pk=pk)

        except Medicine.DoesNotExist:
            return Response(
                {"error": "Medicine not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MedicineStockUpdateSerializer(
            medicine,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                MedicineSerializer(medicine).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# PATIENT LIST
# GET /pharmacist/patients/
# ============================================================

class PatientListView(APIView):
    permission_classes = [IsPharmacist]

    def get(self, request):

        patients = Patient.objects.all().order_by("name")

        data = []

        for patient in patients:

            data.append({
                "id": patient.id,
                "patient_id": patient.patient_id,
                "name": patient.name,
                "dob": patient.dob,
                "gender": patient.gender,
                "age": patient.age,
                "address": patient.address,
                "phone": patient.phone,
                "blood_group": patient.blood_group,
                "status": patient.status,
            })

        return Response(data)


# ============================================================
# PATIENT APPOINTMENTS
# GET /pharmacist/patients/<patient_id>/appointments/
# ============================================================

class PatientAppointmentListView(APIView):
    permission_classes = [IsPharmacist]

    def get(self, request, patient_id):

        try:
            patient = Patient.objects.get(
                pk=patient_id
            )

        except Patient.DoesNotExist:
            return Response(
                {"error": "Patient not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        appointments = Appointment.objects.select_related(
            "doctor"
        ).filter(
            patient=patient
        ).order_by(
            "-appointment_date",
            "-appointment_time"
        )

        data = []

        for appointment in appointments:

            data.append({
                "id": appointment.id,
                "patient": appointment.patient.id,
                "appointment_date": appointment.appointment_date,
                "appointment_time": appointment.appointment_time,
                "doctor": appointment.doctor.id,
                "doctor_id": appointment.doctor.doctor_id,
                "doctor_name": appointment.doctor.name,
                "appointment_type": appointment.appointment_type,
                "token_no": appointment.token_no,
                "status": appointment.status,
            })

        return Response(data)


# ============================================================
# APPOINTMENT PRESCRIPTIONS
# GET /pharmacist/appointments/<appointment_id>/prescriptions/
# ============================================================

class AppointmentPrescriptionListView(APIView):
    permission_classes = [IsPharmacist]

    def get(self, request, appointment_id):

        try:
            appointment = Appointment.objects.get(
                pk=appointment_id
            )

        except Appointment.DoesNotExist:
            return Response(
                {"error": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        prescriptions = MedicinePrescription.objects.select_related(
            "consultation",
            "consultation__patient",
            "medicine",
        ).filter(
            consultation__appointment=appointment
        ).order_by(
            "-created_at"
        )

        serializer = MedicinePrescriptionSerializer(
            prescriptions,
            many=True
        )

        return Response(serializer.data)


# ============================================================
# DISPENSE MEDICINE
# POST /pharmacist/dispense/
# ============================================================

class MedicineDispensingListCreateView(APIView):
    permission_classes = [IsPharmacist]

    def get(self, request):

        dispensings = MedicineDispensing.objects.select_related(
            "patient",
            "appointment",
            "prescription",
            "medicine",
        ).all().order_by(
            "-dispensed_at"
        )

        serializer = MedicineDispensingSerializer(
            dispensings,
            many=True
        )

        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):

        serializer = MedicineDispensingSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        prescription = serializer.validated_data[
            "prescription"
        ]

        medicine = serializer.validated_data[
            "medicine"
        ]

        quantity = serializer.validated_data[
            "quantity"
        ]

        # ----------------------------------------------------
        # Get prescription
        # ----------------------------------------------------

        try:
            prescription = MedicinePrescription.objects.select_related(
                "consultation",
                "consultation__patient",
                "medicine",
            ).get(
                pk=prescription.id
            )

        except MedicinePrescription.DoesNotExist:
            return Response(
                {"error": "Prescription not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # Make sure selected medicine matches prescription
        # ----------------------------------------------------

        if prescription.medicine_id != medicine.id:

            return Response(
                {
                    "error": (
                        "Selected medicine does not match "
                        "the doctor's prescription."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # Get medicine and lock row
        # ----------------------------------------------------

        try:
            medicine = Medicine.objects.select_for_update().get(
                pk=medicine.id
            )

        except Medicine.DoesNotExist:
            return Response(
                {"error": "Medicine not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # Check stock
        # ----------------------------------------------------

        if medicine.stock_quantity < quantity:

            return Response(
                {
                    "error": "Insufficient stock.",
                    "available_stock": medicine.stock_quantity,
                    "requested_quantity": quantity,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # Get patient and appointment from consultation
        # ----------------------------------------------------

        patient = prescription.consultation.patient

        appointment = prescription.consultation.appointment

        # ----------------------------------------------------
        # Calculate price
        # ----------------------------------------------------

        unit_price = medicine.price_per_unit

        total_price = unit_price * quantity

        # ----------------------------------------------------
        # Reduce stock
        # ----------------------------------------------------

        medicine.stock_quantity -= quantity

        medicine.save(
            update_fields=["stock_quantity"]
        )

        # ----------------------------------------------------
        # Create dispensing record
        # ----------------------------------------------------

        dispensing = MedicineDispensing.objects.create(
            dispensing_id=serializer.validated_data[
                "dispensing_id"
            ],
            patient=patient,
            appointment=appointment,
            prescription=prescription,
            medicine=medicine,
            quantity=quantity,
            unit_price=unit_price,
            total_price=total_price,
        )

        return Response(
            MedicineDispensingSerializer(
                dispensing
            ).data,
            status=status.HTTP_201_CREATED
        )


# ============================================================
# MEDICINE BILL
# POST /pharmacist/bills/
# ============================================================

class MedicineBillListCreateView(APIView):
    permission_classes = [IsPharmacist]

    def get(self, request):

        bills = MedicineBill.objects.select_related(
            "patient",
            "appointment",
        ).all().order_by(
            "-created_at"
        )

        serializer = MedicineBillSerializer(
            bills,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = MedicineBillSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        patient = serializer.validated_data["patient"]

        appointment = serializer.validated_data["appointment"]

        # ----------------------------------------------------
        # Calculate total from dispensing records
        # ----------------------------------------------------

        dispensings = MedicineDispensing.objects.filter(
            patient=patient,
            appointment=appointment
        )

        total_amount = sum(
            dispensing.total_price
            for dispensing in dispensings
        )

        if total_amount == 0:

            return Response(
                {
                    "error": (
                        "No medicine dispensing records found "
                        "for this patient and appointment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # Create bill
        # ----------------------------------------------------

        bill = MedicineBill.objects.create(
            bill_id=serializer.validated_data["bill_id"],
            patient=patient,
            appointment=appointment,
            total_amount=total_amount,
            payment_status=serializer.validated_data.get(
                "payment_status",
                "PENDING"
            ),
        )

        return Response(
            MedicineBillSerializer(
                bill
            ).data,
            status=status.HTTP_201_CREATED
        )


# ============================================================
# SALES REPORT
# GET /pharmacist/reports/sales/
#
# ?period=daily
# ?period=weekly
# ?period=monthly
# ============================================================

class SalesReportView(APIView):
    permission_classes = [IsPharmacist]

    def get(self, request):

        period = request.query_params.get(
            "period",
            "daily"
        ).lower()

        now = timezone.now()

        if period == "daily":

            start_date = now - timedelta(days=1)

        elif period == "weekly":

            start_date = now - timedelta(days=7)

        elif period == "monthly":

            start_date = now - timedelta(days=30)

        else:

            return Response(
                {
                    "error": (
                        "Invalid period. Use daily, "
                        "weekly or monthly."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        dispensings = MedicineDispensing.objects.select_related(
            "medicine",
            "patient",
            "appointment",
        ).filter(
            dispensed_at__gte=start_date
        ).order_by(
            "-dispensed_at"
        )

        total_sales = sum(
            dispensing.total_price
            for dispensing in dispensings
        )

        total_items = sum(
            dispensing.quantity
            for dispensing in dispensings
        )

        data = []

        for dispensing in dispensings:

            data.append({
                "dispensing_id": dispensing.dispensing_id,
                "medicine": dispensing.medicine.name,
                "patient": dispensing.patient.name,
                "quantity": dispensing.quantity,
                "unit_price": dispensing.unit_price,
                "total_price": dispensing.total_price,
                "dispensed_at": dispensing.dispensed_at,
            })

        return Response({
            "period": period,
            "start_date": start_date,
            "end_date": now,
            "total_sales": total_sales,
            "total_items_sold": total_items,
            "records": data,
        })