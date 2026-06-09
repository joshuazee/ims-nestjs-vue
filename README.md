# SSS-IMS-Platform

基础信息管理系统（Information Management System）

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端 | Vue 3 + TypeScript + Vite | 3.5+ |
| UI | Element Plus + UnoCSS | 2.9+ |
| 后端 | NestJS + Prisma | 11+ / 6+ |
| 数据库 | PostgreSQL | 18+ |
| 认证 | JWT (Access + Refresh Token) | - |

## 项目结构

```
sss-ims-platform/
├── apps/
│   ├── web/          # 前端 (Vue 3 + Vite)
│   └── server/       # 后端 (NestJS + Prisma)
├── packages/
│   └── shared/       # 共享类型/工具 (可选)
├── docs/             # 项目文档
├── pnpm-workspace.yaml
└── package.json
```

## 快速开始

### 环境要求
- Node.js >= 22.0.0
- pnpm >= 10.0.0
- PostgreSQL >= 18

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置数据库
创建 `.env` 文件（参考 `.env.example`）：
```env
DATABASE_URL="postgresql://admin:admin123@localhost:5432/myapp"
JWT_SECRET="your-secret-key-here"
```

### 3. 数据库迁移
```bash
pnpm db:migrate
pnpm db:seed
```

### 4. 启动开发服务器
```bash
# 启动后端（终端 1）
pnpm dev:server

# 启动前端（终端 2）
pnpm dev:web
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000/api
- Swagger 文档：http://localhost:3000/api/docs

## 文档

- [需求规格说明书 (PRD)](./docs/prd.md)
- [技术架构方案](./docs/architecture.md)
- [实现路径 (Roadmap)](./docs/roadmap.md)

## 开发规范

- 代码提交遵循 [Conventional Commits](https://conventionalcommits.org/)
- `pnpm format` 自动格式化代码
- `pnpm lint` 检查代码规范

## 许可证

MIT
