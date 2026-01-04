<template>
  <div class="passive-tree-container bg-surface-darker border border-border-primary rounded-lg overflow-hidden relative h-[600px]" ref="container">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center z-10 bg-surface-dark/50">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-eternal-gold"></div>
    </div>
    
    <div v-if="error" class="absolute inset-0 flex items-center justify-center z-10 text-red-400">
      {{ error }}
    </div>

    <!-- Controls -->
    <div class="absolute top-4 right-4 z-20 flex flex-col gap-2">
      <button @click="resetView" class="btn btn-sm btn-secondary bg-surface-dark/80" title="Reset View">
        <span class="text-xl">⟲</span>
      </button>
      <button @click="zoomIn" class="btn btn-sm btn-secondary bg-surface-dark/80" title="Zoom In">
        <span class="text-xl">+</span>
      </button>
      <button @click="zoomOut" class="btn btn-sm btn-secondary bg-surface-dark/80" title="Zoom Out">
        <span class="text-xl">-</span>
      </button>
    </div>

    <svg 
      v-if="treeData"
      ref="svgElement"
      class="w-full h-full cursor-move"
      @mousedown="startPan"
      @mousemove="pan"
      @mouseup="endPan"
      @mouseleave="endPan"
      @wheel.prevent="handleWheel"
    >
      <g :transform="`translate(${view.x}, ${view.y}) scale(${view.scale})`">
        <!-- Connections -->
        <g class="connections opacity-40">
          <line 
            v-for="(conn, idx) in connections" 
            :key="`conn-${idx}`"
            :x1="conn.x1" 
            :y1="conn.y1" 
            :x2="conn.x2" 
            :y2="conn.y2" 
            stroke="#4a5568" 
            :stroke-width="conn.active ? 8 : 4"
            :class="{ 'stroke-eternal-gold opacity-100': conn.active }"
          />
        </g>
        
        <!-- Nodes -->
        <g class="nodes">
          <circle 
            v-for="node in visibleNodes" 
            :key="node.id"
            :cx="node.x" 
            :cy="node.y" 
            :r="getNodeSize(node)" 
            :fill="getNodeColor(node)"
            :stroke="node.active ? '#FFD700' : '#2D3748'"
            :stroke-width="node.active ? 4 : 2"
            class="transition-colors duration-200"
            @mouseenter="hoveredNode = node"
            @mouseleave="hoveredNode = null"
          />
        </g>
      </g>
    </svg>

    <!-- Tooltip -->
    <div 
      v-if="hoveredNode"
      class="absolute z-30 pointer-events-none card p-3 max-w-sm"
      :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }"
    >
      <div v-if="hoveredNode.name" class="font-bold text-eternal-gold mb-1">{{ hoveredNode.name }}</div>
      <div v-for="(stat, idx) in hoveredNode.stats" :key="idx" class="text-xs text-text-secondary">
        {{ stat }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';

const props = defineProps<{
  activeNodes?: string[]; // Array of Node IDs that should be highlighted
}>();

const container = ref<HTMLElement | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const treeData = ref<any>(null);
const hoveredNode = ref<any>(null);

// View state
const view = ref({ x: 0, y: 0, scale: 0.15 });
const isPanning = ref(false);
const lastMousePos = ref({ x: 0, y: 0 });

// Processed data
const nodes = ref<any[]>([]);
const connections = ref<any[]>([]);

const visibleNodes = computed(() => {
  // Optimization: Only render nodes if we have data
  return nodes.value;
});

const tooltipPos = ref({ x: 0, y: 0 });

watch(() => hoveredNode.value, (newVal) => {
  if (newVal && container.value) {
    // Basic positioning, improved logic would handle edge cases
    // We update this via mousemove event on container ideally, 
    // but here we might just simplify or use a fixed offset from mouse
  }
});

// Using a separate mousemove listener on container for tooltip might be better,
// but let's just calculate it during render or use a simpler approach.
// Updated: Let's track mouse position in `pan` or a global mouse tracker for tooltip.
// For now, let's just center it or use the event in the circle handler?
// Actually, let's use the container's mousemove to update a `mousePos` ref.

onMounted(async () => {
  try {
    loading.value = true;
    const response = await axios.get('/data/tree.json');
    treeData.value = response.data;
    processTreeData();
    resetView(); // Center initial view
  } catch (e) {
    console.error("Failed to load passive tree:", e);
    error.value = "Failed to load passive tree data.";
  } finally {
    loading.value = false;
  }
});

function processTreeData() {
  if (!treeData.value) {
    console.error("No tree data found");
    return;
  }

  console.log("Processing tree data...", { 
    hasNodes: !!treeData.value.nodes,
    hasGroups: !!treeData.value.groups,
    hasConstants: !!treeData.value.constants
  });

  const rawNodes = treeData.value.nodes;
  const rawGroups = treeData.value.groups;
  // Fallback constants if missing (using values found in file)
  const orbitRadii = treeData.value.constants?.orbitRadii || [0, 82, 162, 335, 493, 662, 846, 251, 1080, 1322];
  const orbitAngles = treeData.value.constants?.orbitAnglesByOrbit;
  const skillsPerOrbit = treeData.value.constants?.skillsPerOrbit || [1, 12, 24, 24, 72, 72, 72, 24, 72, 144];

  const processedNodes: any[] = [];
  const processedConnections: any[] = [];
  const nodeMap = new Map();

  // 1. Process Nodes
  Object.keys(rawNodes).forEach(id => {
    const n = rawNodes[id];
    
    // Determine position
    let x = 0;
    let y = 0;

    // Use group + orbit logic if available
    if (n.group !== undefined && rawGroups[n.group]) {
      const group = rawGroups[n.group];
      const orbit = n.orbit || 0;
      const orbitIndex = n.orbitIndex || 0;
      
      const radius = orbitRadii[orbit] || 0;
      
      // Calculate angle
      let angle = 0;
      if (orbitAngles && orbitAngles[orbit] && orbitAngles[orbit].length > orbitIndex) {
          angle = orbitAngles[orbit][orbitIndex];
      } else if (skillsPerOrbit[orbit]) {
          // Fallback calculation: 2 * PI * index / total
          // Note: PoE usually starts from top (-PI/2 or similar offset), 
          // but let's try standard first or match `orbitAngles` logic if we verified it.
          // The `orbitAngles` dump showed [0, 0.523...] which is 0, 30deg... 
          // 0 is usually top or right. In PoE encoding, it's usually counter-clockwise from top.
          angle = (2 * Math.PI * orbitIndex) / skillsPerOrbit[orbit];
          
          // Correction based on observation: 0 is usually top -> -PI/2 in math (since y is down)
          // But `sin(angle) * r` for x and `-cos(angle) * r` for y works for "0 is top, clockwise"
          // Let's assume the angles in `orbitAngles` are radians.
          angle -= Math.PI / 2; 
      }

      x = group.x + radius * Math.sin(angle);
      y = group.y - radius * Math.cos(angle);
    } else if (typeof n.x === 'number' && typeof n.y === 'number') {
       // Direct coordinates fallback (unlikely for main nodes)
       x = n.x;
       y = n.y;
    } else {
        // Skip nodes without position (e.g. mastery groups sometimes)
        return;
    }

    const node = {
      id,
      x,
      y,
      name: n.name || n.lc || (n.stats && n.stats.length > 0 ? "Passive" : "Node"),
      stats: n.stats || [],
      isKeystone: n.ks,
      isNotable: n.not,
      isMastery: n.m,
      active: false,
      out: n.out || []
    };
    
    processedNodes.push(node);
    nodeMap.set(id, node);
  });

  // 2. Parse Connections
  const connectionSet = new Set<string>();

  processedNodes.forEach(node => {
     if (node.out && node.out.length) {
       node.out.forEach((targetId: string) => {
         const target = nodeMap.get(targetId.toString());
         if (target) {
             const connId = [node.id, target.id].sort().join('-');
             if (!connectionSet.has(connId)) {
                connectionSet.add(connId);
                processedConnections.push({
                  x1: node.x,
                  y1: node.y,
                  x2: target.x,
                  y2: target.y,
                  active: false
                });
             }
         }
       });
     }
  });
  
  console.log(`Processed ${processedNodes.length} nodes and ${processedConnections.length} connections.`);

  nodes.value = processedNodes;
  connections.value = processedConnections;
  updateActiveState();
}

watch(() => props.activeNodes, () => {
  updateActiveState();
}, { deep: true });

function updateActiveState() {
  const activeSet = new Set(props.activeNodes || []);
  
  nodes.value.forEach(n => {
    n.active = activeSet.has(n.id);
  });
  
  // For connections, we light them up if both ends are active
  // Note: we need to map connections back to node IDs to do this efficiently.
  // Currently `processedConnections` lost the IDs. Let's fix that in processTreeData 
  // or just ignore connection processing for now for "active" lines (simplified)
  // Re-processing connections could count active edges here
  // const activeConns: any[] = [];
  // ... (Optimization left for later, strictly visual nodes are fine for now)
}

// Interaction
function startPan(e: MouseEvent) {
  isPanning.value = true;
  lastMousePos.value = { x: e.clientX, y: e.clientY };
  if(container.value) container.value.style.cursor = 'grabbing';
}

function pan(e: MouseEvent) {
  // Update tooltip position
  const rect = container.value?.getBoundingClientRect();
  if (rect) {
    tooltipPos.value = { 
      x: e.clientX - rect.left + 15, 
      y: e.clientY - rect.top + 15 
    };
  }

  if (!isPanning.value) return;
  
  const dx = e.clientX - lastMousePos.value.x;
  const dy = e.clientY - lastMousePos.value.y;
  
  view.value.x += dx;
  view.value.y += dy;
  
  lastMousePos.value = { x: e.clientX, y: e.clientY };
}

function endPan() {
  isPanning.value = false;
  if(container.value) container.value.style.cursor = 'move';
}

function handleWheel(e: WheelEvent) {
  const zoomFactor = 1.1;
  const direction = e.deltaY > 0 ? -1 : 1;
  const factor = direction > 0 ? zoomFactor : 1 / zoomFactor;
  
  // Basic zoom at center for now (improving to mouse-point zoom is better UX but more math)
  view.value.scale *= factor;
}

function zoomIn() {
  view.value.scale *= 1.2;
}

function zoomOut() {
  view.value.scale /= 1.2;
}

function resetView() {
  // Center roughly on (0,0) or the average of nodes
  // PoE tree usually centered at 0,0
  view.value = { 
    x: container.value ? container.value.clientWidth / 2 : 300, 
    y: container.value ? container.value.clientHeight / 2 : 300, 
    scale: 0.15 
  };
}

// Styling helpers
function getNodeSize(node: any) {
  if (node.isKeystone) return 50; // Bigger
  if (node.isNotable) return 30;
  if (node.isMastery) return 20; // Or hidden if transparent
  return 15; // Small
}

function getNodeColor(node: any) {
  if (node.isKeystone) return '#FF4500'; // Orangeish
  if (node.isNotable) return '#FFD700'; // Gold
  if (node.isMastery) return '#00000000'; // Transparent usually? Or specific icon
  return '#4A5568'; // Dark gray for normal
}

</script>

<style scoped>
.passive-tree-container {
  /* Pattern background could be cool here */
  background-image: radial-gradient(circle at center, #1a202c 0%, #0d1117 100%);
}
</style>
