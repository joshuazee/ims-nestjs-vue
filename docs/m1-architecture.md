# M1: 架构设计完成报告

**版本:** v1.0  
**日期:** 2026-06-09  
**状态:** ✅ 已完成

---

## 架构设计目标

将 M0 的骨架填充为可直接落地的技术方案，定义：
- 数据库实体关系、索引策略、种子数据
- API 请求/响应格式、DTO 校验规则、错误码体系
- 前端组件规范、路由策略、状态管理方案
- 安全模型（JWT 双 Token、权限守卫层级）

---

## 1. 数据库架构

### 1.1 实体关系（ER Diagram）

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   User   │───→│ UserRole │←───│   Role   │───→│ RoleMenu │
│  用户表   │    │ 关联表    │    │  角色表   │    │ 关联表    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                                               │
     │    ┌──────────┐                             │
     └───→│   Dept   │                        ┌──────────┐
          │  部门表   │                        │   Menu   │
          └──────────┘                        │  菜单表   │
                                              └──────────┘

┌──────────┐         ┌──────────┐
│ DictType │←────────│ DictItem │
│ 字典类型  │         │ 字典项    │
└──────────┘         └──────────┘

┌──────────┐
│RefreshToken│
│ 刷新令牌  │
└──────────┘
```

### 1.2 核心表设计决策

| 设计点 | 决策 | 理由 |
|--------|------|------|
| 主键 | `Int @id @default(autoincrement())` | 简单、高效、兼容性好 |
| 软删除 | `status` 字段（0禁用/1启用） | 保留审计数据，避免误删 |
| 表名前缀 | `sys_` | 与业务表区分，避免命名冲突 |
| 树形结构 | 自关联 `parentId` + Prisma `relation` | Menu/Dept 多级树，简单够用 |
| 时间戳 | `createdAt` + `updatedAt` | 全表统一，审计追溯 |
| 关联级联 | 删除用户/角色 `Cascade`；删除菜单/部门 `SetNull` | 防止孤儿数据，保留完整性 |
| 索引 | 外键、状态、类型字段加 `@@index` | 覆盖 90% 查询场景 |

### 1.3 索引清单

| 表 | 索引字段 | 用途 |
|----|----------|------|
| sys_user | `deptId`, `status` | 部门查询、状态筛选 |
| sys_menu | `parentId`, `status`, `type` | 树形查询、菜单过滤 |
| sys_dept | `parentId`, `status` | 部门树查询 |
| sys_role | `status` | 角色状态筛选 |
| sys_user_role | `userId`, `roleId` | 联合查询 |
| sys_role_menu | `roleId`, `menuId` | 权限查询 |
| sys_dict_item | `dictTypeId`, `status` | 字典项查询 |
| sys_refresh_token | `userId`, `token` | Token 查询与撤销 |

---

## 2. API 接口规范

### 2.1 统一响应格式

```typescript
interface ApiResult<T> {
  code: number;      // 业务状态码，0 = 成功
  message: string;   // 提示信息
  data: T;           // 响应数据
  timestamp: number; // 服务器时间戳
}

interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 2.2 错误码体系（ApiCode）

| 分类 | 码段 | 示例 | 说明 |
|------|------|------|------|
| 成功 | 0 | SUCCESS | 请求成功 |
| 客户端错误 | 1xx | PARAM_ERROR / PARAM_MISSING | 参数校验失败 |
| 认证授权 | 10xx | UNAUTHORIZED / TOKEN_EXPIRED / FORBIDDEN | 登录/Token/权限问题 |
| 资源错误 | 20xx | NOT_FOUND / ALREADY_EXISTS | 数据不存在或冲突 |
| 服务器错误 | 50xx | INTERNAL_ERROR / DB_ERROR | 后端/数据库异常 |

### 2.3 HTTP 状态码映射

| HTTP 状态 | 业务码 | 场景 |
|-----------|--------|------|
| 200 | 0 | 正常响应 |
| 200 | 1 | 参数校验失败 |
| 401 | 1001 | 未登录/Token 过期 |
| 403 | 1004 | 无权限 |
| 404 | 2001 | 资源不存在 |
| 409 | 2003 | 数据冲突（如唯一约束）|
| 500 | 5000 | 服务器内部错误 |

