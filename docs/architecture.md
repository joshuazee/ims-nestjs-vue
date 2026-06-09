# SSS-IMS-Platform 技术架构方案

**版本:** v1.0  
**日期:** 2026-06-09  
**状态:** 待评审  
**关联文档:** [PRD](./prd.md) · [Roadmap](./roadmap.md)

---

## 1. 技术架构总览

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           客户端层                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Web 浏览器   │  │   移动端      │  │  第三方 API   │              │
│  │  (Vue 3 SPA)  │  │  (H5/小程序)  │  │  (未来扩展)   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
└─────────┼─────────────────┼─────────────────┼──────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         网关/接入层                                   │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  Nginx / Caddy (反向代理 + 静态文件 + HTTPS)                  │     │
│  │  - SSL 终端  ·  负载均衡  ·  Gzip 压缩  ·  防 XSS 头部        │     │
│  └─────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         应用层 (Node.js)                              │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  NestJS 应用 (server)                                         │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │     │
│  │  │ Auth 模块   │  │ RBAC 模块   │  │ 业务模块    │           │     │
│  │  │ · JWT 签发  │  │ · 用户管理  │  │ · 用户管理  │           │     │
│  │  │ · 权限守卫  │  │ · 角色管理  │  │ · 角色管理  │           │     │
│  │  │ · Token 刷新│  │ · 菜单管理  │  │ · 菜单管理  │           │     │
│  │  └─────────────┘  │ · 部门管理  │  │ · 部门管理  │           │     │
│  │                   │ · 字典管理  │  │ · 字典管理  │           │     │
│  │                   └─────────────┘  └─────────────┘           │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │     │
│  │  │ 全局异常    │  │ 日志中间件  │  │ 响应拦截    │           │     │
│  │  │ 过滤器      │  │ (Winston)   │  │ 器          │           │     │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │     │
│  └─────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         数据层                                        │
│  ┌────────────────────────┐  ┌─────────────────────────────────────┐ │
│  │  PostgreSQL            │  │  Redis (可选，后续扩展)             │ │
│  │  · 业务数据存储        │  │  · Session / Token 缓存           │ │
│  │  · 关系型数据          │  │  · 高频查询缓存                    │ │
│  │  · ACID 事务支持       │  │  · 限流/防重放                     │ │
│  └────────────────────────┘  └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈确认

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| 前端框架 | Vue 3 | 3.5+ | 组合式 API，TypeScript 原生支持，生态成熟 |
| 前端构建 | Vite | 6+ | 秒级启动，HMR 极速，Rollup 打包优化 |
| UI 组件 | Element Plus | 2.9+ | 企业级组件库，Vue 3 原生，文档完善 |
| 原子 CSS | UnoCSS | 0.65+ | 按需生成，零运行时，开发体验好 |
| 状态管理 | Pinia | 2.2+ | Vue 官方推荐，TypeScript 友好，轻量 |
| 路由 | Vue Router | 4.5+ | 动态路由支持，导航守卫 |
| 后端框架 | NestJS | 11+ | 企业级架构，装饰器风格，模块化设计 |
| ORM | Prisma | 6+ | 类型安全，自动迁移，可视化 Studio |
| 数据库 | PostgreSQL | 18+ | 已有部署，功能强大，JSON 支持好 |
| 认证 | JWT | jose 库 | 双 Token 策略，无状态，可扩展 |
| 密码加密 | bcrypt | 5.1+ | 标准哈希，慢哈希防暴力破解 |
| 验证 | class-validator | 0.14+ | DTO 装饰器验证，与 NestJS 深度集成 |
| 文档 | Swagger | OpenAPI 3 | 自动生成，在线调试，前后端协作 |
| 包管理 | pnpm | 10+ | 快速，节省磁盘，workspace 支持 |
| 代码规范 | ESLint + Prettier | 9+ / 3+ | 统一风格，自动格式化 |

---

## 2. 数据库设计

