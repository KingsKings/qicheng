<script setup>
import { computed } from 'vue'

const props = defineProps({
  streak: {
    type: Number,
    default: 0
  },
  best: {
    type: Number,
    default: 0
  }
})

const level = computed(() => {
  if (props.streak >= 30) return { text: '传奇', emoji: '🔥', color: '#E17055' }
  if (props.streak >= 14) return { text: '大师', emoji: '⭐', color: '#FDCB6E' }
  if (props.streak >= 7) return { text: '达人', emoji: '🌟', color: '#6C5CE7' }
  if (props.streak >= 3) return { text: '新手', emoji: '🔥', color: '#00B894' }
  return { text: '开始', emoji: '💤', color: '#B2BEC3' }
})

// 当 streak >= 3 时显示 "🔥 N" 格式
const showFireFormat = computed(() => props.streak >= 3)
</script>

<template>
  <div class="streak-badge" :style="{ '--badge-color': level.color }">
    <template v-if="showFireFormat">
      <span class="streak-fire">🔥 {{ streak }}</span>
    </template>
    <template v-else>
      <span class="streak-emoji">{{ level.emoji }}</span>
      <div class="streak-info">
        <span class="streak-count">{{ streak }}</span>
        <span class="streak-label">天连续</span>
      </div>
    </template>
    <span v-if="streak > 0" class="streak-level" :style="{ color: level.color }">{{ level.text }}</span>
  </div>
</template>

<style scoped>
.streak-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  background: var(--primary-bg);
  border-radius: var(--radius-full);
  border: 1px solid var(--primary-border);
  flex-shrink: 0;
}

.streak-emoji {
  font-size: 18px;
  line-height: 1;
}

.streak-fire {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.streak-info {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.streak-count {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.streak-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.streak-level {
  font-size: var(--text-xs);
  font-weight: 600;
}
</style>
