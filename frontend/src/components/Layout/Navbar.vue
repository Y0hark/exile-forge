<template>
  <nav 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border-primary/50"
    :class="{ 'bg-bg-primary/80 backdrop-blur-md shadow-lg': isScrolled, 'bg-transparent': !isScrolled }"
  >
    <div class="absolute inset-0 bg-gradient-to-r from-eternal-black/90 via-bg-secondary/90 to-eternal-black/90 opacity-80 pointer-events-none"></div>
    
    <div class="container mx-auto px-6 h-20 flex items-center justify-between relative z-10">
      <!-- Brand Logo -->
      <router-link to="/" class="group flex items-center gap-2.5">
        <div class="relative w-10 h-10 flex items-center justify-center">
          <div class="absolute inset-0 border-2 border-eternal-gold/30 rounded-full group-hover:border-eternal-gold transition-colors duration-500"></div>
          <div class="absolute inset-0 border-2 border-eternal-gold rounded-full opacity-0 group-hover:animate-ping-slow"></div>
          <span class="text-2xl transform group-hover:scale-110 transition-transform duration-300">⚔️</span>
        </div>
        <div class="flex flex-col justify-center">
          <h1 class="font-serif text-2xl font-bold text-eternal-gold tracking-wider mb-0 leading-none group-hover:text-shadow-gold transition-all duration-300">
            ExileForge
          </h1>
          <span class="text-[10px] text-text-secondary uppercase tracking-[0.3em] leading-tight group-hover:text-text-primary transition-colors">
            Shape Your Destiny
          </span>
        </div>
      </router-link>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-8">
        <router-link 
          v-for="link in navLinks" 
          :key="link.path" 
          :to="link.path"
          class="relative group px-1 py-2 font-serif font-medium tracking-wide text-sm uppercase text-text-secondary hover:text-eternal-gold transition-colors duration-300"
          active-class="!text-eternal-gold"
        >
          {{ link.name }}
          <span class="absolute bottom-0 left-0 w-full h-[1px] bg-eternal-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          <span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-eternal-gold rounded-full opacity-0 group-[.router-link-active]:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_#d4af37]"></span>
        </router-link>
        
        <!-- Auth Section -->
        <div class="ml-4 pl-8 border-l border-border-primary/30 flex items-center gap-4">
          <template v-if="isAuthenticated">
             <router-link 
              to="/account"
              class="flex items-center gap-3 group hover:bg-bg-elevated/50 px-3 py-1.5 rounded-full transition-all border border-transparent hover:border-eternal-gold/30"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-eternal-gold/20 to-eternal-gold/5 border border-eternal-gold/30 flex items-center justify-center text-eternal-gold font-serif group-hover:shadow-[0_0_10px_rgba(212,175,55,0.2)] transition-all">
                {{ userInitials }}
              </div>
              <span class="text-sm font-medium text-text-primary group-hover:text-eternal-gold transition-colors">{{ userName }}</span>
            </router-link>
          </template>
          
          <button 
            v-else 
            @click="$emit('show-login')" 
            class="btn btn-primary btn-sm"
          >
            Login
          </button>
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <button 
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="md:hidden relative w-10 h-10 flex items-center justify-center text-eternal-gold hover:bg-bg-elevated/50 rounded-full transition-colors"
      >
        <div class="w-6 h-5 relative flex flex-col justify-between">
          <span class="w-full h-0.5 bg-current transform transition-all duration-300 origin-left" :class="{ 'rotate-45 translate-x-1': mobileMenuOpen }"></span>
          <span class="w-full h-0.5 bg-current transition-opacity duration-300" :class="{ 'opacity-0': mobileMenuOpen }"></span>
          <span class="w-full h-0.5 bg-current transform transition-all duration-300 origin-left" :class="{ '-rotate-45 translate-x-1': mobileMenuOpen }"></span>
        </div>
      </button>
    </div>
    
    <!-- Mobile Menu Drawer -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div 
        v-if="mobileMenuOpen"
        class="md:hidden absolute top-20 left-0 right-0 bg-bg-secondary/95 backdrop-blur-xl border-b border-border-primary border-t border-eternal-gold/10 shadow-2xl"
      >
        <div class="container mx-auto py-6 px-6 flex flex-col gap-2">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="px-4 py-3 rounded-lg text-text-secondary hover:text-eternal-gold hover:bg-eternal-gold/5 transition-all font-serif uppercase tracking-wide flex items-center justify-between group"
            active-class="!text-eternal-gold bg-eternal-gold/5"
            @click="mobileMenuOpen = false"
          >
            {{ link.name }}
            <span class="opacity-0 group-hover:opacity-100 transition-opacity text-eternal-gold">↠</span>
          </router-link>
          
          <div class="h-px bg-border-primary/50 my-2"></div>
          
          <template v-if="isAuthenticated">
            <router-link
              to="/account"
              class="px-4 py-3 rounded-lg text-text-primary hover:text-eternal-gold hover:bg-eternal-gold/5 transition-all flex items-center gap-3"
              @click="mobileMenuOpen = false"
            >
              <div class="w-8 h-8 rounded-full bg-eternal-gold/10 border border-eternal-gold/30 flex items-center justify-center text-eternal-gold text-xs">
                {{ userInitials }}
              </div>
              <span class="font-medium">Account Settings</span>
            </router-link>
            <button
              @click="handleLogout"
              class="w-full mt-2 btn-secondary py-3 text-sm"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <button 
              @click="$emit('show-login'); mobileMenuOpen = false"
              class="w-full mt-2 btn btn-primary"
            >
              Login
            </button>
          </template>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const mobileMenuOpen = ref(false);
const isScrolled = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const userName = computed(() => authStore.userName);
const userInitials = computed(() => {
  return userName.value ? userName.value.substring(0, 2).toUpperCase() : 'EX';
});

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Builder', path: '/builder' },
  { name: 'Browse', path: '/browse' },
  { name: 'My Builds', path: '/my-builds' },
];

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

const handleLogout = async () => {
  await authStore.logout();
  mobileMenuOpen.value = false;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

defineEmits(['show-login']);
</script>

<style scoped>
/* Custom animations for the navbar */
.text-shadow-gold {
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
}

.animate-ping-slow {
  animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
