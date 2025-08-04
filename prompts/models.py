from django.db import models
from django.conf import settings
from django.utils import timezone

class Prompt(models.Model):
    SHARING_CHOICES = [
        ('private', 'Private'),
        ('team', 'Team Shared'),
    ]
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='prompts')
    sharing_mode = models.CharField(max_length=10, choices=SHARING_CHOICES, default='private')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title

class PromptVersion(models.Model):
    prompt = models.ForeignKey(Prompt, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    commit_message = models.CharField(max_length=500, blank=True)
    
    class Meta:
        ordering = ['-version_number']
        unique_together = ['prompt', 'version_number']
    
    def __str__(self):
        return f"{self.prompt.title} v{self.version_number}"