### 2.1 Prisma Schema 完整定义

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// 用户与认证
// ─────────────────────────────────────────────

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique @db.VarChar(50)
  password  String   @db.VarChar(255)   // bcrypt 哈希
  nickname  String?  @db.VarChar(50)
  email     String?  @db.VarChar(100)
  phone     String?  @db.VarChar(20)
  avatar    String?  @db.VarChar(255)    // URL 或路径
  deptId    Int?
  status    Int      @default(1)         // 0:禁用 1:启用
  createdAt DateTime @default(now()) @db.Timestamp(6)
  updatedAt DateTime @updatedAt @db.Timestamp(6)

  // 关联
  dept          Dept?          @relation(fields: [deptId], references: [id])
  roles         UserRole[]
  refreshTokens RefreshToken[]

  @@index([deptId])
  @@index([status])
  @@map("sys_user")
}

model RefreshToken {
  id        Int      @id @default(autoincrement())
  userId    Int
  token     String   @db.VarChar(255) @unique
  expiresAt DateTime @db.Timestamp(6)
  createdAt DateTime @default(now()) @db.Timestamp(6)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("sys_refresh_token")
}

// ─────────────────────────────────────────────
// RBAC 权限模型
// ─────────────────────────────────────────────

model Role {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(50)
  code        String   @unique @db.VarChar(50)  // 唯一编码，如 admin
  description String?  @db.VarChar(200)
  sort        Int      @default(0)
  status      Int      @default(1)              // 0:禁用 1:启用
  createdAt   DateTime @default(now()) @db.Timestamp(6)
  updatedAt   DateTime @updatedAt @db.Timestamp(6)

  users UserRole[]
  menus RoleMenu[]

  @@index([status])
  @@map("sys_role")
}

model UserRole {
  id     Int @id @default(autoincrement())
  userId Int
  roleId Int

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId])
  @@index([userId])
  @@index([roleId])
  @@map("sys_user_role")
}

model Menu {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(50)          // 显示名称
  type        String   @db.VarChar(10)           // DIR / MENU / BUTTON
  path        String?  @db.VarChar(200)         // 路由路径
  component   String?  @db.VarChar(200)         // 组件路径
  icon        String?  @db.VarChar(50)           // 图标
  permission  String?  @db.VarChar(100)         // 权限标识，如 user:list
  parentId    Int?
  sort        Int      @default(0)
  status      Int      @default(1)
  isExternal  Boolean  @default(false)           // 是否外链
  isCache     Boolean  @default(true)            // 是否缓存
  isHidden    Boolean  @default(false)           // 是否隐藏
  createdAt   DateTime @default(now()) @db.Timestamp(6)
  updatedAt   DateTime @updatedAt @db.Timestamp(6)

  // 自关联树形
  parent   Menu?  @relation("MenuTree", fields: [parentId], references: [id], onDelete: SetNull)
  children Menu[] @relation("MenuTree")
  roles    RoleMenu[]

  @@index([parentId])
  @@index([status])
  @@index([type])
  @@map("sys_menu")
}

model RoleMenu {
  id     Int @id @default(autoincrement())
  roleId Int
  menuId Int

  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)
  menu Menu @relation(fields: [menuId], references: [id], onDelete: Cascade)

  @@unique([roleId, menuId])
  @@index([roleId])
  @@index([menuId])
  @@map("sys_role_menu")
}

// ─────────────────────────────────────────────
// 组织架构
// ─────────────────────────────────────────────

model Dept {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(50)
  code      String?  @db.VarChar(50) @unique
  parentId  Int?
  leader    String?  @db.VarChar(50)            // 负责人
  sort      Int      @default(0)
  status    Int      @default(1)
  createdAt DateTime @default(now()) @db.Timestamp(6)
  updatedAt DateTime @updatedAt @db.Timestamp(6)

  // 自关联树形
  parent   Dept?  @relation("DeptTree", fields: [parentId], references: [id], onDelete: SetNull)
  children Dept[] @relation("DeptTree")
  users    User[]

  @@index([parentId])
  @@index([status])
  @@map("sys_dept")
}

// ─────────────────────────────────────────────
// 字典管理
// ─────────────────────────────────────────────

model DictType {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(50)
  code      String   @unique @db.VarChar(50)
  status    Int      @default(1)               // 0:禁用 1:启用
  createdAt DateTime @default(now()) @db.Timestamp(6)
  updatedAt DateTime @updatedAt @db.Timestamp(6)

  items DictItem[]

  @@index([status])
  @@map("sys_dict_type")
}

