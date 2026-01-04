<template>
  <div class="visual-inventory">
    <div class="equipment-grid">
      <!-- Helmet -->
      <div class="slot helmet" @mouseenter="hoverItem = inventory.helmet" @mouseleave="hoverItem = null">
        <SlotIcon type="helmet" :item="inventory.helmet" />
      </div>

      <!-- Weapons -->
      <div class="slot weapon-1" @mouseenter="hoverItem = inventory.mainHand" @mouseleave="hoverItem = null">
        <SlotIcon type="weapon" :item="inventory.mainHand" />
      </div>

      <!-- Body Armor -->
      <div class="slot body" @mouseenter="hoverItem = inventory.starter?.body" @mouseleave="hoverItem = null">
        <SlotIcon type="body" :item="inventory.starter?.body" />
      </div>

      <!-- Offhand / Weapon 2 -->
      <div class="slot weapon-2" @mouseenter="hoverItem = inventory.offHand" @mouseleave="hoverItem = null">
        <SlotIcon type="shield" :item="inventory.offHand" />
      </div>

      <!-- Gloves -->
      <div class="slot gloves" @mouseenter="hoverItem = inventory.gloves" @mouseleave="hoverItem = null">
        <SlotIcon type="gloves" :item="inventory.gloves" />
      </div>

      <!-- Boots -->
      <div class="slot boots" @mouseenter="hoverItem = inventory.boots" @mouseleave="hoverItem = null">
        <SlotIcon type="boots" :item="inventory.boots" />
      </div>

      <!-- Accessories -->
      <div class="slot amulet" @mouseenter="hoverItem = inventory.amulet" @mouseleave="hoverItem = null">
        <SlotIcon type="amulet" :item="inventory.amulet" />
      </div>
      
      <div class="slot ring-1" @mouseenter="hoverItem = inventory.rings?.[0]" @mouseleave="hoverItem = null">
        <SlotIcon type="ring" :item="inventory.rings?.[0]" />
      </div>
      
      <div class="slot ring-2" @mouseenter="hoverItem = inventory.rings?.[1]" @mouseleave="hoverItem = null">
        <SlotIcon type="ring" :item="inventory.rings?.[1]" />
      </div>
      
      <div class="slot belt" @mouseenter="hoverItem = inventory.belt" @mouseleave="hoverItem = null">
        <SlotIcon type="belt" :item="inventory.belt" />
      </div>
    </div>

    <!-- Item Tooltip -->
    <div v-if="hoverItem" class="item-tooltip fixed z-50 pointer-events-none" :style="tooltipStyle">
      <div class="tooltip-header" :class="getRarityClass(hoverItem)">
        <div class="font-serif text-lg font-bold">{{ hoverItem.baseName || 'Unknown Item' }}</div>
        <div class="text-xs uppercase tracking-wider">{{ hoverItem.rarity || 'Rare' }} {{ hoverItem.type || 'Item' }}</div>
      </div>
      <div class="tooltip-body bg-black/90 p-3 border-x border-b border-gray-700">
        <!-- Stats -->
        <div v-if="hoverItem.keyAffixes && hoverItem.keyAffixes.length" class="space-y-1 text-blue-300 mb-3">
          <div v-for="stat in hoverItem.keyAffixes" :key="stat">{{ stat }}</div>
        </div>
        
        <!-- Reason/Notes -->
        <div v-if="hoverItem.reasonWhy" class="text-text-secondary italic text-sm border-t border-gray-800 pt-2 mt-2">
          "{{ hoverItem.reasonWhy }}"
        </div>
        
        <div v-if="hoverItem.priority" class="mt-2 text-xs uppercase text-eternal-gold font-bold">
          Priority: {{ hoverItem.priority }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import SlotIcon from '../Common/SlotIcon.vue';

const props = defineProps<{
  inventory: any; // gearProgression.starter/mid/endgame object
}>();

const hoverItem = ref<any>(null);
const mouseX = ref(0);
const mouseY = ref(0);

const updateMouse = (e: MouseEvent) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
};

onMounted(() => {
  window.addEventListener('mousemove', updateMouse);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', updateMouse);
});

const tooltipStyle = computed(() => ({
  left: `${mouseX.value + 20}px`,
  top: `${mouseY.value + 20}px`,
}));

const getRarityClass = (item: any) => {
  if (item.rarity === 'Unique' || item.priority === 'Required') return 'text-orange-500 border-orange-500 bg-orange-950/50';
  return 'text-yellow-300 border-yellow-500 bg-yellow-950/50';
};
</script>

<style scoped>
.equipment-grid {
  display: grid;
  grid-template-areas:
    ".       helmet  ."
    "weapon1 body    weapon2"
    "gloves  boots   ."
    "ring1   amulet  ring2"
    ".       belt    .";
  gap: 16px;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(circle, rgba(20,20,30,0.8) 0%, rgba(10,10,15,1) 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
}

.slot {
  width: 64px;
  height: 64px;
  background-color: rgba(0,0,0,0.5);
  border: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: help;
}

.slot:hover {
  border-color: #d4af37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.slot.body { grid-area: body; height: 128px; }
.slot.helmet { grid-area: helmet; }
.slot.weapon-1 { grid-area: weapon1; height: 128px; }
.slot.weapon-2 { grid-area: weapon2; height: 128px; }
.slot.gloves { grid-area: gloves; }
.slot.boots { grid-area: boots; }
.slot.amulet { grid-area: amulet; width: 48px; height: 48px; margin: auto; }
.slot.ring-1 { grid-area: ring1; width: 48px; height: 48px; margin: auto; }
.slot.ring-2 { grid-area: ring2; width: 48px; height: 48px; margin: auto; }
.slot.belt { grid-area: belt; width: 96px; height: 48px; margin: auto; }

.tooltip-header {
  padding: 8px 12px;
  border: 1px solid;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}
</style>
