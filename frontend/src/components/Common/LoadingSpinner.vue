<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div
      class="spinner"
      :style="{
        width: sizeValue,
        height: sizeValue,
        borderWidth: borderWidth
      }"
    ></div>
    <span v-if="message" class="ml-3 text-text-secondary">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  containerClass?: string;
}>(), {
  size: 'md',
  message: '',
  containerClass: ''
});

const sizeValue = computed(() => {
  switch (props.size) {
    case 'sm': return '24px';
    case 'lg': return '56px';
    default: return '40px';
  }
});

const borderWidth = computed(() => {
  switch (props.size) {
    case 'sm': return '3px';
    case 'lg': return '5px';
    default: return '4px';
  }
});
</script>
