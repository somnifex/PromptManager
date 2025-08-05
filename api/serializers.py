from rest_framework import serializers
from .models import SystemSetting

class SystemSettingSerializer(serializers.ModelSerializer):
    parsed_value = serializers.ReadOnlyField()
    
    class Meta:
        model = SystemSetting
        fields = ['id', 'key', 'value', 'parsed_value', 'category', 'description', 'created_at', 'updated_at']

class SystemSettingsUpdateSerializer(serializers.Serializer):
    """批量更新系统设置的序列化器"""
    settings = serializers.DictField(child=serializers.CharField(), help_text="设置键值对")
    
    def validate_settings(self, value):
        """验证设置数据"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("设置必须是字典格式")
        return value

class SystemSettingsCategorySerializer(serializers.Serializer):
    """按分类获取设置的序列化器"""
    category = serializers.CharField(help_text="设置分类")
