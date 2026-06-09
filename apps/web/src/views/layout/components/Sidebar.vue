<template>
  <div class="sidebar">
    <el-scrollbar>
      <el-menu
        default-active="/dashboard"
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
        <!-- 动态菜单将在这里渲染 -->
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
// 侧边栏 - 动态菜单渲染
</script>

<style scoped>
.sidebar {
  width: 210px;
  height: 100vh;
  background: #304156;
}
</style>