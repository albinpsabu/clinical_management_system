from django.contrib.auth import get_user_model

from rest_framework import generics, viewsets, status
from rest_framework.response import Response

from accounts.permissions import IsAdmin

from .models import (
    Department,
    Doctor,
    Medicine,
    LabTest,
)

from .serializers import (
    StaffCreateSerializer,
    DoctorCreateSerializer,
    DepartmentSerializer,
    MedicineSerializer,
    LabTestSerializer,
)

from doctor.models import (
    MedicinePrescription,
    LabPrescription,
)

from pharmacist.models import (
    MedicineDispensing,
)


User = get_user_model()


# ============================================================
# STAFF - LIST + CREATE
# ============================================================

class StaffListCreateView(generics.ListCreateAPIView):

    permission_classes = [IsAdmin]

    queryset = User.objects.filter(
        role__in=[
            "RECEPTIONIST",
            "PHARMACIST",
            "LAB_TECHNICIAN",
        ]
    ).order_by("id")

    serializer_class = StaffCreateSerializer


# ============================================================
# STAFF - DETAIL + UPDATE + DELETE
# ============================================================

class StaffDetailView(generics.RetrieveUpdateDestroyAPIView):

    permission_classes = [IsAdmin]

    queryset = User.objects.filter(
        role__in=[
            "RECEPTIONIST",
            "PHARMACIST",
            "LAB_TECHNICIAN",
        ]
    ).order_by("id")

    serializer_class = StaffCreateSerializer


# ============================================================
# DOCTORS - LIST + CREATE
# ============================================================

class DoctorListCreateView(generics.ListCreateAPIView):

    permission_classes = [IsAdmin]

    queryset = Doctor.objects.select_related(
        "user",
        "department",
    ).order_by("id")

    serializer_class = DoctorCreateSerializer


# ============================================================
# DOCTORS - DETAIL + UPDATE + DELETE
# ============================================================

class DoctorDetailView(generics.RetrieveUpdateDestroyAPIView):

    permission_classes = [IsAdmin]

    queryset = Doctor.objects.select_related(
        "user",
        "department",
    ).all()

    serializer_class = DoctorCreateSerializer


# ============================================================
# DEPARTMENTS
# ============================================================

class DepartmentViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAdmin]

    queryset = Department.objects.all().order_by("id")

    serializer_class = DepartmentSerializer


# ============================================================
# MEDICINES
# ============================================================

class MedicineViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAdmin]

    queryset = Medicine.objects.all().order_by("id")

    serializer_class = MedicineSerializer

    def destroy(self, request, *args, **kwargs):

        medicine = self.get_object()

        # ----------------------------------------------------
        # Check MedicinePrescription records
        # ----------------------------------------------------

        has_prescriptions = MedicinePrescription.objects.filter(
            medicine=medicine
        ).exists()

        # ----------------------------------------------------
        # Check MedicineDispensing records
        # ----------------------------------------------------

        has_dispensing_records = MedicineDispensing.objects.filter(
            medicine=medicine
        ).exists()

        # ----------------------------------------------------
        # Medicine is already used in medical records
        # ----------------------------------------------------

        if has_prescriptions or has_dispensing_records:

            # Preserve medical history.
            # Do not physically delete the medicine.
            medicine.status = "Inactive"

            medicine.save(
                update_fields=["status"]
            )

            return Response(
                {
                    "message": (
                        f"Medicine '{medicine.name}' is already "
                        "used in medical records. It has been "
                        "marked as Inactive instead of deleted."
                    ),
                    "medicine_id": medicine.medicine_id,
                    "status": medicine.status,
                },
                status=status.HTTP_200_OK,
            )

        # ----------------------------------------------------
        # Medicine has never been used
        # ----------------------------------------------------

        medicine.delete()

        return Response(
            {
                "message": "Medicine deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# LAB TESTS
# ============================================================

class LabTestViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAdmin]

    queryset = LabTest.objects.all().order_by("id")

    serializer_class = LabTestSerializer

    def destroy(self, request, *args, **kwargs):

        lab_test = self.get_object()

        # ----------------------------------------------------
        # Check LabPrescription records
        #
        # IMPORTANT:
        # LabPrescription uses `lab_test` as the ForeignKey
        # to LabTest.
        # ----------------------------------------------------

        has_prescriptions = LabPrescription.objects.filter(
            lab_test=lab_test
        ).exists()

        # ----------------------------------------------------
        # Lab test is already used
        # ----------------------------------------------------

        if has_prescriptions:

            # Preserve laboratory history.
            # Do not physically delete the lab test.
            lab_test.status = "Inactive"

            lab_test.save(
                update_fields=["status"]
            )

            return Response(
                {
                    "message": (
                        f"Lab test '{lab_test.name}' is already "
                        "used in laboratory records. It has been "
                        "marked as Inactive instead of deleted."
                    ),
                    "test_id": lab_test.test_id,
                    "status": lab_test.status,
                },
                status=status.HTTP_200_OK,
            )

        # ----------------------------------------------------
        # Lab test has never been used
        # ----------------------------------------------------

        lab_test.delete()

        return Response(
            {
                "message": "Lab test deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )