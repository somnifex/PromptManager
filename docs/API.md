# API 文档

本文档详细描述了提示词管理平台的 RESTful API 接口。

## 📋 概览

- **基础 URL**: `http://localhost:8000/api`
- **认证方式**: Token 认证
- **数据格式**: JSON
- **字符编码**: UTF-8

## 🔐 认证

所有 API 请求（除了注册和登录）都需要在请求头中包含认证 Token：

```http
Authorization: Token <your-token>
```

## 📊 响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "Error message",
  "status_code": 400
}
```

## 👤 用户认证 API

### 1. 用户注册

创建新用户账户。

**Endpoint**: `POST /api/users/register/`

**请求参数**:
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "password_confirm": "string (required)",
  "role": "string (optional, default: 'user')"
}
```

**角色选项**:
- `user`: 普通用户
- `admin`: 管理员

**成功响应** (201):
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true
  },
  "token": "abc123def456..."
}
```

**错误响应** (400):
```json
{
  "username": ["Username already exists"],
  "email": ["Email already exists"],
  "password": ["Passwords don't match"]
}
```

### 2. 用户登录

使用用户名和密码登录。

**Endpoint**: `POST /api/users/login/`

**请求参数**:
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**成功响应** (200):
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true
  },
  "token": "abc123def456..."
}
```

**错误响应** (400):
```json
{
  "non_field_errors": ["Invalid credentials"]
}
```

### 3. 用户登出

登出当前用户并删除 Token。

**Endpoint**: `POST /api/users/logout/`

**请求头**:
```
Authorization: Token <your-token>
```

**成功响应** (200):
```json
{
  "message": "Successfully logged out"
}
```

### 4. 获取用户信息

获取当前登录用户的信息。

**Endpoint**: `GET /api/users/profile/`

**请求头**:
```
Authorization: Token <your-token>
```

**成功响应** (200):
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "created_at": "2024-01-01T00:00:00Z",
  "is_active": true
}
```

## 📝 提示词管理 API

### 1. 获取提示词列表

获取用户可访问的提示词列表。

**Endpoint**: `GET /api/prompts/`

**请求头**:
```
Authorization: Token <your-token>
```

**查询参数**:
- `page`: 页码（默认：1）
- `page_size`: 每页数量（默认：20）

**成功响应** (200):
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/prompts/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Code Review Assistant",
      "content": "Please review the following code and provide feedback...",
      "author_username": "john_doe",
      "sharing_mode": "team",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "latest_version": {
        "version_number": 3,
        "content": "Updated code review prompt...",
        "author_username": "john_doe",
        "created_at": "2024-01-01T12:00:00Z",
        "commit_message": "Added security review section"
      },
      "versions": [...]
    }
  ]
}
```

**响应字段说明**:
- `id`: 提示词唯一标识符
- `title`: 提示词标题
- `content`: 提示词内容
- `author_username`: 作者用户名
- `sharing_mode`: 共享模式（`private` 或 `team`）
- `is_active`: 是否激活
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `latest_version`: 最新版本信息
- `versions`: 所有版本列表

### 2. 创建提示词

创建新的提示词。

**Endpoint**: `POST /api/prompts/`

**请求头**:
```
Authorization: Token <your-token>
Content-Type: application/json
```

**请求参数**:
```json
{
  "title": "string (required)",
  "content": "string (required)",
  "sharing_mode": "string (optional, default: 'private')",
  "commit_message": "string (optional)"
}
```

**共享模式选项**:
- `private`: 私有（仅创建者可访问）
- `team`: 团队共享（所有用户可查看）

**成功响应** (201):
```json
{
  "id": 1,
  "title": "Code Review Assistant",
  "content": "Please review the following code and provide feedback...",
  "author_username": "john_doe",
  "sharing_mode": "team",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "latest_version": {
    "version_number": 1,
    "content": "Please review the following code and provide feedback...",
    "author_username": "john_doe",
    "created_at": "2024-01-01T00:00:00Z",
    "commit_message": ""
  },
  "versions": [...]
}
```

### 3. 获取提示词详情

获取指定提示词的详细信息。

**Endpoint**: `GET /api/prompts/{id}/`

**请求头**:
```
Authorization: Token <your-token>
```

**路径参数**:
- `id`: 提示词 ID

