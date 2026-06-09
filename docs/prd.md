# SSS-IMS-Platform 需求规格说明书 (PRD)

**版本:** v1.0  
**日期:** 2026-06-08  
**状态:** 待确认

---

## 1. 项目概述

### 1.1 项目背景
构建一套基础信息管理系统（IMS）开发模板，提供开箱即用的权限管理基础设施。作为后续所有业务系统的基础底座，其他系统只需在此基础上扩展业务模块即可。

### 1.2 项目目标
- 提供完整的 RBAC 权限管理模板（用户、角色、菜单、权限）
- 前后端分离，技术栈现代化
- Monorepo 单仓库管理，便于统一构建和部署
- 代码规范、目录结构清晰，可直接作为新项目模板

### 1.3 技术栈

| 层级 | 技术选型 | 版本 |
|------|----------|------|
| 前端框架 | Vue 3 + TypeScript | 3.5+ |
| 前端构建 | Vite | 6+ |
| 前端 UI | Element Plus + UnoCSS | 2.9+ |
| 前端路由 | Vue Router | 4+ |
| 前端状态 | Pinia | 2+ |
| 后端框架 | NestJS | 11+ |
| 后端 ORM | Prisma | 6+ |
| 数据库 | PostgreSQL | 18+ (已部署) |
| 认证 | JWT (Access + Refresh Token) | - |
| 文档 | Swagger (OpenAPI) | - |
| 包管理 | pnpm workspaces | 10+ |
| 代码规范 | ESLint + Prettier + TypeScript strict | - |

---

## 2. 功能模块

### 2.1 模块总览

```
┌─────────────────────────────────────────────────────────┐
│                    SSS-IMS-Platform                      │
├─────────────────────────────────────────────────────────┤
│  🏠 系统管理                                               │
│  ├─ 用户管理 (User Management)                             │
│  ├─ 角色管理 (Role Management)                            │
│  ├─ 菜单管理 (Menu Management)                            │
│  ├─ 部门管理 (Dept Management)                            │
│  └─ 字典管理 (Dictionary Management)                       │
│                                                          │
│  🔐 权限控制 (RBAC)                                        │
│  ├─ 基于角色的访问控制                                     │
│  ├─ 菜单级权限                                             │
│  ├─ 按钮/API 级权限                                        │
│  └─ 数据权限 (部门级)                                      │
│                                                          │
│  🎨 前端框架                                                │
│  ├─ 登录/注册页面                                          │
│  ├─ 布局框架 (侧边栏 + 顶部栏 + 内容区)                      │
│  ├─ 动态路由 (根据权限动态生成)                             │
│  ├─ 面包屑导航                                            │
│  ├─ 标签页导航                                            │
│  └─ 暗黑模式 / 主题切换                                    │
│                                                          │
│  📝 开发辅助                                                │
│  ├─ API 文档 (Swagger UI)                                  │
│  ├─ 请求/响应拦截器                                        │
│  ├─ 统一错误处理                                           │
│  ├─ 表单验证封装                                           │
│  └─ 通用组件库 (Table, Form, Dialog, Search)               │
└─────────────────────────────────────────────────────────┘
```

### 2.2 详细功能说明

#### 2.2.1 用户管理
- **用户列表**: 分页、搜索、筛选、排序
- **用户新增/编辑**: 表单验证、头像上传、部门选择
- **用户详情**: 基本信息、角色分配、操作日志
- **用户状态**: 启用/禁用、密码重置
- **用户导入/导出**: Excel 格式
- **个人中心**: 修改密码、修改头像、修改个人信息

#### 2.2.2 角色管理
- **角色列表**: 分页、搜索
- **角色新增/编辑**: 角色名称、角色编码、描述、排序
- **角色权限配置**: 菜单权限 + 按钮权限树形选择
- **角色成员**: 查看/分配该角色下的用户
- **角色状态**: 启用/禁用

#### 2.2.3 菜单管理
- **菜单列表**: 树形展示，支持拖拽排序
- **菜单新增/编辑**: 
  - 类型：目录 / 菜单 / 按钮
  - 属性：名称、路径、组件、图标、排序、权限标识
  - 路由配置：是否外链、是否缓存、是否隐藏
- **菜单导入/导出**: JSON 格式

#### 2.2.4 部门管理
- **部门列表**: 树形展示
- **部门新增/编辑**: 名称、编码、负责人、排序
- **部门层级**: 支持多级部门
- **部门用户**: 查看部门下用户

#### 2.2.5 字典管理
- **字典类型**: 系统字典 / 业务字典
- **字典项**: 键值对、排序、状态
- **用途**: 前端下拉框、状态映射等

