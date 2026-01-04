<template>
  <div class="slot-icon w-full h-full flex items-center justify-center opacity-50 transition-opacity" :class="{ 'opacity-100 text-eternal-gold': hasItem }">
    <img v-if="iconSrc" :src="iconSrc" class="w-2/3 h-2/3 object-contain filter drop-shadow-lg" />
    <span v-else class="text-xs uppercase font-bold tracking-tighter">{{ type }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type: string;
  item?: any;
}>();

const hasItem = computed(() => !!props.item);

// In a real app, mapping these types to actual asset paths
// For now, we'll use placeholders or just text if no asset
const iconSrc = computed(() => {
  // Placeholder logic, ideally returned from backend or asset map
  return null;
});
</script>
