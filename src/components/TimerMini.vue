<script setup>
const props = defineProps({
  displayTime: {
    type: String,
    default: '00:00'
  },
  displayMinutes: {
    type: Number,
    default: 0
  },
  taskName: {
    type: String,
    default: ''
  },
  isPaused: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['expand', 'pause', 'resume', 'stop'])
</script>

<template>
  <div class="timer-mini" @click="emit('expand')">
    <div class="timer-mini-dot" :class="{ paused: isPaused }"></div>
    <span class="timer-mini-time">{{ displayTime }}</span>
    <span class="timer-mini-name">{{ taskName }}</span>
    <div class="timer-mini-actions" @click.stop>
      <button
        class="mini-btn"
        @click="isPaused ? emit('resume') : emit('pause')"
      >
        {{ isPaused ? '▶️' : '⏸️' }}
      </button>
      <button class="mini-btn" @click="emit('stop')">⏹️</button>
    </div>
  </div>
</template>

<style scoped>
.timer-mini {
  position: fixed;
  bottom: calc(var(--nav-height) + var(--safe-bottom) + var(--space-md));
  left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-lg);
  background: var(--primary);
  color: white;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  max-width: calc(100vw - var(--space-xl) * 2);
  animation: slideUp 0.3s ease;
}

.timer-mini:active {
  transform: translateX(-50%) scale(0.96);
}

.timer-mini-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #55EFC4;
  animation: pulse 1.5s infinite;
  flex-shrink: 0;
}

.timer-mini-dot.paused {
  background: var(--warning);
  animation: none;
}

.timer-mini-time {
  font-size: var(--text-base);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.timer-mini-name {
  font-size: var(--text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.timer-mini-actions {
  display: flex;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.mini-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 0;
  transition: background var(--transition-fast);
}

.mini-btn:active {
  background: rgba(255, 255, 255, 0.3);
}
</style>
