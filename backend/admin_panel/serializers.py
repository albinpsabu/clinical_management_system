from django.contrib.auth import get_user_model
from django.db import transaction

from rest_framework import serializers

from .models import Department, Doctor, Medicine, LabTest


User = get_user_model()


# ============================================================
# STAFF
# ============================================================

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

        read_only_fields = [
            "id",
        ]

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

    def validate_username(self, value):

        queryset = User.objects.filter(
            username=value
        )

        # During update, don't consider the current user
        # as a duplicate.
        if self.instance is not None:
            queryset = queryset.exclude(
                id=self.instance.id
            )

        if queryset.exists():

            raise serializers.ValidationError(
                "This username is already taken. "
                "Please choose another username."
            )

        return value

    def create(self, validated_data):

        password = validated_data.pop("password")

        return User.objects.create_user(
            password=password,
            **validated_data
        )

    def update(self, instance, validated_data):

        password = validated_data.pop(
            "password",
            None
        )

        # Update normal User fields
        for attr, value in validated_data.items():

            setattr(
                instance,
                attr,
                value
            )

        # Update password only when supplied
        if password:

            instance.set_password(password)

        instance.save()

        return instance


# ============================================================
# DOCTOR
# ============================================================

class DoctorCreateSerializer(serializers.ModelSerializer):

    # --------------------------------------------------------
    # USER FIELDS
    # --------------------------------------------------------

    username = serializers.CharField(
        write_only=True,
        required=False
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=False,
        allow_blank=True
    )

    email = serializers.EmailField(
        source="user.email",
        required=True
    )

    phone = serializers.CharField(
        source="user.phone",
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

        read_only_fields = [
            "id",
            "doctor_id",
        ]

    # --------------------------------------------------------
    # CREATE / UPDATE VALIDATION
    # --------------------------------------------------------

    def validate(self, attrs):

        # Username and password are required only when
        # creating a new doctor.

        if self.instance is None:

            username = self.initial_data.get(
                "username"
            )

            password = self.initial_data.get(
                "password"
            )

            if not username:

                raise serializers.ValidationError({
                    "username": (
                        "Username is required when creating "
                        "a doctor."
                    )
                })

            if not password:

                raise serializers.ValidationError({
                    "password": (
                        "Password is required when creating "
                        "a doctor."
                    )
                })

            if User.objects.filter(
                username=username
            ).exists():

                raise serializers.ValidationError({
                    "username": (
                        "This username is already taken. "
                        "Please choose another username."
                    )
                })

        return attrs

    # --------------------------------------------------------
    # CREATE DOCTOR
    # --------------------------------------------------------
    @transaction.atomic
    def create(self, validated_data):

        # ----------------------------------------------------
        # Username and password
        # Remove them from validated_data because they belong
        # to the User model, not the Doctor model.
        # ----------------------------------------------------

        username = validated_data.pop("username")
        password = validated_data.pop("password")

        # ----------------------------------------------------
        # User-related fields
        # ----------------------------------------------------

        user_data = validated_data.pop(
            "user",
            {}
        )

        email = user_data.get(
            "email"
        )

        phone = user_data.get(
            "phone",
            ""
        )

        # ----------------------------------------------------
        # Final validation
        # ----------------------------------------------------

        if not username:
            raise serializers.ValidationError({
                "username": "Username is required when creating a doctor."
            })

        if not password:
            raise serializers.ValidationError({
                "password": "Password is required when creating a doctor."
            })

        if not email:
            raise serializers.ValidationError({
                "email": "Email is required when creating a doctor."
            })

        # ----------------------------------------------------
        # Check username
        # ----------------------------------------------------

        if User.objects.filter(
            username=username
        ).exists():

            raise serializers.ValidationError({
                "username": (
                    "This username is already taken. "
                    "Please choose another username."
                )
            })

        # ----------------------------------------------------
        # Create linked User
        # ----------------------------------------------------

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            phone=phone,
            role="DOCTOR"
        )

        # ----------------------------------------------------
        # Create Doctor
        # ----------------------------------------------------

        doctor = Doctor.objects.create(
            user=user,
            **validated_data
        )

        return doctor
    # --------------------------------------------------------
    # UPDATE DOCTOR
    # --------------------------------------------------------

    @transaction.atomic
    def update(self, instance, validated_data):

        # ----------------------------------------------------
        # User-related fields
        # ----------------------------------------------------

        user_data = validated_data.pop(
            "user",
            {}
        )

        email = user_data.get(
            "email"
        )

        phone = user_data.get(
            "phone"
        )

        # ----------------------------------------------------
        # Optional username/password
        # ----------------------------------------------------

        username = self.initial_data.get(
            "username"
        )

        password = self.initial_data.get(
            "password"
        )

        # ----------------------------------------------------
        # Linked User
        # ----------------------------------------------------

        user = instance.user

        # ----------------------------------------------------
        # Update username if supplied
        # ----------------------------------------------------

        if username:

            username_exists = User.objects.filter(
                username=username
            ).exclude(
                id=user.id
            ).exists()

            if username_exists:

                raise serializers.ValidationError({
                    "username": (
                        "This username is already taken. "
                        "Please choose another username."
                    )
                })

            user.username = username

        # ----------------------------------------------------
        # Update email
        # ----------------------------------------------------

        if email is not None:

            user.email = email

        # ----------------------------------------------------
        # Update phone
        # ----------------------------------------------------

        if phone is not None:

            user.phone = phone

        # ----------------------------------------------------
        # Update password only when provided
        # ----------------------------------------------------

        if password:

            if len(password) < 8:

                raise serializers.ValidationError({
                    "password": (
                        "Password must be at least 8 "
                        "characters long."
                    )
                })

            user.set_password(
                password
            )

        # ----------------------------------------------------
        # Save User
        # ----------------------------------------------------

        user.save()

        # ----------------------------------------------------
        # Update Doctor fields
        # ----------------------------------------------------

        for attr, value in validated_data.items():

            setattr(
                instance,
                attr,
                value
            )

        # ----------------------------------------------------
        # Save Doctor
        # ----------------------------------------------------

        instance.save()

        return instance


# ============================================================
# DEPARTMENT
# ============================================================

class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department

        fields = "__all__"


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

    def get_extra_kwargs(self):

        extra_kwargs = super().get_extra_kwargs()

        # ----------------------------------------------------
        # CREATE
        #
        # All required Medicine model fields remain required.
        # ----------------------------------------------------

        if self.instance is not None:

            # ------------------------------------------------
            # UPDATE
            #
            # Allow partial medicine updates.
            #
            # This is important because the Pharmacist/Admin
            # stock update form may send only:
            #
            # stock_quantity
            # batch_number
            # expiry_date
            #
            # without sending medicine_type, name, etc.
            # ------------------------------------------------

            optional_update_fields = [
                "name",
                "generic_name",
                "medicine_type",
                "manufacturer",
                "description",
                "stock_quantity",
                "batch_number",
                "manufacture_date",
                "expiry_date",
                "price_per_unit",
                "status",
            ]

            for field in optional_update_fields:

                extra_kwargs.setdefault(
                    field,
                    {}
                )

                extra_kwargs[field]["required"] = False

        return extra_kwargs


# ============================================================
# LAB TEST
# ============================================================

class LabTestSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabTest

        fields = "__all__"

        read_only_fields = [
            "id",
            "test_id",
        ]