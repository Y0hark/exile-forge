<template>
  <div id="app" class="min-h-screen bg-bg-primary text-text-primary flex flex-col">
    <!-- Initial Page Loader -->
    <PageLoader :loading="initialLoad" />

    <!-- Navbar -->
    <Navbar @show-login="showAuthModal = true" class="sticky top-0 z-50 backdrop-blur-md bg-bg-secondary/80 border-b border-border-primary" />
    
    <!-- Main Content -->
    <main class="flex-1 relative">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- Footer -->
    <Footer />
    
    <!-- Auth Modal -->
    <AuthModal
      v-model="showAuthModal"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from './components/Layout/Navbar.vue';
import Footer from './components/Layout/Footer.vue';
import AuthModal from './components/Auth/AuthModal.vue';
import PageLoader from './components/Common/PageLoader.vue';

const showAuthModal = ref(false);
const initialLoad = ref(true);

const handleAuthSuccess = () => {
  showAuthModal.value = false;
};

onMounted(() => {
  // Simulate initial initialization
  setTimeout(() => {
    initialLoad.value = false;
  }, 2000);
});
</script>

<style>
/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
