from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('settings/', views.user_settings, name='user_settings'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('two-factor/setup/', views.two_factor_setup, name='two_factor_setup'),
    path('two-factor/enable/', views.two_factor_enable, name='two_factor_enable'),
    path('two-factor/disable/', views.two_factor_disable, name='two_factor_disable'),
    path('two-factor/verify/', views.verify_two_factor, name='two_factor_verify'),
    
    # Admin endpoints
    path('admin/stats/', views.admin_stats, name='admin_stats'),
    path('admin/users/', views.admin_users, name='admin_users'),
    path('admin/users/<int:user_id>/', views.admin_user_detail, name='admin_user_detail'),
]