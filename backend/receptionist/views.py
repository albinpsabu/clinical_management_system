from django.shortcuts import render,redirect
from .forms import PatientRegistrationForm

def register_patient(request):
    if request.method =="POST":
        form=PatientRegistrationForm(request.POST)

        if form.is_valid():
            form.save()
            return redirect("patient_registered")
    else:
        form=PatientRegistrationForm()


    return render(request, "receptionist/register_patient.html",{"form":form})




def patient_registered(request):
    return render(request, "receptionist/patient_registered.html")


