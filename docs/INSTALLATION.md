# 安装和设置指南

本文档提供了详细的安装和设置说明，帮助您快速部署提示词管理平台。

## 📋 系统要求

### 必需软件
- **Python**: 3.8 或更高版本
- **Node.js**: 16.0 或更高版本
- **npm**: 8.0 或更高版本（或 yarn 1.22+）

### 推荐配置
- **内存**: 最少 2GB RAM，推荐 4GB+
- **存储**: 最少 1GB 可用空间
- **操作系统**: Linux, macOS, Windows 10+

## 🚀 快速开始

### 方式一：使用开发环境（推荐）

#### 1. 准备工作

确保您已经安装了所需的软件：

```bash
# 检查 Python 版本
python --version
# 或者
python3 --version

# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version
```

#### 2. 获取源码

```bash
# 克隆项目（如果从 Git 仓库）
git clone <repository-url>
cd prompt

# 或者使用现有源码
cd /path/to/project
```

#### 3. 后端设置

##### 3.1 激活虚拟环境

```bash
# 激活虚拟环境
source .venv/bin/activate

# 验证虚拟环境
which python  # 应该显示虚拟环境中的 Python 路径
```

##### 3.2 安装依赖

```bash
# 使用 uv 安装依赖
uv pip install django djangorestframework django-cors-headers django-environ python-dotenv

# 或者使用 pip
pip install django djangorestframework django-cors-headers django-environ python-dotenv
```

##### 3.3 数据库设置

```bash
# 生成迁移文件
python manage.py makemigrations

# 应用迁移
python manage.py migrate

# 创建超级用户（可选）
python manage.py createsuperuser
```

**注意**: 在创建超级用户时，您需要提供：
- 用户名
- 邮箱地址
- 密码
- 确认密码

##### 3.4 启动后端服务

```bash
# 启动开发服务器
python manage.py runserver

# 或者指定端口和地址
python manage.py runserver 0.0.0.0:8000
```

后端服务将在 `http://localhost:8000` 启动

#### 4. 前端设置

##### 4.1 进入前端目录

```bash
cd frontend
```

##### 4.2 安装依赖

```bash
# 使用 npm 安装
npm install --legacy-peer-deps

# 或者使用 yarn
yarn install
```

**注意**: 如果遇到 npm 权限问题，可以尝试：
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install --legacy-peer-deps
```

##### 4.3 配置环境变量

创建 `.env` 文件：

```bash
# 创建环境变量文件
touch .env
```

在 `.env` 文件中添加：

```env
REACT_APP_API_URL=http://localhost:8000/api
```

##### 4.4 启动前端服务

```bash
# 启动开发服务器
npm start

# 或者指定端口
PORT=3001 npm start
```

前端应用将在 `http://localhost:3000` 启动

#### 5. 验证安装

1. **访问应用**: 打开浏览器访问 `http://localhost:3000`
2. **注册账户**: 点击 "Register" 标签，创建新用户
3. **登录系统**: 使用注册的账户登录
4. **创建提示词**: 点击 "New Prompt" 创建第一个提示词

### 方式二：使用 Docker（推荐用于生产环境）

#### 1. 安装 Docker

确保您的系统已经安装了 Docker 和 Docker Compose：

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker Compose 版本
docker-compose --version
```

#### 2. 创建 Docker 文件

创建 `Dockerfile`：

```dockerfile
# 后端 Dockerfile
FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目文件
COPY . .

# 收集静态文件
RUN python manage.py collectstatic --noinput

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["gunicorn", "prompt_management.wsgi:application", "--bind", "0.0.0.0:8000"]
```

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: prompt_db
      POSTGRES_USER: prompt_user
      POSTGRES_PASSWORD: prompt_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn prompt_management.wsgi:application --bind 0.0.0.0:8000"
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://prompt_user:prompt_password@db:5432/prompt_db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### 3. 构建和启动

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up

# 或者在后台启动
docker-compose up -d
```

## 🔧 详细配置

### 后端配置

#### 1. 数据库配置

默认使用 SQLite，生产环境建议使用 PostgreSQL 或 MySQL。

**PostgreSQL 配置示例**：

```python
# prompt_management/settings.py

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'prompt_db',
        'USER': 'prompt_user',
        'PASSWORD': 'prompt_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**MySQL 配置示例**：

```python
# prompt_management/settings.py

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'prompt_db',
        'USER': 'prompt_user',
        'PASSWORD': 'prompt_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

#### 2. 环境变量配置

创建 `.env` 文件用于环境变量管理：

```env
# Django 配置
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3

# CORS 配置
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# 邮件配置（可选）
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

#### 3. 安全配置

生产环境的安全配置：

```python
# prompt_management/settings.py

# 关闭调试模式
DEBUG = False

# 允许的主机
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']

# 安全设置
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True

# CSRF 设置
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'

# Session 设置
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
```

### 前端配置

#### 1. 环境变量

创建 `.env` 文件：

```env
# API 配置
REACT_APP_API_URL=https://your-domain.com/api

