from django.contrib import admin
from .models import SystemSetting

@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ['key', 'category', 'value', 'description', 'updated_at']
    list_filter = ['category', 'created_at', 'updated_at']
    search_fields = ['key', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('key', 'value', 'category', 'description')
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
