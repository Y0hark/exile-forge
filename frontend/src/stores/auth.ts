import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/client';

// User interface
export interface User {
    id: number;
    email: string;
    username: string;
    createdAt?: string;
}

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<User | null>(null);
    const token = ref<string | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Getters
    const isAuthenticated = computed(() => !!token.value);
    const userEmail = computed(() => user.value?.email || '');
    const userName = computed(() => user.value?.username || '');

    // Load token from localStorage on init
    const loadFromStorage = () => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            token.value = storedToken;
            try {
                user.value = JSON.parse(storedUser);
            } catch (e) {
                // Invalid stored user data
                localStorage.removeItem('auth_user');
            }
        }
    };

    // Save to localStorage
    const saveToStorage = () => {
        if (token.value && user.value) {
            localStorage.setItem('auth_token', token.value);
            localStorage.setItem('auth_user', JSON.stringify(user.value));
        }
    };

    // Clear storage
    const clearStorage = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    // Actions
    const login = async (email: string, password: string) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await authApi.login(email, password);

            user.value = response.user;
            token.value = response.token;
            saveToStorage();

            return response.user;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Login failed';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const register = async (email: string, username: string, password: string) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await authApi.register(email, username, password);

            user.value = response.user;
            token.value = response.token;
            saveToStorage();

            return response.user;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Registration failed';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const logout = async () => {
        try {
            if (token.value) {
                await authApi.logout();
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            user.value = null;
            token.value = null;
            clearStorage();
        }
    };

    const loadProfile = async () => {
        if (!token.value) return;

        isLoading.value = true;
        error.value = null;

        try {
            const response = await authApi.getProfile();
            user.value = response.user;
            saveToStorage();
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to load profile';

            // If token is invalid, logout
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout();
            }

            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const refreshToken = async () => {
        if (!token.value) return;

        try {
            const response = await authApi.refreshToken();
            token.value = response.token;
            saveToStorage();
        } catch (err) {
            console.error('Token refresh error:', err);
            logout();
        }
    };

    // Initialize on store creation
    loadFromStorage();

    return {
        // State
        user,
        token,
        isLoading,
        error,

        // Getters
        isAuthenticated,
        userEmail,
        userName,

        // Actions
        login,
        register,
        logout,
        loadProfile,
        refreshToken,
    };
});
