from django.urls import path

from .views import (
    LabTestListView,
    LabPrescriptionListView,
    LabResultListCreateView,
    LabBillListCreateView,
)


urlpatterns = [
    path(
        "tests/",
        LabTestListView.as_view(),
        name="lab-tests"
    ),

    path(
        "prescriptions/",
        LabPrescriptionListView.as_view(),
        name="lab-prescriptions"
    ),

    path(
        "results/",
        LabResultListCreateView.as_view(),
        name="lab-results"
    ),

    path(
        "bills/",
        LabBillListCreateView.as_view(),
        name="lab-bills"
    ),
]