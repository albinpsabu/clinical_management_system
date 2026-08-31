from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),


    path("admin-panel/", include("admin_panel.urls")),

    path("accounts/", include("accounts.urls")),

    path("receptionist/", include("receptionist.urls")),
]