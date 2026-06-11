import router from './index';
import { useUserStore } from '@/store/user';
import { usePermissionStore } from '@/store/permission';
import { ElMessage } from 'element-plus';

// 白名单路由（无需登录）
const whiteList = ['/login', '/404'];

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  // 已登录
  if (userStore.isLoggedIn) {
    if (to.path === '/login') {
      next({ path: '/' });
    } else {
      // 如果还没有加载动态路由，先加载
      if (!permissionStore.isRoutesLoaded) {
        try {
          await userStore.fetchUserInfo();
          // 根据后端菜单生成动态路由
          const dynamicRoutes = generateDynamicRoutes(userStore.menus);
          dynamicRoutes.forEach((route) => {
            router.addRoute(route as any);
          });
          permissionStore.setRoutesLoaded(true);
          permissionStore.setSidebarRouters(userStore.menus);
          next({ ...to, replace: true });
        } catch (error) {
          ElMessage.error('获取用户信息失败');
          userStore.logout();
          next(`/login?redirect=${to.path}`);
        }
      } else {
        next();
      }
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
    }
  }
});

// 根据后端菜单生成动态路由
function generateDynamicRoutes(menus: any[]): any[] {
  const routes: any[] = [];

  menus.forEach((menu) => {
    if (menu.type === 'MENU' && menu.component) {
      const route = {
        path: menu.path,
        name: menu.name,
        component: () => import(`@/views/${menu.component}.vue`),
        meta: {
          title: menu.name,
          icon: menu.icon,
          permission: menu.permission,
        },
      };
      routes.push(route);
    }

    // 递归处理子菜单
    if (menu.children && menu.children.length > 0) {
      const childRoutes = generateDynamicRoutes(menu.children);
      routes.push(...childRoutes);
    }
  });

  return routes;
}

export default router;