model DictItem {
  id          Int      @id @default(autoincrement())
  dictTypeId  Int
  label       String   @db.VarChar(50)         // 显示标签
  value       String   @db.VarChar(50)         // 存储值
  sort        Int      @default(0)
  status      Int      @default(1)
  createdAt   DateTime @default(now()) @db.Timestamp(6)
  updatedAt   DateTime @updatedAt @db.Timestamp(6)

  dictType DictType @relation(fields: [dictTypeId], references: [id], onDelete: Cascade)

  @@index([dictTypeId])
  @@index([status])
  @@map("sys_dict_item")
}
```

### 2.2 数据库设计要点

| 设计决策 | 说明 |
|----------|------|
| **自增 ID** | 所有主表使用 `Int @id @default(autoincrement())`，简单高效 |
| **统一时间戳** | 全部表包含 `createdAt` + `updatedAt`，审计追溯 |
| **软删除风格** | 使用 `status` 字段（0禁用/1启用），而非物理删除，保留数据完整性 |
| **表名前缀** | 统一 `sys_` 前缀，与业务表区分，避免命名冲突 |
| **树形结构** | Menu / Dept 使用自关联 `parentId` + Prisma 自关联关系，简单够用 |
| **联合唯一** | 中间表（UserRole / RoleMenu）使用 `@@unique` 防止重复关联 |
| **外级联** | 删除用户/角色时自动清理关联表（`onDelete: Cascade`），删除菜单/部门时置空（`SetNull`） |
| **索引策略** | 外键字段、状态字段、类型字段加索引，覆盖 90% 查询场景 |

---

## 3. API 接口设计

### 3.1 统一响应格式

```typescript
// 通用响应包装
interface ApiResult<T> {
  code: number;      // 业务状态码，0 表示成功
  message: string;   // 提示信息
  data: T;           // 响应数据
  timestamp: number; // 服务器时间戳
}

// 分页响应
interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 3.2 HTTP 状态码与业务码映射

| HTTP 状态码 | 业务码 | 场景 | 说明 |
|-------------|--------|------|------|
| 200 | 0 | 成功 | 正常响应 |
| 200 | 1 | 参数校验失败 | 表单错误，返回字段级错误 |
| 401 | 1001 | 未登录/Token 过期 | 前端跳转登录 |
| 403 | 1002 | 无权限 | 权限不足 |
| 404 | 1003 | 资源不存在 | 接口或数据不存在 |
| 409 | 1004 | 数据冲突 | 用户名/编码已存在 |
| 500 | 5000 | 服务器内部错误 | 记录日志，不暴露细节 |

### 3.3 核心接口清单

#### 认证模块 (Auth)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/auth/login` | 登录（用户名+密码） | 否 |
| POST | `/api/auth/refresh` | 刷新 Access Token | 否（需 Refresh Token）|
| POST | `/api/auth/logout` | 退出登录（作废 Token）| 是 |
| GET | `/api/auth/me` | 获取当前用户信息 | 是 |

