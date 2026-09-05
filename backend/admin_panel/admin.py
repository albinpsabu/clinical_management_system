from django.contrib import admin
from .models import Department, Doctor, Medicine, LabTest


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "status")
    search_fields = ("name",)
    list_filter = ("status",)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = (
        "doctor_id",
        "name",
        "specialization",
        "department",
        "consultation_fee",
        "status",
    )
    search_fields = ("doctor_id", "name", "specialization")
    list_filter = ("department", "status")


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = (
        "medicine_id",
        "name",
        "medicine_type",
        "stock_quantity",
        "price_per_unit",
        "expiry_date",
        "status",
    )
    search_fields = ("medicine_id", "name", "generic_name")
    list_filter = ("medicine_type", "status")


@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = (
        "test_id",
        "name",
        "price",
        "status",
    )
    search_fields = ("test_id", "name")
    list_filter = ("status",)