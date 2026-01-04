<template>
  <div class="container mx-auto px-8 py-12">
    <LoadingSpinner v-if="isLoading" size="lg" message="Loading build..." class="min-h-screen" />
    
    <ErrorAlert v-else-if="error" type="error" :message="error" class="max-w-2xl mx-auto" />
    
    <div v-else-if="currentBuild" class="max-w-6xl mx-auto">
      <!-- Header with Actions -->
      <div class="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <router-link to="/builder" class="btn btn-secondary">
          ← Back to Generator
        </router-link>
        <div class="flex gap-3">
          <button @click="saveBuild" class="btn btn-secondary" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Build' }}
          </button>
          <button @click="shareBuild" class="btn btn-secondary">
            Share
          </button>
        </div>
      </div>

      <!-- Build Header -->
      <div class="card card-accent mb-8">
        <h1 class="font-serif text-4xl md:text-5xl font-bold mb-4 text-eternal-gold">
          {{ currentBuild.data.name }}
        </h1>
        <div class="flex flex-wrap gap-4 text-text-secondary mb-4">
          <span>{{ currentBuild.data.class }}</span>
          <span>•</span>
          <span>{{ currentBuild.data.ascendancy }}</span>
          <span>•</span>
          <span>{{ currentBuild.data.mainSkill.gem }}</span>
        </div>
        <p class="text-text-secondary text-lg">
          {{ currentBuild.data.mainSkill.description }}
        </p>
      </div>

      <!-- Rating Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div class="card text-center">
          <div class="text-4xl font-bold text-eternal-gold mb-2">
            {{ currentBuild.data.analysis.mappingRating }}/10
          </div>
          <div class="text-text-secondary">Mapping</div>
        </div>
        <div class="card text-center">
          <div class="text-4xl font-bold text-eternal-gold mb-2">
            {{ currentBuild.data.analysis.bossingRating }}/10
          </div>
          <div class="text-text-secondary">Bossing</div>
        </div>
        <div class="card text-center">
          <div class="text-4xl font-bold text-eternal-gold mb-2">
            {{ currentBuild.data.analysis.survivalRating }}/10
          </div>
          <div class="text-text-secondary">Survival</div>
        </div>
      </div>

      <!-- Tabs -->
      <!-- Tabs -->
      <div class="card">
        <!-- Tab Headers -->
        <div class="flex border-b border-border-primary overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-6 py-3 font-semibold whitespace-nowrap transition-fast"
            :class="activeTab === tab.id ? 'border-b-2 border-eternal-gold text-eternal-gold' : 'text-text-secondary hover:text-eternal-gold'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'">
            <div class="space-y-8">
              <!-- Visual Skill Links -->
              <GemLinks 
                :skillName="currentBuild.data.mainSkill.gem"
                :supports="getLastPhaseSupports(currentBuild.data)" 
              />
            
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 class="font-serif text-2xl font-bold mb-3 text-eternal-gold">Strengths</h3>
                  <ul class="list-disc list-inside space-y-2 text-text-secondary">
                    <li v-for="(strength, index) in currentBuild.data.analysis.strengths" :key="index">
                      {{ strength }}
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 class="font-serif text-2xl font-bold mb-3 text-eternal-gold">Weaknesses</h3>
                  <ul class="list-disc list-inside space-y-2 text-text-secondary">
                    <li v-for="(weakness, index) in currentBuild.data.analysis.weaknesses" :key="index">
                      {{ weakness }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Equipment Tab -->
          <div v-if="activeTab === 'equipment'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div v-if="currentBuild.data.equipment">
                <h3 class="font-serif text-2xl font-bold mb-4 text-eternal-gold">Key Uniques</h3>
                <ul class="space-y-4" v-if="currentBuild.data.equipment.keyUniques">
                  <li v-for="(item, index) in currentBuild.data.equipment.keyUniques" :key="index" class="card bg-surface-darker p-4 flex items-start gap-4">
                    <div class="w-12 h-12 rounded bg-surface-dark border border-border-primary flex items-center justify-center text-2xl">
                      🔮
                    </div>
                    <div>
                      <div class="font-bold text-eternal-gold">{{ item }}</div>
                      <div class="text-xs text-text-secondary mt-1">Unique Item</div>
                    </div>
                  </li>
                </ul>
                <p v-else class="text-text-secondary">No unique items recommended.</p>
              </div>

              <div v-if="currentBuild.data.equipment">
                <h3 class="font-serif text-2xl font-bold mb-4 text-eternal-gold">Stat Priorities</h3>
                <ul class="space-y-2" v-if="currentBuild.data.equipment.statPriorities">
                  <li v-for="(stat, index) in currentBuild.data.equipment.statPriorities" :key="index" class="flex items-center gap-2 text-text-secondary">
                    <span class="text-eternal-gold">›</span>
                    {{ stat }}
                  </li>
                </ul>
                <p v-else class="text-text-secondary">No stat priorities listed.</p>
              </div>
            </div>
          </div>

          <!-- Passive Tree Tab -->
          <div v-else-if="activeTab === 'passives'">
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                 <h3 class="font-serif text-2xl font-bold text-eternal-gold">Passive Tree</h3>
                 <div class="text-text-secondary text-sm" v-if="currentBuild.data.passiveTree">
                   Strategy: <span class="text-white">{{ currentBuild.data.passiveTree.pathingAdvice || 'Follow key nodes' }}</span>
                 </div>
              </div>
              
              <!-- Visualization -->
              <PassiveTree 
                v-if="currentBuild.data.passiveTree"
                :activeNodes="currentBuild.data.passiveTree.keyNodes || []" 
              />
              <div v-else class="text-text-secondary">No passive tree strategy available.</div>
              
              <!-- Strategy Details -->
               <div class="card bg-surface-darker" v-if="currentBuild.data.passiveTree && currentBuild.data.passiveTree.keyNodes">
                <h4 class="font-bold text-lg mb-2 text-eternal-gold">Key Nodes</h4>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="node in currentBuild.data.passiveTree.keyNodes" 
                    :key="node"
                    class="badge badge-accent"
                  >
                    {{ node }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Gear Tab (Visual Inventory) -->
          <div v-else-if="activeTab === 'gear'">
            <div class="flex justify-center mb-6 gap-2">
              <button 
                v-for="tier in ['starter', 'mid', 'endgame']" 
                :key="tier"
                @click="selectedGearTier = tier"
                class="btn btn-sm capitalize"
                :class="selectedGearTier === tier ? 'btn-primary' : 'btn-secondary'"
              >
                {{ tier }}
              </button>
            </div>
            
            <VisualInventory 
                v-if="currentBuild.data.gearProgression[selectedGearTier]"
                :inventory="currentBuild.data.gearProgression[selectedGearTier]" 
            />
            <p v-else class="text-center text-text-secondary">No gear data for this tier.</p>
          </div>

          <!-- Leveling Tab -->
          <div v-else-if="activeTab === 'leveling'">
            <div v-if="currentBuild.data.levelingGuide" class="space-y-4">
              <div
                v-for="(phase, index) in currentBuild.data.levelingGuide.phases"
                :key="index"
                class="border border-border-primary rounded-lg overflow-hidden"
              >
                <button
                  @click="togglePhase(Number(index))"
                  class="w-full px-6 py-4 bg-bg-surface flex items-center justify-between hover:bg-bg-elevated transition-fast"
                >
                  <span class="font-semibold text-eternal-gold">
                    {{ phase.levelRange }}
                  </span>
                  <svg
                    class="w-5 h-5 transition-transform"
                    :class="expandedPhases.has(Number(index)) ? 'rotate-180' : ''"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <div v-if="expandedPhases.has(Number(index))" class="p-6 space-y-4">
                  <div v-if="phase.mainSkillSetup">
                    <h5 class="font-semibold mb-2">Main Skill Setup</h5>
                    <p class="text-text-secondary">
                      {{ phase.mainSkillSetup.main }}
                      <span v-if="phase.mainSkillSetup.supports && phase.mainSkillSetup.supports.length">
                        + {{ phase.mainSkillSetup.supports.join(', ') }}
                      </span>
                    </p>
                  </div>
                  
                  <div v-if="phase.passiveNodes && phase.passiveNodes.length">
                    <h5 class="font-semibold mb-2">Passive Nodes</h5>
                    <ul class="list-disc list-inside text-text-secondary">
                      <li v-for="(node, i) in phase.passiveNodes" :key="i">{{ node }}</li>
                    </ul>
                  </div>
                  
                  <div v-if="phase.importantNotes && phase.importantNotes.length">
                    <h5 class="font-semibold mb-2">Important Notes</h5>
                    <ul class="list-disc list-inside text-text-secondary">
                      <li v-for="(note, i) in phase.importantNotes" :key="i">{{ note }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-text-secondary">No leveling guide available for this build.</p>
          </div>

          <!-- Explanation Tab -->
          <div v-else-if="activeTab === 'explanation'">
            <MarkdownRenderer v-if="currentBuild.explanation" :content="currentBuild.explanation" />
            <p v-else class="text-text-secondary">No detailed explanation available for this build.</p>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-20">
      <p class="text-text-secondary text-xl">Build not found</p>
      <router-link to="/builder" class="btn btn-primary mt-6">
        Generate New Build
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBuildsStore } from '../stores/builds';
import { useAuthStore } from '../stores/auth';
import LoadingSpinner from '../components/Common/LoadingSpinner.vue';
import ErrorAlert from '../components/Common/ErrorAlert.vue';
import MarkdownRenderer from '../components/Common/MarkdownRenderer.vue';
import VisualInventory from '../components/Results/VisualInventory.vue';
import GemLinks from '../components/Results/GemLinks.vue';
import PassiveTree from '../components/PassiveTree.vue';

const route = useRoute();
const buildsStore = useBuildsStore();
const authStore = useAuthStore();

const activeTab = ref('overview');
const selectedGearTier = ref('starter');
const expandedPhases = ref(new Set<number>());
const isSaving = ref(false);

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'passives', label: 'Passive Tree' },
  { id: 'leveling', label: 'Leveling Guide' },
  { id: 'explanation', label: 'Full Explanation' },
];

