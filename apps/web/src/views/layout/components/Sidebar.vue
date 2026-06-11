<template>
  <div class="sidebar" :style="{ width: appStore.sidebarCollapsed ? '64px' : '210px' }">
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        router
        collapse-transition
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <!-- 动态菜单渲染 -->
        <template v-for="menu in sidebarMenus" :key="menu.id">
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
            <template #title>
              <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
              <span>{{ menu.name }}</span>
            </template>
            <el-menu-item
              v-for="child in menu.children"
              :key="child.id"
              :index="child.path"
            >
              <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="menu.path">
            <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
            <span>{{ menu.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePermissionStore } from '@/store/permission';
import { useAppStore } from '@/store/app';
import { HomeFilled } from '@element-plus/icons-vue';

const route = useRoute();
const permissionStore = usePermissionStore();
const appStore = useAppStore();

const activeMenu = computed(() => route.path);
const sidebarMenus = computed(() => permissionStore.sidebarRouters);
</script>

<style scoped>
.sidebar {
  height: 100vh;
  background: #304156;
  transition: width 0.3s;
}
</style>