**登录请求/响应示例：**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```
```http
200 OK
{
  "code": 0,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 7200,          // 2小时
    "refreshExpiresIn": 604800  // 7天
  }
}
```

#### 用户管理 (User)

| 方法 | 路径 | 描述 | 权限标识 |
|------|------|------|----------|
| GET | `/api/users` | 分页列表 | `user:list` |
| GET | `/api/users/:id` | 详情 | `user:list` |
| POST | `/api/users` | 新增 | `user:create` |
| PUT | `/api/users/:id` | 编辑 | `user:update` |
| DELETE | `/api/users/:id` | 删除 | `user:delete` |
| PUT | `/api/users/:id/reset-password` | 重置密码 | `user:update` |
| PUT | `/api/users/:id/status` | 修改状态 | `user:update` |
| PUT | `/api/users/:id/roles` | 分配角色 | `user:update` |
| GET | `/api/users/export` | 导出 Excel | `user:export` |
| POST | `/api/users/import` | 导入 Excel | `user:import` |

**查询参数规范：**
```
GET /api/users?page=1&pageSize=20&keyword=张&deptId=1&status=1
```

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "nickname": "管理员",
        "email": "admin@sss.com",
        "phone": "13800138000",
        "avatar": "https://...",
        "deptId": 1,
        "deptName": "技术部",
        "status": 1,
        "roles": [{ "id": 1, "name": "超级管理员" }],
        "createdAt": "2026-06-01T12:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 角色管理 (Role)

| 方法 | 路径 | 描述 | 权限标识 |
|------|------|------|----------|
| GET | `/api/roles` | 列表 | `role:list` |
| GET | `/api/roles/:id` | 详情（含权限树）| `role:list` |
| POST | `/api/roles` | 新增 | `role:create` |
| PUT | `/api/roles/:id` | 编辑 | `role:update` |
| DELETE | `/api/roles/:id` | 删除 | `role:delete` |
| PUT | `/api/roles/:id/menus` | 分配菜单/权限 | `role:update` |
| GET | `/api/roles/:id/users` | 查看成员 | `role:list` |

#### 菜单管理 (Menu)

| 方法 | 路径 | 描述 | 权限标识 |
|------|------|------|----------|
| GET | `/api/menus` | 树形列表 | `menu:list` |
| GET | `/api/menus/tree` | 纯树结构（用于选择）| `menu:list` |
| POST | `/api/menus` | 新增 | `menu:create` |
| PUT | `/api/menus/:id` | 编辑 | `menu:update` |
| DELETE | `/api/menus/:id` | 删除 | `menu:delete` |
| PUT | `/api/menus/sort` | 批量排序 | `menu:update` |

#### 部门管理 (Dept)

| 方法 | 路径 | 描述 | 权限标识 |
|------|------|------|----------|
| GET | `/api/depts` | 树形列表 | `dept:list` |
| GET | `/api/depts/tree` | 纯树结构 | `dept:list` |
| POST | `/api/depts` | 新增 | `dept:create` |
| PUT | `/api/depts/:id` | 编辑 | `dept:update` |
| DELETE | `/api/depts/:id` | 删除 | `dept:delete` |

#### 字典管理 (Dict)

| 方法 | 路径 | 描述 | 权限标识 |
|------|------|------|----------|
| GET | `/api/dict-types` | 字典类型列表 | `dict:list` |
| POST | `/api/dict-types` | 新增类型 | `dict:create` |
| PUT | `/api/dict-types/:id` | 编辑类型 | `dict:update` |
| DELETE | `/api/dict-types/:id` | 删除类型 | `dict:delete` |
| GET | `/api/dict-types/:code/items` | 按编码查字典项 | 无需认证（前端下拉用）|
| POST | `/api/dict-items` | 新增字典项 | `dict:create` |
| PUT | `/api/dict-items/:id` | 编辑字典项 | `dict:update` |
| DELETE | `/api/dict-items/:id` | 删除字典项 | `dict:delete` |

---

## 4. 安全设计

### 4.1 JWT 双 Token 策略

```
┌─────────────────────────────────────────────────────────────┐
│                     Token 生命周期                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  登录 ──→ 颁发 Access Token (2h) + Refresh Token (7d)       │
│                                                             │
│  正常使用 ───────────────────────────────────────────────→   │
│    每次请求携带 Access Token (Authorization: Bearer <token>)│
│                                                             │
│  Access Token 过期 ──→ 前端用 Refresh Token 换取新 Token    │
│                                                             │
│  Refresh Token 过期 ──→ 强制重新登录                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Token 结构（Payload）：**
```json
// Access Token
{
  "sub": "1",           // 用户ID
  "username": "admin",
  "roles": [1, 2],      // 角色ID数组
  "type": "access",
  "iat": 1735689600,
  "exp": 1735696800     // 2小时后过期
}

// Refresh Token
{
  "sub": "1",
  "type": "refresh",
  "jti": "uuid",        // 唯一标识，用于撤销
  "iat": 1735689600,
  "exp": 1736294400     // 7天后过期
}
```

**安全要点：**
- Token 使用 `HS256` 签名，密钥存储在环境变量 `JWT_SECRET`
- Refresh Token 存储在数据库，支持后端撤销（用户退出/修改密码时清理）
- Access Token 短有效期（2小时），减少泄露风险
- Token 在 HTTP Header 传输，`HttpOnly` Cookie 方案后续可扩展

### 4.2 密码安全

