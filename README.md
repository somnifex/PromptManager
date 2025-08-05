# Prompt Management Platform

## 项目简介

Prompt Management Platform 是一个功能强大的提示词管理与协作工具，帮助个人和团队高效地创建、管理、共享和版本化各类提示词。

## 主要功能

- **用户系统**: 用户注册、登录、权限控制
- **提示词管理**: 完整的CRUD功能，支持私有和团队共享模式
- **版本控制**: 自动记录变更历史，支持版本恢复
- **标签系统**: 多标签分类和快速筛选
- **现代化界面**: 响应式设计，支持深浅模式切换和国际化

## 技术栈

### 后端

- Django + Django Rest Framework
- SQLite/PostgreSQL
- Token认证
- Docker部署

### 前端

- React + Material-UI
- Redux Toolkit
- React Router + i18next

### 后端目录结构

```
.
├── api/                  # API 跄由聚合
├── prompts/              # 核心应用：提示词、版本、标签管理
├── prompt_management/    # Django 项目主配置
├── users/                # 用户及认证管理应用
└── manage.py             # Django 管理脚本
```

### 前端目录结构

```
frontend/
├── public/               # 公共静态资源
└── src/
    ├── api/              # (隐式) API 请求逻辑封装在 Slice 中
    ├── components/       # 可复用 React 组件
    ├── contexts/         # React Context
    ├── i18n/             # 国际化配置与语言文件
## 快速开始

### 环境要求
- Python 3.8+
- Node.js 16+

### 后端启动
```

bash
# 克隆项目
git clone <repository-url>
cd PromptManager

# 创建虚拟环境

python3 -m venv .venv
source .venv/bin/activate

# 安装依赖

pip install -r requirements.txt

# 数据库迁移

python manage.py migrate

# 启动服务

python manage.py runserver
```

### 前端启动

```bash
cd frontend
npm install
npm start
```

### Docker部署

```bash
# 开发环境
docker-compose up --build

# 生产环境
docker-compose -f docker-compose.prod.yml up --build -d
```