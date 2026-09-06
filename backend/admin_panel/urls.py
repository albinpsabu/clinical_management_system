from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    StaffListCreateView,
    StaffDetailView,
    DoctorListCreateView,
    DoctorDetailView,
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

    # ========================================================
    # STAFF
    # ========================================================

    path(
        "staff/",
        StaffListCreateView.as_view(),
        name="staff"
    ),

    path(
        "staff/<int:pk>/",
        StaffDetailView.as_view(),
        name="staff-detail"
    ),


    # ========================================================
    # DOCTORS
    # ========================================================

    path(
        "doctors/",
        DoctorListCreateView.as_view(),
        name="doctors"
    ),

    path(
        "doctors/<int:pk>/",
        DoctorDetailView.as_view(),
        name="doctor-detail"
    ),


    # ========================================================
    # VIEWSETS
    # ========================================================

    path(
        "",
        include(router.urls)
    ),
]