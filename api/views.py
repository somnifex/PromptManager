from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from users.views import IsAdmin
from .models import SystemSetting
from .serializers import SystemSettingSerializer, SystemSettingsUpdateSerializer
import json

class IsAdminOrReadOnly(permissions.BasePermission):
    """只有管理员可以修改，所有人可以读取公开设置"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'

@api_view(['GET', 'PUT'])
@permission_classes([IsAdmin])
def system_settings(request):
    """获取或更新系统设置"""
    if request.method == 'GET':
        # 获取所有设置，按分类组织
        settings = SystemSetting.get_all_settings()
        
        # 如果没有设置，返回默认设置
        if not settings:
            default_settings = get_default_settings()
            return Response(default_settings)
        
        return Response(settings)
    
    elif request.method == 'PUT':
        # 批量更新设置
        settings_data = request.data.get('settings', {})
        
        if not isinstance(settings_data, dict):
            return Response({'error': 'Settings must be a dictionary'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 更新设置
        for key, value in settings_data.items():
            # 根据键名确定分类
            category = determine_category(key)
            SystemSetting.set_setting(key, value, category=category)
        
        # 返回更新后的设置
        updated_settings = SystemSetting.get_all_settings()
        return Response(updated_settings)

@api_view(['GET'])
@permission_classes([IsAdminOrReadOnly])
def system_settings_category(request, category):
    """获取指定分类的设置"""
    settings = SystemSetting.get_category_settings(category)
    return Response(settings)

def get_default_settings():
    """获取默认设置"""
    return {
        'basic': {
            'siteName': 'Prompt Management System',
            'siteDescription': 'A powerful prompt management platform',
            'maintenanceMode': False,
            'allowRegistration': True,
        },
        'email': {
            'emailEnabled': False,
            'smtpHost': '',
            'smtpPort': 587,
            'smtpUser': '',
            'smtpPassword': '',
            'smtpTLS': True,
        },
        'security': {
            'sessionTimeout': 24,
            'passwordMinLength': 8,
            'requireStrongPassword': True,
            'twoFactorEnabled': False,
        },
        'storage': {
            'maxFileSize': 10,
            'allowedFileTypes': 'txt,md,json',
            'storageQuota': 1000,
        },
        'performance': {
            'cacheEnabled': True,
            'cacheTimeout': 3600,
            'rateLimit': 1000,
        },
        'logs': {
            'logLevel': 'INFO',
            'logRetention': 30,
        }
    }

def determine_category(key):
    """根据键名确定分类"""
    category_map = {
        'siteName': 'basic',
        'siteDescription': 'basic',
        'maintenanceMode': 'basic',
        'allowRegistration': 'basic',
        
        'emailEnabled': 'email',
        'smtpHost': 'email',
        'smtpPort': 'email',
        'smtpUser': 'email',
        'smtpPassword': 'email',
        'smtpTLS': 'email',
        
        'sessionTimeout': 'security',
        'passwordMinLength': 'security',
        'requireStrongPassword': 'security',
        'twoFactorEnabled': 'security',
        
        'maxFileSize': 'storage',
        'allowedFileTypes': 'storage',
        'storageQuota': 'storage',
        
        'cacheEnabled': 'performance',
        'cacheTimeout': 'performance',
        'rateLimit': 'performance',
        
        'logLevel': 'logs',
        'logRetention': 'logs',
    }
    return category_map.get(key, 'general')
