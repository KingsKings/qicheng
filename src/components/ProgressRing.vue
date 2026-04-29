<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 80
  },
  strokeWidth: {
    type: Number,
    default: 6
  },
  showText: {
    type: Boolean,
    default: true
  }
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => {
  const progress = Math.min(100, Math.max(0, props.progress))
  return circumference.value - (progress / 100) * circumference.value
})

const color = computed(() => {
  if (props.progress >= 100) return 'var(--success)'
  if (props.progress >= 50) return 'var(--primary)'
  return 'var(--warning)'
})
</script>

<template>
  <div class="progress-ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      class="progress-ring-svg"
    >
      <!-- 背景圆环 -->
      <circle
        class="progress-ring-bg"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke-width="strokeWidth"
      />
      <!-- 进度圆环 -->
      <circle
        class="progress-ring-bar"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke-width="strokeWidth"
        :stroke="color"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        stroke-linecap="round"
      />
    </svg>
    <div v-if="showText" class="progress-ring-text">
      <span class="progress-ring-value" :style="{ color }">{{ progress }}</span>
      <span class="progress-ring-unit">%</span>
    </div>
  </div>
</template>

<style scoped>
.progress-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.progress-ring-svg {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  stroke: var(--border-light);
}

.progress-ring-bar {
  transition: stroke-dashoffset 0.6s ease, stroke 0.3s ease;
}

.progress-ring-text {
  position: absolute;
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.progress-ring-value {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.progress-ring-unit {
  font-size: 11px;
  color: var(--text-hint);
  margin-left: 1px;
}
</style>
