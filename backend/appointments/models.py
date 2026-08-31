from django.db import models
from patients.models import Patient


class Appointment(models.Model):

    STATUS_CHOICES = [
        ("BOOKED", "Booked"),
        ("CONSULTED", "Consulted"),
        ("CANCELLED", "Cancelled"),
    ]

    APPOINTMENT_TYPE_CHOICES = [
        ("WALK_IN", "Walk-in"),
        ("PRIOR_BOOKING", "Prior Booking"),
    ]

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="appointments"
    )

    doctor_id = models.PositiveIntegerField()

    appointment_date = models.DateField()
    appointment_time = models.TimeField()

    token_no = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    appointment_type = models.CharField(
        max_length=20,
        choices=APPOINTMENT_TYPE_CHOICES
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="BOOKED"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.patient} - "
            f"Doctor {self.doctor_id} - "
            f"{self.appointment_date}"
        )