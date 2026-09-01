from django.db import models

from patients.models import Patient
from doctor.models import LabPrescription


class LabResult(models.Model):

    STATUS_CHOICES = [
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
    ]

    result_id = models.CharField(
        max_length=20,
        unique=True
    )

    lab_prescription = models.OneToOneField(
        LabPrescription,
        on_delete=models.CASCADE,
        related_name="lab_result"
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="lab_results"
    )

    result = models.TextField()

    remarks = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="IN_PROGRESS"
    )

    completed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"{self.result_id} - "
            f"{self.patient.name}"
        )


class LabBill(models.Model):

    PAYMENT_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
    ]

    bill_id = models.CharField(
        max_length=20,
        unique=True
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="lab_bills"
    )

    lab_prescription = models.ForeignKey(
        LabPrescription,
        on_delete=models.CASCADE,
        related_name="lab_bills"
    )

    test_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2
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

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.bill_id} - "
            f"{self.patient.name}"
        )