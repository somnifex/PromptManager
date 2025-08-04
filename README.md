# Prompt Management Platform

一个现代化的提示词管理平台，支持多用户协作、版本控制和多语言界面。基于 Django 后端和 React 前端构建。

## ✨ 主要特性

### 🎨 现代化界面

- **美观设计**: 采用 Material-UI 组件库，现代化的视觉设计
- **深色模式**: 支持浅色/深色主题自动切换
- **流畅动画**: 使用 Framer Motion 实现丰富的交互动画
- **响应式布局**: 完美适配桌面、平板和移动设备

### 🌍 多语言支持

- **国际化**: 完整的中英文界面切换
- **智能检测**: 自动检测浏览器语言偏好
- **本地存储**: 语言设置自动保存

### 💼 核心功能

- **用户认证**: 基于角色的访问控制（管理员/普通用户）
- **提示词管理**: 完整的 CRUD 操作
- **版本控制**: Git 风格的版本历史和恢复
- **协作共享**: 支持私有和团队共享模式
- **搜索过滤**: 强大的搜索和筛选功能

## 📋 系统架构

### 后端架构

```
prompt_management/
├── prompt_management/     # 项目配置
├── users/                # 用户管理应用
│   ├── models.py        # 用户模型
│   ├── serializers.py   # 序列化器
│   ├── views.py         # 视图层
│   └── urls.py          # URL 路由
├── prompts/             # 提示词管理应用
│   ├── models.py        # 提示词和版本模型
│   ├── serializers.py   # 序列化器
│   ├── views.py         # 视图层
│   └── urls.py          # URL 路由
└── api/                 # API 路由聚合
```

### 前端架构

```
frontend/
├── src/
│   ├── components/      # React 组件
│   │   ├── Layout.js    # 布局组件
│   │   ├── Login.js     # 登录组件
│   │   ├── Dashboard.js # 仪表板组件
│   │   ├── PromptForm.js # 提示词表单组件
│   │   └── PromptDetail.js # 提示词详情组件
│   ├── slices/          # Redux 切片
│   │   ├── authSlice.js # 认证状态管理
│   │   └── promptSlice.js # 提示词状态管理
│   ├── store.js         # Redux 存储
│   ├── App.js           # 主应用组件
│   └── index.js         # 入口文件
└── public/              # 静态资源
```

## 🛠️ 安装和设置

### 环境要求

- Python 3.8+
- Node.js 16+
- npm 或 yarn
- Git

### 快速开始

1. **克隆项目**

```bash
git clone <repository-url>
cd prompt_management_platform
```

2. **后端设置**

```bash
# 创建并激活虚拟环境
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# 或 .venv\Scripts\activate  # Windows

# 安装后端依赖
pip install -r requirements.txt

# 数据库迁移
python manage.py migrate

# 创建管理员用户
python manage.py createsuperuser

# 启动后端服务
python manage.py runserver
```

3. **前端设置**

```bash
# 在新的终端窗口中
cd frontend

# 安装前端依赖
npm install --legacy-peer-deps

# 启动前端服务
npm start
```

### 访问应用

- 前端: http://localhost:3000
- 后端 API: http://localhost:8000/api
- 管理后台: http://localhost:8000/admin

## � 生产部署

### 环境配置

1. **复制环境变量模板**

```bash
cp .env.example .env
```

2. **编辑环境变量**

```bash
# 修改.env文件中的配置
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgresql://user:password@localhost/dbname
```

### Docker 部署（推荐）

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 数据库迁移
docker-compose exec web python manage.py migrate

# 创建超级用户
docker-compose exec web python manage.py createsuperuser
```

### 传统部署

1. **后端部署**

```bash
# 安装生产依赖
pip install gunicorn

# 收集静态文件
python manage.py collectstatic

# 使用gunicorn启动
gunicorn prompt_management.wsgi:application --bind 0.0.0.0:8000
```

2. **前端部署**

```bash
cd frontend

# 构建生产版本
npm run build

# 将build目录部署到Web服务器
```

```python
# CORS 配置
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# 认证配置
AUTH_USER_MODEL = 'users.User'

# REST Framework 配置
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

## 📖 API 文档

### 认证接口

#### 用户注册

```
POST /api/users/register/
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user|admin"
}
```

#### 用户登录