### 2.4 核心接口清单

| 模块 | 接口 | 方法 | 权限标识 |
|------|------|------|----------|
| **认证** | `/api/auth/login` | POST | 无 |
| | `/api/auth/refresh` | POST | 无（需 Refresh Token）|
| | `/api/auth/logout` | POST | 需登录 |
| | `/api/auth/me` | GET | 需登录 |
| **用户** | `/api/users` | GET | user:list |
| | `/api/users/:id` | GET | user:list |
| | `/api/users` | POST | user:create |
| | `/api/users/:id` | PUT | user:update |
| | `/api/users/:id/reset-password` | PUT | user:update |
| | `/api/users/:id/roles` | PUT | user:update |
| **角色** | `/api/roles` | GET | role:list |
| | `/api/roles/:id/menus` | PUT | role:update |
| | `/api/roles/:id/users` | GET | role:list |
| **菜单** | `/api/menus` | GET | menu:list |
| | `/api/menus/tree` | GET | menu:list |
| | `/api/menus/sort` | PUT | menu:update |
| **部门** | `/api/depts` | GET | dept:list |
| | `/api/depts/tree` | GET | dept:list |
| **字典** | `/api/dict-types/:code/items` | GET | 无需认证 |
| | `/api/dict-types` | GET | dict:list |
| | `/api/dict-items` | POST | dict:create |

---

## 3. 安全架构

### 3.1 JWT 双 Token 策略

```
登录 ──→ 颁发 Access Token (2h) + Refresh Token (7d)
           │
正常使用 ──→ 每次请求携带 Access Token (Authorization: Bearer <token>)
           │
Access Token 过期 ──→ 前端用 Refresh Token 换取新 Token
           │
Refresh Token 过期 ──→ 强制重新登录
```

**Token 结构：**
```json
// Access Token
{ "sub": "1", "username": "admin", "roles": [1], "type": "access", "exp": 1735696800 }

// Refresh Token
{ "sub": "1", "type": "refresh", "jti": "uuid", "exp": 1736294400 }
```

**安全要点：**
- `HS256` 签名，密钥 `JWT_SECRET` 环境变量配置
- Refresh Token 存储数据库，支持后端撤销（退出/改密码时清理）
- Access Token 短有效期（2小时），减少泄露风险

### 3.2 密码策略

- **bcrypt 哈希**：成本因子 `12`（约 250ms/次），抗彩虹表
- **强制规则**：最小 6 位，重置后默认 `admin123`，首次登录建议修改
- **传输安全**：HTTPS 全程加密

### 3.3 权限守卫层级

```typescript
// 1. 认证守卫（所有接口）
@UseGuards(JwtAuthGuard)

// 2. 角色守卫（接口级）
@Roles('super_admin')
@UseGuards(RolesGuard)

// 3. 权限守卫（按钮/API 级）
@Permissions('user:create')
@UseGuards(PermissionsGuard)
```

**权限粒度：**
- 菜单权限 → 左侧导航栏显示/隐藏
- 按钮权限 → `v-permission` 指令，无权限移除 DOM
- API 权限 → 后端接口守卫，返回 403

---

## 4. 后端架构

### 4.1 NestJS 模块结构

```
apps/server/src/
├── modules/
│   ├── auth/           # 认证模块（JWT + 守卫 + 策略）
│   ├── user/           # 用户管理
│   ├── role/           # 角色管理
│   ├── menu/           # 菜单管理
│   ├── dept/           # 部门管理
│   └── dict/           # 字典管理
├── common/
│   ├── filters/        # 全局异常过滤器
│   ├── interceptors/   # 响应拦截器
│   ├── decorators/     # @Roles / @Permissions
│   ├── dto/            # 通用 DTO（分页）
│   └── enums/          # ApiCode 枚举
├── prisma/
│   ├── prisma.service.ts   # Prisma 连接管理
│   └── prisma.module.ts    # Prisma 全局模块
└── main.ts             # 入口
```

