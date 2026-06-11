import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '@/store/user';

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200 && res.code !== 0) {
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return res;
  },
  async (error: AxiosError) => {
    const { response } = error;

    if (response?.status === 401) {
      // Token 过期，尝试刷新
      const userStore = useUserStore();
      const refreshSuccess = await userStore.refreshAccessToken();
      if (refreshSuccess) {
        // 重试原请求
        const originalRequest = error.config as InternalAxiosRequestConfig;
        originalRequest.headers.Authorization = `Bearer ${userStore.token}`;
        return request(originalRequest);
      }
      // 刷新失败，跳转登录
      userStore.logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default request;
