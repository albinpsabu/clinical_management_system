from rest_framework import serializers

from admin_panel.models import LabTest
from doctor.models import LabPrescription

from .models import LabResult, LabBill


# ============================================================
# LAB TEST
# ============================================================

class LabTestSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabTest
        fields = "__all__"


# ============================================================
# LAB PRESCRIPTION
# ============================================================

class LabPrescriptionSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="consultation.patient.name",
        read_only=True
    )

    patient = serializers.IntegerField(
        source="consultation.patient.id",
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
            "patient",
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
            "patient",
            "patient_name",
            "test_name",
            "result",
            "created_at",
            "updated_at",
        ]


# ============================================================
# LAB RESULT
# ============================================================

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
        source="lab_prescription.lab_test.name",
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
            "completed_at",
            "created_at",
            "updated_at",
        ]

    def validate_lab_prescription(self, lab_prescription):

        # A valid laboratory test must be assigned.
        if not lab_prescription.lab_test_id:
            raise serializers.ValidationError(
                "This laboratory prescription has no laboratory test assigned."
            )

        # Prevent duplicate results.
        if LabResult.objects.filter(
            lab_prescription=lab_prescription
        ).exists():
            raise serializers.ValidationError(
                "A laboratory result already exists for this prescription."
            )

        # A completed prescription cannot be processed again.
        if lab_prescription.status == "COMPLETED":
            raise serializers.ValidationError(
                "This laboratory prescription is already completed."
            )

        # Sample must be collected first.
        if lab_prescription.status == "REQUESTED":
            raise serializers.ValidationError(
                "Sample must be collected before entering the laboratory result."
            )

        return lab_prescription


# ============================================================
# LAB BILL
# ============================================================

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
        source="lab_prescription.lab_test.name",
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
            "bill_id",
            "patient",
            "patient_name",
            "lab_request_id",
            "test_name",
            "test_charge",
            "total_amount",
            "payment_status",
            "created_at",
        ]

    def validate_lab_prescription(self, lab_prescription):

        # Test must be completed before billing.
        if lab_prescription.status != "COMPLETED":
            raise serializers.ValidationError(
                "Cannot generate bill. The laboratory test is not completed."
            )

        # A prescription can have only one bill.
        if LabBill.objects.filter(
            lab_prescription=lab_prescription
        ).exists():
            raise serializers.ValidationError(
                "A bill already exists for this laboratory prescription."
            )

        # Test must exist.
        if not lab_prescription.lab_test_id:
            raise serializers.ValidationError(
                "This laboratory prescription has no laboratory test assigned."
            )

        return lab_prescription