**成功响应** (200):
```json
{
  "id": 1,
  "title": "Code Review Assistant",
  "content": "Please review the following code and provide feedback...",
  "author_username": "john_doe",
  "sharing_mode": "team",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "latest_version": {
    "version_number": 3,
    "content": "Updated code review prompt...",
    "author_username": "john_doe",
    "created_at": "2024-01-01T12:00:00Z",
    "commit_message": "Added security review section"
  },
  "versions": [
    {
      "id": 1,
      "version_number": 1,
      "content": "Original content...",
      "author_username": "john_doe",
      "created_at": "2024-01-01T00:00:00Z",
      "commit_message": "Initial version"
    },
    {
      "id": 2,
      "version_number": 2,
      "content": "Updated content...",
      "author_username": "john_doe",
      "created_at": "2024-01-01T06:00:00Z",
      "commit_message": "Added performance section"
    },
    {
      "id": 3,
      "version_number": 3,
      "content": "Updated code review prompt...",
      "author_username": "john_doe",
      "created_at": "2024-01-01T12:00:00Z",
      "commit_message": "Added security review section"
    }
  ]
}
```

### 4. 更新提示词

更新指定提示词的信息。

**Endpoint**: `PUT /api/prompts/{id}/`

**请求头**:
```
Authorization: Token <your-token>
Content-Type: application/json
```

**路径参数**:
- `id`: 提示词 ID

**请求参数**:
```json
{
  "title": "string (optional)",
  "content": "string (optional)",
  "sharing_mode": "string (optional)",
  "commit_message": "string (optional)"
}
```

**成功响应** (200):
```json
{
  "id": 1,
  "title": "Updated Code Review Assistant",
  "content": "Updated prompt content...",
  "author_username": "john_doe",
  "sharing_mode": "team",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T15:00:00Z",
  "latest_version": {
    "version_number": 4,
    "content": "Updated prompt content...",
    "author_username": "john_doe",
    "created_at": "2024-01-01T15:00:00Z",
    "commit_message": "Updated title and content"
  },
  "versions": [...]
}
```

**注意**: 当 `content` 字段被修改时，系统会自动创建新的版本。

### 5. 删除提示词

删除指定的提示词。

**Endpoint**: `DELETE /api/prompts/{id}/`

**请求头**:
```
Authorization: Token <your-token>
```

**路径参数**:
- `id`: 提示词 ID

**成功响应** (204):
```
[Empty response body]
```

### 6. 获取版本历史

获取指定提示词的版本历史。

**Endpoint**: `GET /api/prompts/{prompt_id}/versions/`

**请求头**:
```
Authorization: Token <your-token>
```

**路径参数**:
- `prompt_id`: 提示词 ID

**成功响应** (200):
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "version_number": 1,
      "content": "Original content...",
      "author_username": "john_doe",
      "created_at": "2024-01-01T00:00:00Z",
      "commit_message": "Initial version"
    },
    {
      "id": 2,
      "version_number": 2,
      "content": "Updated content...",
      "author_username": "john_doe",
      "created_at": "2024-01-01T06:00:00Z",
      "commit_message": "Added performance section"
    },
    {
      "id": 3,
      "version_number": 3,
      "content": "Updated code review prompt...",
      "author_username": "john_doe",
      "created_at": "2024-01-01T12:00:00Z",
      "commit_message": "Added security review section"
    }
  ]
}
```

### 7. 恢复版本

将提示词恢复到指定版本。

**Endpoint**: `POST /api/prompts/{prompt_id}/versions/{version_id}/restore/`

**请求头**:
```
Authorization: Token <your-token>
```

**路径参数**:
- `prompt_id`: 提示词 ID
- `version_id`: 版本 ID

**成功响应** (200):
```json
{
  "message": "Version restored successfully"
}
```

**注意**: 恢复操作会创建一个新版本，包含被恢复版本的内容。

## 🔐 权限系统

### 用户权限

#### 普通用户 (User)
- ✅ 创建自己的提示词
- ✅ 查看自己的提示词
- ✅ 编辑自己的提示词
- ✅ 删除自己的提示词
- ✅ 查看团队共享的提示词
- ✅ 查看版本历史
- ✅ 恢复自己的提示词版本
- ❌ 查看其他用户的私有提示词
- ❌ 编辑其他用户的提示词
- ❌ 删除其他用户的提示词
- ❌ 管理用户账户

#### 管理员 (Admin)
- ✅ 所有普通用户的权限
- ✅ 查看所有提示词
- ✅ 编辑任何提示词
- ✅ 删除任何提示词
- ✅ 恢复任何提示词版本
- ✅ 管理用户账户

### 共享模式权限

#### 私有 (Private)
- 👁️ 只有创建者和管理员可以查看
- ✏️ 只有创建者和管理员可以编辑
- 🗑️ 只有创建者和管理员可以删除

#### 团队共享 (Team)
- 👁️ 所有用户都可以查看
- ✏️ 只有创建者和管理员可以编辑
- 🗑️ 只有创建者和管理员可以删除

## 🚨 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 204 | 删除成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 405 | 方法不允许 |
| 500 | 服务器内部错误 |

## 🔄 分页

列表接口支持分页，使用以下查询参数：

- `page`: 页码（从 1 开始）
- `page_size`: 每页数量（默认：20，最大：100）

**分页响应格式**:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/prompts/?page=2",
  "previous": null,
  "results": [...]
}
```

