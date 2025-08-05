"""
生产环境设置
"""
import os
from .settings import *

# 生产环境必须设置安全的SECRET_KEY
# 示例: 生成一个新的密钥
# python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
SECRET_KEY = os.environ.get('SECRET_KEY', 'temp-key-for-collectstatic-only-change-in-production')
if not SECRET_KEY or SECRET_KEY == 'temp-key-for-collectstatic-only-change-in-production':
    import sys
    if 'collectstatic' not in sys.argv:
        raise ValueError("生产环境必须设置SECRET_KEY环境变量")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['*']

# 安全设置
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# 生产环境的CORS设置
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
]

# 数据库设置 - 生产环境建议使用PostgreSQL
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': os.environ.get('DB_NAME'),
#         'USER': os.environ.get('DB_USER'),
#         'PASSWORD': os.environ.get('DB_PASSWORD'),
#         'HOST': os.environ.get('DB_HOST', 'localhost'),
#         'PORT': os.environ.get('DB_PORT', '5432'),
#     }
# }

# 静态文件设置
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# 日志设置 - 使用控制台输出
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
