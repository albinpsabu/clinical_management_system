from django.db import models
from patients.models import Patient
from appointments.models import Appointment
from admin_panel.models import Medicine
from doctor.models import MedicinePrescription


class MedicineDispensing(models.Model):
    dispensing_id = models.CharField(max_length=20, unique=True)

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="medicine_dispensings"
    )

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name="medicine_dispensings"
    )

    prescription = models.ForeignKey(
        MedicinePrescription,
        on_delete=models.PROTECT,
        related_name="dispensings"
    )

    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.PROTECT,
        related_name="dispensings"
    )

    quantity = models.PositiveIntegerField()

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    dispensed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.dispensing_id} - {self.patient.name}"


class MedicineBill(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
    ]

    bill_id = models.CharField(max_length=20, unique=True)

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="medicine_bills"
    )

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name="medicine_bills"
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="PENDING"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.bill_id} - {self.patient.name}"