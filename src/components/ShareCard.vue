<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  completedCount: {
    type: Number,
    default: 0
  },
  totalMinutes: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  date: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const displayDate = computed(() => {
  if (props.date) return props.date
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

const motivationalText = computed(() => {
  if (props.completedCount >= 10) return '效率爆表！你是今天的王者！'
  if (props.completedCount >= 5) return '太棒了！今天收获满满！'
  if (props.completedCount >= 3) return '不错的开始，继续保持！'
  return '每一步都算数，加油！'
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="share-overlay" @click.self="emit('close')">
        <div class="share-card">
          <div class="share-card-header">
            <span class="share-emoji">🎉</span>
            <h3 class="share-title">今日成就</h3>
            <p class="share-date">{{ displayDate }}</p>
          </div>

          <div class="share-stats">
            <div class="stat-item">
              <span class="stat-value">{{ completedCount }}</span>
              <span class="stat-label">完成任务</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ totalMinutes }}</span>
              <span class="stat-label">专注分钟</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ streak }}</span>
              <span class="stat-label">连续天数</span>
            </div>
          </div>

          <p class="share-motivation">{{ motivationalText }}</p>

          <div class="share-footer">
            <span class="share-brand">启程 · ADHD 每日规划</span>
          </div>

          <button class="share-close-btn" @click="emit('close')">关闭</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.share-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.share-card {
  background: linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  color: white;
  width: 100%;
  max-width: 340px;
  text-align: center;
  animation: scaleIn 0.3s ease;
  position: relative;
}

.share-card-header {
  margin-bottom: var(--space-xl);
}

.share-emoji {
  font-size: 48px;
  display: block;
  margin-bottom: var(--space-md);
}

.share-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-xs);
}

.share-date {
  font-size: var(--text-sm);
  opacity: 0.8;
}

.share-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
  padding: var(--space-lg) 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
}

.stat-label {
  font-size: var(--text-xs);
  opacity: 0.8;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
}

.share-motivation {
  font-size: var(--text-base);
  font-weight: 500;
  margin-bottom: var(--space-xl);
  opacity: 0.9;
}

.share-footer {
  padding-top: var(--space-lg);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: var(--space-lg);
}

.share-brand {
  font-size: var(--text-xs);
  opacity: 0.7;
  letter-spacing: 2px;
}

.share-close-btn {
  width: 100%;
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition-fast);
}

.share-close-btn:active {
  background: rgba(255, 255, 255, 0.3);
}
</style>
