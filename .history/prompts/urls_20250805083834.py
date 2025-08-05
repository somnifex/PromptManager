from django.urls import path
from . import views

urlpatterns = [
    path('', views.PromptListCreateView.as_view(), name='prompt-list-create'),
    path('<int:id>/', views.PromptDetailView.as_view(), name='prompt-detail'),
    path('<int:prompt_id>/versions/', views.PromptVersionListView.as_view(), name='prompt-versions'),
    path('<int:prompt_id>/versions/<int:version_id>/restore/', 
         views.restore_version, name='restore-version'),
    path('tags/', views.TagListCreateView.as_view(), name='tag-list-create'),
    path('tags/<int:id>/', views.TagDetailView.as_view(), name='tag-detail'),
    path('tags/<int:tag_id>/prompts/', views.prompts_by_tag, name='prompts-by-tag'),
]