### 4.2 全局异常处理

```typescript
GlobalExceptionFilter
  ├── HttpException → 映射为业务码
  ├── PrismaClientKnownRequestError
  │   ├── P2002 → ALREADY_EXISTS（唯一约束冲突）
  │   ├── P2003 → DELETE_DENIED（外键约束）
  │   └── P2025 → NOT_FOUND（记录不存在）
  └── 其他 → INTERNAL_ERROR
```

### 4.3 响应拦截器

```typescript
TransformInterceptor
  └── 所有成功响应统一包装为 { code: 0, message: 'success', data, timestamp }
```

---

## 5. 前端架构

### 5.1 目录结构

```
apps/web/src/
├── api/              # 按模块拆分的接口请求
├── components/       # 通用组件（ProTable / ProForm / ProDialog）
├── views/
│   ├── login/        # 登录页面
│   ├── layout/       # 布局框架
│   │   ├── Sidebar.vue      # 侧边栏（动态菜单）
│   │   ├── Header.vue       # 顶部栏（用户/面包屑）
│   │   └── TagsView.vue     # 标签页导航
│   ├── dashboard/    # 首页仪表盘
│   └── system/       # 系统管理页面
│       ├── user/     # 用户管理
│       ├── role/     # 角色管理
│       ├── menu/     # 菜单管理
│       ├── dept/     # 部门管理
│       └── dict/     # 字典管理
├── router/           # 动态路由生成器
├── store/            # Pinia（user / permission / app）
├── composables/      # 组合式函数（usePagination / usePermission）
├── directives/       # v-permission
└── utils/            # Axios 封装 / storage
```

### 5.2 状态管理方案（Pinia）

| Store | 状态 | 方法 |
|-------|------|------|
| **user** | token, userInfo | login(), logout(), fetchUserInfo() |
| **permission** | routes, menus | generateRoutes()（从后端获取权限菜单）|
| **app** | theme, layout, sidebar | toggleTheme(), toggleSidebar() |

### 5.3 路由策略

```typescript
// 常量路由（无需权限）
/login → LoginView

// 动态路由（根据权限生成）
/ → Layout
  ├── /dashboard → DashboardView
  ├── /system/user → UserView（需 user:list）
  ├── /system/role → RoleView（需 role:list）
  └── ...

// 路由守卫
未登录 → 跳转登录
已登录 + 无动态路由 → 加载权限菜单 → 生成路由 → 重试导航
```

### 5.4 Axios 请求封装

```typescript
request.interceptors.request.use(config => {
  // 注入 Access Token
  config.headers.Authorization = `Bearer ${token}`
})

request.interceptors.response.use(
  res => res.data,
  async err => {
    if (err.status === 401) {
      // 尝试刷新 Token
      const success = await refreshToken()
      if (success) return request(err.config) // 重试
      // 刷新失败 → 跳转登录
      router.push('/login')
    }
  }
)
```

---

## 6. 组件规范

### 6.1 通用组件（ProTable / ProForm / ProDialog）

| 组件 | 功能 | 使用场景 |
|------|------|----------|
| **ProTable** | 表格 + 搜索 + 分页 + 操作按钮 | 用户/角色/部门列表 |
| **ProForm** | 表单 + 验证 + 布局 | 新增/编辑弹窗 |
| **ProDialog** | 对话框 + 表单 | 弹窗操作 |
| **AppIcon** | 图标封装 | 菜单/按钮图标 |
| **Breadcrumb** | 面包屑导航 | 内容区顶部 |

### 6.2 自定义指令

```vue
<!-- v-permission：无权限自动移除 DOM -->
<el-button v-permission="'user:create'">新增用户</el-button>
<el-button v-permission="'user:delete'">删除</el-button>
```

---

## 7. 开发规范

### 7.1 代码提交规范（Conventional Commits）

```
feat: 新增用户导入功能
fix: 修复部门树形排序错误
docs: 更新 API 文档说明
style: 调整登录页面样式
refactor: 优化分页查询逻辑
test: 补充用户模块单元测试
chore: 升级 Element Plus 版本
```