- **bcrypt 哈希**：成本因子 `12`（约 250ms/次），抗彩虹表
- **强制规则**：最小 6 位，重置后默认密码 `admin123`，首次登录建议修改
- **传输安全**：HTTPS 全程加密，禁止明文传输密码

### 4.3 权限守卫层级

```typescript
// 1. 认证守卫（所有接口）
@UseGuards(JwtAuthGuard)

// 2. 角色守卫（接口级）
@Roles('admin')
@UseGuards(RolesGuard)

// 3. 权限守卫（按钮/API 级）
@Permissions('user:create')
@UseGuards(PermissionsGuard)
```

### 4.4 输入安全

- **全局参数验证**：`ValidationPipe` 自动校验 DTO，拒绝非法输入
- **SQL 注入**：Prisma 参数化查询，天然免疫
- **XSS**：前端 Element Plus 组件自动转义，后端不返回 HTML
- **敏感字段脱敏**：密码、Token 等字段不序列化到响应

---

## 5. 前端架构

### 5.1 目录结构

```
apps/web/
├── src/
│   ├── api/                  # 接口请求（按模块拆分）
│   │   ├── auth.ts           # 登录/认证
│   │   ├── user.ts           # 用户管理
│   │   ├── role.ts
│   │   ├── menu.ts
│   │   ├── dept.ts
│   │   └── dict.ts
│   ├── components/           # 通用组件
│   │   ├── ProTable/         # 高级表格（搜索+分页+操作）
│   │   ├── ProForm/          # 高级表单（验证+布局）
│   │   ├── ProDialog/        # 对话框封装
│   │   ├── AppIcon/          # 图标组件
│   │   └── Breadcrumb/       # 面包屑
│   ├── views/                # 页面视图
│   │   ├── login/            # 登录页
│   │   ├── layout/           # 布局框架
│   │   │   ├── components/
│   │   │   │   ├── Sidebar.vue      # 侧边栏
│   │   │   │   ├── Header.vue       # 顶部栏
│   │   │   │   ├── TagsView.vue     # 标签页
│   │   │   │   └── AppMain.vue      # 内容区
│   │   │   └── Layout.vue
│   │   ├── system/           # 系统管理页面
│   │   │   ├── user/
│   │   │   ├── role/
│   │   │   ├── menu/
│   │   │   ├── dept/
│   │   │   └── dict/
│   │   └── dashboard/        # 首页仪表盘
│   ├── router/               # 路由配置
│   │   ├── index.ts          # 路由实例
│   │   ├── routes.ts         # 常量路由（登录/404）
│   │   └── dynamic.ts        # 动态路由生成器
│   ├── store/                # Pinia 状态
│   │   ├── user.ts           # 用户/Token
│   │   ├── permission.ts     # 权限/路由
│   │   └── app.ts            # 全局配置（主题/布局）
│   ├── composables/          # 组合式函数
│   │   ├── usePagination.ts  # 分页逻辑
│   │   ├── useTable.ts       # 表格 CRUD 封装
│   │   └── usePermission.ts  # 权限检查
│   ├── directives/           # 自定义指令
│   │   └── permission.ts     # v-permission
│   ├── utils/
│   │   ├── request.ts        # Axios 封装（拦截器）
│   │   ├── storage.ts        # localStorage 封装
│   │   └── format.ts         # 格式化工具
│   ├── types/                # TypeScript 类型
│   │   └── api.ts            # 通用 API 类型
│   ├── App.vue
│   └── main.ts               # 入口
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 5.2 状态管理设计

```typescript
// store/user.ts - 用户状态
const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)
  
  const login = async (form: LoginForm) => {
    const res = await apiAuth.login(form)
    token.value = res.accessToken
    setToken(res.accessToken)
    await fetchUserInfo()
  }
  
  const fetchUserInfo = async () => {
    userInfo.value = await apiAuth.getMe()
  }
  
  const logout = async () => {
    await apiAuth.logout()
    clearToken()
    token.value = ''
    userInfo.value = null
  }
  
  return { token, userInfo, login, logout, fetchUserInfo }
})

