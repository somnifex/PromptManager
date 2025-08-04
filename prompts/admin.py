from django.contrib import admin
from .models import Prompt, PromptVersion

@admin.register(Prompt)
class PromptAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'sharing_mode', 'is_active', 'created_at', 'updated_at')
    list_filter = ('sharing_mode', 'is_active', 'created_at', 'author')
    search_fields = ('title', 'content', 'author__username')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(PromptVersion)
class PromptVersionAdmin(admin.ModelAdmin):
    list_display = ('prompt', 'version_number', 'author', 'created_at')
    list_filter = ('created_at', 'author')
    search_fields = ('prompt__title', 'content', 'author__username')
    readonly_fields = ('created_at',)
