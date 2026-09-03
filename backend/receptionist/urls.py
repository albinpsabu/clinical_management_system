from django.urls import path

from .views import (
    PatientListCreateView,
    PatientDetailView,
    AppointmentListCreateView,
    AppointmentCancelView,
    ConsultationBillListCreateView,
    PaymentCompleteView,
    DoctorListView,
)


urlpatterns = [

    # ========================================================
    # PATIENTS
    # ========================================================

    path(
        "patients/",
        PatientListCreateView.as_view(),
        name="patient-list-create"
    ),

    path(
        "patients/<str:patient_id>/",
        PatientDetailView.as_view(),
        name="patient-detail"
    ),

    # ========================================================
    # DOCTORS
    # ========================================================

    path(
        "doctors/",
        DoctorListView.as_view(),
        name="doctor-list"
    ),

    # ========================================================
    # APPOINTMENTS
    # ========================================================

    path(
        "appointments/",
        AppointmentListCreateView.as_view(),
        name="appointment-list-create"
    ),

    path(
        "appointments/<int:appointment_id>/cancel/",
        AppointmentCancelView.as_view(),
        name="appointment-cancel"
    ),

    # ========================================================
    # BILLING
    # ========================================================

    path(
        "billing/",
        ConsultationBillListCreateView.as_view(),
        name="billing-list-create"
    ),

    # ========================================================
    # PAYMENT
    # ========================================================

    path(
        "billing/<str:bill_id>/pay/",
        PaymentCompleteView.as_view(),
        name="payment-complete"
    ),
]