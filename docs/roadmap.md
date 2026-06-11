# SSS-IMS-Platform 实现路径 (Roadmap)

**版本:** v1.0  
**日期:** 2026-06-08  
**状态:** ✅ M0/M1/M2/M3/M4 已完成，进入 M5 前端业务页面

---

## 里程碑概览

```
M0 ──→ M1 ──→ M2 ──→ M3 ──→ M4 ──→ M5 ──→ M6 ──→ M7
准备   架构   后端    后端    前端    前端    集成    验收
      设计   核心   业务   框架   业务   联调   收尾
      1天    2天    2天    2天    2天    1天    1天
      
总计: ~11 天 (不含等待确认时间)
```

---

## M0: 项目准备 (0.5 天)

**目标:** 搭建 Monorepo 骨架，配置开发环境
**状态:** ✅ 已完成（2026-06-09）
**GitHub 提交:** `7301aaa` - feat: M0 project setup

**任务清单:**
- [x] 创建项目目录结构
- [x] 初始化 pnpm workspace
- [x] 配置 ESLint + Prettier + TypeScript
- [x] 配置 Git 仓库 + .gitignore
- [x] 配置 Commitlint / 代码提交规范（可选）
- [x] 编写 README
- [x] 配置 .env.example 环境变量模板
- [x] 配置 Prisma Schema + seed 脚本
- [x] 配置 NestJS 入口 + 全局异常/拦截器

**目录结构:**
```
sss-ims-platform/
├── apps/
│   ├── web/                 # 前端 (Vite + Vue)
│   │   ├── src/
│   │   │   ├── api/         # 接口请求
│   │   │   ├── components/  # 通用组件
│   │   │   ├── views/       # 页面
│   │   │   ├── router/      # 路由
│   │   │   ├── store/       # Pinia
│   │   │   ├── utils/       # 工具函数
│   │   │   └── App.vue
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── server/              # 后端 (NestJS)
│       ├── src/
│       │   ├── modules/     # 业务模块
│       │   ├── common/      # 公共模块
│       │   ├── prisma/      # 数据库
│       │   └── main.ts
│       ├── prisma/
│       │   └── schema.prisma
│       ├── nest-cli.json
│       └── package.json
│
├── packages/
│   └── shared/              # 共享类型/工具 (可选)
│       └── package.json
│
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── .prettierrc
```

**输出物:** `docs/m0-setup.md`

---

## M1: 架构设计 (1 天)

**目标:** 输出技术方案文档，评审通过
**状态:** ✅ 已完成（2026-06-09）

**任务清单:**
- [x] 数据库 Schema 详细设计（Prisma）
- [x] API 接口设计（Swagger 文档）
- [x] 前端架构设计（组件规范、状态管理）
- [x] 安全设计（JWT 方案、密码策略）
- [x] 目录结构规范
- [x] 错误码/响应格式规范
- [x] **测试架构设计（新增）**
  - [x] 后端测试策略（Jest + 单元/集成/E2E）
  - [x] 前端测试策略（Vitest + 组件/组合式函数/状态测试）
  - [x] 测试规范（Arrange-Act-Assert、覆盖率目标）
  - [x] CI/CD 测试流水线配置

**输出物:** `docs/m1-architecture.md`（含测试架构章节）
**GitHub 提交:** `39e6186` - docs: M1 architecture - add testing architecture

---

## M2: 后端 - 核心基础设施 + 业务模块 (2 天)

**目标:** 搭建 NestJS 核心框架，连接数据库，完成所有业务 CRUD 接口
**状态:** ✅ 已完成（2026-06-09 ~ 2026-06-11）
**GitHub 提交:** `d5d1030` - feat: M2 backend core + business CRUD

**任务清单:**

### Day 1 (M2 核心)
- [x] Prisma 初始化 + 数据库连接
- [x] 数据库迁移（Migration）
- [x] 统一响应格式（ApiResult / ApiException）
- [x] 全局异常过滤器（GlobalExceptionFilter）
- [x] 参数验证管道（ValidationPipe）
- [x] Swagger 文档配置

### Day 2 (M2 核心 + M3 业务合并)
- [x] JWT 模块（Access Token + Refresh Token）
- [x] 认证守卫（AuthGuard / JwtStrategy）
- [x] 权限守卫（PermissionGuard / RolesGuard）
- [x] 密码加密工具（bcrypt）
- [x] 数据库 Seed 脚本（初始化管理员/菜单/角色）
- [x] 用户管理模块（User）- CRUD + 分页 + 角色分配 + 密码重置
- [x] 角色管理模块（Role）- CRUD + 菜单分配
- [x] 菜单管理模块（Menu）- 树形 CRUD
- [x] 部门管理模块（Dept）- 树形 CRUD
- [x] 字典管理模块（Dict）- 类型+项 CRUD
- [x] 单元测试补完（64 tests passed）

**说明:** M3 后端业务模块在 M2 阶段同步完成，避免分阶段造成的重复上下文切换。

**输出物:** `docs/m2-backend-core.md`

---

## M3: 后端 - 业务模块 (已合并至 M2)

