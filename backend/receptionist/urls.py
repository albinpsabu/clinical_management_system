from django.urls import path
from .import views



urlpatterns=[
    path("register-patient/",views.register_patient,name="register_patient"),
    path("patient-registered",views.patient_registered,name="patient_registered"),
]
