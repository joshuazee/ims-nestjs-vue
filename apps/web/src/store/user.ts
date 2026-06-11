import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/utils/request';

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>(localStorage.getItem('token') || '');
  const refreshToken = ref<string>(localStorage.getItem('refreshToken') || '');
  const userInfo = ref<any>(null);
  const menus = ref<any[]>([]);
  const permissions = ref<string[]>([]);

  // Getters
  const isLoggedIn = computed(() => !!token.value);
  const username = computed(() => userInfo.value?.username || '');
  const nickname = computed(() => userInfo.value?.nickname || '');
  const avatar = computed(() => userInfo.value?.avatar || '');
  const roles = computed(() => userInfo.value?.roles || []);

  // Actions
  async function login(username: string, password: string) {
    const res: any = await request.post('/auth/login', { username, password });
    const data = res.data;
    token.value = data.accessToken;
    refreshToken.value = data.refreshToken;
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  }

  async function fetchUserInfo() {
    const res: any = await request.get('/auth/me');
    userInfo.value = res.data;
    menus.value = res.data.menus || [];
    permissions.value = res.data.permissions || [];
    return res.data;
  }

  async function refreshAccessToken() {
    try {
      const res: any = await request.post('/auth/refresh', {
        refreshToken: refreshToken.value,
      });
      const data = res.data;
      token.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  function logout() {
    token.value = '';
    refreshToken.value = '';
    userInfo.value = null;
    menus.value = [];
    permissions.value = [];
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  function hasPermission(permission: string) {
    return permissions.value.includes(permission);
  }

  return {
    token,
    refreshToken,
    userInfo,
    menus,
    permissions,
    isLoggedIn,
    username,
    nickname,
    avatar,
    roles,
    login,
    fetchUserInfo,
    refreshAccessToken,
    logout,
    hasPermission,
  };
});