# 其他配置
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

#### 2. 自定义主题

修改 `src/index.js` 中的主题配置：

```javascript
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
    },
    h2: {
      fontSize: '2rem',
    },
    h3: {
      fontSize: '1.75rem',
    },
    h4: {
      fontSize: '1.5rem',
    },
    h5: {
      fontSize: '1.25rem',
    },
    h6: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
```

#### 3. 构建配置

创建 `webpack.config.js`（如果需要自定义构建）：

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 3000,
    hot: true,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
};
```

## 🐛 故障排除

### 常见问题及解决方案

#### 1. 虚拟环境问题

**问题**: `source .venv/bin/activate` 命令失败

**解决方案**:
```bash
# 检查虚拟环境路径
ls -la .venv/bin/

# 如果路径不存在，重新创建虚拟环境
python -m venv .venv

# 激活虚拟环境
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

#### 2. Python 包安装失败

**问题**: `pip install` 命令失败

**解决方案**:
```bash
# 升级 pip
pip install --upgrade pip

# 清理缓存
pip cache purge

# 使用国内镜像
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple django

# 或者使用 uv
uv pip install django
```

#### 3. Django 迁移错误

**问题**: `python manage.py migrate` 失败

**解决方案**:
```bash
# 删除迁移文件
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/__pycache__" -type d -exec rm -rf {} +

# 重新生成迁移
python manage.py makemigrations

# 重新应用迁移
python manage.py migrate

# 如果还有问题，可以尝试删除数据库并重新开始
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

#### 4. CORS 错误

**问题**: 前端访问后端 API 时出现 CORS 错误

**解决方案**:
```python
# 检查 prompt_management/settings.py 中的 CORS 配置

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# 如果使用 HTTPS，添加 HTTPS 地址
CORS_ALLOWED_ORIGINS += [
    "https://localhost:3000",
    "https://127.0.0.1:3000",
]

# 确保中间件顺序正确
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # ... 其他中间件
]
```

#### 5. npm 安装失败

**问题**: `npm install` 命令失败

**解决方案**:
```bash
# 清理 npm 缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install --legacy-peer-deps

# 或者使用 yarn
npm install -g yarn
yarn install
```

#### 6. 前端构建失败

**问题**: `npm run build` 失败

**解决方案**:
```bash
# 检查 Node.js 版本
node --version

# 如果版本过低，升级 Node.js
# 使用 nvm 管理 Node.js 版本
nvm install 18
nvm use 18

# 重新安装依赖
npm install --legacy-peer-deps

# 构建项目
npm run build
```

#### 7. 数据库连接错误

**问题**: 数据库连接失败

**解决方案**:
```bash
# 检查数据库服务状态
# PostgreSQL
sudo systemctl status postgresql

# MySQL
sudo systemctl status mysql

# 检查数据库配置
python manage.py check --database default

# 测试数据库连接
python manage.py dbshell
```

#### 8. 权限问题

**问题**: 文件权限错误

**解决方案**:
```bash
# 修复文件权限
chmod +x manage.py

# 设置适当的文件夹权限
chmod 755 .venv/
chmod 644 db.sqlite3

# 如果使用 SQLite，确保数据库文件可写
touch db.sqlite3
chmod 664 db.sqlite3
```

### 调试技巧

#### 1. 开启详细日志

```bash
# Django 详细日志
python manage.py runserver --verbosity=2

# 或者设置环境变量
export DJANGO_LOG_LEVEL=DEBUG
```

#### 2. 使用调试工具

```python
# 在 views.py 中添加调试代码
import pdb

def my_view(request):
    pdb.set_trace()  # 调试断点
    # ... 其他代码
```

#### 3. 检查网络连接

```bash
# 测试后端 API
curl http://localhost:8000/api/users/login/

# 测试前端应用
curl http://localhost:3000/

# 检查端口占用
lsof -i :8000
lsof -i :3000
```

#### 4. 查看错误日志

```bash
# Django 错误日志
tail -f logs/django.log

# npm 错误日志
tail -f npm-debug.log

# 系统日志
journalctl -f -u nginx
```

## 📚 相关资源

### 官方文档
- [Django 官方文档](https://docs.djangoproject.com/)
- [Django REST Framework 文档](https://www.django-rest-framework.org/)
- [React 官方文档](https://react.dev/)
- [Material-UI 文档](https://mui.com/)

### 学习资源
- [Django 教程](https://www.djangoproject.com/start/)
- [React 教程](https://react.dev/learn)
- [REST API 设计指南](https://restfulapi.net/)

### 社区支持
- [Stack Overflow](https://stackoverflow.com/)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Reddit Django 社区](https://www.reddit.com/r/django/)
- [Reddit React 社区](https://www.reddit.com/r/reactjs/)

---

如果您在安装过程中遇到任何问题，请查看故障排除部分或联系技术支持团队。