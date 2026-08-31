from django.urls import path

from .views import (
    PatientListCreateView,
    PatientDetailView,
    AppointmentListCreateView,
    ConsultationBillListCreateView,
    PaymentCompleteView,
)


urlpatterns = [

    # Patients
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

    # Appointments
    path(
        "appointments/",
        AppointmentListCreateView.as_view(),
        name="appointment-list-create"
    ),

    # Consultation billing
    path(
        "billing/",
        ConsultationBillListCreateView.as_view(),
        name="billing-list-create"
    ),

    # Payment
    path(
        "billing/<str:bill_id>/pay/",
        PaymentCompleteView.as_view(),
        name="payment-complete"
    ),
]