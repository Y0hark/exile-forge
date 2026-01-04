<template>
  <div class="gem-links-container p-6 bg-bg-surface border border-border-primary rounded-lg">
    <h3 class="text-xl font-serif text-eternal-gold mb-6 border-b border-border-primary pb-2">Main Skill Setup</h3>
    
    <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12">
      <!-- Main Skill (6-Link style) -->
      <div class="main-gem relative group">
        <!-- Socket Hexagon -->
        <div class="socket w-20 h-20 bg-gray-900 clip-hex flex items-center justify-center border-2 border-eternal-gold shadow-glow-gold relative z-10 transition-transform group-hover:scale-110">
          <div class="text-center">
            <div class="text-2xl mb-1">⚔️</div>
            <div class="text-xs font-bold text-white px-1 truncate max-w-[4.5rem]">{{ skillName }}</div>
          </div>
        </div>
        
        <!-- Connecting lines to supports -->
        <div v-for="(support, index) in supports" :key="`line-${index}`" 
             class="absolute top-1/2 left-1/2 h-1 bg-eternal-gold origin-left -z-0 transition-all duration-500"
             :style="getLineStyle(index, supports.length)"
        ></div>
        
        <!-- Tooltip -->
        <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black px-2 py-1 rounded text-xs whitespace-nowrap z-20 pointer-events-none">
          Active Skill
        </div>
      </div>

      <!-- Support Gems -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div v-for="(support, index) in supports" :key="index" class="support-gem relative group">
          <div class="socket w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center border-2 border-blue-400 shadow-glow-blue relative z-10 transition-transform group-hover:scale-110">
             <div class="text-center">
                <div class="text-lg">💎</div>
             </div>
          </div>
          <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center w-32">
             <span class="text-xs font-bold text-gray-300 block truncate">{{ support }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  skillName: string;
  supports: string[];
}>();

// Calculate rotation for connecting lines if we wanted a radial layout
// For this simple layout, we won't draw lines dynamically to the grid slots as it's tricky with CSS only
// We'll simplistic lines or just implicitly show links
const getLineStyle = (_index: number, _total: number) => {
    // This is placeholder logic. 
    // Implementing true dynamic lines in CSS between grid items is hard without SVG.
    // For now, hiding lines to keep it clean, rely on visual grouping.
    return { display: 'none' };
};
</script>

<style scoped>
.clip-hex {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

.shadow-glow-gold {
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
}

.shadow-glow-blue {
  box-shadow: 0 0 10px rgba(66, 153, 225, 0.4);
}
</style>
