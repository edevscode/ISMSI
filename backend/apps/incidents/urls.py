from django.urls import path
from . import views

urlpatterns = [
    path('',             views.IncidentListCreateView.as_view(), name='incident-list'),
    path('<int:pk>/',    views.IncidentDetailView.as_view(),     name='incident-detail'),
    path('<int:pk>/status/', views.IncidentStatusUpdateView.as_view(), name='incident-status'),
    path('<int:pk>/assign/', views.IncidentAssignView.as_view(),       name='incident-assign'),
]
