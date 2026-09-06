from django.db import models
from patients.models import Patient
from appointments.models import Appointment


class ConsultationBill(models.Model):

    PAYMENT_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("COMPLETED", "Completed"),
    ]

    bill_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="consultation_bills"
    )

    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name="consultation_bill"
    )

    registration_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="PENDING"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):

        if not self.bill_id:
            last_bill = ConsultationBill.objects.order_by("-id").first()

            if last_bill:
                number = last_bill.id + 1
            else:
                number = 1

            self.bill_id = f"BILL{number:06d}"

        self.total_amount = (
            self.registration_fee +
            self.consultation_fee
        )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.bill_id} - {self.patient}"