<template>
  <div class="header">
    <div class="header-left">
      <span class="title">SSS IMS</span>
    </div>
    <div class="header-right">
      <span class="username">admin</span>
      <el-button type="text" @click="handleLogout">退出登录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const handleLogout = () => {
  // TODO: 退出登录
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}
.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
</style>