from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsReceptionist

from patients.models import Patient
from appointments.models import Appointment

from .models import ConsultationBill
from .serializers import (
    PatientSerializer,
    AppointmentSerializer,
    ConsultationBillSerializer,
)


# ============================================================
# PATIENT LIST / CREATE
# ============================================================

class PatientListCreateView(APIView):
    permission_classes = [IsReceptionist]

    def get(self, request):
        patients = Patient.objects.all().order_by("-id")

        serializer = PatientSerializer(
            patients,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = PatientSerializer(
            data=request.data
        )

        if serializer.is_valid():

            phone = serializer.validated_data.get("phone")

            if Patient.objects.filter(phone=phone).exists():

                existing_patient = Patient.objects.get(
                    phone=phone
                )

                return Response(
                    {
                        "message": "Patient already exists",
                        "patient": PatientSerializer(
                            existing_patient
                        ).data,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            patient = serializer.save()

            return Response(
                PatientSerializer(patient).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# ============================================================
# PATIENT DETAILS
# ============================================================

class PatientDetailView(APIView):
    permission_classes = [IsReceptionist]

    def get(self, request, patient_id):

        try:
            patient = Patient.objects.get(
                patient_id=patient_id
            )

        except Patient.DoesNotExist:

            return Response(
                {"error": "Patient not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PatientSerializer(patient)

        return Response(serializer.data)


# ============================================================
# APPOINTMENT LIST / CREATE
# ============================================================

class AppointmentListCreateView(APIView):
    permission_classes = [IsReceptionist]

    def get(self, request):

        appointments = Appointment.objects.select_related(
            "patient",
            "doctor"
        ).all().order_by(
            "appointment_date",
            "appointment_time"
        )

        serializer = AppointmentSerializer(
            appointments,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = AppointmentSerializer(
            data=request.data
        )

        if serializer.is_valid():

            doctor = serializer.validated_data["doctor"]

            # Only active doctors can receive appointments
            if doctor.status != "Active":

                return Response(
                    {
                        "doctor": (
                            "Appointments can only be created "
                            "for active doctors."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            appointment = serializer.save()

            return Response(
                AppointmentSerializer(
                    appointment
                ).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# ============================================================
# CONSULTATION BILL LIST / CREATE
# ============================================================

class ConsultationBillListCreateView(APIView):
    permission_classes = [IsReceptionist]

    def get(self, request):

        bills = ConsultationBill.objects.select_related(
            "patient",
            "appointment"
        ).all().order_by(
            "-created_at"
        )

        serializer = ConsultationBillSerializer(
            bills,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = ConsultationBillSerializer(
            data=request.data
        )

        if serializer.is_valid():

            bill = serializer.save()

            return Response(
                ConsultationBillSerializer(
                    bill
                ).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# ============================================================
# PAYMENT COMPLETE
# ============================================================

class PaymentCompleteView(APIView):
    permission_classes = [IsReceptionist]

    def post(self, request, bill_id):

        try:
            bill = ConsultationBill.objects.get(
                bill_id=bill_id
            )

        except ConsultationBill.DoesNotExist:

            return Response(
                {"error": "Bill not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Prevent paying an already completed bill
        if bill.payment_status == "COMPLETED":

            return Response(
                {
                    "message": "Payment already completed",
                    "bill_id": bill.bill_id,
                    "payment_status": bill.payment_status,
                    "token_no": bill.appointment.token_no,
                },
                status=status.HTTP_200_OK,
            )

        bill.payment_status = "COMPLETED"
        bill.save(
            update_fields=["payment_status"]
        )

        # Token is generated only after payment
        appointment = bill.appointment

        if appointment.token_no is None:

            last_token = Appointment.objects.filter(
                appointment_date=appointment.appointment_date
            ).exclude(
                token_no=None
            ).order_by(
                "-token_no"
            ).first()

            if last_token:
                appointment.token_no = (
                    last_token.token_no + 1
                )
            else:
                appointment.token_no = 1

            appointment.save(
                update_fields=["token_no"]
            )

        return Response(
            {
                "message": "Payment completed",
                "bill_id": bill.bill_id,
                "payment_status": bill.payment_status,
                "token_no": appointment.token_no,
            },
            status=status.HTTP_200_OK,
        )