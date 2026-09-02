from django.urls import path

from .views import (
    MedicineListView,
    MedicineStockUpdateView,
    PatientListView,
    PatientAppointmentListView,
    AppointmentPrescriptionListView,
    MedicineDispensingListCreateView,
    MedicineBillListCreateView,
    SalesReportView,
)


urlpatterns = [

    # --------------------------------------------------------
    # Medicines
    # --------------------------------------------------------

    path(
        "medicines/",
        MedicineListView.as_view(),
        name="medicine-list"
    ),

    path(
        "medicines/<int:pk>/stock/",
        MedicineStockUpdateView.as_view(),
        name="medicine-stock-update"
    ),

    # --------------------------------------------------------
    # Patients
    # --------------------------------------------------------

    path(
        "patients/",
        PatientListView.as_view(),
        name="patient-list"
    ),

    path(
        "patients/<int:patient_id>/appointments/",
        PatientAppointmentListView.as_view(),
        name="patient-appointments"
    ),

    # --------------------------------------------------------
    # Prescriptions
    # --------------------------------------------------------

    path(
        "appointments/<int:appointment_id>/prescriptions/",
        AppointmentPrescriptionListView.as_view(),
        name="appointment-prescriptions"
    ),

    # --------------------------------------------------------
    # Dispensing
    # --------------------------------------------------------

    path(
        "dispense/",
        MedicineDispensingListCreateView.as_view(),
        name="medicine-dispense"
    ),

    # --------------------------------------------------------
    # Bills
    # --------------------------------------------------------

    path(
        "bills/",
        MedicineBillListCreateView.as_view(),
        name="medicine-bills"
    ),

    # --------------------------------------------------------
    # Sales Reports
    # --------------------------------------------------------

    path(
        "reports/sales/",
        SalesReportView.as_view(),
        name="sales-report"
    ),
]