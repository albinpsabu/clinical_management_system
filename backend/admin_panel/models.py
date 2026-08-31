from django.conf import settings
from django.db import models


class Department(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True
    )

    description = models.TextField(
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ("Active", "Active"),
            ("Inactive", "Inactive"),
        ],
        default="Active"
    )

    def __str__(self):
        return self.name


class Doctor(models.Model):
   
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="doctor_profile",
        null=True,
        blank=True
    )
    
    doctor_id = models.CharField(
        max_length=20,
        unique=True
    )

    name = models.CharField(
        max_length=100
    )

    specialization = models.CharField(
        max_length=100
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="doctors"
    )

    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ("Active", "Active"),
            ("Inactive", "Inactive"),
        ],
        default="Active"
    )

    def __str__(self):
        return f"{self.doctor_id} - {self.name}"


class Medicine(models.Model):
    medicine_id = models.CharField(
        max_length=20,
        unique=True
    )

    name = models.CharField(
        max_length=100
    )

    generic_name = models.CharField(
        max_length=100,
        blank=True
    )

    medicine_type = models.CharField(
        max_length=50
    )

    manufacturer = models.CharField(
        max_length=100,
        blank=True
    )

    description = models.TextField(
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ("Active", "Active"),
            ("Inactive", "Inactive"),
        ],
        default="Active"
    )

    def __str__(self):
        return f"{self.medicine_id} - {self.name}"


class LabTest(models.Model):
    test_id = models.CharField(
        max_length=20,
        unique=True
    )

    name = models.CharField(
        max_length=100,
        unique=True
    )

    description = models.TextField(
        blank=True
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ("Active", "Active"),
            ("Inactive", "Inactive"),
        ],
        default="Active"
    )

    def __str__(self):
        return f"{self.test_id} - {self.name}"