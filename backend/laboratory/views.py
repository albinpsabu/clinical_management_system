from django.db import transaction
from django.utils import timezone

from rest_framework import generics
from accounts.permissions import IsLabTechnician

from admin_panel.models import LabTest
from doctor.models import LabPrescription
from rest_framework import generics, serializers
from .models import LabResult, LabBill
from .serializers import (
    LabTestSerializer,
    LabPrescriptionSerializer,
    LabResultSerializer,
    LabBillSerializer,
)


class LabTestListView(generics.ListAPIView):
    """
    Lab Technician can view lab tests
    created by the Administrator.
    """

    permission_classes = [IsLabTechnician]

    queryset = LabTest.objects.all().order_by("id")
    serializer_class = LabTestSerializer


class LabPrescriptionListView(generics.ListAPIView):
    """
    Lab Technician can view lab prescriptions
    raised by Doctors.
    """

    permission_classes = [IsLabTechnician]

    queryset = LabPrescription.objects.all().order_by("-created_at")
    serializer_class = LabPrescriptionSerializer


class LabResultListCreateView(generics.ListCreateAPIView):
    """
    Lab Technician can view and create lab results.
    """
    permission_classes = [IsLabTechnician]

    queryset = LabResult.objects.select_related(
        "patient",
        "lab_prescription"
    ).all().order_by("-created_at")

    serializer_class = LabResultSerializer

    @transaction.atomic
    def perform_create(self, serializer):

        lab_prescription = serializer.validated_data[
            "lab_prescription"
        ]

        patient = lab_prescription.consultation.patient

        status = serializer.validated_data.get("status")

        # Save the lab result
        lab_result = serializer.save(
            patient=patient,
            completed_at=(
                timezone.now()
                if status == "COMPLETED"
                else None
            )
        )

        # If the test is completed,
        # automatically update the prescription
        if status == "COMPLETED":

            lab_prescription.status = "COMPLETED"
            lab_prescription.result = lab_result.result
            lab_prescription.save(
                update_fields=[
                    "status",
                    "result",
                    "updated_at"
                ]
            )

class LabBillListCreateView(generics.ListCreateAPIView):
    """
    Lab Technician can view and create lab bills.
    """

    permission_classes = [IsLabTechnician]

    queryset = LabBill.objects.select_related(
        "patient",
        "lab_prescription"
    ).all().order_by("-created_at")

    serializer_class = LabBillSerializer

    @transaction.atomic
    def perform_create(self, serializer):

        lab_prescription = serializer.validated_data[
            "lab_prescription"
        ]

        patient = lab_prescription.consultation.patient

        # Find the laboratory test using prescription test name
        try:
            lab_test = lab_prescription.lab_test
        except LabTest.DoesNotExist:
            raise serializers.ValidationError(
                f"Laboratory test '{lab_prescription.test_name}' "
                "was not found."
            )

        # Get price from backend
        test_charge = lab_test.price

        # Currently total amount = test charge
        total_amount = test_charge

        serializer.save(
            patient=patient,
            test_charge=test_charge,
            total_amount=total_amount,
        )