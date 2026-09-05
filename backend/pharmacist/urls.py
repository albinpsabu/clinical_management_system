from django.urls import path

from .views import (
    MedicineListView,
    MedicineStockUpdateView,
    PatientListView,
    PatientAppointmentListView,
    AppointmentPrescriptionListView,
    MedicineDispensingListCreateView,
    MedicineDispensingHistoryView,
    MedicineBillListCreateView,
    MedicineBillPaymentView,
    SalesReportView,
)


urlpatterns = [

    # ========================================================
    # Medicines
    # ========================================================

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


    # ========================================================
    # Patients
    # ========================================================

    path(
        "patients/",
        PatientListView.as_view(),
        name="patient-list"
    ),

    path(
        "patients/<str:patient_id>/appointments/",
        PatientAppointmentListView.as_view(),
        name="patient-appointments"
    ),


    # ========================================================
    # Prescriptions
    # ========================================================

    path(
        "appointments/<int:appointment_id>/prescriptions/",
        AppointmentPrescriptionListView.as_view(),
        name="appointment-prescriptions"
    ),


    # ========================================================
    # Dispensing
    # ========================================================

    # Create a dispensing
    # POST /pharmacist/dispense/
    path(
        "dispense/",
        MedicineDispensingListCreateView.as_view(),
        name="medicine-dispense"
    ),

    # Dispensing history
    # GET /pharmacist/dispensing/
    path(
        "dispensing/",
        MedicineDispensingHistoryView.as_view(),
        name="medicine-dispensing"
    ),


    # ========================================================
    # Bills
    # ========================================================

    # List / create bills
    # GET  /pharmacist/bills/
    # POST /pharmacist/bills/
    path(
        "bills/",
        MedicineBillListCreateView.as_view(),
        name="medicine-bills"
    ),

    # Mark bill as paid
    # PATCH /pharmacist/bills/<bill_id>/pay/
    path(
        "bills/<str:bill_id>/pay/",
        MedicineBillPaymentView.as_view(),
        name="medicine-bill-payment"
    ),


    # ========================================================
    # Sales Reports
    # ========================================================

    path(
        "reports/sales/",
        SalesReportView.as_view(),
        name="sales-report"
    ),
]