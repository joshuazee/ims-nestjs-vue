import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';

export const usePermissionStore = defineStore('permission', () => {
  // State
  const routes = ref<any[]>([]);
  const sidebarRouters = ref<any[]>([]);
  const isRoutesLoaded = ref(false);

  // Getters
  const getRoutes = computed(() => routes.value);

  // Actions
  function setRoutes(newRoutes: any[]) {
    routes.value = newRoutes;
  }

  function setSidebarRouters(routers: any[]) {
    sidebarRouters.value = routers;
  }

  function setRoutesLoaded(loaded: boolean) {
    isRoutesLoaded.value = loaded;
  }

  function resetRoutes() {
    routes.value = [];
    sidebarRouters.value = [];
    isRoutesLoaded.value = false;
  }

  return {
    routes: readonly(routes),
    sidebarRouters: readonly(sidebarRouters),
    isRoutesLoaded: readonly(isRoutesLoaded),
    getRoutes,
    setRoutes,
    setSidebarRouters,
    setRoutesLoaded,
    resetRoutes,
  };
});
