<script setup>
import { inject, ref, watch } from 'vue'

const toasts = inject('toasts')

const localToasts = ref([])

watch(
  () => toasts?.value,
  (val) => {
    if (val) {
      localToasts.value = [...val]
    }
  },
  { deep: true }
)

function getIcon(type) {
  switch (type) {
    case 'success': return '✅'
    case 'error': return '❌'
    case 'warning': return '⚠️'
    case 'info': return 'ℹ️'
    default: return '💬'
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in localToasts"
          :key="toast.id"
          class="toast"
          :class="'toast-' + (toast.type || 'info')"
        >
          <span class="toast-icon">{{ getIcon(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--space-lg);
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  pointer-events: none;
  width: calc(100% - var(--space-xl) * 2);
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  pointer-events: auto;
  animation: slideDown 0.3s ease;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
  line-height: 1;
}

.toast-message {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

.toast-success {
  border-left: 3px solid var(--success);
}

.toast-error {
  border-left: 3px solid var(--danger);
}

.toast-warning {
  border-left: 3px solid var(--warning);
}

.toast-info {
  border-left: 3px solid var(--info);
}
</style>
