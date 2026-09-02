from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsDoctor

from admin_panel.models import Doctor
from appointments.models import Appointment
from patients.models import Patient

from .models import (
    Consultation,
    MedicinePrescription,
    LabPrescription,
)

from .serializers import (
    ConsultationSerializer,
    MedicinePrescriptionSerializer,
    LabPrescriptionSerializer,
)


# ============================================================
# DOCTOR - VIEW APPOINTMENTS
# ============================================================

class DoctorAppointmentListView(APIView):
    permission_classes = [IsDoctor]

    def get(self, request):

        try:
            doctor = Doctor.objects.get(
                user=request.user
            )

        except Doctor.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        appointments = Appointment.objects.select_related(
            "patient",
            "doctor"
        ).filter(
            doctor=doctor
        ).order_by(
            "appointment_date",
            "appointment_time"
        )

        data = []

        for appointment in appointments:
            data.append({
                "id": appointment.id,
                "patient": appointment.patient.id,
                "patient_id": appointment.patient.patient_id,
                "patient_name": appointment.patient.name,

                "doctor": appointment.doctor.id,
                "doctor_id": appointment.doctor.doctor_id,
                "doctor_name": appointment.doctor.name,

                "appointment_date": appointment.appointment_date,
                "appointment_time": appointment.appointment_time,
                "appointment_type": appointment.appointment_type,
                "token_no": appointment.token_no,
                "status": appointment.status,
            })

        return Response(data)


# ============================================================
# DOCTOR - VIEW PATIENT DETAILS
# ============================================================

class DoctorPatientDetailView(APIView):
    permission_classes = [IsDoctor]

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

        serializer = ConsultationSerializer(
            Consultation.objects.filter(
                patient=patient
            ),
            many=True
        )

        return Response({
            "patient": {
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
            },

            "consultations": serializer.data,
        })


# ============================================================
# DOCTOR - CONSULTATIONS
# ============================================================

class ConsultationListCreateView(APIView):
    permission_classes = [IsDoctor]

    def get(self, request):

        consultations = Consultation.objects.select_related(
            "patient",
            "appointment",
            "appointment__doctor"
        ).all().order_by(
            "-created_at"
        )

        serializer = ConsultationSerializer(
            consultations,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = ConsultationSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():

            consultation = serializer.save()

            appointment = consultation.appointment

            if appointment.status == "BOOKED":

                appointment.status = "CONSULTED"

                appointment.save(
                    update_fields=["status"]
                )

            return Response(
                ConsultationSerializer(
                    consultation
                ).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# ============================================================
# DOCTOR - MEDICINE PRESCRIPTIONS
# ============================================================

class MedicinePrescriptionListCreateView(APIView):
    permission_classes = [IsDoctor]

    def get(self, request):

        prescriptions = MedicinePrescription.objects.select_related(
            "consultation",
            "consultation__patient",
            "medicine",
        ).all().order_by(
            "-created_at"
        )

        serializer = MedicinePrescriptionSerializer(
            prescriptions,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = MedicinePrescriptionSerializer(
            data=request.data
        )

        if serializer.is_valid():

            prescription = serializer.save()

            return Response(
                MedicinePrescriptionSerializer(
                    prescription
                ).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# ============================================================
# DOCTOR - LAB PRESCRIPTIONS
# ============================================================

class LabPrescriptionListCreateView(APIView):
    permission_classes = [IsDoctor]

    def get(self, request):

        lab_prescriptions = LabPrescription.objects.select_related(
            "consultation",
            "consultation__patient"
        ).all().order_by(
            "-created_at"
        )

        serializer = LabPrescriptionSerializer(
            lab_prescriptions,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = LabPrescriptionSerializer(
            data=request.data
        )

        if serializer.is_valid():

            lab_prescription = serializer.save()

            return Response(
                LabPrescriptionSerializer(
                    lab_prescription
                ).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )