
from django.urls import path

from .views import (
    LoginView,
    MeView,
    LogoutView,
    ChangePasswordView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),
]