<template>
  <div class="container mx-auto px-8 py-12 max-w-3xl">
    <h1 class="font-serif text-5xl font-bold mb-8 text-eternal-gold text-center">
      Build Generator
    </h1>
    
    <!-- Builder Form - using existing component logic from original App.vue -->
    <div class="card card-accent">
      <form @submit.prevent="generateBuild">
        <div class="mb-6">
          <label class="block text-sm font-semibold mb-2 uppercase tracking-wide">
            Describe Your Build
            <span class="text-error">*</span>
          </label>
          <textarea
            v-model="buildDescription"
            placeholder="e.g., I want a cold damage-based mage build focused on endgame mapping with high clear speed"
            class="input w-full h-32 resize-none"
            :disabled="isGenerating"
            required
            minlength="20"
          ></textarea>
          <p class="text-text-disabled text-xs mt-1">Minimum 20 characters</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-semibold mb-2 uppercase tracking-wide">
              Class (Optional)
            </label>
            <select v-model="buildClass" class="input w-full" :disabled="isGenerating">
              <option value="">Auto-select</option>
              <optgroup label="Strength">
                <option value="Marauder">Marauder</option>
                <option value="Warrior">Warrior</option>
              </optgroup>
              <optgroup label="Dexterity">
                <option value="Ranger">Ranger</option>
                <option value="Huntress">Huntress</option>
              </optgroup>
              <optgroup label="Intelligence">
                <option value="Witch">Witch</option>
                <option value="Sorceress">Sorceress</option>
              </optgroup>
              <optgroup label="Hybrid">
                <option value="Duelist">Duelist (Str/Dex)</option>
                <option value="Mercenary">Mercenary (Str/Dex)</option>
                <option value="Shadow">Shadow (Dex/Int)</option>
                <option value="Monk">Monk (Dex/Int)</option>
                <option value="Templar">Templar (Str/Int)</option>
                <option value="Druid">Druid (Str/Int)</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2 uppercase tracking-wide">
              Ascendancy (Optional)
            </label>
            <input
              v-model="buildAscendancy"
              type="text"
              placeholder="e.g. Beastmaster, Gemling Legionnaire"
              class="input w-full"
              :disabled="isGenerating"
            />
          </div>
        </div>

        <div class="mb-8 space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              v-model="allowUniques"
              :disabled="isGenerating"
              class="w-5 h-5"
            />
            <span class="text-sm">Allow unique items</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              v-model="allowRespec"
              :disabled="isGenerating"
              class="w-5 h-5"
            />
            <span class="text-sm">Allow respec during leveling</span>
          </label>
        </div>

        <ErrorAlert v-if="localError" type="error" :message="localError" @dismiss="localError = null" class="mb-6" />
        <ErrorAlert v-if="error" type="error" :message="error" @dismiss="error = null" class="mb-6" />

        <button
          type="submit"
          class="btn btn-primary w-full text-lg py-4"
          :disabled="isGenerating || !buildDescription || buildDescription.length < 20"
        >
          <span v-if="!isGenerating">Generate Build</span>
          <span v-else class="flex items-center justify-center gap-3">
            <LoadingSpinner size="sm" />
            Generating... (this may take 30-60 seconds)
          </span>
        </button>

        <p v-if="generationCost" class="text-center text-text-secondary text-sm mt-4">
          Estimated cost: ${{ generationCost.usd.toFixed(4) }} ({{ generationCost.tokens }} tokens)
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBuildsStore } from '../stores/builds';
import { useAuthStore } from '../stores/auth';
import ErrorAlert from '../components/Common/ErrorAlert.vue';
import LoadingSpinner from '../components/Common/LoadingSpinner.vue';

const router = useRouter();
const buildsStore = useBuildsStore();
const authStore = useAuthStore();

// Form state
const buildDescription = ref('');
const buildClass = ref('');
const buildAscendancy = ref('');
const allowUniques = ref(true);
const allowRespec = ref(true);

// Build state
const isGenerating = computed(() => buildsStore.isGenerating);
const error = computed(() => buildsStore.error);
const generationCost = computed(() => buildsStore.generationCost);
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Local error state for auth check
const localError = ref<string | null>(null);

const generateBuild = async () => {
  localError.value = null;

  if (!isAuthenticated.value) {
    localError.value = 'You must be logged in to generate a build. Please login using the button in the navigation bar.';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  try {
    await buildsStore.generateBuild({
      playstyle_description: buildDescription.value,
      class: buildClass.value || undefined,
      preferred_ascendancy: buildAscendancy.value || undefined,
      allow_uniques: allowUniques.value,
      allow_respec: allowRespec.value,
    });
    
    // Navigate to build display after successful generation
    if (buildsStore.currentBuild) {
      router.push(`/builds/${buildsStore.currentBuild.id}`);
    }
  } catch (err) {
    console.error('Build generation failed:', err);
  }
};
</script>
