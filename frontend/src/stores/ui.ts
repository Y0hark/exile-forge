import { defineStore } from 'pinia';
import { ref } from 'vue';

export type Theme = 'dark' | 'light';

export const useUiStore = defineStore('ui', () => {
    // State
    const currentTab = ref<string>('overview');
    const sidebarOpen = ref<boolean>(true);
    const theme = ref<Theme>('dark'); // ExileForge is dark-mode only

    // Load from localStorage
    const loadFromStorage = () => {
        const storedSidebar = localStorage.getItem('ui_sidebar');
        const storedTab = localStorage.getItem('ui_tab');

        if (storedSidebar !== null) {
            sidebarOpen.value = storedSidebar === 'true';
        }

        if (storedTab) {
            currentTab.value = storedTab;
        }
    };

    // Actions
    const setTab = (tab: string) => {
        currentTab.value = tab;
        localStorage.setItem('ui_tab', tab);
    };

    const toggleSidebar = () => {
        sidebarOpen.value = !sidebarOpen.value;
        localStorage.setItem('ui_sidebar', sidebarOpen.value.toString());
    };

    const openSidebar = () => {
        sidebarOpen.value = true;
        localStorage.setItem('ui_sidebar', 'true');
    };

    const closeSidebar = () => {
        sidebarOpen.value = false;
        localStorage.setItem('ui_sidebar', 'false');
    };

    const setTheme = (newTheme: Theme) => {
        theme.value = newTheme;
        // ExileForge is dark-mode only, but keep this for potential future use
    };

    // Initialize
    loadFromStorage();

    return {
        // State
        currentTab,
        sidebarOpen,
        theme,

        // Actions
        setTab,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        setTheme,
    };
});
