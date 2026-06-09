<template>
  <div class="layout-container">
    <Sidebar />
    <div class="layout-main">
      <Header />
      <TagsView />
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
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
}
.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f0f2f5;
}
</style>
