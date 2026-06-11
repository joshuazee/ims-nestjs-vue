# M4: 前端框架搭建

**版本:** v1.0
**日期:** 2026-06-12
**状态:** ✅ 已完成

---

## 1. 概述

M4 阶段完成了 Vue 3 前端骨架搭建，包括：

- Axios 请求封装 + Token 注入/自动刷新机制
- Pinia 状态管理（User / Permission / App）
- 路由守卫 + 动态路由（根据后端权限菜单生成）
- 登录页面连接真实 API
- 布局框架动态菜单渲染
- 标签页导航 + 侧边栏折叠
- 用户信息展示 + 退出登录

---

## 2. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.5.x | 前端框架 |
| Vue Router | 4.x | 路由管理 |
| Pinia | 2.x | 状态管理 |
| Axios | 1.7.x | HTTP 请求 |
| Element Plus | 2.9.x | UI 组件库 |
| UnoCSS | 0.65.x | 原子化 CSS |

---

## 3. 核心实现

### 3.1 Axios 请求封装

**文件:** `apps/web/src/utils/request.ts`

功能：
- 统一 baseURL 配置
- 请求拦截器自动注入 Access Token
- 响应拦截器统一错误处理
- 401 自动刷新 Token 并重试原请求

```typescript
// 关键逻辑
request.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshSuccess = await userStore.refreshAccessToken();
      if (refreshSuccess) return request(error.config); // 重试
      userStore.logout();
      window.location.href = '/login';
    }
  }
);
```

### 3.2 Pinia 状态管理

#### User Store (`apps/web/src/store/user.ts`)

| State | 说明 |
|-------|------|
| `token` | Access Token |
| `refreshToken` | Refresh Token |
| `userInfo` | 当前用户信息 |
| `menus` | 后端返回的菜单列表 |
| `permissions` | 权限标识列表 |

| Action | 说明 |
|--------|------|
| `login()` | 登录，存储双 Token |
| `fetchUserInfo()` | 获取用户信息、菜单、权限 |
| `refreshAccessToken()` | 刷新 Access Token |
| `logout()` | 清除所有状态 |
| `hasPermission()` | 检查是否拥有某权限 |

#### Permission Store (`apps/web/src/store/permission.ts`)

| State | 说明 |
|-------|------|
| `routes` | 动态路由列表 |
| `sidebarRouters` | 侧边栏菜单 |
| `isRoutesLoaded` | 是否已加载动态路由 |

#### App Store (`apps/web/src/store/app.ts`)

| State | 说明 |
|-------|------|
| `sidebarCollapsed` | 侧边栏折叠状态 |
| `theme` | 主题（light/dark）|
| `showTagsView` | 是否显示标签页 |

### 3.3 路由守卫

**文件:** `apps/web/src/router/guard.ts`

功能：
- 白名单路由免登录（`/login`, `/404`）
- 未登录跳转登录页（带 redirect 参数）
- 已登录自动获取用户信息并生成动态路由
- 根据后端菜单递归生成 Vue Router 路由配置

```typescript
// 动态路由生成逻辑
function generateDynamicRoutes(menus) {
  const routes = [];
  menus.forEach((menu) => {
    if (menu.type === 'MENU' && menu.component) {
      routes.push({
        path: menu.path,
        component: () => import(`@/views/${menu.component}.vue`),
        meta: { title, icon, permission },
      });
    }
    if (menu.children) routes.push(...generateDynamicRoutes(menu.children));
  });
  return routes;
}
```

### 3.4 布局框架

#### Layout (`apps/web/src/views/layout/Layout.vue`)

- 左侧 Sidebar（动态菜单）
- 顶部 Header（面包屑 + 用户信息 + 退出）
- 右侧内容区（router-view）
- 标签页导航（TagsView）
- 侧边栏支持折叠（响应式宽度）

#### Sidebar (`apps/web/src/views/layout/components/Sidebar.vue`)

- 动态渲染后端返回的菜单树
- 支持 `el-sub-menu` 嵌套
- 根据 `route.path` 自动高亮当前菜单
- 折叠/展开动画

#### Header (`apps/web/src/views/layout/components/Header.vue`)

- 左侧：折叠按钮 + 面包屑
- 右侧：用户头像 + 昵称 + 下拉菜单
- 下拉菜单：个人中心 / 系统设置 / 退出登录
- 退出确认弹窗（ElMessageBox）

#### TagsView (`apps/web/src/views/layout/components/TagsView.vue`)

- 自动记录访问过的路由
- 点击切换路由
- 关闭标签（自动跳转到上一个标签）
- 当前路由高亮

### 3.5 登录页面

**文件:** `apps/web/src/views/login/LoginView.vue`

功能：
- 表单验证（用户名 3-50 位，密码 6-50 位）
- 调用 `userStore.login()` 获取 Token
- 登录成功跳转首页或 redirect 地址
- 登录失败提示错误信息
- 回车键触发登录

---

## 4. 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:3000/api` |

---

## 5. 相关文件

| 文件 | 说明 |
|------|------|
| `apps/web/src/main.ts` | 应用入口，引入路由守卫 |
| `apps/web/src/utils/request.ts` | Axios 封装 |
| `apps/web/src/store/user.ts` | User Store |
| `apps/web/src/store/permission.ts` | Permission Store |
| `apps/web/src/store/app.ts` | App Store |
| `apps/web/src/router/index.ts` | 常量路由配置 |
| `apps/web/src/router/guard.ts` | 路由守卫 + 动态路由生成 |
| `apps/web/src/views/login/LoginView.vue` | 登录页面 |
| `apps/web/src/views/layout/Layout.vue` | 布局框架 |
| `apps/web/src/views/layout/components/Sidebar.vue` | 侧边栏 |
| `apps/web/src/views/layout/components/Header.vue` | 顶部栏 |
| `apps/web/src/views/layout/components/TagsView.vue` | 标签页 |
| `apps/web/src/views/dashboard/DashboardView.vue` | 首页占位 |

---

## 6. 验证方式

### 6.1 编译检查

```bash
cd apps/web
npx vue-tsc --noEmit
```

预期输出：无错误

### 6.2 启动开发服务器

```bash
cd apps/web
pnpm dev
```

预期输出：
```
VITE v6.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 6.3 登录测试

1. 访问 `http://localhost:5173/login`
2. 输入 `admin` / `admin123`
3. 登录成功跳转首页
4. 侧边栏显示动态菜单
5. 顶部栏显示用户头像和昵称
6. 点击退出登录，跳转回登录页

---

## 7. 下一步

M4 已完成，接下来进入 M5：前端业务页面实现。

**M5 计划内容：**
- 通用组件封装（ProTable / ProForm / ProDialog）
- 用户管理页面
- 角色管理页面
- 菜单管理页面（树形表格）
- 部门管理页面（树形表格）
- 字典管理页面
- 个人中心页面
- 首页仪表盘（Dashboard）
