from django.db import models
# Create your models here.
from django.db import models

from patients.models import Patient
from appointments.models import Appointment


class Consultation(models.Model):

    consultation_id = models.CharField(
        max_length=20,
        unique=True
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="consultations"
    )

    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name="consultation"
    )

    symptoms = models.TextField()

    diagnosis = models.TextField()

    clinical_notes = models.TextField(
        blank=True,
        null=True
    )

    treatment_plan = models.TextField(
        blank=True,
        null=True
    )

    follow_up_date = models.DateField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ("IN_PROGRESS", "In Progress"),
            ("COMPLETED", "Completed"),
        ],
        default="IN_PROGRESS"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"{self.consultation_id} - "
            f"{self.patient.name}"
        )


class MedicinePrescription(models.Model):

    prescription_id = models.CharField(
        max_length=20,
        unique=True
    )

    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name="medicine_prescriptions"
    )

    medicine = models.ForeignKey(
        "admin_panel.Medicine",
        on_delete=models.PROTECT,
        related_name="prescriptions"
    )

    dosage = models.CharField(
        max_length=100
    )

    frequency = models.CharField(
        max_length=100
    )

    duration = models.CharField(
        max_length=100
    )

    route = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    instructions = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.prescription_id} - "
            f"{self.medicine.name}"
        )


class LabPrescription(models.Model):

    lab_request_id = models.CharField(
        max_length=20,
        unique=True
    )

    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name="lab_prescriptions"
    )

    test_name = models.CharField(
        max_length=200
    )

    clinical_reason = models.TextField(
        blank=True,
        null=True
    )

    instructions = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ("REQUESTED", "Requested"),
            ("SAMPLE_COLLECTED", "Sample Collected"),
            ("COMPLETED", "Completed"),
        ],
        default="REQUESTED"
    )

    result = models.TextField(
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
            f"{self.lab_request_id} - "
            f"{self.test_name}"
        )