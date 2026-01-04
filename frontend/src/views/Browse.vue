<template>
  <div class="container mx-auto px-8 py-12">
    <h1 class="font-serif text-5xl font-bold mb-8 text-eternal-gold">Browse Builds</h1>
    
    <p class="text-text-secondary mb-8">
      Discover builds created by the community. Filter by class, playstyle, or search for specific skills.
    </p>
    
    <LoadingSpinner v-if="isLoading" size="lg" message="Loading builds..." class="min-h-96" />
    
    <ErrorAlert v-else-if="error" type="error" :message="error" class="mb-8" />
    
    <div v-else>
      <!-- Empty State -->
      <div v-if="publicBuilds.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">🔍</div>
        <h2 class="text-2xl font-semibold mb-4 text-text-secondary">No public builds yet</h2>
        <p class="text-text-secondary mb-6">Be the first to share a build with the community!</p>
        <router-link to="/builder" class="btn btn-primary">
          Create Build
        </router-link>
      </div>
      
      <!-- Builds Grid -->
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div
            v-for="build in publicBuilds"
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
              <p class="text-xs">Downloads: {{ build.downloads || 0 }}</p>
            </div>
            
            <button class="btn btn-secondary w-full text-sm">
              View Build
            </button>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="flex justify-center gap-4">
          <button
            @click="loadMore"
            v-if="hasMore"
            class="btn btn-primary"
            :disabled="isLoading"
          >
            Load More
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBuildsStore } from '../stores/builds';
import LoadingSpinner from '../components/Common/LoadingSpinner.vue';
import ErrorAlert from '../components/Common/ErrorAlert.vue';

const router = useRouter();
const buildsStore = useBuildsStore();

const publicBuilds = ref<any[]>([]);
const currentPage = ref(1);
const hasMore = ref(true);

const isLoading = computed(() => buildsStore.isLoading);
const error = computed(() => buildsStore.error);

const viewBuild = (id: number) => {
  router.push(`/builds/${id}`);
};

const loadMore = async () => {
  currentPage.value++;
  const response = await buildsStore.fetchPublicBuilds(currentPage.value);
  if (response.builds) {
    publicBuilds.value.push(...response.builds);
    hasMore.value = response.builds.length === 20; // Assuming 20 per page
  }
};

onMounted(async () => {
  const response = await buildsStore.fetchPublicBuilds(1);
  if (response.builds) {
    publicBuilds.value = response.builds;
    hasMore.value = response.builds.length === 20;
  }
});
</script>
