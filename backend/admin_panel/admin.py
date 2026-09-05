from django.contrib import admin

from .models import Department, Doctor, Medicine, LabTest
from accounts.models import User


# =========================================================
# DEPARTMENT
# =========================================================

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "status",
    )

    search_fields = (
        "name",
    )

    list_filter = (
        "status",
    )


# =========================================================
# DOCTOR
# =========================================================

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

    search_fields = (
        "doctor_id",
        "name",
        "specialization",
    )

    list_filter = (
        "department",
        "status",
    )


# =========================================================
# MEDICINE
# =========================================================

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

    search_fields = (
        "medicine_id",
        "name",
        "generic_name",
    )

    list_filter = (
        "medicine_type",
        "status",
    )


# =========================================================
# LAB TEST
# =========================================================

@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):

    list_display = (
        "test_id",
        "name",
        "price",
        "status",
    )

    search_fields = (
        "test_id",
        "name",
    )

    list_filter = (
        "status",
    )


# =========================================================
# STAFF / USERS
# =========================================================

@admin.register(User)
class UserAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "is_active",
    )

    search_fields = (
        "username",
        "email",
        "first_name",
        "last_name",
    )

    list_filter = (
        "role",
        "is_active",
    )

    ordering = (
        "username",
    )