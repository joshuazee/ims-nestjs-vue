import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(false);
  const theme = ref('light');
  const layout = ref('default');
  const showTagsView = ref(true);
  const showLogo = ref(true);

  // Actions
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setTheme(newTheme: string) {
    theme.value = newTheme;
  }

  function setLayout(newLayout: string) {
    layout.value = newLayout;
  }

  function toggleTagsView() {
    showTagsView.value = !showTagsView.value;
  }

  return {
    sidebarCollapsed,
    theme,
    layout,
    showTagsView,
    showLogo,
    toggleSidebar,
    setTheme,
    setLayout,
    toggleTagsView,
  };
});
