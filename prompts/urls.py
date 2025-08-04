from django.urls import path
from . import views

urlpatterns = [
    path('', views.PromptListCreateView.as_view(), name='prompt-list-create'),
    path('<int:id>/', views.PromptDetailView.as_view(), name='prompt-detail'),
    path('<int:prompt_id>/versions/', views.PromptVersionListView.as_view(), name='prompt-versions'),
    path('<int:prompt_id>/versions/<int:version_id>/restore/', 
         views.restore_version, name='restore-version'),
]