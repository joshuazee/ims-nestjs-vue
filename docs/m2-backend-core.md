# M2: 后端核心基础设施

**版本:** v1.0
**日期:** 2026-06-11
**状态:** ✅ 已完成

---

## 1. 概述

M2 阶段完成了 NestJS 后端核心框架搭建，包括数据库连接、统一响应格式、全局异常处理、JWT 认证授权、权限守卫以及所有业务模块的基础 CRUD 接口实现。同时为数据库初始化了种子数据，便于直接测试验证。

---

## 2. 任务清单

| 任务 | 状态 | 说明 |
|------|------|------|
| Prisma 初始化 + 数据库连接 | ✅ | 使用 Prisma Client，PostgreSQL 已部署于本地 Docker |
| 数据库迁移 | ✅ | 迁移文件已生成并应用到数据库 |
| 统一响应格式（ApiResult） | ✅ | TransformInterceptor 全局拦截器 |
| 全局异常过滤器 | ✅ | GlobalExceptionFilter，支持 NestJS HTTP 异常和 Prisma 错误 |
| 参数验证管道（ValidationPipe） | ✅ | 在 `main.ts` 中全局配置，启用 whitelist 和 transform |
| Swagger 文档配置 | ✅ | `http://localhost:3000/api/docs` 访问接口文档 |
| JWT 模块（Access + Refresh Token） | ✅ | 双 Token 机制，Access Token 2h，Refresh Token 7天 |
| 认证守卫（AuthGuard / JwtStrategy） | ✅ | Passport JWT 策略 + 全局 JwtAuthGuard |
| 权限守卫（PermissionGuard） | ✅ | 基于 `@Permissions('user:create')` 注解控制 |
| 密码加密工具（bcrypt） | ✅ | bcryptjs，salt 轮数为 12 |
| 数据库 Seed 脚本 | ✅ | 初始化管理员、部门、菜单、角色、字典数据 |
| 业务模块 CRUD（User/Role/Menu/Dept/Dict） | ✅ | 所有模块均完成完整的增删改查接口 |

---

## 3. 数据库架构

### 3.1 表结构

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `sys_user` | 用户表 | username, password, nickname, email, phone, deptId, status |
| `sys_role` | 角色表 | name, code, description, sort, status |
| `sys_menu` | 菜单表 | name, type, path, component, icon, permission, parentId, sort |
| `sys_dept` | 部门表 | name, code, parentId, leader, sort |
| `sys_dict_type` | 字典类型表 | name, code, status |
| `sys_dict_item` | 字典项表 | dictTypeId, label, value, sort |
| `sys_user_role` | 用户-角色关联表 | userId, roleId |
| `sys_role_menu` | 角色-菜单关联表 | roleId, menuId |
| `sys_refresh_token` | Refresh Token 表 | userId, token, expiresAt |

### 3.2 关联关系

```
User 1 -- N UserRole N -- 1 Role
Role 1 -- N RoleMenu N -- 1 Menu
User N -- 1 Dept
Menu 1 -- N Menu (自关联树形)
Dept 1 -- N Dept (自关联树形)
DictType 1 -- N DictItem
```

---

## 4. 核心实现

### 4.1 统一响应格式

所有接口返回统一格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1718087881000
}
```

**代码位置**: `apps/server/src/common/interceptors/transform.interceptor.ts`

### 4.2 全局异常处理

支持以下异常类型：

| 异常类型 | 响应码 | 说明 |
|----------|--------|------|
| NestJS HttpException | 根据状态码映射 | 参数错误、未授权、无权限等 |
| Prisma P2002 | 409 | 唯一约束冲突 |
| Prisma P2003 | 400 | 外键约束失败 |
| Prisma P2025 | 404 | 记录未找到 |
| Prisma ValidationError | 400 | 数据验证失败 |
| 其他未捕获异常 | 500 | 内部错误 |

**代码位置**: `apps/server/src/common/filters/global-exception.filter.ts`

### 4.3 JWT 认证与权限控制

#### 登录流程

```
POST /api/auth/login
  → 验证用户名密码
  → 生成 Access Token + Refresh Token
  → 存储 Refresh Token 到数据库
  → 返回双 Token
```

#### 请求认证流程

```
请求 → JwtAuthGuard 验证 Token 有效性
     → PermissionsGuard 检查 @Permissions 注解
     → 执行业务逻辑
```

#### 权限注解使用

```typescript
@Controller('users')
@UseGuards(PermissionsGuard)
@ApiBearerAuth()
export class UserController {
  @Post()
  @Permissions('user:create')
  create(@Body() dto: CreateUserDto) { ... }
}
```

**代码位置**: 
- `apps/server/src/modules/auth/guards/jwt-auth.guard.ts`
- `apps/server/src/modules/auth/guards/permissions.guard.ts`
- `apps/server/src/modules/auth/strategies/jwt.strategy.ts`

### 4.4 参数验证

在 `main.ts` 中全局配置 ValidationPipe：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // 自动剔除未定义属性
    transform: true,          // 自动类型转换
    forbidNonWhitelisted: true, // 禁止未定义属性
  }),
);
```

---

## 5. API 接口列表

### 5.1 认证接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/login` | 用户登录 | 公开 |
| POST | `/api/auth/refresh` | 刷新 Token | 公开 |
| POST | `/api/auth/logout` | 退出登录 | 需要登录 |
| GET | `/api/auth/me` | 获取当前用户信息 | 需要登录 |

