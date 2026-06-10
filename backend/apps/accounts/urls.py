from django.urls import path
from . import views

urlpatterns = [
    path('login/',           views.LoginView.as_view(),          name='auth-login'),
    path('refresh/',         views.TokenRefreshView.as_view(),   name='auth-refresh'),
    path('register/',        views.RegisterView.as_view(),        name='auth-register'),
    path('me/',              views.MeView.as_view(),              name='auth-me'),
    path('change-password/', views.ChangePasswordView.as_view(), name='auth-change-password'),
    path('accounts/',        views.AdminCreateAccountView.as_view(), name='admin-create-account'),
]
