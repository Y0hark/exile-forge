import { defineStore } from 'pinia';
import { ref } from 'vue';
import { preferencesApi } from '../api/client';

export interface UserPreferences {
    id?: number;
    user_id?: number;
    prefer_no_uniques: boolean;
    prefer_no_rare_uniques: boolean;
    allow_respec: boolean;
}

export const usePreferencesStore = defineStore('preferences', () => {
    // State
    const preferences = ref<UserPreferences>({
        prefer_no_uniques: false,
        prefer_no_rare_uniques: false,
        allow_respec: true,
    });
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Load from localStorage (for non-authenticated users)
    const loadFromStorage = () => {
        const stored = localStorage.getItem('user_preferences');
        if (stored) {
            try {
                preferences.value = { ...preferences.value, ...JSON.parse(stored) };
            } catch (e) {
                console.error('Failed to load preferences from storage:', e);
            }
        }
    };

    // Save to localStorage
    const saveToStorage = () => {
        localStorage.setItem('user_preferences', JSON.stringify(preferences.value));
    };

    // Actions
    const fetchPreferences = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await preferencesApi.getPreferences();
            preferences.value = response.preferences;
            saveToStorage();
            return response.preferences;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch preferences';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const updatePreferences = async (updates: Partial<UserPreferences>) => {
        isLoading.value = true;
        error.value = null;

        // Optimistic update
        const oldPreferences = { ...preferences.value };
        preferences.value = { ...preferences.value, ...updates };
        saveToStorage();

        try {
            const response = await preferencesApi.updatePreferences(updates);
            preferences.value = response.preferences;
            saveToStorage();
            return response.preferences;
        } catch (err: any) {
            // Rollback on error
            preferences.value = oldPreferences;
            saveToStorage();

            error.value = err.response?.data?.message || 'Failed to update preferences';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const setPreference = (key: keyof UserPreferences, value: boolean) => {
        preferences.value = { ...preferences.value, [key]: value };
        saveToStorage();
    };

    const resetPreferences = () => {
        preferences.value = {
            prefer_no_uniques: false,
            prefer_no_rare_uniques: false,
            allow_respec: true,
        };
        saveToStorage();
    };

    // Initialize
    loadFromStorage();

    return {
        // State
        preferences,
        isLoading,
        error,

        // Actions
        fetchPreferences,
        updatePreferences,
        setPreference,
        resetPreferences,
    };
});
