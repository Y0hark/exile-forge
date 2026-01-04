<template>
  <transition name="fade">
    <div v-if="loading" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-primary">
      <!-- Background Glow -->
      <div class="absolute inset-0 bg-radial-gradient opacity-50 animate-pulse"></div>
      
      <!-- Logo Container -->
      <div class="relative z-10 flex flex-col items-center">
        <!-- Animated Ring -->
        <div class="relative w-32 h-32 mb-8">
          <div class="absolute inset-0 border-4 border-eternal-gold/30 rounded-full animate-spin-slow"></div>
          <div class="absolute inset-2 border-4 border-eternal-gold/60 rounded-full animate-spin-reverse"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-6xl animate-pulse">⚔️</span>
          </div>
        </div>
        
        <!-- Text -->
        <h1 class="font-serif text-4xl font-bold text-eternal-gold mb-2 tracking-widest uppercase animate-slide-up">
          ExileForge
        </h1>
        <p class="text-text-secondary text-sm tracking-[0.2em] uppercase animate-fade-in-delayed">
          Shape Your Destiny
        </p>
      </div>
      
      <!-- Progress Bar (Optional visual) -->
      <div class="absolute bottom-20 w-64 h-1 bg-bg-surface rounded-full overflow-hidden">
        <div class="h-full bg-eternal-gold animate-progress"></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean;
}>();
</script>

<style scoped>
.bg-radial-gradient {
  background: radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

.animate-spin-reverse {
  animation: spin 2s linear infinite reverse;
}

.animate-slide-up {
  animation: slideInUp 0.8s ease-out forwards;
}

.animate-fade-in-delayed {
  opacity: 0;
  animation: fadeIn 0.8s ease-out 0.4s forwards;
}

.animate-progress {
  width: 0%;
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { left: -100%; width: 0%; }
  50% { width: 100%; }
  100% { left: 100%; width: 0%; }
}

/* Transition classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
