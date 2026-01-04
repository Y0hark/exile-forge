<template>
  <div
    v-if="show"
    class="alert fade-in"
    :class="alertClasses"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <svg
        v-if="showIcon"
        class="w-5 h-5 flex-shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          v-if="type === 'error'"
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
        <path
          v-else-if="type === 'warning'"
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
        <path
          v-else-if="type === 'success'"
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
        <path
          v-else
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd"
        />
      </svg>
      
      <!-- Message -->
      <div class="flex-1">
        <slot>{{ message }}</slot>
      </div>
      
      <!-- Dismiss Button -->
      <button
        v-if="dismissible"
        @click="handleDismiss"
        class="text-current hover:opacity-75 transition-fast flex-shrink-0"
        aria-label="Dismiss"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = withDefaults(defineProps<{
  type?: 'error' | 'warning' | 'success' | 'info';
  message?: string;
  dismissible?: boolean;
  showIcon?: boolean;
}>(), {
  type: 'info',
  message: '',
  dismissible: true,
  showIcon: true
});

const emit = defineEmits(['dismiss']);

const show = ref(true);

const alertClasses = computed(() => {
  const baseClasses = 'p-4 rounded-lg border-2 text-sm';
  
  const typeClasses = {
    error: 'bg-error/10 border-error text-error',
    warning: 'bg-warning/10 border-warning text-warning',
    success: 'bg-success/10 border-success text-success',
    info: 'bg-info/10 border-info text-info',
  };
  
  return `${baseClasses} ${typeClasses[props.type]}`;
});

const handleDismiss = () => {
  show.value = false;
  emit('dismiss');
};
</script>
