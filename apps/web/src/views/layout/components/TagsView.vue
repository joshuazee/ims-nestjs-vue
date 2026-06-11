<template>
  <div class="tags-view">
    <el-scrollbar>
      <div class="tags-list">
        <el-tag
          v-for="tag in tags"
          :key="tag.path"
          :type="isActive(tag) ? 'primary' : 'info'"
          :effect="isActive(tag) ? 'dark' : 'plain'"
          closable
          @click="handleClick(tag)"
          @close="handleClose(tag)"
        >
          {{ tag.title }}
        </el-tag>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const tags = ref<any[]>([{ path: '/dashboard', title: '首页' }]);

watch(
  () => route.path,
  () => {
    const { path, meta } = route;
    if (meta?.title && !tags.value.find((t) => t.path === path)) {
      tags.value.push({ path, title: meta.title });
    }
  },
  { immediate: true }
);

const isActive = (tag: any) => tag.path === route.path;

const handleClick = (tag: any) => {
  router.push(tag.path);
};

const handleClose = (tag: any) => {
  const index = tags.value.findIndex((t) => t.path === tag.path);
  tags.value.splice(index, 1);
  if (isActive(tag) && tags.value.length > 0) {
    router.push(tags.value[tags.value.length - 1].path);
  }
};
</script>

<style scoped>
.tags-view {
  height: 40px;
  padding: 5px 10px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}
.tags-list {
  display: flex;
  gap: 5px;
}
</style>