### 5.2 用户管理接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/users` | 创建用户 | `user:create` |
| GET | `/api/users` | 用户列表（分页） | `user:list` |
| GET | `/api/users/:id` | 用户详情 | `user:list` |
| PUT | `/api/users/:id` | 更新用户 | `user:update` |
| DELETE | `/api/users/:id` | 删除用户 | `user:delete` |
| PUT | `/api/users/:id/status` | 修改状态 | `user:update` |
| PUT | `/api/users/:id/password` | 重置密码 | `user:update` |
| PUT | `/api/users/:id/roles` | 分配角色 | `user:update` |

### 5.3 角色管理接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/roles` | 创建角色 | `role:create` |
| GET | `/api/roles` | 角色列表（分页） | `role:list` |
| GET | `/api/roles/:id` | 角色详情 | `role:list` |
| PUT | `/api/roles/:id` | 更新角色 | `role:update` |
| DELETE | `/api/roles/:id` | 删除角色 | `role:delete` |
| PUT | `/api/roles/:id/menus` | 分配菜单权限 | `role:update` |

### 5.4 菜单管理接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/menus` | 创建菜单 | `menu:create` |
| GET | `/api/menus` | 菜单列表（树形） | `menu:list` |
| GET | `/api/menus/:id` | 菜单详情 | `menu:list` |
| PUT | `/api/menus/:id` | 更新菜单 | `menu:update` |
| DELETE | `/api/menus/:id` | 删除菜单 | `menu:delete` |

### 5.5 部门管理接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/depts` | 创建部门 | `dept:create` |
| GET | `/api/depts` | 部门列表（树形） | `dept:list` |
| GET | `/api/depts/:id` | 部门详情 | `dept:list` |
| PUT | `/api/depts/:id` | 更新部门 | `dept:update` |
| DELETE | `/api/depts/:id` | 删除部门 | `dept:delete` |

### 5.6 字典管理接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/dicts/types` | 创建字典类型 | `dict:create` |
| GET | `/api/dicts/types` | 字典类型列表 | `dict:list` |
| GET | `/api/dicts/types/:id` | 字典类型详情 | `dict:list` |
| PUT | `/api/dicts/types/:id` | 更新字典类型 | `dict:update` |
| DELETE | `/api/dicts/types/:id` | 删除字典类型 | `dict:delete` |
| POST | `/api/dicts/items` | 创建字典项 | `dict:create` |
| GET | `/api/dicts/types/:id/items` | 字典项列表 | `dict:list` |
| GET | `/api/dicts/items/:id` | 字典项详情 | `dict:list` |
| PUT | `/api/dicts/items/:id` | 更新字典项 | `dict:update` |
| DELETE | `/api/dicts/items/:id` | 删除字典项 | `dict:delete` |

---

## 6. Seed 数据初始化

### 6.1 初始化内容

```
🌱 部门: 技术部
🌱 角色: 超级管理员 (super_admin)
🌱 用户: admin / admin123
🌱 菜单: 系统管理目录 + 5个管理菜单 + 各按钮权限
🌱 字典: 用户状态、菜单类型、性别
```

### 6.2 运行方式

```bash
cd apps/server
npx ts-node prisma/seed.ts
```

或：

```bash
# 设置环境变量后运行
$env:DATABASE_URL="postgresql://admin:admin123@localhost:5432/myapp"
npx ts-node prisma/seed.ts
```

**代码位置**: `apps/server/prisma/seed.ts`

---

## 7. Swagger 文档

启动服务后访问：

```
http://localhost:3000/api/docs
```

支持 Bearer Token 认证，在右上角输入 `Bearer <token>` 即可测试受保护接口。

---

## 8. 验证方式

### 8.1 编译检查

```bash
cd apps/server
npx nest build
```

预期输出：`Found 0 errors`

### 8.2 启动服务

```bash
$env:DATABASE_URL="postgresql://admin:admin123@localhost:5432/myapp"
npx nest start --watch
```

预期输出：
```
🚀 Server running on http://localhost:3000
📚 Swagger UI: http://localhost:3000/api/docs
```

### 8.3 测试登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

预期返回：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 7200,
    "refreshExpiresIn": 604800
  },
  "timestamp": 1718087881000
}
```

---

## 9. 相关文件

| 文件 | 说明 |
|------|------|
| `apps/server/src/main.ts` | 应用入口，配置全局管道、Swagger、CORS |
| `apps/server/src/app.module.ts` | 根模块，注册所有模块和全局守卫/拦截器/过滤器 |
| `apps/server/prisma/schema.prisma` | Prisma Schema 定义 |
| `apps/server/prisma/seed.ts` | 数据库初始化脚本 |
| `apps/server/src/common/interceptors/transform.interceptor.ts` | 统一响应拦截器 |
| `apps/server/src/common/filters/global-exception.filter.ts` | 全局异常过滤器 |
| `apps/server/src/common/enums/api-code.enum.ts` | API 响应码枚举 |
| `apps/server/src/modules/auth/` | 认证模块（登录、刷新、登出、用户信息） |
| `apps/server/src/modules/user/` | 用户管理模块 |
| `apps/server/src/modules/role/` | 角色管理模块 |
| `apps/server/src/modules/menu/` | 菜单管理模块 |
| `apps/server/src/modules/dept/` | 部门管理模块 |
| `apps/server/src/modules/dict/` | 字典管理模块 |

---

## 10. 下一步

M2 已完成后，可以进入以下任一阶段：

- **M3**: 后端业务增强（文件上传、操作日志、数据导出等扩展功能）
- **M4**: 前端框架搭建（API 封装、Pinia 状态管理、路由守卫、动态菜单）
- **M5**: 前端业务页面实现（用户/角色/菜单/部门/字典管理页面）
