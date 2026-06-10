from django.urls import path
from . import views

urlpatterns = [
    path('',       views.TanodListView.as_view(),        name='tanod-list'),
    path('ping/',  views.TanodPingView.as_view(),        name='tanod-ping'),
    path('status/', views.TanodStatusUpdateView.as_view(), name='tanod-status'),
]
