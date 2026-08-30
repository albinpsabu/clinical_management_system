from django.db import models


class Patient (models.Model):
    patient_id =models.CharField(max_length=20, unique=True)
    name=models.CharField(max_length=100)
    dob =models.DateField()
    gender=models.CharField(max_length=100)
    age=models.PositiveIntegerField()
    address=models.TextField()
    phone=models.CharField(max_length=10,unique=True)
    blood_group=models.CharField(max_length=5)
    status=models.CharField(max_length=20,default="Active")


    def __str__(self):
        return f"{self.patient_id} - {self.name}"

