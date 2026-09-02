from django.urls import path

from . import views


urlpatterns = [
    path(
        "appointments/",
        views.DoctorAppointmentListView.as_view(),
        name="doctor-appointments",
    ),

    path(
        "patients/<str:patient_id>/",
        views.DoctorPatientDetailView.as_view(),
        name="doctor-patient-detail",
    ),

    path(
        "consultations/",
        views.ConsultationListCreateView.as_view(),
        name="consultations",
    ),

    path(
        "prescriptions/medicines/",
        views.MedicinePrescriptionListCreateView.as_view(),
        name="medicine-prescriptions",
    ),
    
    path(
        "prescriptions/labs/",
        views.LabPrescriptionListCreateView.as_view(),
        name="lab-prescriptions",
    ),
]