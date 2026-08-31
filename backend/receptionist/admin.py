from django.contrib import admin

# Register your models here.
from django.contrib import admin

from .models import ConsultationBill


@admin.register(ConsultationBill)
class ConsultationBillAdmin(admin.ModelAdmin):

    list_display = (
        "bill_id",
        "patient",
        "appointment",
        "total_amount",
        "payment_status",
        "created_at",
    )

    list_filter = (
        "payment_status",
        "created_at",
    )

    search_fields = (
        "bill_id",
        "patient__patient_id",
        "patient__name",
    )