```
POST /api/users/login/
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### 用户登出

```
POST /api/users/logout/
Authorization: Token <token>
```

#### 获取用户信息

```
GET /api/users/profile/
Authorization: Token <token>
```

### 提示词接口

#### 获取提示词列表

```
GET /api/prompts/
Authorization: Token <token>
```

#### 创建提示词

```
POST /api/prompts/
Authorization: Token <token>
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  "sharing_mode": "private|team",
  "commit_message": "string (optional)"
}
```

#### 获取提示词详情

```
GET /api/prompts/{id}/
Authorization: Token <token>
```

#### 更新提示词

```
PUT /api/prompts/{id}/
Authorization: Token <token>
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  "sharing_mode": "private|team",
  "commit_message": "string (optional)"
}
```

#### 删除提示词

```
DELETE /api/prompts/{id}/
Authorization: Token <token>
```

#### 获取版本历史

```
GET /api/prompts/{id}/versions/
Authorization: Token <token>
```

#### 恢复版本

```
POST /api/prompts/{id}/versions/{version_id}/restore/
Authorization: Token <token>
```

## 👥 用户角色和权限

### 管理员 (Admin)

- 查看所有用户的提示词
- 编辑和删除任何提示词
- 管理用户账户
- 完全的系统访问权限

### 普通用户 (User)

- 创建、编辑、删除自己的提示词
- 查看团队共享的提示词
- 查看提示词版本历史
- 恢复自己的提示词版本

### 共享模式

#### 私有 (Private)

- 只有创建者可以查看和编辑
- 其他用户无法访问

#### 团队共享 (Team)

- 所有用户都可以查看
- 只有创建者和管理员可以编辑

## 🔒 版本控制

### 版本生成规则

- 创建提示词时自动生成版本 1
- 每次编辑提示词内容时自动创建新版本
- 版本号自动递增（1, 2, 3, ...）

### 版本信息

每个版本包含：
- 版本号
- 内容快照
- 修改人
- 创建时间
- 提交消息（可选）

### 版本操作

- **查看历史**: 查看提示词的所有版本
- **恢复版本**: 将提示词恢复到指定版本
- **版本对比**: 查看不同版本之间的内容差异

## 🎯 使用指南

### 首次使用

1. **注册账户**
   - 访问 `http://localhost:3000`
   - 点击 "Register" 标签
   - 填写用户名、邮箱、密码
   - 选择角色（用户/管理员）
2. **登录系统**
   - 使用注册的账户登录
   - 登录成功后自动跳转到仪表板
3. **创建提示词**
   - 点击 "New Prompt" 按钮
   - 填写标题和内容
   - 选择共享模式（私有/团队共享）
   - 添加提交消息（可选）
   - 点击 "Create Prompt"

### 日常使用

#### 查看提示词

- 在仪表板查看所有可访问的提示词
- 点击提示词卡片查看详情
- 查看版本历史和共享状态

#### 编辑提示词

- 点击提示词卡片的编辑按钮
- 修改标题、内容或共享模式
- 添加提交消息说明修改内容
- 保存后自动创建新版本

#### 管理版本

- 在提示词详情页面点击 "History"
- 查看所有版本的详细信息
- 选择版本查看具体内容
- 点击恢复按钮恢复到指定版本

### 团队协作

#### 共享提示词

- 创建或编辑提示词时选择 "Team Shared"
- 团队成员可以在仪表板看到共享的提示词
- 只有创建者可以编辑共享的提示词

#### 版本追踪

- 所有修改都会自动生成版本记录
- 可以追踪谁在什么时候做了什么修改
- 支持恢复到任何历史版本

## 🧪 测试

### 后端测试

```bash
python manage.py test
```

### 前端测试

```bash
npm test
```

### 运行所有测试

```bash
# 后端
source .venv/bin/activate
python manage.py test

# 前端
cd frontend
npm test
```

## 🚀 部署

### 生产环境配置

1. **环境变量设置**

```bash
# Django 设置
export DEBUG=False
export SECRET_KEY=your-secret-key
export DATABASE_URL=your-database-url

# 前端设置
export REACT_APP_API_URL=https://your-domain.com/api
```

2. **数据库迁移**

```bash
python manage.py migrate
```

3. **静态文件收集**

```bash
python manage.py collectstatic
```

4. **前端构建**

```bash
cd frontend
npm run build
```

### 部署选项

#### 使用 Gunicorn + Nginx

```bash
# 安装 Gunicorn
pip install gunicorn

# 启动服务
gunicorn prompt_management.wsgi:application --bind 0.0.0.0:8000

# Nginx 配置示例
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /static/ {
        alias /path/to/static/;
    }
}
```

#### 使用 Docker

```dockerfile
# Dockerfile
FROM python:3.9

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "prompt_management.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 故障排除

### 常见问题

#### 1. CORS 错误

确保在 `settings.py` 中正确配置了 CORS：

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

#### 2. 认证失败

检查请求头中是否包含正确的 Token：

```javascript
axios.defaults.headers.common['Authorization'] = `Token ${token}`;
```

#### 3. 数据库连接错误

确保数据库服务正在运行，并检查 `DATABASES` 配置：

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

#### 4. 前端构建失败

清理 node_modules 并重新安装：

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 开发环境调试

#### 后端调试

```bash
# 开启调试模式
export DEBUG=True

# 查看详细错误日志
python manage.py runserver --verbosity=2
```

#### 前端调试

```bash
# 开启开发者工具
npm start

# 查看控制台日志
# 浏览器按 F12 打开开发者工具
```

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查 [Issues](https://github.com/your-repo/issues) 页面
3. 创建新的 Issue 描述问题

## 🔮 未来计划

- [ ] 添加标签和分类功能
- [ ] 实现全文搜索
- [ ] 添加导入/导出功能
- [ ] 集成更多 AI 模型
- [ ] 添加团队管理功能
- [ ] 实现实时协作
- [ ] 添加数据统计和分析
- [ ] 移动端应用开发

---

**提示词管理平台** - 为团队提供集中式、可追溯的提示词知识库解决方案