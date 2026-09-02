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

    doctor_name = serializers.CharField(
        source="doctor.name",
        read_only=True
    )

    doctor_code = serializers.CharField(
        source="doctor.doctor_id",
        read_only=True
    )

    class Meta:
        model = Appointment

        fields = [
            "id",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "doctor_code",
            "appointment_date",
            "appointment_time",
            "appointment_type",
            "token_no",
            "status",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "doctor_name",
            "doctor_code",
            "token_no",
            "status",
            "created_at",
        ]

    def validate(self, attrs):

        patient = attrs.get("patient")
        doctor = attrs.get("doctor")
        appointment_date = attrs.get("appointment_date")

        # Check whether this patient already has
        # an appointment with the same doctor on the same date
        if Appointment.objects.filter(
            patient=patient,
            doctor=doctor,
            appointment_date=appointment_date
        ).exists():

            raise serializers.ValidationError({
                "appointment_date":
                    "This patient already has an appointment "
                    "with this doctor on this date."
            })

        return attrs


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