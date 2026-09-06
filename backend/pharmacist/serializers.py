from rest_framework import serializers

from admin_panel.models import Medicine
from doctor.models import MedicinePrescription

from .models import (
    MedicineDispensing,
    MedicineBill,
)


# ============================================================
# MEDICINE
# ============================================================

class MedicineSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medicine
        fields = "__all__"

        read_only_fields = [
            "id",
            "medicine_id",
        ]


# ============================================================
# MEDICINE STOCK UPDATE
# Pharmacist can update only:
# - stock quantity
# - batch number
# - expiry date
# ============================================================

class MedicineStockUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medicine

        fields = [
            "stock_quantity",
            "batch_number",
            "expiry_date",
        ]


# ============================================================
# DOCTOR MEDICINE PRESCRIPTION
# ============================================================

class MedicinePrescriptionSerializer(serializers.ModelSerializer):

    # --------------------------------------------------------
    # Patient information
    # --------------------------------------------------------

    patient_name = serializers.CharField(
        source="consultation.patient.name",
        read_only=True
    )

    patient_id = serializers.CharField(
        source="consultation.patient.patient_id",
        read_only=True
    )

    # --------------------------------------------------------
    # Appointment information
    # --------------------------------------------------------

    appointment_id = serializers.IntegerField(
        source="consultation.appointment.id",
        read_only=True
    )

    consultation_id = serializers.CharField(
        source="consultation.consultation_id",
        read_only=True
    )

    # --------------------------------------------------------
    # Medicine information
    # --------------------------------------------------------

    medicine_name = serializers.CharField(
        source="medicine.name",
        read_only=True
    )

    medicine_code = serializers.CharField(
        source="medicine.medicine_id",
        read_only=True
    )

    stock_quantity = serializers.IntegerField(
        source="medicine.stock_quantity",
        read_only=True
    )

    price_per_unit = serializers.DecimalField(
        source="medicine.price_per_unit",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    # --------------------------------------------------------
    # Meta
    # --------------------------------------------------------

    class Meta:
        model = MedicinePrescription

        fields = [
            "id",
            "prescription_id",

            "consultation",
            "consultation_id",
            "appointment_id",

            # Patient
            "patient_name",
            "patient_id",

            # Medicine
            "medicine",
            "medicine_code",
            "medicine_name",

            # Prescription details
            "dosage",
            "frequency",
            "duration",
            "route",
            "instructions",

            # Medicine stock and price
            "stock_quantity",
            "price_per_unit",

            "created_at",
        ]

        read_only_fields = [
            "id",
            "prescription_id",

            "patient_name",
            "patient_id",
            "consultation_id",
            "appointment_id",

            "medicine_code",
            "medicine_name",
            "stock_quantity",
            "price_per_unit",

            "created_at",
        ]


# ============================================================
# MEDICINE DISPENSING
#
# Pharmacist sends only:
#
# {
#     "prescription": 1,
#     "quantity": 5
# }
#
# Backend automatically gets:
# - patient
# - appointment
# - medicine
# - unit price
# - total price
# - dispensing ID
# ============================================================

class MedicineDispensingSerializer(serializers.ModelSerializer):

    medicine_name = serializers.CharField(
        source="medicine.name",
        read_only=True
    )

    medicine_code = serializers.CharField(
        source="medicine.medicine_id",
        read_only=True
    )

    patient_name = serializers.CharField(
        source="patient.name",
        read_only=True
    )

    patient_id = serializers.CharField(
        source="patient.patient_id",
        read_only=True
    )

    class Meta:
        model = MedicineDispensing

        fields = [
            "id",
            "dispensing_id",

            "patient",
            "patient_id",
            "patient_name",

            "appointment",

            "prescription",

            "medicine",
            "medicine_code",
            "medicine_name",

            "quantity",
            "unit_price",
            "total_price",

            "dispensed_at",
        ]

        read_only_fields = [
            "id",
            "dispensing_id",

            "patient",
            "patient_id",
            "patient_name",

            "appointment",

            "medicine",
            "medicine_code",
            "medicine_name",

            "unit_price",
            "total_price",

            "dispensed_at",
        ]


# ============================================================
# MEDICINE BILL
# ============================================================

class MedicineBillSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.name",
        read_only=True
    )

    patient_id = serializers.CharField(
        source="patient.patient_id",
        read_only=True
    )

    class Meta:
        model = MedicineBill

        fields = [
            "id",
            "bill_id",

            "patient",
            "patient_id",
            "patient_name",

            "appointment",

            "total_amount",
            "payment_status",

            "created_at",
        ]

        read_only_fields = [
            "id",
            "bill_id",

            "patient",
            "patient_id",
            "patient_name",

            "appointment",

            "total_amount",
            "payment_status",

            "created_at",
        ]