### 7.2 接口命名规范

- 全部小写，短横线分隔：`/api/users` `/api/dict-types`
- 资源名词复数，动作用 HTTP 方法：`GET /api/users` 而非 `GET /api/getUsers`
- 子资源用路径：`/api/users/:id/roles`

### 7.3 数据库命名规范

- 表名：`sys_` 前缀 + 单数名词，如 `sys_user`
- 字段名：小写下划线（Prisma 自动映射为 camelCase）
- 索引名：`idx_表名_字段名`

---

## 8. 技术风险与应对

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| Prisma 迁移冲突 | 中 | 高 | 开发用 `migrate dev`，生产用 `migrate deploy`，禁止直接改数据库 |
| 动态路由实现复杂 | 中 | 中 | 参考 Vue-Admin-Template 成熟方案，预留 2 天缓冲 |
| 前端树形组件性能 | 低 | 中 | Element Plus Tree 支持虚拟滚动，数据量大时启用 |
| 权限边界情况 | 中 | 高 | 设计阶段定义清楚：超级管理员绕过所有检查，其他角色严格校验 |
| Docker 镜像拉取 | 已解决 | 高 | 已配置国内镜像源，构建脚本加重试逻辑 |
| Token 泄露 | 低 | 高 | 短有效期 + 可撤销 Refresh Token + HTTPS 强制 |

---

## 9. 输出物清单

| 文件 | 路径 | 说明 |
|------|------|------|
| **数据库 Schema** | `apps/server/prisma/schema.prisma` | 完整 Prisma Schema（7 表 + 2 关联表）|
| **种子数据** | `apps/server/prisma/seed.ts` | 管理员/角色/菜单/字典初始数据 |
| **错误码枚举** | `apps/server/src/common/enums/api-code.enum.ts` | ApiCode + 消息映射 |
| **分页 DTO** | `apps/server/src/common/dto/paginated.dto.ts` | 分页参数校验 |
| **用户 DTO** | `apps/server/src/modules/user/dto/user.dto.ts` | 登录/用户 CRUD DTO |
| **角色 DTO** | `apps/server/src/modules/role/dto/role.dto.ts` | 角色 CRUD + 分配权限 DTO |
| **菜单 DTO** | `apps/server/src/modules/menu/dto/menu.dto.ts` | 菜单 CRUD + 排序 DTO |
| **部门 DTO** | `apps/server/src/modules/dept/dto/dept.dto.ts` | 部门 CRUD DTO |
| **字典 DTO** | `apps/server/src/modules/dict/dto/dict.dto.ts` | 字典类型/项 DTO |
| **全局异常过滤器** | `apps/server/src/common/filters/global-exception.filter.ts` | Prisma + HTTP 异常映射 |
| **响应拦截器** | `apps/server/src/common/interceptors/transform.interceptor.ts` | 统一响应包装 |
| **权限装饰器** | `apps/server/src/common/decorators/roles.decorator.ts` | @Roles / @Permissions |
| **Prisma 服务** | `apps/server/src/prisma/prisma.service.ts` | 连接管理 |
| **Prisma 模块** | `apps/server/src/prisma/prisma.module.ts` | 全局模块导出 |
| **登录页面** | `apps/web/src/views/login/LoginView.vue` | 表单验证 + 登录逻辑 |
| **布局框架** | `apps/web/src/views/layout/Layout.vue` | Sidebar + Header + TagsView |
| **仪表盘** | `apps/web/src/views/dashboard/DashboardView.vue` | 首页占位 |
| **本报告** | `docs/m1-architecture.md` | M1 架构设计文档 |

---

## 10. 下一步（M2: 后端核心基础设施）

M1 架构设计已确认，等待进入 M2：

1. **Day 1**: Prisma 初始化 + 数据库连接 + 迁移 + 统一响应 + 日志 + 验证管道 + Swagger
2. **Day 2**: JWT 模块 + 认证守卫 + 权限守卫 + 密码加密 + 数据库 Seed 脚本

**输出物:** `docs/m2-backend-core.md`

---

*M1 完成于 2026-06-09，耗时约 1 天。*
