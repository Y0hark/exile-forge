<template>
  <div class="visual-passive-tree card p-0 overflow-hidden relative" style="height: 600px;">
    <!-- Controls -->
    <div class="absolute top-4 right-4 z-10 flex gap-2">
      <button @click="resetView" class="btn btn-sm btn-secondary" title="Reset View">
        <span class="text-xl">⟲</span>
      </button>
      <div class="join">
        <button @click="zoomIn" class="btn btn-sm btn-secondary join-item" title="Zoom In">+</button>
        <button @click="zoomOut" class="btn btn-sm btn-secondary join-item" title="Zoom Out">-</button>
      </div>
    </div>

    <!-- SVG Container -->
    <div 
      class="w-full h-full cursor-grab active:cursor-grabbing bg-bg-base"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
      @wheel.prevent="onWheel"
    >
      <svg 
        ref="svgRef" 
        width="100%" 
        height="100%" 
        :viewBox="viewBoxString"
        class="transition-transform duration-75 ease-out"
      >
        <defs>
          <!-- glow filter for keystones -->
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <!-- Gradient for connections -->
          <linearGradient id="line-gradient" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#4a4a4a" />
            <stop offset="50%" stop-color="#d4af37" />
            <stop offset="100%" stop-color="#4a4a4a" />
          </linearGradient>
        </defs>

        <!-- Connections (Edges) -->
        <g class="connections">
          <path 
            v-for="(path, i) in connections" 
            :key="`path-${i}`"
            :d="path"
            fill="none"
            stroke="url(#line-gradient)"
            stroke-width="2"
            opacity="0.6"
          />
        </g>

        <!-- Nodes -->
        <g class="nodes">
          <g 
            v-for="node in nodes" 
            :key="node.id"
            :transform="`translate(${node.x}, ${node.y})`"
            class="transition-all duration-300"
            @mouseover="hoverNode = node"
            @mouseleave="hoverNode = null"
          >
            <!-- Node Circle -->
            <circle 
              :r="node.type === 'keystone' ? 20 : 12" 
              :fill="node.type === 'keystone' ? '#d4af37' : '#2d3748'"
              :stroke="node.type === 'keystone' ? '#fff' : '#d4af37'"
              stroke-width="2"
              :filter="node.type === 'keystone' ? 'url(#glow)' : ''"
              class="cursor-pointer hover:fill-eternal-gold"
            />
            
            <!-- Node Label (if Keystone or Major) -->
            <text 
              v-if="node.type === 'keystone' || node.type === 'major'"
              y="35" 
              text-anchor="middle" 
              fill="#e2e8f0"
              class="text-xs font-serif font-bold pointer-events-none select-none shadow-black drop-shadow-md"
            >
              {{ node.name }}
            </text>
          </g>
        </g>
      </svg>
    </div>

    <!-- Tooltip -->
    <div 
      v-if="hoverNode"
      class="absolute pointer-events-none z-20 px-3 py-2 bg-bg-elevated border border-eternal-gold/50 rounded shadow-xl text-sm"
      :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }"
    >
      <div class="font-bold text-eternal-gold mb-1">{{ hoverNode.name }}</div>
      <div class="text-text-secondary text-xs capitalize">{{ hoverNode.type }} Node</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps<{
  treeData: any; // The passiveTreePath object from the build JSON
}>();

// Types
interface Node {
  id: string;
  name: string;
  type: 'keystone' | 'major' | 'minor';
  x: number;
  y: number;
}

// State
const nodes = ref<Node[]>([]);
const connections = ref<string[]>([]);
const hoverNode = ref<Node | null>(null);

// Viewport State for Pan/Zoom
const viewBox = ref({ x: -400, y: -300, w: 800, h: 600 });
const isDragging = ref(false);
const lastMousePos = ref({ x: 0, y: 0 });

const viewBoxString = computed(() => 
  `${viewBox.value.x} ${viewBox.value.y} ${viewBox.value.w} ${viewBox.value.h}`
);

const tooltipPos = ref({ x: 0, y: 0 });

