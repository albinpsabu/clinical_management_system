
from rest_framework import serializers

from .models import (
    Consultation,
    MedicinePrescription,
    LabPrescription,
)


# ============================================================
# CONSULTATION SERIALIZER
# ============================================================

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
            "consultation_id",
            "patient",
            "patient_name",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):

        appointment = attrs.get("appointment")
        request = self.context.get("request")

        if appointment and request:

            from admin_panel.models import Doctor

            try:
                doctor = Doctor.objects.get(
                    user=request.user
                )

            except Doctor.DoesNotExist:

                raise serializers.ValidationError({
                    "appointment": "Doctor profile not found."
                })

            # Make sure the appointment belongs
            # to the logged-in doctor.
            if appointment.doctor != doctor:

                raise serializers.ValidationError({
                    "appointment": (
                        "This appointment does not "
                        "belong to you."
                    )
                })

            # Consultation can only be created
            # for a booked appointment.
            if appointment.status != "BOOKED":

                raise serializers.ValidationError({
                    "appointment": (
                        "This appointment is not "
                        "available for consultation."
                    )
                })

            # Automatically get patient from appointment.
            attrs["patient"] = appointment.patient

        return attrs


# ============================================================
# MEDICINE PRESCRIPTION SERIALIZER
# ============================================================

class MedicinePrescriptionSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="consultation.patient.name",
        read_only=True
    )

    consultation_id = serializers.CharField(
        source="consultation.consultation_id",
        read_only=True
    )

    medicine_name = serializers.CharField(
        source="medicine.name",
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
            "medicine",
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
            "prescription_id",
            "consultation_id",
            "patient_name",
            "medicine_name",
            "created_at",
        ]


# ============================================================
# LAB PRESCRIPTION SERIALIZER
# ============================================================

class LabPrescriptionSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="consultation.patient.name",
        read_only=True
    )

    consultation_id = serializers.CharField(
        source="consultation.consultation_id",
        read_only=True
    )

    test_name = serializers.CharField(
        source="lab_test.name",
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
            "lab_test",
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
            "lab_request_id",
            "consultation_id",
            "patient_name",
            "test_name",
            "created_at",
            "updated_at",
        ]

