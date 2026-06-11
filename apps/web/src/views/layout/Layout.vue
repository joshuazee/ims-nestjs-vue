<template>
  <div class="layout-container">
    <Sidebar />
    <div class="layout-main" :style="{ marginLeft: appStore.sidebarCollapsed ? '64px' : '210px' }">
      <Header />
      <TagsView v-if="appStore.showTagsView" />
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import TagsView from './components/TagsView.vue';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();
</script>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
}
.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s;
}
.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f0f2f5;
}
</style>
