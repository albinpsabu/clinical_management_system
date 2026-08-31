from django.contrib.auth import get_user_model

from rest_framework import generics, viewsets
from accounts.permissions import IsAdmin

from .models import Department, Doctor, Medicine, LabTest
from .serializers import (
    StaffCreateSerializer,
    DoctorCreateSerializer,
    DepartmentSerializer,
    MedicineSerializer,
    LabTestSerializer,
)


User = get_user_model()


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


class DoctorListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    queryset = Doctor.objects.select_related(
        "user",
        "department"
    ).order_by("id")

    serializer_class = DoctorCreateSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    queryset = Department.objects.all().order_by("id")
    serializer_class = DepartmentSerializer


class MedicineViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    queryset = Medicine.objects.all().order_by("id")
    serializer_class = MedicineSerializer


class LabTestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    queryset = LabTest.objects.all().order_by("id")
    serializer_class = LabTestSerializer