## 📝 示例代码

### Python 示例

```python
import requests

# API 基础 URL
BASE_URL = "http://localhost:8000/api"

# 用户登录
def login(username, password):
    response = requests.post(f"{BASE_URL}/users/login/", json={
        "username": username,
        "password": password
    })
    if response.status_code == 200:
        return response.json()["token"]
    return None

# 获取提示词列表
def get_prompts(token):
    headers = {"Authorization": f"Token {token}"}
    response = requests.get(f"{BASE_URL}/prompts/", headers=headers)
    return response.json()

# 创建提示词
def create_prompt(token, title, content, sharing_mode="private"):
    headers = {"Authorization": f"Token {token}"}
    data = {
        "title": title,
        "content": content,
        "sharing_mode": sharing_mode
    }
    response = requests.post(f"{BASE_URL}/prompts/", json=data, headers=headers)
    return response.json()

# 使用示例
if __name__ == "__main__":
    # 登录
    token = login("john_doe", "password123")
    if token:
        print("登录成功")
        
        # 获取提示词列表
        prompts = get_prompts(token)
        print(f"共有 {prompts['count']} 个提示词")
        
        # 创建新提示词
        new_prompt = create_prompt(
            token,
            "测试提示词",
            "这是一个测试提示词的内容。",
            "team"
        )
        print(f"创建提示词成功，ID: {new_prompt['id']}")
    else:
        print("登录失败")
```

### JavaScript 示例

```javascript
// API 基础 URL
const BASE_URL = 'http://localhost:8000/api';

// 用户登录
async function login(username, password) {
  try {
    const response = await fetch(`${BASE_URL}/users/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
    return null;
  } catch (error) {
    console.error('登录失败:', error);
    return null;
  }
}

// 获取提示词列表
async function getPrompts(token) {
  try {
    const response = await fetch(`${BASE_URL}/prompts/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('获取提示词列表失败:', error);
    return null;
  }
}

// 创建提示词
async function createPrompt(token, title, content, sharingMode = 'private') {
  try {
    const response = await fetch(`${BASE_URL}/prompts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        sharing_mode: sharingMode,
      }),
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('创建提示词失败:', error);
    return null;
  }
}

// 使用示例
(async function() {
  // 登录
  const token = await login('john_doe', 'password123');
  if (token) {
    console.log('登录成功');
    
    // 获取提示词列表
    const prompts = await getPrompts(token);
    if (prompts) {
      console.log(`共有 ${prompts.count} 个提示词`);
    }
    
    // 创建新提示词
    const newPrompt = await createPrompt(
      token,
      '测试提示词',
      '这是一个测试提示词的内容。',
      'team'
    );
    if (newPrompt) {
      console.log(`创建提示词成功，ID: ${newPrompt.id}`);
    }
  } else {
    console.log('登录失败');
  }
})();
```

### cURL 示例

```bash
#!/bin/bash

# API 基础 URL
BASE_URL="http://localhost:8000/api"

# 用户登录
echo "登录用户..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/users/login/" \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "password123"}')

# 提取 token
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
echo "Token: $TOKEN"

# 获取提示词列表
echo "获取提示词列表..."
curl -s -X GET "${BASE_URL}/prompts/" \
  -H "Authorization: Token ${TOKEN}" | python3 -m json.tool

# 创建提示词
echo "创建提示词..."
curl -s -X POST "${BASE_URL}/prompts/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Token ${TOKEN}" \
  -d '{
    "title": "cURL 测试提示词",
    "content": "通过 cURL 创建的测试提示词",
    "sharing_mode": "team",
    "commit_message": "通过 cURL 创建"
  }' | python3 -m json.tool

# 获取版本历史
echo "获取版本历史..."
curl -s -X GET "${BASE_URL}/prompts/1/versions/" \
  -H "Authorization: Token ${TOKEN}" | python3 -m json.tool
```

## 📈 性能考虑

### 请求限制
- 单个请求返回的最大记录数：100
- 分页大小默认值：20
- 建议的页面大小：10-50

### 缓存策略
- 用户认证信息不缓存
- 提示词列表缓存时间：5 分钟
- 版本历史缓存时间：10 分钟

### 并发处理
- 支持并发请求
- 版本创建采用乐观锁机制
- 数据库操作使用事务确保数据一致性

---

如有任何问题或建议，请联系开发团队或提交 Issue。