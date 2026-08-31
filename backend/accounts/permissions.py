

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    message = "Only administrators can access this API."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (
                request.user.role == "ADMIN"
                or request.user.is_superuser
            )
        )


class IsDoctor(BasePermission):
    message = "Only doctors can access this API."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "DOCTOR"
        )


class IsReceptionist(BasePermission):
    message = "Only receptionists can access this API."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "RECEPTIONIST"
        )


class IsPharmacist(BasePermission):
    message = "Only pharmacists can access this API."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "PHARMACIST"
        )


class IsLabTechnician(BasePermission):
    message = "Only lab technicians can access this API."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "LAB_TECHNICIAN"
        )