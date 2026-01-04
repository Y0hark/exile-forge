<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="handleClose"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-overlay" @click="handleClose"></div>
        
        <!-- Modal Content -->
        <div
          class="relative bg-bg-elevated border-2 border-border-primary rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pop-in"
          :style="{ maxWidth: maxWidth }"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-border-primary">
            <h3 v-if="title" class="font-serif text-2xl font-bold text-eternal-gold">
              {{ title }}
            </h3>
            <slot name="header"></slot>
            
            <button
              @click="handleClose"
              class="text-text-secondary hover:text-eternal-gold transition-fast ml-auto"
              aria-label="Close"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
          
          <!-- Body -->
          <div class="p-6">
            <slot></slot>
          </div>
          
          <!-- Footer -->
          <div v-if="$slots.footer" class="p-6 border-t border-border-primary">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title?: string;
  maxWidth?: string;
  closeOnBackdrop?: boolean;
}>(), {
  title: '',
  maxWidth: '640px',
  closeOnBackdrop: true
});

const emit = defineEmits(['update:modelValue', 'close']);

const handleClose = () => {
  if (props.closeOnBackdrop) {
    emit('update:modelValue', false);
    emit('close');
  }
};

// Handle ESC key
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-normal);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