// store/permission.ts - 权限状态
const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const menus = ref<Menu[]>([])
  
  const generateRoutes = async () => {
    const menuList = await apiMenu.getMenus() // 从后端获取权限菜单
    menus.value = menuList
    routes.value = filterDynamicRoutes(menuList) // 转换为 Vue Router 路由
    return routes.value
  }
  
  return { routes, menus, generateRoutes }
})
```

### 5.3 Axios 请求封装

```typescript
// utils/request.ts
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

// 请求拦截器：注入 Token
request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器：统一错误处理 + Token 刷新
request.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    if (err.response?.status === 401) {
      // Token 过期，尝试刷新
      const success = await refreshToken()
      if (success) return request(err.config) // 重试原请求
      // 刷新失败，跳转登录
      router.push('/login')
    }
    return Promise.reject(err)
  }
)
```

### 5.4 动态路由生成

```typescript
// 后端返回的菜单 → 前端路由
const menuToRoute = (menu: Menu): RouteRecordRaw => {
  return {
    path: menu.path,
    name: menu.name,
    component: () => import(`@/views/${menu.component}.vue`),
    meta: {
      title: menu.name,
      icon: menu.icon,
      permission: menu.permission,
      keepAlive: menu.isCache,
    },
  }
}

// 路由守卫：未登录跳转 + 动态加载路由
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  
  if (!userStore.token && to.path !== '/login') {
    return next('/login')
  }
  
  if (userStore.token && permissionStore.routes.length === 0) {
    const routes = await permissionStore.generateRoutes()
    routes.forEach(r => router.addRoute(r))
    return next(to.path) // 重新导航
  }
  
  next()
})
```

### 5.5 权限指令

```typescript
// directives/permission.ts
const vPermission: Directive = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const required = binding.value as string
    
    const hasPermission = userStore.userInfo?.permissions?.includes(required)
    if (!hasPermission) {
      el.parentNode?.removeChild(el) // 无权限则移除 DOM
    }
  }
}

// 使用：<el-button v-permission="'user:create'">新增</el-button>
```

---

## 6. 后端架构

### 6.1 NestJS 模块结构

```
apps/server/
├── src/
│   ├── modules/              # 业务模块
│   │   ├── auth/             # 认证模块
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── roles.guard.ts
│   │   │   │   └── permissions.guard.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── token.dto.ts
│   │   ├── user/             # 用户模块
│   │   ├── role/             # 角色模块
│   │   ├── menu/             # 菜单模块
│   │   ├── dept/             # 部门模块
│   │   └── dict/             # 字典模块
│   ├── common/               # 公共模块
│   │   ├── filters/          # 全局异常过滤器
│   │   │   └── global-exception.filter.ts
│   │   ├── interceptors/     # 响应拦截器
│   │   │   └── transform.interceptor.ts
│   │   ├── decorators/       # 自定义装饰器
│   │   │   ├── roles.decorator.ts
│   │   │   └── permissions.decorator.ts
│   │   ├── dto/
│   │   │   └── paginated.dto.ts
│   │   └── enums/
│   │       └── api-code.enum.ts
│   ├── prisma/               # Prisma 服务
│   │   └── prisma.service.ts
│   └── main.ts               # 入口
├── prisma/
│   └── schema.prisma
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### 6.2 全局异常处理

```typescript
// 统一异常过滤器，捕获所有错误并格式化
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()
    
    let code = ApiCode.INTERNAL_ERROR
    let message = '服务器内部错误'
    let status = HttpStatus.INTERNAL_SERVER_ERROR
    
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma 错误转换
      if (exception.code === 'P2002') {
        code = ApiCode.CONFLICT
        message = '数据已存在'
        status = HttpStatus.CONFLICT
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus()
      message = exception.message
      code = this.mapHttpStatus(status)
    }
    
    res.status(status).json({
      code,
      message,
      data: null,
      timestamp: Date.now(),
    })
  }
}
```

### 6.3 响应拦截器

```typescript
// 统一包装成功响应
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'success',
        data,
        timestamp: Date.now(),
      }))
    )
  }
}
```

---

## 7. 部署方案

### 7.1 开发环境启动

```bash
# 1. 安装依赖
pnpm install

# 2. 数据库迁移
cd apps/server
npx prisma migrate dev --name init
npx prisma db seed   # 初始化管理员/菜单/角色

# 3. 启动后端
cd apps/server
pnpm dev    # NestJS 开发模式，热重载

# 4. 启动前端（新终端）
cd apps/web
pnpm dev    # Vite 开发服务器，http://localhost:5173
```

