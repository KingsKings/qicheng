<script setup>
import { computed, ref, watch, inject } from 'vue'
import { useTasks } from '../composables/useTasks'
import { useTimer } from '../composables/useTimer'
import { useStreak } from '../composables/useStreak'
import { useSettings } from '../composables/useSettings'
import { useWeeklyHistory } from '../composables/useWeeklyHistory'
import { getDailyQuote } from '../data/mockData'

import BrainDump from '../components/BrainDump.vue'
import ProgressRing from '../components/ProgressRing.vue'
import StreakBadge from '../components/StreakBadge.vue'
import TaskList from '../components/TaskList.vue'
import TimerMini from '../components/TimerMini.vue'
import TimerModal from '../components/TimerModal.vue'
import PendingDrawer from '../components/PendingDrawer.vue'
import BottomNav from '../components/BottomNav.vue'
import CelebrationOverlay from '../components/CelebrationOverlay.vue'
import DecomposeDrawer from '../components/DecomposeDrawer.vue'

const emit = defineEmits(['switch-page'])

// Toast
const showToast = inject('showToast')

// Composables
const {
  tasks, brainDumpText, activeTasks, completedTasks, pendingTasks,
  totalCount, completedCount, pendingCount, progress, allCompleted,
  addTask, addFromBrainDump, toggleTask, markPending,
  restoreFromPending, deleteTask, updateTaskTimer
} = useTasks()

const {
  isRunning, isPaused, isMinimized, currentTaskId,
  displayTime, displayMinutes, remainingSeconds, originalSeconds,
  start, pause, resume, stop, minimize, restore, setDuration
} = useTimer()

const { currentStreak, bestStreak, recordToday } = useStreak()
const { voiceBroadcast } = useSettings()
const { weeklyData } = useWeeklyHistory()

// 总秒数（用于 TimerModal 圆形进度）
const totalSeconds = computed(() => originalSeconds.value)

// 状态
const showPendingDrawer = ref(false)
const showCelebration = ref(false)
const celebrationTriggered = ref(false)
const celebrationLevel = ref('small')
const celebrationTitle = ref('')
const celebrationMessage = ref('')
const showDecomposeDrawer = ref(false)
const decomposeTaskName = ref('')

// 每日名言（从 mockData 获取）
const dailyQuote = getDailyQuote()

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 当前计时任务名
const currentTaskName = computed(() => {
  if (!currentTaskId.value) return ''
  const task = tasks.value.find(t => t.id === currentTaskId.value)
  return task ? task.name : ''
})

// 快速添加模板（带默认时长）
const quickTemplates = [
  { label: '喝水', icon: '💧', name: '喝水', duration: 1 },
  { label: '休息 5 分钟', icon: '☕', name: '休息 5 分钟', duration: 5 },
  { label: '深呼吸', icon: '🌬️', name: '深呼吸', duration: 2 },
  { label: '散步', icon: '🚶', name: '散步', duration: 10 },
  { label: '读一页书', icon: '📖', name: '读一页书', duration: 5 },
  { label: '整理桌面', icon: '🧹', name: '整理桌面', duration: 10 }
]

// 连击里程碑消息
function getStreakMessage(n) {
  if (n === 3) return '连击 3！状态很棒'
  if (n === 5) return '连击 5！越来越顺了'
  if (n === 10) return '连击 10！你今天太厉害了'
  return ''
}

// 监听全部完成
watch(allCompleted, (val) => {
  if (val && !celebrationTriggered.value && totalCount.value > 0) {
    celebrationTriggered.value = true
    celebrationLevel.value = 'large'
    celebrationTitle.value = '全部完成！'
    celebrationMessage.value = '今天的任务全部搞定了，你真棒！'
    showCelebration.value = true
    recordToday()
  }
})

watch(totalCount, () => {
  celebrationTriggered.value = false
})

// ===== 事件处理 =====

function onBrainDumpSubmit() {
  const count = addFromBrainDump()
  if (count) {
    showToast?.(`已添加 ${count} 个任务到稍后做`, 'success')
  }
}

