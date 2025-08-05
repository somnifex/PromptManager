from django.urls import path, include
from . import views

urlpatterns = [
    path('users/', include('users.urls')),
    path('prompts/', include('prompts.urls')),
    path('admin/settings/', views.system_settings, name='system_settings'),
    path('admin/settings/<str:category>/', views.system_settings_category, name='system_settings_category'),
]