// Generate Visual Graph from Data
// Since we don't have real coordinates, we'll arrange them in a force-directed-like or radial layout
// For simplicity, let's create a spiral or tree-like layout progressing outwards
const generateGraph = () => {
  if (!props.treeData) return;

  const generatedNodes: Node[] = [];
  const generatedConnections: string[] = [];
  
  // 1. Add Keystones (Central or Key positions)
  const keystones = props.treeData.keystones || [];
  keystones.forEach((name: string, i: number) => {
    // Position keystones in a circle
    const angle = (i / keystones.length) * Math.PI * 2;
    const radius = 200;
    generatedNodes.push({
      id: `keystone-${i}`,
      name,
      type: 'keystone',
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
  });

  // 2. Add Phase Clusters
  // We'll arrange phases flowing outwards from center
  const byPhase = props.treeData.byPhase || {};
  const phaseKeys = Object.keys(byPhase);
  
  phaseKeys.forEach((phaseKey, phaseIndex) => {
    const phase = byPhase[phaseKey];
    const clusterNodes = phase.nodes || [];
    
    // Position cluster nodes in a group for this phase
    const startX = -300 + (phaseIndex * 200); // Spread horizontally
    
    clusterNodes.forEach((nodeName: string, i: number) => {
      const nodeX = startX + (i % 3) * 40;
      const nodeY = (i * 30) - 100 + (Math.random() * 20); // Some randomness
      
      generatedNodes.push({
        id: `node-${phaseIndex}-${i}`,
        name: nodeName,
        type: 'major',
        x: nodeX,
        y: nodeY
      });
    });
  });

  // 3. Create connections
  // Connect nodes sequentially for now to visualize a "path"
  if (generatedNodes.length > 1) {
    for (let i = 0; i < generatedNodes.length - 1; i++) {
        const start = generatedNodes[i];
        const end = generatedNodes[i + 1];
        if (start && end) {
            // Bezier curve connection
            const midX = (start.x + end.x) / 2;
            generatedConnections.push(
            `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`
            );
        }
    }
  }

  nodes.value = generatedNodes;
  connections.value = generatedConnections;
};

// Controls
const zoomIn = () => {
  viewBox.value.w *= 0.8;
  viewBox.value.h *= 0.8;
};

const zoomOut = () => {
  viewBox.value.w *= 1.25;
  viewBox.value.h *= 1.25;
};

const resetView = () => {
  viewBox.value = { x: -400, y: -300, w: 800, h: 600 };
};

const startDrag = (e: MouseEvent) => {
  isDragging.value = true;
  lastMousePos.value = { x: e.clientX, y: e.clientY };
};

const onDrag = (e: MouseEvent) => {
  // Update tooltip position
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  tooltipPos.value = {
    x: e.clientX - rect.left + 15,
    y: e.clientY - rect.top + 15
  };

  if (!isDragging.value) return;

  const dx = e.clientX - lastMousePos.value.x;
  const dy = e.clientY - lastMousePos.value.y;
  
  // Scale pan speed by zoom level
  const scale = viewBox.value.w / 800; // Assuming 800 is base width
  
  viewBox.value.x -= dx * scale;
  viewBox.value.y -= dy * scale;
  
  lastMousePos.value = { x: e.clientX, y: e.clientY };
};

const stopDrag = () => {
  isDragging.value = false;
};

const onWheel = (e: WheelEvent) => {
  const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
  viewBox.value.w *= zoomFactor;
  viewBox.value.h *= zoomFactor;
};

onMounted(() => {
  generateGraph();
});

watch(() => props.treeData, generateGraph, { deep: true });
</script>

<style scoped>
.visual-passive-tree {
  background-image: 
    radial-gradient(circle at center, rgba(26, 26, 46, 0.8) 0%, rgba(26, 26, 46, 1) 100%),
    url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgb3BhY2l0eT0iMC4wNSI+CjxwYXRoIGQ9Ik0yNSAwIEwyNSAyNSBMNTAgMjUgTDUwIDUwIEwyNSA1MCBMMjUgMjUgTDAgMjUgTDAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+');
}
</style>