### 2.3 权限模型 (RBAC)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   User   │───→│ UserRole │←───│   Role   │───→│ RoleMenu │
│  用户表   │    │ 用户角色关联│    │  角色表   │    │ 角色菜单关联│
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                   │
                                                   ↓
                                              ┌──────────┐
                                              │   Menu   │
                                              │  菜单表   │
                                              └──────────┘
```

**权限粒度**:
- **菜单权限**: 能否看到左侧菜单项
- **按钮权限**: 页面内按钮的显示/隐藏 (`v-permission` 指令)
- **API 权限**: 后端接口鉴权 (`@Roles` / `@Permissions` 装饰器)
- **数据权限**: 只能查看本部门及下级部门数据（后续扩展）

---

## 3. 数据库设计

### 3.1 实体关系图 (ER Diagram)

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      User       │         │    UserRole     │         │      Role       │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ PK id           │────┐    │ PK id           │    ┌────│ PK id           │
│    username     │    │    │ FK userId       │────┘    │    name         │
│    password     │    │    │ FK roleId       │────────→│    code         │
│    nickname     │    │    │    createdAt    │         │    description  │
│    email        │    │    └─────────────────┘         │    sort         │
│    phone        │    │                                   │    status       │
│    avatar       │    │                                   │    createdAt    │
│    deptId ──────┼────┘                                   └─────────────────┘
│    status       │                                              │
│    createdAt    │                                              │
└─────────────────┘                                              │
     │                                                           │
     │    ┌─────────────────┐                                   │
     └───→│      Dept       │                                   │
          ├─────────────────┤                                   │
          │ PK id           │                                   │
          │    name         │                                   │
          │    code         │                                   │
          │    parentId ────┼────┐                              │
          │    leader       │    │                              │
          │    sort         │    │                              │
          │    status       │    │                              │
          │    createdAt    │    │                              │
          └─────────────────┘    │                              │
               ▲                   │                              │
               └───────────────────┘                              │
                                                                   │
                    ┌─────────────────┐                            │
                    │    RoleMenu     │                            │
                    ├─────────────────┤                            │
                    │ PK id           │                            │
                    │ FK roleId       │←───────────────────────────┘
                    │ FK menuId       │
                    │    createdAt    │
                    └─────────────────┘
                              │
                              ↓
                    ┌─────────────────┐
                    │      Menu       │
                    ├─────────────────┤
                    │ PK id           │
                    │    name         │
                    │    type         │  (DIR/MENU/BUTTON)
                    │    path         │
                    │    component    │
                    │    icon         │
                    │    permission   │
                    │    parentId     │
                    │    sort         │
                    │    status       │
                    │    isExternal   │
                    │    isCache      │
                    │    isHidden     │
                    │    createdAt    │
                    └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│   DictType      │         │    DictItem     │
├─────────────────┤         ├─────────────────┤
│ PK id           │←────────│ FK dictTypeId   │
│    name         │         │    label        │
│    code         │         │    value        │
│    status       │         │    sort         │
│    createdAt    │         │    status       │
└─────────────────┘         │    createdAt    │
                            └─────────────────┘

┌─────────────────┐
│  RefreshToken   │
├─────────────────┤
│ PK id           │
│ FK userId       │
│    token        │
│    expiresAt    │
│    createdAt    │
└─────────────────┘
```

### 3.2 核心表结构 (Prisma Schema 概览)

