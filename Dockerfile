# 后端Dockerfile
FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目文件
COPY . .

# 设置Django使用生产环境设置
ENV DJANGO_SETTINGS_MODULE=prompt_management.settings_production

# 创建静态文件目录
RUN mkdir -p staticfiles

# 收集静态文件
RUN python manage.py collectstatic --noinput

# 暴露端口
EXPOSE 8000

# 设置环境变量
ENV DJANGO_SETTINGS_MODULE=prompt_management.settings_production

# 启动命令
CMD ["gunicorn", "prompt_management.wsgi:application", "--bind", "0.0.0.0:8000"]
