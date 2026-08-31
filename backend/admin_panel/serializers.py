from django.contrib.auth import get_user_model
from django.db import transaction

from rest_framework import serializers

from .models import Department, Doctor, Medicine, LabTest


User = get_user_model()


class StaffCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "password",
            "email",
            "phone",
            "role",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate_role(self, value):
        allowed_roles = [
            "RECEPTIONIST",
            "PHARMACIST",
            "LAB_TECHNICIAN",
        ]

        if value not in allowed_roles:
            raise serializers.ValidationError(
                "Only Receptionist, Pharmacist and Lab Technician "
                "can be created through this endpoint."
            )

        return value

    def create(self, validated_data):
        password = validated_data.pop("password")

        return User.objects.create_user(
            password=password,
            **validated_data
        )


class DoctorCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        write_only=True
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    email = serializers.EmailField(
        write_only=True
    )

    phone = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = Doctor
        fields = [
            "id",
            "username",
            "password",
            "email",
            "phone",
            "doctor_id",
            "name",
            "specialization",
            "department",
            "consultation_fee",
            "status",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        if Doctor.objects.filter(
            doctor_id=attrs["doctor_id"]
        ).exists():
            raise serializers.ValidationError({
                "doctor_id": "This Doctor ID already exists."
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop("username")
        password = validated_data.pop("password")
        email = validated_data.pop("email")
        phone = validated_data.pop("phone", "")

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            phone=phone,
            role="DOCTOR"
        )

        doctor = Doctor.objects.create(
            user=user,
            **validated_data
        )

        return doctor


class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department
        fields = "__all__"


class MedicineSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medicine
        fields = "__all__"


class LabTestSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabTest
        fields = "__all__"