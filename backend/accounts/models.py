

# Create your models here.


from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = [
        ("ADMIN", "Admin"),
        ("RECEPTIONIST", "Receptionist"),
        ("DOCTOR", "Doctor"),
        ("PHARMACIST", "Pharmacist"),
        ("LAB_TECHNICIAN", "Lab Technician"),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="RECEPTIONIST"
    )

    phone = models.CharField(
        max_length=15,
        blank=True
    )

    def __str__(self):
        return f"{self.username} - {self.role}"