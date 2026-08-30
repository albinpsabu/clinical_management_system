from django import forms 
from patients .models import Patient 

class PatientRegistrationForm (forms.ModelForm):
    class Meta:
        model=Patient
        fields=[
            "patient_id",
            "name",
            "dob",
            "gender",
            "age",
            "address",
            "phone",
            "blood_group",
        ]