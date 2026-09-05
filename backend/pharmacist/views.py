from datetime import timedelta
from decimal import Decimal
from uuid import uuid4

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

        medicines = (
            Medicine.objects
            .all()
            .order_by("name")
        )

        serializer = MedicineSerializer(
            medicines,
            many=True
        )

        return Response(
            serializer.data
        )


# ============================================================
# MEDICINE STOCK UPDATE
# PATCH /pharmacist/medicines/<id>/stock/
#
# Pharmacist can update only:
# - stock quantity
# - batch number
# - expiry date
# ============================================================

class MedicineStockUpdateView(APIView):

    permission_classes = [IsPharmacist]

    def patch(self, request, pk):

        try:

            medicine = Medicine.objects.get(
                pk=pk
            )

        except Medicine.DoesNotExist:

            return Response(
                {
                    "error": "Medicine not found."
                },
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
                MedicineSerializer(
                    medicine
                ).data,
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

        patients = (
            Patient.objects
            .all()
            .order_by("name")
        )

        data = []

        for patient in patients:

            data.append(
                {
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
                }
            )

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
                patient_id=patient_id
            )

        except Patient.DoesNotExist:

            return Response(
                {
                    "error": "Patient not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        appointments = (
            Appointment.objects
            .select_related(
                "patient",
                "doctor"
            )
            .filter(
                patient=patient
            )
            .order_by(
                "-appointment_date",
                "-appointment_time"
            )
        )

        data = []

        for appointment in appointments:

            data.append(
                {
                    "id": appointment.id,

                    "patient":
                        appointment.patient.id,

                    "patient_id":
                        appointment.patient.patient_id,

                    "patient_name":
                        appointment.patient.name,

                    "appointment_date":
                        appointment.appointment_date,

                    "appointment_time":
                        appointment.appointment_time,

                    "doctor":
                        appointment.doctor.id,

                    "doctor_id":
                        appointment.doctor.doctor_id,

                    "doctor_name":
                        appointment.doctor.name,

                    "appointment_type":
                        appointment.appointment_type,

                    "token_no":
                        appointment.token_no,

                    "status":
                        appointment.status,
                }
            )

        return Response(data)


# ============================================================
# APPOINTMENT PRESCRIPTIONS
# GET /pharmacist/appointments/<appointment_id>/prescriptions/
#
# Returns:
# - prescription details
# - is_dispensed
# - dispensing_status
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
                {
                    "error": "Appointment not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        prescriptions = (
            MedicinePrescription.objects
            .select_related(
                "consultation",
                "consultation__patient",
                "consultation__appointment",
                "medicine",
            )
            .filter(
                consultation__appointment=appointment
            )
            .order_by(
                "-created_at"
            )
        )

        serializer = MedicinePrescriptionSerializer(
            prescriptions,
            many=True
        )

        data = serializer.data

        # ----------------------------------------------------
        # ADD DISPENSING STATUS
        # ----------------------------------------------------

        for item in data:

            is_dispensed = (
                MedicineDispensing.objects
                .filter(
                    prescription_id=item["id"]
                )
                .exists()
            )

            item["is_dispensed"] = is_dispensed

            item["dispensing_status"] = (
                "DISPENSED"
                if is_dispensed
                else "PENDING"
            )

        return Response(data)


# ============================================================
# MEDICINE DISPENSING
#
# GET  /pharmacist/dispense/
# POST /pharmacist/dispense/
#
# Pharmacist sends:
#
# {
#     "prescription": 1,
#     "quantity": 5
# }
#
# Backend automatically gets:
# - patient
# - appointment
# - medicine
# - unit price
# - total price
# - dispensing ID
#
# After successful dispensing:
# - stock is reduced
# - dispensing record is created
# - bill is created/updated
# - prescription becomes DISPENSED
# ============================================================

class MedicineDispensingListCreateView(APIView):

    permission_classes = [IsPharmacist]

    # ========================================================
    # GET DISPENSING HISTORY
    # ========================================================

    def get(self, request):

        dispensings = (
            MedicineDispensing.objects
            .select_related(
                "patient",
                "appointment",
                "prescription",
                "medicine",
            )
            .all()
            .order_by(
                "-dispensed_at"
            )
        )

        serializer = MedicineDispensingSerializer(
            dispensings,
            many=True
        )

        return Response(
            serializer.data
        )

    # ========================================================
    # CREATE DISPENSING
    # ========================================================

    @transaction.atomic
    def post(self, request):

        # ----------------------------------------------------
        # VALIDATE REQUEST
        # ----------------------------------------------------

        serializer = MedicineDispensingSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        prescription = (
            serializer.validated_data.get(
                "prescription"
            )
        )

        quantity = (
            serializer.validated_data.get(
                "quantity"
            )
        )

        # ----------------------------------------------------
        # VALIDATE PRESCRIPTION
        # ----------------------------------------------------

        if not prescription:

            return Response(
                {
                    "error":
                        "Prescription is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # VALIDATE QUANTITY
        # ----------------------------------------------------

        if not quantity or quantity < 1:

            return Response(
                {
                    "error":
                        "Quantity must be at least 1."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # GET ACTUAL PRESCRIPTION
        # ----------------------------------------------------

        try:

            prescription = (
                MedicinePrescription.objects
                .select_related(
                    "consultation",
                    "consultation__patient",
                    "consultation__appointment",
                    "medicine",
                )
                .get(
                    pk=prescription.id
                )
            )

        except MedicinePrescription.DoesNotExist:

            return Response(
                {
                    "error":
                        "Prescription not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # CHECK IF ALREADY DISPENSED
        # ----------------------------------------------------

        already_dispensed = (
            MedicineDispensing.objects
            .filter(
                prescription=prescription
            )
            .exists()
        )

        if already_dispensed:

            return Response(
                {
                    "error":
                        "This prescription has already been dispensed.",

                    "status":
                        "DISPENSED",
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # GET PATIENT
        # ----------------------------------------------------

        patient = (
            prescription
            .consultation
            .patient
        )

        # ----------------------------------------------------
        # GET APPOINTMENT
        # ----------------------------------------------------

        appointment = (
            prescription
            .consultation
            .appointment
        )

        # ----------------------------------------------------
        # GET MEDICINE WITH ROW LOCK
        # ----------------------------------------------------

        try:

            medicine = (
                Medicine.objects
                .select_for_update()
                .get(
                    pk=prescription.medicine.id
                )
            )

        except Medicine.DoesNotExist:

            return Response(
                {
                    "error":
                        "Medicine not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # CHECK DUPLICATE AGAIN
        # ----------------------------------------------------

        if (
            MedicineDispensing.objects
            .filter(
                prescription=prescription
            )
            .exists()
        ):

            return Response(
                {
                    "error":
                        "This prescription has already been dispensed.",

                    "status":
                        "DISPENSED",
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # CHECK EXISTING BILL BEFORE CHANGING STOCK
        # ----------------------------------------------------

        existing_bill = (
            MedicineBill.objects
            .filter(
                patient=patient,
                appointment=appointment
            )
            .first()
        )

        if (
            existing_bill and
            existing_bill.payment_status == "PAID"
        ):

            return Response(
                {
                    "error":
                        "This appointment already has a paid medicine bill."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # CHECK STOCK
        # ----------------------------------------------------

        if medicine.stock_quantity < quantity:

            return Response(
                {
                    "error":
                        "Insufficient stock.",

                    "available_stock":
                        medicine.stock_quantity,

                    "requested_quantity":
                        quantity,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # CALCULATE PRICE
        # ----------------------------------------------------

        unit_price = (
            medicine.price_per_unit
        )

        total_price = (
            Decimal(quantity) *
            unit_price
        )

        # ----------------------------------------------------
        # REDUCE STOCK
        # ----------------------------------------------------

        medicine.stock_quantity -= quantity

        medicine.save(
            update_fields=[
                "stock_quantity"
            ]
        )

        # ----------------------------------------------------
        # CREATE DISPENSING RECORD
        # ----------------------------------------------------

        dispensing_id = (
            f"DISP-{uuid4().hex[:10].upper()}"
        )

        dispensing = (
            MedicineDispensing.objects.create(
                dispensing_id=dispensing_id,

                patient=patient,

                appointment=appointment,

                prescription=prescription,

                medicine=medicine,

                quantity=quantity,

                unit_price=unit_price,

                total_price=total_price,
            )
        )

        # ----------------------------------------------------
        # GET ALL DISPENSINGS FOR THIS APPOINTMENT
        # ----------------------------------------------------

        dispensings = (
            MedicineDispensing.objects
            .filter(
                patient=patient,
                appointment=appointment
            )
        )

        # ----------------------------------------------------
        # CALCULATE COMPLETE BILL AMOUNT
        # ----------------------------------------------------

        total_amount = sum(
            (
                item.total_price
                for item in dispensings
            ),
            Decimal("0.00")
        )

        # ----------------------------------------------------
        # CREATE OR UPDATE BILL
        # ----------------------------------------------------

        if existing_bill:

            existing_bill.total_amount = (
                total_amount
            )

            existing_bill.save(
                update_fields=[
                    "total_amount"
                ]
            )

            bill = existing_bill

        else:

            bill = (
                MedicineBill.objects.create(
                    bill_id=(
                        f"BILL-{uuid4().hex[:10].upper()}"
                    ),

                    patient=patient,

                    appointment=appointment,

                    total_amount=total_amount,

                    payment_status="PENDING",
                )
            )

        # ----------------------------------------------------
        # RETURN SUCCESS
        # ----------------------------------------------------

        return Response(
            {
                "message":
                    "Medicine dispensed successfully.",

                "status":
                    "DISPENSED",

                "dispensing":
                    MedicineDispensingSerializer(
                        dispensing
                    ).data,

                "bill":
                    MedicineBillSerializer(
                        bill
                    ).data,
            },
            status=status.HTTP_201_CREATED
        )


# ============================================================
# DISPENSING HISTORY
# GET /pharmacist/dispensing/
# ============================================================

class MedicineDispensingHistoryView(APIView):

    permission_classes = [IsPharmacist]

    def get(self, request):

        dispensings = (
            MedicineDispensing.objects
            .select_related(
                "patient",
                "appointment",
                "prescription",
                "medicine",
            )
            .all()
            .order_by(
                "-dispensed_at"
            )
        )

        serializer = MedicineDispensingSerializer(
            dispensings,
            many=True
        )

        return Response(
            serializer.data
        )


# ============================================================
# MEDICINE BILL
#
# GET  /pharmacist/bills/
# POST /pharmacist/bills/
# ============================================================

class MedicineBillListCreateView(APIView):

    permission_classes = [IsPharmacist]

    # ========================================================
    # GET BILLS
    # ========================================================

    def get(self, request):

        bills = (
            MedicineBill.objects
            .select_related(
                "patient",
                "appointment",
            )
            .all()
            .order_by(
                "-created_at"
            )
        )

        serializer = MedicineBillSerializer(
            bills,
            many=True
        )

        return Response(
            serializer.data
        )

    # ========================================================
    # CREATE BILL
    #
    # Kept for compatibility with the existing API.
    #
    # Normally the dispense endpoint now creates the bill
    # automatically.
    # ========================================================

    @transaction.atomic
    def post(self, request):

        serializer = MedicineBillSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        patient = (
            serializer.validated_data[
                "patient"
            ]
        )

        appointment = (
            serializer.validated_data[
                "appointment"
            ]
        )

        # ----------------------------------------------------
        # CHECK EXISTING BILL
        # ----------------------------------------------------

        existing_bill = (
            MedicineBill.objects
            .filter(
                patient=patient,
                appointment=appointment
            )
            .first()
        )

        # ----------------------------------------------------
        # GET DISPENSING RECORDS
        # ----------------------------------------------------

        dispensings = (
            MedicineDispensing.objects
            .filter(
                patient=patient,
                appointment=appointment
            )
        )

        # ----------------------------------------------------
        # CALCULATE TOTAL
        # ----------------------------------------------------

        total_amount = sum(
            (
                dispensing.total_price
                for dispensing in dispensings
            ),
            Decimal("0.00")
        )

        # ----------------------------------------------------
        # CHECK DISPENSING
        # ----------------------------------------------------

        if total_amount == Decimal("0.00"):

            return Response(
                {
                    "error":
                        "No medicine dispensing records found for this patient and appointment."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # EXISTING BILL
        # ----------------------------------------------------

        if existing_bill:

            if (
                existing_bill.payment_status ==
                "PAID"
            ):

                return Response(
                    {
                        "error":
                            "Bill is already paid.",

                        "bill":
                            MedicineBillSerializer(
                                existing_bill
                            ).data,
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            existing_bill.total_amount = (
                total_amount
            )

            existing_bill.save(
                update_fields=[
                    "total_amount"
                ]
            )

            return Response(
                MedicineBillSerializer(
                    existing_bill
                ).data,
                status=status.HTTP_200_OK
            )

        # ----------------------------------------------------
        # CREATE NEW BILL
        # ----------------------------------------------------

        bill_id = (
            serializer.validated_data.get(
                "bill_id"
            )
        )

        if not bill_id:

            bill_id = (
                f"BILL-{uuid4().hex[:10].upper()}"
            )

        bill = (
            MedicineBill.objects.create(
                bill_id=bill_id,

                patient=patient,

                appointment=appointment,

                total_amount=total_amount,

                payment_status="PENDING",
            )
        )

        return Response(
            MedicineBillSerializer(
                bill
            ).data,
            status=status.HTTP_201_CREATED
        )


# ============================================================
# BILL PAYMENT
#
# PATCH /pharmacist/bills/<bill_id>/pay/
# ============================================================

class MedicineBillPaymentView(APIView):

    permission_classes = [IsPharmacist]

    def patch(self, request, bill_id):

        try:

            bill = MedicineBill.objects.get(
                bill_id=bill_id
            )

        except MedicineBill.DoesNotExist:

            return Response(
                {
                    "error":
                        "Bill not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # CHECK ALREADY PAID
        # ----------------------------------------------------

        if bill.payment_status == "PAID":

            return Response(
                {
                    "error":
                        "Bill is already paid."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # MARK AS PAID
        # ----------------------------------------------------

        bill.payment_status = "PAID"

        bill.save(
            update_fields=[
                "payment_status"
            ]
        )

        # ----------------------------------------------------
        # RETURN UPDATED BILL
        # ----------------------------------------------------

        return Response(
            MedicineBillSerializer(
                bill
            ).data,
            status=status.HTTP_200_OK
        )


# ============================================================
# SALES REPORT
#
# GET /pharmacist/reports/sales/
#
# ?period=daily
# ?period=weekly
# ?period=monthly
# ============================================================

class SalesReportView(APIView):

    permission_classes = [IsPharmacist]

    def get(self, request):

        period = (
            request.query_params
            .get(
                "period",
                "daily"
            )
            .lower()
        )

        now = timezone.now()

        # ----------------------------------------------------
        # DETERMINE REPORT PERIOD
        # ----------------------------------------------------

        if period == "daily":

            start_date = (
                now -
                timedelta(days=1)
            )

        elif period == "weekly":

            start_date = (
                now -
                timedelta(days=7)
            )

        elif period == "monthly":

            start_date = (
                now -
                timedelta(days=30)
            )

        else:

            return Response(
                {
                    "error":
                        "Invalid period. Use daily, weekly or monthly."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # GET DISPENSING RECORDS
        # ----------------------------------------------------

        dispensings = (
            MedicineDispensing.objects
            .select_related(
                "medicine",
                "patient",
                "appointment",
            )
            .filter(
                dispensed_at__gte=start_date
            )
            .order_by(
                "-dispensed_at"
            )
        )

        # ----------------------------------------------------
        # TOTAL SALES
        # ----------------------------------------------------

        total_sales = sum(
            (
                dispensing.total_price
                for dispensing in dispensings
            ),
            Decimal("0.00")
        )

        # ----------------------------------------------------
        # TOTAL ITEMS SOLD
        # ----------------------------------------------------

        total_items = sum(
            (
                dispensing.quantity
                for dispensing in dispensings
            ),
            0
        )

        # ----------------------------------------------------
        # BUILD REPORT RECORDS
        # ----------------------------------------------------

        data = []

        for dispensing in dispensings:

            data.append(
                {
                    "dispensing_id":
                        dispensing.dispensing_id,

                    "medicine":
                        dispensing.medicine.name,

                    "patient":
                        dispensing.patient.name,

                    "quantity":
                        dispensing.quantity,

                    "unit_price":
                        dispensing.unit_price,

                    "total_price":
                        dispensing.total_price,

                    "dispensed_at":
                        dispensing.dispensed_at,
                }
            )

        # ----------------------------------------------------
        # RETURN REPORT
        # ----------------------------------------------------

        return Response(
            {
                "period":
                    period,

                "start_date":
                    start_date,

                "end_date":
                    now,

                "total_sales":
                    total_sales,

                "total_items_sold":
                    total_items,

                "records":
                    data,
            }
        )