import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { buildApi } from '../api/client';

// Build interfaces
export interface Build {
    id: number;
    name: string;
    class: string;
    ascendancy: string;
    mainSkill: string;
    createdAt: string;
    updatedAt?: string;
    isPublic?: boolean;
    downloads?: number;
    data?: any;
    explanation?: string;
}

export interface BuildGenerationRequest {
    playstyle_description: string;
    class?: string;
    allow_uniques?: boolean;
    allow_respec?: boolean;
    preferred_ascendancy?: string;
}

export const useBuildsStore = defineStore('builds', () => {
    // State
    const builds = ref<Build[]>([]);
    const currentBuild = ref<Build | null>(null);
    const isLoading = ref(false);
    const isGenerating = ref(false);
    const error = ref<string | null>(null);
    const generationCost = ref<{ tokens: number; usd: number } | null>(null);

    // Getters
    const userBuilds = computed(() => builds.value);
    const recentBuilds = computed(() =>
        [...builds.value].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5)
    );

    // Actions
    const generateBuild = async (request: BuildGenerationRequest) => {
        isGenerating.value = true;
        error.value = null;
        generationCost.value = null;

        try {
            const response = await buildApi.generateBuild(request);

            currentBuild.value = response.build;
            generationCost.value = response.cost;

            // Add to builds list if not already there
            if (!builds.value.find(b => b.id === response.build.id)) {
                builds.value.unshift(response.build);
            }

            return response.build;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to generate build';
            throw err;
        } finally {
            isGenerating.value = false;
        }
    };

    const fetchBuild = async (id: number) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await buildApi.getBuild(id);
            currentBuild.value = response.build;
            return response.build;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch build';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const fetchUserBuilds = async (userId: number) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await buildApi.getUserBuilds(userId);
            builds.value = response.builds;
            return response.builds;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch builds';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const fetchPublicBuilds = async (page: number = 1, limit: number = 20) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await buildApi.getPublicBuilds(page, limit);
            return response;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch public builds';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const updateBuild = async (id: number, updates: { name?: string; build_data?: any }) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await buildApi.updateBuild(id, updates);

            // Update in builds list
            const index = builds.value.findIndex(b => b.id === id);
            if (index !== -1) {
                builds.value[index] = { ...builds.value[index], ...response.build };
            }

            // Update current build if it's the same
            if (currentBuild.value?.id === id) {
                currentBuild.value = { ...currentBuild.value, ...response.build };
            }

            return response.build;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to update build';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteBuild = async (id: number) => {
        isLoading.value = true;
        error.value = null;

        try {
            await buildApi.deleteBuild(id);

            // Remove from builds list
            builds.value = builds.value.filter(b => b.id !== id);

            // Clear current build if it's the deleted one
            if (currentBuild.value?.id === id) {
                currentBuild.value = null;
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to delete build';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const publishBuild = async (id: number) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await buildApi.publishBuild(id);

            // Update in builds list
            const index = builds.value.findIndex(b => b.id === id);
            if (index !== -1) {
                builds.value[index] = { ...builds.value[index], isPublic: true };
            }

            return response.build;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to publish build';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const clearCurrentBuild = () => {
        currentBuild.value = null;
        generationCost.value = null;
    };

    return {
        // State
        builds,
        currentBuild,
        isLoading,
        isGenerating,
        error,
        generationCost,

        // Getters
        userBuilds,
        recentBuilds,

        // Actions
        generateBuild,
        fetchBuild,
        fetchUserBuilds,
        fetchPublicBuilds,
        updateBuild,
        deleteBuild,
        publishBuild,
        clearCurrentBuild,
    };
});
