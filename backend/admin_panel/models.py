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

    def save(self, *args, **kwargs):
        if not self.doctor_id:
            last_doctor = Doctor.objects.order_by("-id").first()
            next_number = (last_doctor.id + 1) if last_doctor else 1
            self.doctor_id = f"DOC{next_number:06d}"

        super().save(*args, **kwargs)

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

    stock_quantity = models.PositiveIntegerField(
        default=0
    )

    batch_number = models.CharField(
        max_length=50,
        blank=True
    )

    manufacture_date = models.DateField(
        null=True,
        blank=True
    )

    expiry_date = models.DateField(
        null=True,
        blank=True
    )

    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ("Active", "Active"),
            ("Inactive", "Inactive"),
        ],
        default="Active"
    )

    def save(self, *args, **kwargs):
        if not self.medicine_id:
            last_medicine = Medicine.objects.order_by("-id").first()
            next_number = (last_medicine.id + 1) if last_medicine else 1
            self.medicine_id = f"MED{next_number:06d}"

        super().save(*args, **kwargs)

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

    def save(self, *args, **kwargs):
        if not self.test_id:
            last_test = LabTest.objects.order_by("-id").first()
            next_number = (last_test.id + 1) if last_test else 1
            self.test_id = f"LAB{next_number:06d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.test_id} - {self.name}"