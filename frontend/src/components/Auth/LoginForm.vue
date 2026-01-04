<template>
  <div class="auth-form max-w-md mx-auto">
    <h2 class="font-serif text-3xl font-bold text-eternal-gold mb-6 text-center">
      Login to ExileForge
    </h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-semibold mb-2 uppercase tracking-wide">
          Email <span class="text-error">*</span>
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="input"
          :class="{ error: errors.email }"
          placeholder="your@email.com"
          required
          :disabled="isLoading"
        />
        <p v-if="errors.email" class="text-error text-xs mt-1">{{ errors.email }}</p>
      </div>
      
      <!-- Password Field -->
      <div>
        <label for="password" class="block text-sm font-semibold mb-2 uppercase tracking-wide">
          Password <span class="text-error">*</span>
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="input pr-12"
            :class="{ error: errors.password }"
            placeholder="••••••••"
            required
            :disabled="isLoading"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-eternal-gold transition-fast"
            :disabled="isLoading"
          >
            <svg v-if="!showPassword" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="text-error text-xs mt-1">{{ errors.password }}</p>
      </div>
      
      <!-- Remember Me -->
      <div class="flex items-center">
        <input
          id="remember"
          v-model="rememberMe"
          type="checkbox"
          class="w-4 h-4"
          :disabled="isLoading"
        />
        <label for="remember" class="ml-2 text-sm text-text-secondary cursor-pointer">
          Remember me
        </label>
      </div>
      
      <!-- Error Alert -->
      <ErrorAlert v-if="error" type="error" :message="error" @dismiss="error = null" />
      
      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary w-full py-3"
        :disabled="isLoading || !isFormValid"
      >
        <span v-if="!isLoading">Login</span>
        <span v-else class="flex items-center justify-center gap-2">
          <div class="spinner w-5 h-5"></div>
          Logging in...
        </span>
      </button>
      
      <!-- Register Link -->
      <p class="text-center text-sm text-text-secondary mt-4">
        Don't have an account?
        <button
          type="button"
          @click="$emit('switch-to-register')"
          class="text-eternal-gold hover:underline"
        >
          Sign up
        </button>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import ErrorAlert from '../Common/ErrorAlert.vue';

const emit = defineEmits(['success', 'switch-to-register']);

const authStore = useAuthStore();

// Form state
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Validation
const errors = ref<Record<string, string>>({});

const isFormValid = computed(() => {
  return email.value.length > 0 && password.value.length > 0;
});

const handleSubmit = async () => {
  errors.value = {};
  error.value = null;
  
  // Validation
  if (!email.value.includes('@')) {
    errors.value.email = 'Please enter a valid email';
    return;
  }
  
  if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters';
    return;
  }
  
  isLoading.value = true;
  
  try {
    await authStore.login(email.value, password.value);
    emit('success');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.';
  } finally {
    isLoading.value = false;
  }
};
</script>