### 7.2 生产环境部署（Docker）

```dockerfile
# 后端 Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY apps/server ./apps/server
RUN pnpm --filter server build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY apps/server/prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: sss_ims
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  server:
    build: ./apps/server
    environment:
      DATABASE_URL: postgresql://admin:admin123@postgres:5432/sss_ims
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  web:
    build: ./apps/web
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  postgres_data:
```

### 7.3 环境变量清单

| 变量 | 开发默认值 | 生产要求 | 说明 |
|------|-----------|---------|------|
| `DATABASE_URL` | `postgresql://admin:admin123@localhost:5432/myapp` | 必填 | 数据库连接 |
| `JWT_SECRET` | `dev-secret-key` | **必须修改** | JWT 签名密钥（≥32位随机串）|
| `JWT_ACCESS_EXPIRES` | `7200` | 可选 | Access Token 有效期（秒）|
| `JWT_REFRESH_EXPIRES` | `604800` | 可选 | Refresh Token 有效期（秒）|
| `PORT` | `3000` | 可选 | 后端服务端口 |
| `CORS_ORIGIN` | `*` | 建议限制 | 前端跨域来源 |
| `LOG_LEVEL` | `debug` | `info` | 日志级别 |

---

## 8. 开发规范

### 8.1 代码提交规范（Commitlint）

```
feat: 新增用户导入功能
fix: 修复部门树形排序错误
docs: 更新 API 文档说明
style: 调整登录页面样式
refactor: 优化分页查询逻辑
test: 补充用户模块单元测试
chore: 升级 Element Plus 版本
```

### 8.2 接口命名规范

- 全部小写，短横线分隔
- 资源名词复数：`/api/users`、`/api/roles`
- 动作用 HTTP 方法表达，不用动词：`GET /api/users` 而非 `GET /api/getUsers`
- 子资源用路径：`/api/users/:id/roles`

### 8.3 数据库命名规范

- 表名：`sys_` 前缀 + 单数名词，如 `sys_user`
- 字段名：小写下划线，如 `created_at`（Prisma 自动映射为 `createdAt`）
- 索引名：`idx_表名_字段名`
- 外键：级联策略明确声明（`Cascade` / `SetNull` / `Restrict`）

---

## 9. 风险与应对

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| Prisma 迁移冲突 | 中 | 高 | 开发环境用 `migrate dev`，生产用 `migrate deploy`，禁止直接改数据库 |
| 动态路由实现复杂 | 中 | 中 | 参考 Vue-Admin-Template 成熟方案，预留 2 天缓冲 |
| 前端树形组件性能 | 低 | 中 | Element Plus Tree 组件支持虚拟滚动，数据量大时启用 |
| 权限边界情况 | 中 | 高 | 设计阶段定义清楚：超级管理员绕过所有检查，其他角色严格校验 |
| Docker 镜像拉取 | 已解决 | 高 | 已配置国内镜像源，构建脚本中加入重试逻辑 |
| Token 泄露风险 | 低 | 高 | 短有效期 + 可撤销 Refresh Token + HTTPS 强制 |

---

## 10. 输出物清单

| 文档 | 路径 | 状态 |
|------|------|------|
| 需求规格说明书 | `docs/prd.md` | ✅ 已完成 |
| 实现路径 | `docs/roadmap.md` | ✅ 已完成 |
| **技术架构方案** | `docs/architecture.md` | ✅ 当前文档 |
| 数据库迁移脚本 | `prisma/migrations/` | ⏳ M0 阶段 |
| API 接口文档 | Swagger UI (`/api/docs`) | ⏳ M2 阶段自动生成 |
| 部署指南 | `docs/deployment.md` | ⏳ M7 阶段 |

---

## 下一步行动

1. **老大评审技术方案** ← 当前步骤
2. 确认后启动 **M0 项目准备**（Monorepo 搭建）
3. 启动 **Arch 子代理** 输出详细数据库 Schema 和接口设计
4. 按 Roadmap 里程碑推进

---

*本文档由 Arch（架构师）角色编制，待 PM 和老大确认后作为技术基准执行。*
