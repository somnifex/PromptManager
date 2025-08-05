from django.db import models
from django.conf import settings
from django.utils import timezone

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#1976d2')  # 默认颜色
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Prompt(models.Model):
    SHARING_CHOICES = [
        ('private', 'Private'),
        ('team', 'Team Shared'),
    ]
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='prompts')
    sharing_mode = models.CharField(max_length=10, choices=SHARING_CHOICES, default='private')
    tags = models.ManyToManyField(Tag, blank=True, related_name='prompts')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title
    
    @property
    def latest_version(self):
        """获取最新版本"""
        return self.versions.first()  # 由于版本按 version_number 降序排列

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
