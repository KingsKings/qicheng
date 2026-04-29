<script setup>
const props = defineProps({
  current: {
    type: String,
    default: 'tasks'
  }
})

const emit = defineEmits(['switch'])

const tabs = [
  { key: 'tasks', label: '任务', icon: '📋' },
  { key: 'meditation', label: '冥想', icon: '🌿' },
  { key: 'achievements', label: '我的', icon: '🏆' },
  { key: 'settings', label: '设置', icon: '⚙️' }
]

function onSwitch(key) {
  emit('switch', key)
}
</script>

<template>
  <nav class="bottom-nav">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="nav-tab"
      :class="{ active: current === tab.key }"
      @click="onSwitch(tab.key)"
    >
      <span class="nav-icon">{{ tab.icon }}</span>
      <span class="nav-label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  max-width: 480px;
  height: var(--nav-height);
  background: var(--bg-card);
  border-top: 1px solid var(--border-light);
  padding-bottom: var(--safe-bottom);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
  padding: 0;
}

.nav-tab:active {
  transform: scale(0.92);
}

.nav-icon {
  font-size: 22px;
  line-height: 1;
  transition: transform var(--transition-fast);
}

.nav-label {
  font-size: var(--text-xs);
  color: var(--text-hint);
  font-weight: 500;
  transition: color var(--transition-fast);
}

.nav-tab.active .nav-icon {
  transform: scale(1.1);
}

.nav-tab.active .nav-label {
  color: var(--primary);
  font-weight: 600;
}
</style>
