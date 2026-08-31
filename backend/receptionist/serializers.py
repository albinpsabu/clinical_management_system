from rest_framework import serializers

from patients.models import Patient
from appointments.models import Appointment

from .models import ConsultationBill


class PatientSerializer(serializers.ModelSerializer):

    class Meta:
        model = Patient
        fields = [
            "id",
            "patient_id",
            "name",
            "dob",
            "gender",
            "age",
            "address",
            "phone",
            "blood_group",
            "status",
        ]


class AppointmentSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.name",
        read_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_name",
            "doctor_id",
            "appointment_date",
            "appointment_time",
            "appointment_type",
            "token_no",
            "status",
            "created_at",
        ]

        read_only_fields = [
            "token_no",
            "status",
            "created_at",
        ]


class ConsultationBillSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.name",
        read_only=True
    )

    class Meta:
        model = ConsultationBill
        fields = [
            "id",
            "bill_id",
            "patient",
            "patient_name",
            "appointment",
            "registration_fee",
            "consultation_fee",
            "total_amount",
            "payment_status",
            "created_at",
        ]

        read_only_fields = [
            "total_amount",
            "created_at",
        ]