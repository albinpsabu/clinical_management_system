from django.db import models
from patients.models import Patient
from appointments.models import Appointment
from admin_panel.models import Medicine
from doctor.models import MedicinePrescription


class MedicineDispensing(models.Model):
    dispensing_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True
    )

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

    def save(self, *args, **kwargs):
        if not self.dispensing_id:
            last_dispensing = MedicineDispensing.objects.order_by("-id").first()

            if last_dispensing:
                number = last_dispensing.id + 1
            else:
                number = 1

            self.dispensing_id = f"DISP{number:06d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.dispensing_id} - {self.patient.name}"


class MedicineBill(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
    ]

    bill_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True
    )

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

    def save(self, *args, **kwargs):
        if not self.bill_id:
            last_bill = MedicineBill.objects.order_by("-id").first()

            if last_bill:
                number = last_bill.id + 1
            else:
                number = 1

            self.bill_id = f"MBILL{number:06d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.bill_id} - {self.patient.name}"