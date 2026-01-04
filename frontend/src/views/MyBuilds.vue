<template>
  <div class="container mx-auto px-8 py-12">
    <h1 class="font-serif text-5xl font-bold mb-8 text-eternal-gold">My Builds</h1>
    
    <LoadingSpinner v-if="isLoading" size="lg" message="Loading builds..." class="min-h-96" />
    
    <ErrorAlert v-else-if="error" type="error" :message="error" class="mb-8" />
    
    <div v-else>
      <!-- Empty State -->
      <div v-if="builds.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">🔨</div>
        <h2 class="text-2xl font-semibold mb-4 text-text-secondary">No builds yet</h2>
        <p class="text-text-secondary mb-6">Create your first build to get started!</p>
        <router-link to="/builder" class="btn btn-primary">
          Generate New Build
        </router-link>
      </div>
      
      <!-- Builds Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="build in builds"
          :key="build.id"
          class="card card-accent cursor-pointer hover:border-eternal-gold transition-fast"
          @click="viewBuild(build.id)"
        >
          <h3 class="font-serif text-2xl font-bold mb-2 text-eternal-gold">
            {{ build.name }}
          </h3>
          <div class="text-text-secondary text-sm space-y-1 mb-4">
            <p>{{ build.class }} - {{ build.ascendancy }}</p>
            <p>{{ build.mainSkill }}</p>
            <p class="text-xs">Created: {{ formatDate(build.createdAt) }}</p>
          </div>
          
          <div class="flex gap-2 mt-4 pt-4 border-t border-border-primary">
            <button
              @click.stop="deleteBuildConfirm(build.id)"
              class="btn btn-danger text-sm py-2 px-4"
            >
              Delete
            </button>
            <span
              v-if="build.isPublic"
              class="px-3 py-2 text-xs bg-success/20 text-success rounded border border-success ml-auto"
            >
              Public
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBuildsStore } from '../stores/builds';
import { useAuthStore } from '../stores/auth';
import LoadingSpinner from '../components/Common/LoadingSpinner.vue';
import ErrorAlert from '../components/Common/ErrorAlert.vue';

const router = useRouter();
const buildsStore = useBuildsStore();
const authStore = useAuthStore();

const builds = computed(() => buildsStore.builds);
const isLoading = computed(() => buildsStore.isLoading);
const error = computed(() => buildsStore.error);

const viewBuild = (id: number) => {
  router.push(`/builds/${id}`);
};

const deleteBuildConfirm = async (id: number) => {
  if (confirm('Are you sure you want to delete this build?')) {
    try {
      await buildsStore.deleteBuild(id);
    } catch (err) {
      console.error('Failed to delete build:', err);
    }
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

onMounted(async () => {
  const user = authStore.user;
  if (user) {
    await buildsStore.fetchUserBuilds(user.id);
  }
});
</script>
