from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    StaffListCreateView,
    DoctorListCreateView,
    DepartmentViewSet,
    MedicineViewSet,
    LabTestViewSet,
)


router = DefaultRouter()

router.register(
    r"departments",
    DepartmentViewSet,
    basename="department"
)

router.register(
    r"medicines",
    MedicineViewSet,
    basename="medicine"
)

router.register(
    r"lab-tests",
    LabTestViewSet,
    basename="lab-test"
)


urlpatterns = [
    path(
        "staff/",
        StaffListCreateView.as_view(),
        name="staff"
    ),

    path(
        "doctors/",
        DoctorListCreateView.as_view(),
        name="doctors"
    ),
]

urlpatterns += router.urls