const currentBuild = computed(() => buildsStore.currentBuild);
const isLoading = computed(() => buildsStore.isLoading);
const error = computed(() => buildsStore.error);

// Helper to extract support gems from the latest phase
const getLastPhaseSupports = (data: any) => {
    if (!data.levelingGuide?.phases || data.levelingGuide.phases.length === 0) return [];
    const lastPhase = data.levelingGuide.phases[data.levelingGuide.phases.length - 1];
    return lastPhase.mainSkillSetup?.supports || [];
};

const togglePhase = (index: number) => {
  if (expandedPhases.value.has(index)) {
    expandedPhases.value.delete(index);
  } else {
    expandedPhases.value.add(index);
  }
};

const saveBuild = async () => {
  if (!authStore.isAuthenticated) {
    alert('Please login to save builds');
    return;
  }
  
  if (!currentBuild.value) return;
  
  isSaving.value = true;
  try {
    // Build is already saved via API on generation
    alert('Build saved successfully!');
  } catch (err) {
    console.error('Failed to save build:', err);
    alert('Failed to save build');
  } finally {
    isSaving.value = false;
  }
};

const shareBuild = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  alert('Build link copied to clipboard!');
};

onMounted(async () => {
  const buildId = Number(route.params.id);
  if (buildId && !currentBuild.value) {
    await buildsStore.fetchBuild(buildId);
  }
});
</script>
