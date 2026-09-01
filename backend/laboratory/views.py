from django.utils import timezone

from rest_framework import generics
from accounts.permissions import IsLabTechnician

from admin_panel.models import LabTest
from doctor.models import LabPrescription

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

    def perform_create(self, serializer):

        lab_prescription = serializer.validated_data[
            "lab_prescription"
        ]

        patient = lab_prescription.consultation.patient

        serializer.save(
            patient=patient,
            completed_at=(
                timezone.now()
                if serializer.validated_data.get("status") == "COMPLETED"
                else None
            )
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

    def perform_create(self, serializer):

        lab_prescription = serializer.validated_data[
            "lab_prescription"
        ]

        patient = lab_prescription.consultation.patient

        serializer.save(
            patient=patient
        )
