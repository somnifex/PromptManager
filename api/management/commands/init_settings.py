from django.core.management.base import BaseCommand
from api.models import SystemSetting

class Command(BaseCommand):
    help = '初始化系统默认设置'

    def handle(self, *args, **options):
        """初始化默认设置"""
        default_settings = {
            # 基础设置
            'basic': {
                'siteName': 'Prompt Management System',
                'siteDescription': 'A powerful prompt management platform',
                'maintenanceMode': False,
                'allowRegistration': True,
            },
            # 邮件设置
            'email': {
                'emailEnabled': False,
                'smtpHost': '',
                'smtpPort': 587,
                'smtpUser': '',
                'smtpPassword': '',
                'smtpTLS': True,
            },
            # 安全设置
            'security': {
                'sessionTimeout': 24,
                'passwordMinLength': 8,
                'requireStrongPassword': True,
                'twoFactorEnabled': False,
            },
            # 存储设置
            'storage': {
                'maxFileSize': 10,
                'allowedFileTypes': 'txt,md,json',
                'storageQuota': 1000,
            },
            # 性能设置
            'performance': {
                'cacheEnabled': True,
                'cacheTimeout': 3600,
                'rateLimit': 1000,
            },
            # 日志设置
            'logs': {
                'logLevel': 'INFO',
                'logRetention': 30,
            }
        }

        created_count = 0
        updated_count = 0

        for category, settings in default_settings.items():
            for key, value in settings.items():
                setting, created = SystemSetting.objects.get_or_create(
                    key=key,
                    defaults={
                        'value': str(value),
                        'category': category,
                        'description': f'Default {key} setting'
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'创建设置: {category}.{key} = {value}')
                    )
                else:
                    # 如果设置已存在，不覆盖用户的配置
                    self.stdout.write(
                        self.style.WARNING(f'设置已存在，跳过: {category}.{key}')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'初始化完成! 创建了 {created_count} 个新设置，跳过了 {updated_count} 个已存在的设置。'
            )
        )
