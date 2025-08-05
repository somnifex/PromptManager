from django.db import models
from django.core.cache import cache
import json

class SystemSetting(models.Model):
    """系统设置模型"""
    key = models.CharField(max_length=100, unique=True, help_text="设置键名")
    value = models.TextField(help_text="设置值 (JSON格式)")
    category = models.CharField(max_length=50, default='general', help_text="设置分类")
    description = models.CharField(max_length=255, blank=True, help_text="设置描述")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "系统设置"
        verbose_name_plural = "系统设置"
        ordering = ['category', 'key']

    def __str__(self):
        return f"{self.category}.{self.key}"

    @property
    def parsed_value(self):
        """返回解析后的值"""
        try:
            return json.loads(self.value)
        except (json.JSONDecodeError, ValueError):
            return self.value

    def set_value(self, value):
        """设置值，自动序列化为JSON"""
        if isinstance(value, (dict, list)):
            self.value = json.dumps(value, ensure_ascii=False)
        else:
            self.value = str(value)
        self.save()
        # 清除缓存
        cache.delete(f'system_setting_{self.key}')

    @classmethod
    def get_setting(cls, key, default=None):
        """获取设置值"""
        cache_key = f'system_setting_{key}'
        cached_value = cache.get(cache_key)
        
        if cached_value is not None:
            return cached_value
        
        try:
            setting = cls.objects.get(key=key)
            value = setting.parsed_value
            # 缓存1小时
            cache.set(cache_key, value, 3600)
            return value
        except cls.DoesNotExist:
            return default

    @classmethod
    def set_setting(cls, key, value, category='general', description=''):
        """设置值"""
        setting, created = cls.objects.get_or_create(
            key=key,
            defaults={
                'value': json.dumps(value, ensure_ascii=False) if isinstance(value, (dict, list)) else str(value),
                'category': category,
                'description': description
            }
        )
        if not created:
            setting.set_value(value)
            setting.category = category
            setting.description = description
            setting.save()
        return setting

    @classmethod
    def get_category_settings(cls, category):
        """获取某个分类的所有设置"""
        settings = cls.objects.filter(category=category)
        return {setting.key: setting.parsed_value for setting in settings}

    @classmethod
    def get_all_settings(cls):
        """获取所有设置，按分类组织"""
        settings = cls.objects.all()
        result = {}
        for setting in settings:
            if setting.category not in result:
                result[setting.category] = {}
            result[setting.category][setting.key] = setting.parsed_value
        return result
