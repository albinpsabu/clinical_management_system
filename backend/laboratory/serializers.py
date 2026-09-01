from rest_framework import serializers

from admin_panel.models import LabTest
from doctor.models import LabPrescription

from .models import LabResult, LabBill


class LabTestSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabTest
        fields = "__all__"


class LabPrescriptionSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="consultation.patient.name",
        read_only=True
    )

    patient = serializers.IntegerField(
        source="consultation.patient.id",
        read_only=True
    )

    class Meta:
        model = LabPrescription
        fields = [
            "id",
            "lab_request_id",
            "consultation",
            "patient",
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
            "patient",
            "patient_name",
            "result",
            "created_at",
            "updated_at",
        ]

class LabResultSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.name",
        read_only=True
    )

    lab_request_id = serializers.CharField(
        source="lab_prescription.lab_request_id",
        read_only=True
    )

    test_name = serializers.CharField(
        source="lab_prescription.test_name",
        read_only=True
    )

    class Meta:
        model = LabResult
        fields = [
            "id",
            "result_id",
            "lab_prescription",
            "lab_request_id",
            "test_name",
            "patient",
            "patient_name",
            "result",
            "remarks",
            "status",
            "completed_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient",
            "patient_name",
            "lab_request_id",
            "test_name",
            "created_at",
            "updated_at",
        ]

class LabBillSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.name",
        read_only=True
    )

    lab_request_id = serializers.CharField(
        source="lab_prescription.lab_request_id",
        read_only=True
    )

    test_name = serializers.CharField(
        source="lab_prescription.test_name",
        read_only=True
    )

    class Meta:
        model = LabBill
        fields = [
            "id",
            "bill_id",
            "patient",
            "patient_name",
            "lab_prescription",
            "lab_request_id",
            "test_name",
            "test_charge",
            "total_amount",
            "payment_status",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "patient",
            "patient_name",
            "lab_request_id",
            "test_name",
            "created_at",
        ]