function onTaskToggle(taskId) {
  toggleTask(taskId)
  const task = tasks.value.find(t => t.id === taskId)
  if (task?.completed) {
    recordToday()

    // 触发小型庆祝
    celebrationLevel.value = 'small'
    celebrationTitle.value = '任务完成！'
    celebrationMessage.value = `"${task.name}" 做完了，继续加油！`
    showCelebration.value = true

    // 检查连击里程碑
    const newStreak = currentStreak.value
    if (newStreak === 3 || newStreak === 5 || newStreak === 10) {
      setTimeout(() => {
        celebrationLevel.value = 'medium'
        celebrationTitle.value = getStreakMessage(newStreak)
        celebrationMessage.value = ''
        showCelebration.value = true
      }, 1500)
    }

    // 语音播报
    if (voiceBroadcast.value) {
      speak('完成！')
    }
  }
}

function onTaskDelete(taskId) {
  deleteTask(taskId)
}

function onTaskPending(taskId) {
  markPending(taskId)
  showToast?.('已移到稍后做', 'info')
}

function onTaskDecompose(taskId) {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    decomposeTaskName.value = task.name
    showDecomposeDrawer.value = true
  }
}

function onDecomposeAddTask(stepName) {
  // 子任务默认 5 分钟时长
  addTask(stepName, 5)
  showToast?.(`已添加: ${stepName}`, 'success')
}

function onStartTimer(taskId) {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return
  // 传入完整任务对象，让 timer 获取 duration
  start(task)
}

function onTimerStop() {
  const result = stop()
  if (result.taskId && result.seconds > 0) {
    updateTaskTimer(result.taskId, result.seconds)
    const task = tasks.value.find(t => t.id === result.taskId)
    if (task && !task.completed) {
      toggleTask(result.taskId)
      recordToday()

      // 计时完成也触发小型庆祝
      celebrationLevel.value = 'small'
      celebrationTitle.value = '任务完成！'
      celebrationMessage.value = `"${task.name}" 做完了，继续加油！`
      showCelebration.value = true
    }
    const mins = Math.floor(result.seconds / 60)
    const secs = result.seconds % 60
    showToast?.(
      `专注 ${mins > 0 ? mins + '分' : ''}${secs}秒，任务已完成！`,
      'success'
    )
  }
}

// 关闭计时器（中断，不标记完成）
function onTimerClose() {
  const result = stop()
  if (result.taskId) {
    const task = tasks.value.find(t => t.id === result.taskId)
    if (task) {
      // 保存剩余时间到任务，不标记完成
      task.remainingSeconds = remainingSeconds.value || task.duration * 60
      task.status = 'idle'
    }
    showToast?.('计时器已关闭，任务仍在列表中', 'info')
  }
}

function onTimerMinimize() {
  minimize()
}

function onTimerExpand() {
  restore()
}

function onPendingRestore(taskId) {
  restoreFromPending(taskId)
  showToast?.('任务已恢复', 'success')
}

function onPendingDelete(taskId) {
  deleteTask(taskId)
}

function onPendingSetDuration({ taskId, duration }) {
  // 在待办池中找到任务并设置时长
  const task = pendingTasks.value.find(t => t.id === taskId)
  if (task) {
    task.duration = duration
    task.remainingSeconds = duration * 60
  }
}

function onQuickAdd(template) {
  // 快速添加：创建带时长的任务并直接开始计时
  const task = addTask(template.name, template.duration)
  showToast?.(`已添加: ${template.label}`, 'success')
  // 直接开始计时
  start(task)
}

function onCelebrationDone() {
  showCelebration.value = false
}

function onPageSwitch(page) {
  emit('switch-page', page)
}

// 语音播报
function speak(text) {
  if (!('speechSynthesis' in window)) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = 1.1
  window.speechSynthesis.speak(utterance)
}
</script>