```prisma
// 用户表
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  nickname  String?
  email     String?
  phone     String?
  avatar    String?
  deptId    Int?
  status    Int      @default(1) // 0:禁用 1:启用
  createdAt DateTime @default(now())
  
  dept      Dept?    @relation(fields: [deptId], references: [id])
  roles     UserRole[]
  refreshTokens RefreshToken[]
}

// 角色表
model Role {
  id          Int      @id @default(autoincrement())
  name        String
  code        String   @unique
  description String?
  sort        Int      @default(0)
  status      Int      @default(1)
  createdAt   DateTime @default(now())
  
  users       UserRole[]
  menus       RoleMenu[]
}

// 菜单表
model Menu {
  id          Int      @id @default(autoincrement())
  name        String
  type        String   // DIR/MENU/BUTTON
  path        String?
  component   String?
  icon        String?
  permission  String?
  parentId    Int?
  sort        Int      @default(0)
  status      Int      @default(1)
  isExternal  Boolean  @default(false)
  isCache     Boolean  @default(true)
  isHidden    Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  parent      Menu?    @relation("MenuParent", fields: [parentId], references: [id])
  children    Menu[]   @relation("MenuParent")
  roles       RoleMenu[]
}

// 部门表
model Dept {
  id        Int      @id @default(autoincrement())
  name      String
  code      String?
  parentId  Int?
  leader    String?
  sort      Int      @default(0)
  status    Int      @default(1)
  createdAt DateTime @default(now())
  
  parent   Dept?    @relation("DeptParent", fields: [parentId], references: [id])
  children Dept[]   @relation("DeptParent")
  users    User[]
}

// 字典类型
model DictType {
  id        Int      @id @default(autoincrement())
  name      String
  code      String   @unique
  status    Int      @default(1)
  createdAt DateTime @default(now())
  
  items     DictItem[]
}

// 字典项
model DictItem {
  id          Int      @id @default(autoincrement())
  dictTypeId  Int
  label       String
  value       String
  sort        Int      @default(0)
  status      Int      @default(1)
  createdAt   DateTime @default(now())
  
  dictType    DictType @relation(fields: [dictTypeId], references: [id])
}

// 关联表
model UserRole {
  id        Int      @id @default(autoincrement())
  userId    Int
  roleId    Int
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  role      Role     @relation(fields: [roleId], references: [id])
  
  @@unique([userId, roleId])
}

model RoleMenu {
  id        Int      @id @default(autoincrement())
  roleId    Int
  menuId    Int
  createdAt DateTime @default(now())
  
  role      Role     @relation(fields: [roleId], references: [id])
  menu      Menu     @relation(fields: [menuId], references: [id])
  
  @@unique([roleId, menuId])
}

// Refresh Token
model RefreshToken {
  id        Int      @id @default(autoincrement())
  userId    Int
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## 4. 接口设计

### 4.1 认证模块

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/login | 用户名密码登录 | 否 |
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/refresh | 刷新 Token | 否 |
| POST | /api/auth/logout | 登出 | 是 |
| GET | /api/auth/profile | 获取当前用户信息 | 是 |

### 4.2 用户管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/users | 用户列表 | sys:user:list |
| POST | /api/users | 新增用户 | sys:user:create |
| PUT | /api/users/:id | 编辑用户 | sys:user:update |
| DELETE | /api/users/:id | 删除用户 | sys:user:delete |
| GET | /api/users/:id | 用户详情 | sys:user:detail |
| PUT | /api/users/:id/roles | 分配角色 | sys:user:assign |
| PUT | /api/users/:id/password | 重置密码 | sys:user:reset |
| GET | /api/users/profile | 个人中心 | 任意登录 |
| PUT | /api/users/profile | 修改个人信息 | 任意登录 |
| PUT | /api/users/password | 修改密码 | 任意登录 |

### 4.3 角色管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/roles | 角色列表 | sys:role:list |
| POST | /api/roles | 新增角色 | sys:role:create |
| PUT | /api/roles/:id | 编辑角色 | sys:role:update |
| DELETE | /api/roles/:id | 删除角色 | sys:role:delete |
| GET | /api/roles/:id | 角色详情 | sys:role:detail |
| PUT | /api/roles/:id/menus | 分配菜单 | sys:role:assign |
| GET | /api/roles/:id/menus | 角色菜单 | sys:role:menus |
| GET | /api/roles/:id/users | 角色用户 | sys:role:users |

### 4.4 菜单管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/menus | 菜单列表（树形） | sys:menu:list |
| POST | /api/menus | 新增菜单 | sys:menu:create |
| PUT | /api/menus/:id | 编辑菜单 | sys:menu:update |
| DELETE | /api/menus/:id | 删除菜单 | sys:menu:delete |
| GET | /api/menus/:id | 菜单详情 | sys:menu:detail |
| GET | /api/menus/tree | 菜单树（用于角色分配） | 任意登录 |
| GET | /api/menus/routes | 当前用户路由菜单 | 任意登录 |
| GET | /api/menus/permissions | 当前用户权限标识 | 任意登录 |

### 4.5 部门管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/depts | 部门列表（树形） | sys:dept:list |
| POST | /api/depts | 新增部门 | sys:dept:create |
| PUT | /api/depts/:id | 编辑部门 | sys:dept:update |
| DELETE | /api/depts/:id | 删除部门 | sys:dept:delete |
| GET | /api/depts/:id | 部门详情 | sys:dept:detail |
| GET | /api/depts/:id/users | 部门用户 | sys:dept:users |

### 4.6 字典管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/dict-types | 字典类型列表 | sys:dict:list |
| POST | /api/dict-types | 新增字典类型 | sys:dict:create |
| PUT | /api/dict-types/:id | 编辑字典类型 | sys:dict:update |
| DELETE | /api/dict-types/:id | 删除字典类型 | sys:dict:delete |
| GET | /api/dict-types/:code/items | 字典项列表 | 任意登录 |
| POST | /api/dict-items | 新增字典项 | sys:dict:item:create |
| PUT | /api/dict-items/:id | 编辑字典项 | sys:dict:item:update |
| DELETE | /api/dict-items/:id | 删除字典项 | sys:dict:item:delete |

---

## 5. 前端设计

### 5.1 页面结构

```
┌────────────────────────────────────────────────────┐
│  [Logo] SSS-IMS                  [🔔] [👤 用户名 ▼] │  ← Header
├────────────────┬───────────────────────────────────┤
│                │                                   │
│  🏠 首页        │    ┌─────────────────────────┐    │
│                │    │  Breadcrumb: 首页 > 用户管理 │   │
│  📊 系统管理 ▼   │    └─────────────────────────┘    │
│  ├─ 用户管理     │                                   │
│  ├─ 角色管理     │    ┌─────────────────────────┐    │  ← Main Content
│  ├─ 菜单管理     │    │                         │    │
│  ├─ 部门管理     │    │      页面内容区域         │    │
│  └─ 字典管理     │    │                         │    │
│                │    └─────────────────────────┘    │
│  ⚙️ 个人设置     │                                   │
│                │    ┌─────────────────────────┐    │
│                │    │  [标签页1] [标签页2] [×]  │    │  ← Tabs
│                │    └─────────────────────────┘    │
│                │                                   │
└────────────────┴───────────────────────────────────┘
```

### 5.2 路由设计

| 路径 | 组件 | 说明 |
|------|------|------|
| /login | LoginView | 登录页 |
| / | LayoutView | 布局框架 |
| /dashboard | DashboardView | 首页仪表盘 |
| /system/user | UserView | 用户管理 |
| /system/role | RoleView | 角色管理 |
| /system/menu | MenuView | 菜单管理 |
| /system/dept | DeptView | 部门管理 |
| /system/dict | DictView | 字典管理 |
| /profile | ProfileView | 个人中心 |

### 5.3 通用组件

- **ProTable**: 封装表格 + 搜索 + 分页 + 工具栏
- **ProForm**: 封装表单 + 验证 + 提交
- **ProDialog**: 封装对话框 + 表单
- **Permission**: 权限指令 `v-permission="sys:user:create"`
- **IconSelect**: 图标选择器
- **DeptTree**: 部门树选择器
- **MenuTree**: 菜单树选择器

---

## 6. 非功能需求

### 6.1 性能要求
- 页面首次加载 < 2s
- API 响应时间 < 200ms（P95）
- 列表页支持虚拟滚动（数据 > 1000 条时）

### 6.2 安全要求
- 密码加密存储（bcrypt）
- JWT 双 Token 机制（Access + Refresh）
- 接口防重放攻击（时间戳 + 签名）
- SQL 注入防护（Prisma 自动处理）
- XSS 防护（前端转义）
- CORS 配置

### 6.3 代码规范
- TypeScript strict 模式
- ESLint + Prettier 统一格式
- 接口层统一响应格式 `ApiResult<T>`
- 后端统一异常处理过滤器
- 接口命名遵循 RESTful 规范

---

## 7. 部署要求

### 7.1 开发环境
- 前端: `pnpm dev` (Vite dev server)
- 后端: `pnpm dev` (NestJS watch mode)
- 数据库: 本地 Docker PostgreSQL

### 7.2 生产环境
- 前端: Nginx 静态托管
- 后端: PM2 / Docker 容器化
- 数据库: 生产级 PostgreSQL

### 7.3 构建输出
- 前端: `dist/` 目录
- 后端: `dist/` 目录
- 数据库: Prisma Migration 文件

---

## 8. 验收标准

- [ ] 所有 CRUD 接口正常工作（Swagger 可测试）
- [ ] 前端所有页面可正常操作
- [ ] 权限控制正确（无权限的菜单/按钮/API 被拒绝）
- [ ] 登录/登出/刷新 Token 流程正常
- [ ] 代码通过 ESLint 检查（无报错）
- [ ] 提供 README 部署文档
- [ ] 提供数据库初始化脚本（seed）
- [ ] 包含至少一个管理员账号的初始化数据

---

## 9. 附录

### 9.1 初始化数据 (Seed)

```javascript
// 初始管理员账号
{
  username: "admin",
  password: "admin123",
  nickname: "管理员",
  roles: ["admin"]
}

// 初始角色
{
  name: "超级管理员",
  code: "admin",
  description: "拥有所有权限"
}
{
  name: "普通用户",
  code: "user",
  description: "基础操作权限"
}
```

### 9.2 默认菜单结构

```javascript
// 系统管理菜单
├── 系统管理
│   ├── 用户管理 (sys:user:*)
│   ├── 角色管理 (sys:role:*)
│   ├── 菜单管理 (sys:menu:*)
│   ├── 部门管理 (sys:dept:*)
│   └── 字典管理 (sys:dict:*)
```
