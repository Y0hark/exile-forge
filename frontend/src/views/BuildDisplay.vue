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
          {{ currentBuild.name }}
        </h1>
        <div class="flex flex-wrap gap-4 text-text-secondary mb-4">
          <span>{{ currentBuild.class }}</span>
          <span>•</span>
          <span>{{ currentBuild.ascendancy }}</span>
          <span v-if="currentBuild.data?.playstyle">•</span>
          <span v-if="currentBuild.data?.playstyle">{{ currentBuild.data.playstyle }}</span>
        </div>
      </div>

      <!-- Rating Cards -->
      <div v-if="currentBuild.data?.analysis" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
      <div v-if="currentBuild.data" class="card">
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
              
              <!-- Skill Groups Section -->
              <div v-if="currentBuild.data.skillGroups">
                <h3 class="font-serif text-2xl font-bold mb-4 text-eternal-gold">Skill Groups</h3>
                <div class="space-y-4">
                  <div
                    v-for="(group, idx) in currentBuild.data.skillGroups"
                    :key="idx"
                    class="border border-border-primary rounded p-4 bg-surface-darker"
                  >
                    <div class="flex flex-col sm:flex-row justify-between mb-2">
                        <h4 class="text-lg font-bold text-primary-light">{{ group.label }}</h4>
                        <span class="text-eternal-gold font-mono">{{ group.activeSkill }}</span>
                    </div>
                    <div class="text-text-secondary text-sm mb-3">{{ group.description }}</div>
                    
                    <div v-if="group.supportGems && group.supportGems.length" class="flex flex-wrap gap-2">
                        <span class="text-xs uppercase tracking-wider text-text-muted self-center mr-2">Supports:</span>
                        <span v-for="gem in group.supportGems" :key="gem" class="badge badge-neutral text-sm">
                            {{ gem }}
                        </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Key Mechanics Section -->
              <div v-if="currentBuild.data.keyMechanics">
                <h3 class="font-serif text-2xl font-bold mb-4 text-eternal-gold">Key Mechanics</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="(mech, idx) in currentBuild.data.keyMechanics" :key="idx" class="card bg-surface-darker">
                        <h4 class="font-bold text-primary-light mb-2">{{ mech.name }}</h4>
                        <p class="text-sm text-text-secondary">{{ mech.description }}</p>
                    </div>
                </div>
              </div>
            
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8" v-if="currentBuild.data.analysis">
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
              <!-- Text-based Gear List -->
              <div v-if="currentBuild.data.gearProgression">
                 <h3 class="font-serif text-2xl font-bold mb-4 text-eternal-gold">Gear Progression ({{ selectedGearTier }})</h3>
                 
                 <!-- Tier Selector -->
                 <div class="flex gap-2 mb-4">
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

                 <div class="space-y-4">
                     <template v-if="currentBuild.data.gearProgression[selectedGearTier]">
                        <div v-for="(item, slot) in currentBuild.data.gearProgression[selectedGearTier]" :key="slot" class="card bg-surface-darker p-3">
                            <div class="flex justify-between items-start">
                                <span class="text-xs uppercase text-text-muted">{{ slot }}</span>
                                <span class="font-bold text-primary-light">{{ item.baseName || item.name || 'Random Rare' }}</span>
                            </div>
                            <div v-if="item.keyAffixes" class="mt-2">
                                <div class="text-xs text-text-muted mb-1">Prioritize:</div>
                                <div class="flex flex-wrap gap-1">
                                    <span v-for="affix in item.keyAffixes" :key="affix" class="text-xs text-text-secondary bg-black/30 px-2 py-1 rounded">{{ affix }}</span>
                                </div>
                            </div>
                            <div v-if="item.reasonWhy" class="mt-2 text-xs text-text-secondary italic">
                                "{{ item.reasonWhy }}"
                            </div>
                        </div>
                     </template>
                 </div>
              </div>

            </div>
          </div>

          <!-- Passive Tree Tab -->
          <div v-else-if="activeTab === 'passives'">
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                 <h3 class="font-serif text-2xl font-bold text-eternal-gold">Passive Strategy</h3>
              </div>
              
              <!-- Text Strategy -->
              <div class="card bg-surface-darker p-6">
                  <h4 class="font-bold text-lg mb-4 text-eternal-gold">Keystones</h4>
                   <div class="flex flex-wrap gap-2 mb-6" v-if="currentBuild.data.passiveTreePath?.keystones">
                    <span 
                        v-for="node in currentBuild.data.passiveTreePath.keystones" 
                        :key="node"
                        class="badge badge-accent text-lg py-2 px-4"
                    >
                        {{ node }}
                    </span>
                   </div>

                   <h4 class="font-bold text-lg mb-4 text-eternal-gold">Key Notables</h4>
                   <div class="flex flex-wrap gap-2 mb-6" v-if="currentBuild.data.passiveTreePath?.keyNodes">
                    <span 
                        v-for="node in currentBuild.data.passiveTreePath.keyNodes" 
                        :key="node"
                        class="badge badge-neutral"
                    >
                        {{ node }}
                    </span>
                   </div>
              </div>
            </div>
          </div>
          
          <!-- NO GEAR TAB (Visual Inventory Removed) -->

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

// Removed Visual Components for Text-Only Focus
// import VisualInventory from '../components/Results/VisualInventory.vue';
// import GemLinks from '../components/Results/GemLinks.vue';
// import PassiveTree from '../components/PassiveTree.vue';

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
