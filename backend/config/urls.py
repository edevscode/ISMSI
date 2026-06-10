from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/',          include('apps.accounts.urls')),
    path('api/incidents/',     include('apps.incidents.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/tanods/',        include('apps.tanods.urls')),
]