**目标:** 完成所有 CRUD 接口
**状态:** ✅ 已完成（M2 阶段合并完成）
**GitHub 提交:** 同 M2 `d5d1030`

**任务清单:**

- [x] 用户管理模块（User Module）- CRUD + 分页 + 搜索 + 角色分配 + 密码重置
- [x] 角色管理模块（Role Module）- CRUD + 菜单分配
- [x] 菜单管理模块（Menu Module）- 树形 CRUD
- [x] 部门管理模块（Dept Module）- 树形 CRUD
- [x] 字典管理模块（Dict Module）- 类型 CRUD + 项 CRUD

**说明:** M3 的业务代码已在 M2 阶段同步实现，详见 `docs/m3-backend-business.md`。合并原因是为了避免分阶段导致的重复上下文切换，保证数据库 Schema、DTO 规范、权限守卫的一致性。

**输出物:** `docs/m3-backend-business.md`

---

## M4: 前端 - 框架搭建 (2 天)

**目标:** 搭建 Vue 前端骨架，实现登录和布局
**状态:** ✅ 已完成（2026-06-12）
**GitHub 提交:** `8d4326a` - feat: M4 frontend framework

**任务清单:**

- [x] Axios 请求封装 + Token 注入/自动刷新
- [x] Pinia 状态管理（User / Permission / App）
- [x] 路由守卫 + 动态路由（根据后端权限菜单生成）
- [x] 登录页面连接真实 API
- [x] 布局框架（Sidebar + Header + TagsView）
- [x] 动态菜单渲染
- [x] 用户信息展示 + 退出登录
- [x] 侧边栏折叠
- [x] TypeScript 编译通过

**输出物:** `docs/m4-frontend-framework.md`

---

## M5: 前端 - 业务页面 (2 天)

**目标:** 实现所有管理系统页面

**任务清单:**

### Day 1
- [ ] 通用组件封装
  - ProTable（表格 + 搜索 + 分页）
  - ProForm（表单 + 验证）
  - ProDialog（对话框 + 表单）
  - Permission 指令（v-permission）
- [ ] 用户管理页面
- [ ] 角色管理页面

### Day 2
- [ ] 菜单管理页面（树形表格）
- [ ] 部门管理页面（树形表格）
- [ ] 字典管理页面
- [ ] 个人中心页面（修改信息/密码）
- [ ] 首页仪表盘（Dashboard）

**输出物:** `docs/m5-frontend-business.md`

---

## M6: 集成联调 (1 天)

**目标:** 前后端对接，修复问题

**任务清单:**
- [ ] 接口对接测试（所有 API 走通）
- [ ] 权限控制验证
  - 菜单权限（动态路由）
  - 按钮权限（v-permission）
  - API 权限（后端守卫）
- [ ] Token 刷新机制验证
- [ ] 数据一致性检查
- [ ] Bug 修复

**输出物:** `docs/m6-integration.md`

---

## M7: 验收收尾 (1 天)

**目标:** 交付可运行的系统

**任务清单:**
- [ ] 代码审查（ESLint / 格式检查）
- [ ] 编写部署文档（README）
- [ ] 数据库初始化脚本验证
- [ ] 功能走查（按验收标准逐项检查）
- [ ] 编写 API 文档说明
- [ ] 清理无用代码/注释
- [ ] 最终打包测试

**输出物:** `docs/m7-acceptance.md`

---

## 技术风险与应对

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| Prisma 迁移复杂 | 中 | 高 | 先设计好 Schema，避免后期大改 |
| 动态路由实现复杂 | 中 | 中 | 参考成熟方案（Vue-Admin-Template） |
| 前端树形组件 | 低 | 中 | Element Plus 有 Tree/TreeSelect 组件 |
| 权限边界情况 | 中 | 高 | 设计阶段定义清楚权限粒度 |
| Docker 镜像拉取失败 | 已解决 | 高 | 已配置国内镜像源 |

---

## 角色分工

按 TEAM.md 的标准流程推进：

```
PM ──→ Arch ──→ DevOps ──→ Dev ──→ QA
      (联合)   (审核)      (编码)   (验收)

M0~M1: PM + Arch 主导（出方案）
M2~M3: Dev 后端编码
M4~M5: Dev 前端编码
M6:   集成联调（全员）
M7:   QA 验收
```

---

## 交付物清单

| 阶段 | 文档 | 代码 | 说明 |
|------|------|------|------|
| M0 | setup.md | 项目骨架 | Monorepo 结构 |
| M1 | architecture.md | Prisma Schema | 技术方案 |
| M2 | backend-core.md | 后端核心代码 | 认证/授权/基础 |
| M3 | backend-business.md | 后端业务代码 | 所有 CRUD |
| M4 | frontend-framework.md | 前端框架代码 | 布局/路由/登录 |
| M5 | frontend-business.md | 前端业务代码 | 管理页面 |
| M6 | integration.md | 修复代码 | 联调记录 |
| M7 | acceptance.md | 最终代码 | 验收报告 |

---

## 下一步行动

1. **老大确认 PRD + Roadmap** ← 当前步骤
2. 启动 PM 角色，细化需求确认
3. 启动 Arch 角色，输出技术方案
4. 按里程碑顺序推进开发
