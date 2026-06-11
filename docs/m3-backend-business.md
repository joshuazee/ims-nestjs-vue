# M3: 后端业务模块

**版本:** v1.0
**日期:** 2026-06-11
**状态:** ✅ 已完成（M2 阶段合并完成）

---

## 1. 概述

M3 原计划为后端业务模块开发阶段，但在实际推进中，业务模块的 CRUD 接口与 M2 后端核心基础设施同步完成。本里程碑的工作已提前于 M2 阶段全部实现，包括：

- 用户管理（User）模块的完整 CRUD、分页、角色分配、密码重置
- 角色管理（Role）模块的完整 CRUD、菜单权限分配
- 菜单管理（Menu）模块的完整 CRUD、树形结构
- 部门管理（Dept）模块的完整 CRUD、树形结构
- 字典管理（Dict）模块的完整 CRUD（类型+项）

---

## 2. 合并原因说明

在 M2 阶段推进时，为保证开发效率和代码一致性，选择一次性完成所有后端业务接口的搭建，而不是分两个阶段。这样有以下好处：

1. **数据库 Schema 统一**：所有模块共享同一套 Prisma Schema，一次性设计完整
2. **DTO 规范一致**：所有模块统一使用 class-validator 校验规则
3. **权限体系统一**：所有模块统一使用 `@Permissions()` 守卫注解
4. **测试效率提升**：同步编写 Service 单元测试和 Controller 集成测试，确保质量

---

## 3. 实现内容

### 3.1 用户管理模块（User Module）

| 功能 | 接口 | 权限 |
|------|------|------|
| 创建用户 | `POST /api/users` | `user:create` |
| 用户列表 | `GET /api/users` | `user:list` |
| 用户详情 | `GET /api/users/:id` | `user:list` |
| 更新用户 | `PUT /api/users/:id` | `user:update` |
| 删除用户 | `DELETE /api/users/:id` | `user:delete` |
| 修改状态 | `PUT /api/users/:id/status` | `user:update` |
| 重置密码 | `PUT /api/users/:id/password` | `user:update` |
| 分配角色 | `PUT /api/users/:id/roles` | `user:update` |

**实现文件：**
- `apps/server/src/modules/user/user.controller.ts`
- `apps/server/src/modules/user/user.service.ts`
- `apps/server/src/modules/user/dto/user.dto.ts`

### 3.2 角色管理模块（Role Module）

| 功能 | 接口 | 权限 |
|------|------|------|
| 创建角色 | `POST /api/roles` | `role:create` |
| 角色列表 | `GET /api/roles` | `role:list` |
| 角色详情 | `GET /api/roles/:id` | `role:list` |
| 更新角色 | `PUT /api/roles/:id` | `role:update` |
| 删除角色 | `DELETE /api/roles/:id` | `role:delete` |
| 分配菜单 | `PUT /api/roles/:id/menus` | `role:update` |

**实现文件：**
- `apps/server/src/modules/role/role.controller.ts`
- `apps/server/src/modules/role/role.service.ts`
- `apps/server/src/modules/role/dto/role.dto.ts`

### 3.3 菜单管理模块（Menu Module）

| 功能 | 接口 | 权限 |
|------|------|------|
| 创建菜单 | `POST /api/menus` | `menu:create` |
| 菜单列表 | `GET /api/menus` | `menu:list` |
| 菜单详情 | `GET /api/menus/:id` | `menu:list` |
| 更新菜单 | `PUT /api/menus/:id` | `menu:update` |
| 删除菜单 | `DELETE /api/menus/:id` | `menu:delete` |

**实现文件：**
- `apps/server/src/modules/menu/menu.controller.ts`
- `apps/server/src/modules/menu/menu.service.ts`
- `apps/server/src/modules/menu/dto/menu.dto.ts`

### 3.4 部门管理模块（Dept Module）

| 功能 | 接口 | 权限 |
|------|------|------|
| 创建部门 | `POST /api/depts` | `dept:create` |
| 部门列表 | `GET /api/depts` | `dept:list` |
| 部门详情 | `GET /api/depts/:id` | `dept:list` |
| 更新部门 | `PUT /api/depts/:id` | `dept:update` |
| 删除部门 | `DELETE /api/depts/:id` | `dept:delete` |

**实现文件：**
- `apps/server/src/modules/dept/dept.controller.ts`
- `apps/server/src/modules/dept/dept.service.ts`
- `apps/server/src/modules/dept/dto/dept.dto.ts`

### 3.5 字典管理模块（Dict Module）

| 功能 | 接口 | 权限 |
|------|------|------|
| 创建字典类型 | `POST /api/dicts/types` | `dict:create` |
| 字典类型列表 | `GET /api/dicts/types` | `dict:list` |
| 字典类型详情 | `GET /api/dicts/types/:id` | `dict:list` |
| 更新字典类型 | `PUT /api/dicts/types/:id` | `dict:update` |
| 删除字典类型 | `DELETE /api/dicts/types/:id` | `dict:delete` |
| 创建字典项 | `POST /api/dicts/items` | `dict:create` |
| 字典项列表 | `GET /api/dicts/types/:id/items` | `dict:list` |
| 字典项详情 | `GET /api/dicts/items/:id` | `dict:list` |
| 更新字典项 | `PUT /api/dicts/items/:id` | `dict:update` |
| 删除字典项 | `DELETE /api/dicts/items/:id` | `dict:delete` |

**实现文件：**
- `apps/server/src/modules/dict/dict.controller.ts`
- `apps/server/src/modules/dict/dict.service.ts`
- `apps/server/src/modules/dict/dto/dict.dto.ts`

---

## 4. 代码关联

M3 业务代码与 M2 核心代码在 Git 上合并为同一个提交：

- **`d5d1030`** — `feat: M2 backend core - auth, JWT, RBAC, CRUD modules, seed data`

该提交包含 M2 基础设施（Auth、JWT、权限守卫）和 M3 业务模块（User/Role/Menu/Dept/Dict）的完整实现。

---

## 5. 测试覆盖

所有业务模块均已在 M2 测试补完阶段完成单元测试：

| 测试文件 | 类型 | 测试数 | 覆盖 |
|----------|------|--------|------|
| `user.service.spec.ts` | 单元 | 9 | 用户 CRUD、角色分配、密码重置 |
| `role.service.spec.ts` | 单元 | 7 | 角色 CRUD、菜单权限分配 |
| `menu.service.spec.ts` | 单元 | 6 | 菜单 CRUD、树形结构 |
| `dept.service.spec.ts` | 单元 | 6 | 部门 CRUD、删除保护 |
| `dict.service.spec.ts` | 单元 | 10 | 字典类型/项 CRUD |
| `user.controller.spec.ts` | 集成 | 8 | 用户接口 HTTP 测试 |
| `auth.controller.spec.ts` | 集成 | 4 | 认证接口 HTTP 测试 |

---

## 6. 下一步

M3 已全部完成，接下来进入 M4：前端框架搭建。

**M4 计划内容：**
- Axios 请求封装 + Token 注入/刷新机制
- Pinia 状态管理（User Store / Permission Store / App Store）
- 路由守卫 + 动态路由（根据权限菜单生成）
- 登录页面连接真实 API
- 布局框架动态菜单渲染
- 标签页导航
