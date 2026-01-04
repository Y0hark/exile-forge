<template>
  <div class="container mx-auto px-8 py-12 max-w-2xl">
    <h1 class="font-serif text-5xl font-bold mb-8 text-eternal-gold">Account Settings</h1>
    
    <div class="space-y-8">
      <!-- Profile Section -->
      <div class="card">
        <h2 class="font-serif text-3xl font-bold mb-4 text-eternal-gold">Profile</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2 text-text-secondary">Email</label>
            <p class="text-lg">{{ user?.email }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-semibold mb-2 text-text-secondary">Username</label>
            <p class="text-lg">{{ user?.username }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-semibold mb-2 text-text-secondary">Member Since</label>
            <p class="text-lg">{{ formatDate(user?.createdAt || '') }}</p>
          </div>
        </div>
      </div>
      
      <!-- Preferences Section -->
      <div class="card">
        <h2 class="font-serif text-3xl font-bold mb-4 text-eternal-gold">Build Preferences</h2>
        
        <div class="space-y-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              :checked="!preferencesStore.preferences.prefer_no_uniques"
              @change="(e) => preferencesStore.updatePreferences({ prefer_no_uniques: !(e.target as HTMLInputElement).checked })"
              class="w-5 h-5"
            />
            <div>
              <span class="text-sm font-semibold">Allow Unique Items</span>
              <p class="text-xs text-text-secondary">Include unique items in build recommendations</p>
            </div>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              :checked="preferencesStore.preferences.allow_respec"
              @change="(e) => preferencesStore.updatePreferences({ allow_respec: (e.target as HTMLInputElement).checked })"
              class="w-5 h-5"
            />
            <div>
              <span class="text-sm font-semibold">Allow Respec</span>
              <p class="text-xs text-text-secondary">Allow passive tree respeccing during leveling</p>
            </div>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              disabled
              class="w-5 h-5 opacity-50 cursor-not-allowed"
            />
            <div>
              <span class="text-sm font-semibold">Budget Mode</span>
              <p class="text-xs text-text-secondary">Prioritize affordable gear options</p>
            </div>
          </label>
        </div>
        

      </div>
      
      <!-- Danger Zone -->
      <div class="card border-error">
        <h2 class="font-serif text-3xl font-bold mb-4 text-error">Danger Zone</h2>
        
        <button @click="logout" class="btn btn-danger">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePreferencesStore } from '../stores/preferences';

const router = useRouter();
const authStore = useAuthStore();
const preferencesStore = usePreferencesStore();

const user = computed(() => authStore.user);

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const logout = async () => {
  await authStore.logout();
  router.push('/');
};

onMounted(() => {
  // Preferences are loaded from localStorage on store init
});
</script>
