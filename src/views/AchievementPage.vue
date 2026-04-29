<script setup>
import { computed, ref, inject } from 'vue'
import { useTasks } from '../composables/useTasks'
import { useStreak } from '../composables/useStreak'
import { useWeeklyHistory } from '../composables/useWeeklyHistory'

import WeeklyChart from '../components/WeeklyChart.vue'
import ShareCard from '../components/ShareCard.vue'
import AssessmentPage from './AssessmentPage.vue'
import BottomNav from '../components/BottomNav.vue'

const emit = defineEmits(['switch-page'])

const showToast = inject('showToast')

const { completedToday, completedCount } = useTasks()
const { currentStreak } = useStreak()
const { weeklyData, weekTotal, weekAverage } = useWeeklyHistory()

const showShareCard = ref(false)
const showAssessment = ref(false)

// 今日总专注时间
const totalFocusMinutes = computed(() => {
  return completedToday.value.reduce((sum, t) => {
    return sum + Math.floor((t.timerSeconds || 0) / 60)
  }, 0)
})

// 格式化完成时间
function formatTime(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

// 格式化时长
function formatDuration(seconds) {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}秒`
  return `${m}分${s}秒`
}

function onShare() {
  if (completedCount.value === 0) {
    showToast?.('今天还没有完成的任务', 'warning')
    return
  }
  showShareCard.value = true
}

function onPageSwitch(page) {
  showAssessment.value = false
  emit('switch-page', page)
}

function onAssessmentSwitch(page) {
  if (page === 'achievements') {
    showAssessment.value = false
  } else {
    showAssessment.value = false
    emit('switch-page', page)
  }
}
</script>

<template>
  <div class="achievement-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">今日成就</h1>
      <p class="page-subtitle">
        {{ new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }) }}
      </p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-icon">✅</span>
        <span class="stat-value">{{ completedCount }}</span>
        <span class="stat-label">完成任务</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">⏱️</span>
        <span class="stat-value">{{ totalFocusMinutes }}</span>
        <span class="stat-label">专注分钟</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🔥</span>
        <span class="stat-value">{{ currentStreak }}</span>
        <span class="stat-label">连续天数</span>
      </div>
    </div>

    <!-- 完成的任务时间线 -->
    <div v-if="completedToday.length > 0" class="timeline-section">
      <div class="section-header">
        <span class="section-title">完成记录</span>
      </div>
      <div class="timeline">
        <div
          v-for="task in completedToday"
          :key="task.id"
          class="timeline-item"
        >
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-row">
              <span class="timeline-time">{{ formatTime(task.completedAt) }}</span>
              <span v-if="task.timerSeconds" class="timeline-duration">
                {{ formatDuration(task.timerSeconds) }}
              </span>
            </div>
            <span class="timeline-name">{{ task.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎯</div>
      <p class="empty-text">今天还没有完成任何任务</p>
      <p class="empty-hint">去添加一个任务，开始今天的征程吧</p>
    </div>

    <!-- ADHD 自测入口 -->
    <div class="assessment-entry" @click="showAssessment = true">
      <div class="ae-left">
        <span class="ae-icon">🧠</span>
        <div class="ae-info">
          <span class="ae-title">ADHD 自测</span>
          <span class="ae-desc">专业评估量表，了解自己的状态</span>
        </div>
      </div>
      <span class="ae-arrow">→</span>
    </div>

    <!-- 本周回顾 -->
    <div class="weekly-section">
      <WeeklyChart :weekly-data="weeklyData" />
      <div class="weekly-summary">
        <span>本周共完成 <strong>{{ weekTotal }}</strong> 个任务</span>
        <span>日均 <strong>{{ weekAverage }}</strong> 个</span>
      </div>
    </div>

    <!-- 分享按钮 -->
    <button class="share-btn" @click="onShare">
      📤 分享今日成就
    </button>

    <!-- 底部导航 -->
    <BottomNav current="achievements" @switch="onPageSwitch" />

    <!-- 分享卡片 -->
    <ShareCard
      :show="showShareCard"
      :completed-count="completedCount"
      :total-minutes="totalFocusMinutes"
      :streak="currentStreak"
      @close="showShareCard = false"
    />

    <!-- ADHD 自测页面（全屏弹窗） -->
    <Transition name="fade">
      <div v-if="showAssessment" class="assessment-overlay" @click.self="showAssessment = false">
        <div class="assessment-modal">
          <AssessmentPage
            @switch-page="onAssessmentSwitch"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.achievement-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.page-header {
  padding: var(--space-md) 0;
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.page-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* 统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-lg) var(--space-sm);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
}

.stat-icon {
  font-size: 24px;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* 时间线 */
.timeline-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  border: 1px solid var(--border-light);
}

.section-header {
  margin-bottom: var(--space-md);
}

.section-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 28px;
  bottom: 0;
  width: 2px;
  background: var(--border-light);
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--success);
  flex-shrink: 0;
  margin-top: 4px;
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: 2px;
}

.timeline-time {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
}

.timeline-duration {
  font-size: var(--text-xs);
  color: var(--primary);
  background: var(--primary-bg);
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.timeline-name {
  font-size: var(--text-base);
  color: var(--text-primary);
  word-break: break-word;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-2xl) var(--space-xl);
  text-align: center;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: var(--space-lg);
}

.empty-text {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.empty-hint {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* 本周回顾 */
.weekly-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.weekly-summary {
  display: flex;
  justify-content: space-around;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  padding: var(--space-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.weekly-summary strong {
  color: var(--primary);
}

/* 分享按钮 */
.share-btn {
  width: 100%;
  padding: var(--space-lg);
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.share-btn:active {
  transform: scale(0.97);
  opacity: 0.9;
}

/* ADHD 自测入口 */
.assessment-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.06), rgba(236, 72, 153, 0.06));
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.assessment-entry:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.ae-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.ae-icon {
  font-size: 32px;
}

.ae-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ae-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text);
}

.ae-desc {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.ae-arrow {
  font-size: var(--text-lg);
  color: var(--text-tertiary);
}

/* ADHD 自测全屏弹窗 */
.assessment-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.assessment-modal {
  width: 100%;
  max-width: 480px;
  max-height: 100vh;
  background: var(--bg-page);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
