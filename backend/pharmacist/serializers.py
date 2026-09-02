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


# ============================================================
# MEDICINE STOCK UPDATE
# Pharmacist can update only stock-related information
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

    patient_name = serializers.CharField(
        source="consultation.patient.name",
        read_only=True
    )

    patient_id = serializers.CharField(
        source="consultation.patient.patient_id",
        read_only=True
    )

    medicine_name = serializers.CharField(
        source="medicine.name",
        read_only=True
    )

    class Meta:
        model = MedicinePrescription

        fields = [
            "id",
            "prescription_id",
            "consultation",
            "patient_name",
            "patient_id",
            "medicine",
            "medicine_name",
            "dosage",
            "frequency",
            "duration",
            "route",
            "instructions",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "patient_id",
            "medicine_name",
            "created_at",
        ]


# ============================================================
# MEDICINE DISPENSING
# ============================================================

class MedicineDispensingSerializer(serializers.ModelSerializer):

    medicine_name = serializers.CharField(
        source="medicine.name",
        read_only=True
    )

    patient_name = serializers.CharField(
        source="patient.name",
        read_only=True
    )

    class Meta:
        model = MedicineDispensing

        fields = [
            "id",
            "dispensing_id",
            "patient",
            "patient_name",
            "appointment",
            "prescription",
            "medicine",
            "medicine_name",
            "quantity",
            "unit_price",
            "total_price",
            "dispensed_at",
        ]

        read_only_fields = [
            "id",
            "patient",
            "patient_name",
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

    class Meta:
        model = MedicineBill

        fields = [
            "id",
            "bill_id",
            "patient",
            "patient_name",
            "appointment",
            "total_amount",
            "payment_status",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "total_amount",
            "created_at",
        ]