<template>
  <div class="task-page">
    <!-- 顶部栏 -->
    <div class="top-bar">
      <div class="top-bar-row">
        <div class="greeting-section">
          <h1 class="greeting">{{ greeting }}</h1>
          <p class="daily-quote">{{ dailyQuote }}</p>
        </div>
        <StreakBadge :streak="currentStreak" :best="bestStreak" />
      </div>
    </div>

    <!-- 脑暴输入 -->
    <BrainDump
      v-model="brainDumpText"
      @submit="onBrainDumpSubmit"
    />

    <!-- 进度环 -->
    <div v-if="totalCount > 0" class="progress-section">
      <ProgressRing :progress="progress" :size="72" :stroke-width="5" />
      <div class="progress-info">
        <span class="progress-text">
          已完成 {{ completedCount }}/{{ totalCount }}
        </span>
        <span v-if="pendingCount > 0" class="progress-pending">
          {{ pendingCount }} 个稍后做
        </span>
      </div>
    </div>

    <!-- 任务列表 -->
    <TaskList
      :tasks="tasks"
      :current-timer-task-id="currentTaskId"
      @toggle="onTaskToggle"
      @delete="onTaskDelete"
      @pending="onTaskPending"
      @start-timer="onStartTimer"
      @decompose="onTaskDecompose"
    />

    <!-- 快速添加 -->
    <div class="quick-add">
      <div class="quick-add-title">快速添加</div>
      <div class="quick-add-buttons">
        <button
          v-for="tpl in quickTemplates"
          :key="tpl.label"
          class="quick-add-btn"
          @click="onQuickAdd(tpl)"
        >
          <span class="quick-add-icon">{{ tpl.icon }}</span>
          <span class="quick-add-label">{{ tpl.label }}</span>
        </button>
      </div>
    </div>

    <!-- 稍后做按钮 -->
    <div v-if="pendingCount > 0" class="pending-trigger">
      <button class="pending-btn" @click="showPendingDrawer = true">
        <span>⏳ 稍后做</span>
        <span class="badge badge-danger">{{ pendingCount }}</span>
      </button>
    </div>

    <!-- 底部导航 -->
    <BottomNav current="tasks" @switch="onPageSwitch" />

    <!-- TimerMini: 计时器暂停/最小化时显示 -->
    <TimerMini
      v-if="isRunning && isMinimized"
      :display-time="displayTime"
      :display-minutes="displayMinutes"
      :task-name="currentTaskName"
      :is-paused="isPaused"
      @expand="onTimerExpand"
      @pause="pause"
      @resume="resume"
      @stop="onTimerStop"
    />

    <!-- TimerModal: 计时器激活时显示 -->
    <TimerModal
      v-if="isRunning && !isMinimized"
      :display-time="displayTime"
      :display-minutes="displayMinutes"
      :task-name="currentTaskName"
      :is-paused="isPaused"
      :total-seconds="originalSeconds"
      :remaining-seconds="remainingSeconds"
      @close="onTimerClose"
      @pause="pause"
      @resume="resume"
      @stop="onTimerStop"
      @minimize="onTimerMinimize"
    />

    <!-- PendingDrawer -->
    <PendingDrawer
      :show="showPendingDrawer"
      :tasks="pendingTasks"
      @close="showPendingDrawer = false"
      @restore="onPendingRestore"
      @delete="onPendingDelete"
      @set-duration="onPendingSetDuration"
    />

    <!-- 庆祝 -->
    <CelebrationOverlay
      :show="showCelebration"
      :level="celebrationLevel"
      :title="celebrationTitle"
      :message="celebrationMessage"
      @done="onCelebrationDone"
    />

    <!-- 拆解弹窗 -->
    <DecomposeDrawer
      :show="showDecomposeDrawer"
      :task-name="decomposeTaskName"
      @close="showDecomposeDrawer = false"
      @add-task="onDecomposeAddTask"
    />
  </div>
</template>

<style scoped>
.task-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* 顶部栏 */
.top-bar {
  padding: var(--space-md) 0;
}

.top-bar-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.greeting-section {
  flex: 1;
}

.greeting {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.daily-quote {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-style: italic;
}

/* 进度区域 */
.progress-section {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.progress-text {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

.progress-pending {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* 快速添加 */
.quick-add {
  padding: var(--space-md) 0;
}

.quick-add-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}

.quick-add-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.quick-add-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.quick-add-btn:active {
  transform: scale(0.95);
  background: var(--primary-bg);
  border-color: var(--primary);
  color: var(--primary);
}

.quick-add-icon {
  font-size: 14px;
  line-height: 1;
}

.quick-add-label {
  line-height: 1;
}

/* 稍后做触发按钮 */
.pending-trigger {
  padding: var(--space-sm) 0;
}

.pending-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.pending-btn:active {
  transform: scale(0.96);
}
</style>
