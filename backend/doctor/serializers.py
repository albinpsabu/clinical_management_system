from rest_framework import serializers

from patients.models import Patient
from appointments.models import Appointment

from .models import (
    Consultation,
    MedicinePrescription,
    LabPrescription,
)


class ConsultationSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.name",
        read_only=True
    )

    class Meta:
        model = Consultation
        fields = [
            "id",
            "consultation_id",
            "patient",
            "patient_name",
            "appointment",
            "symptoms",
            "diagnosis",
            "clinical_notes",
            "treatment_plan",
            "follow_up_date",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "created_at",
            "updated_at",
        ]


class MedicinePrescriptionSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="consultation.patient.name",
        read_only=True
    )

    consultation_id = serializers.CharField(
        source="consultation.consultation_id",
        read_only=True
    )

    class Meta:
        model = MedicinePrescription
        fields = [
            "id",
            "prescription_id",
            "consultation",
            "consultation_id",
            "patient_name",
            "medicine_name",
            "dosage",
            "frequency",
            "duration",
            "route",
            "instructions",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "consultation_id",
            "patient_name",
            "created_at",
        ]


class LabPrescriptionSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="consultation.patient.name",
        read_only=True
    )

    consultation_id = serializers.CharField(
        source="consultation.consultation_id",
        read_only=True
    )

    class Meta:
        model = LabPrescription
        fields = [
            "id",
            "lab_request_id",
            "consultation",
            "consultation_id",
            "patient_name",
            "test_name",
            "clinical_reason",
            "instructions",
            "status",
            "result",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "consultation_id",
            "patient_name",
            "created_at",
            "updated_at",
        ]