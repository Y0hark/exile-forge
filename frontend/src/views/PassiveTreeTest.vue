<template>
  <div class="p-4 h-screen flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-eternal-gold">Passive Tree Visualization Test</h1>
      <div class="flex gap-2">
        <button @click="toggleRandomNodes" class="btn btn-primary">
          Toggle Random Nodes
        </button>
      </div>
    </div>
    
    <div class="flex-grow border border-border-primary rounded bg-black">
      <PassiveTree :active-nodes="activeNodes" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PassiveTree from '../components/PassiveTree.vue';

const activeNodes = ref<string[]>([]);

function toggleRandomNodes() {
  if (activeNodes.value.length > 0) {
    activeNodes.value = [];
  } else {
    // Just some dummy IDs that might exist in the tree, or random strings
    // In a real scenario we'd use valid IDs.
    // For now, let's just try some likely small numbers or ids found in the file
    // The previous view_file showed node id 42761.
    activeNodes.value = ["42761", "1", "2", "3"]; 
  }
}
</script>
