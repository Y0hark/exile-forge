<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="currentMode === 'login' ? 'Login' : 'Create Account'"
    max-width="500px"
  >
    <div class="py-4">
      <LoginForm
        v-if="currentMode === 'login'"
        @success="handleSuccess"
        @switch-to-register="currentMode = 'register'"
      />
      <RegisterForm
        v-else
        @success="handleSuccess"
        @switch-to-login="currentMode = 'login'"
      />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Modal from '../Common/Modal.vue';
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';

const props = defineProps<{
  modelValue: boolean;
  initialMode?: 'login' | 'register';
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const currentMode = ref<'login' | 'register'>(props.initialMode || 'login');

// Reset mode when modal opens
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.initialMode) {
    currentMode.value = props.initialMode;
  }
});

const handleSuccess = () => {
  emit('success');
  emit('update:modelValue', false);
};
</script>
