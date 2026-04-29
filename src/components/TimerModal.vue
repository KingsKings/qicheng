<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { microTaskSuggestions } from '../data/mockData.js'

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
  },
  totalSeconds: {
    type: Number,
    default: 0
  },
  remainingSeconds: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'pause', 'resume', 'stop', 'minimize'])

// 微任务建议弹窗
const showMicroTask = ref(false)
const currentMicroTask = ref('')

function getRandomMicroTask() {
  const index = Math.floor(Math.random() * microTaskSuggestions.length)
  return microTaskSuggestions[index]
}

function onShowMicroTask() {
  currentMicroTask.value = getRandomMicroTask()
  showMicroTask.value = true
  setTimeout(() => {
    showMicroTask.value = false
  }, 3000)
}

// 进度计算
const progressPercent = computed(() => {
  if (props.totalSeconds <= 0) return 0
  return ((props.totalSeconds - props.remainingSeconds) / props.totalSeconds) * 100
})

// 剩余百分比（用于颜色变化）
const remainingPercent = computed(() => {
  if (props.totalSeconds <= 0) return 100
  return (props.remainingSeconds / props.totalSeconds) * 100
})

// 颜色阶段
const colorPhase = computed(() => {
  if (remainingPercent.value > 50) return 'primary'
  if (remainingPercent.value > 25) return 'warning'
  return 'accent'
})

// SVG 圆环参数
const RADIUS = 100
const STROKE_WIDTH = 8
const DIAMETER = (RADIUS + STROKE_WIDTH) * 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const dashOffset = computed(() => {
  const offset = CIRCUMFERENCE - (progressPercent.value / 100) * CIRCUMFERENCE
  return offset
})

// 进度颜色（渐变基于阶段）
const progressColor = computed(() => {
  switch (colorPhase.value) {
    case 'warning': return 'var(--warning)'
    case 'accent': return 'var(--accent)'
    default: return 'var(--primary)'
  }
})

const glowColor = computed(() => {
  switch (colorPhase.value) {
    case 'warning': return 'rgba(255, 152, 0, 0.35)'
    case 'accent': return 'rgba(255, 107, 107, 0.35)'
    default: return 'rgba(74, 144, 217, 0.35)'
  }
})

const glowColorStrong = computed(() => {
  switch (colorPhase.value) {
    case 'warning': return 'rgba(255, 152, 0, 0.55)'
    case 'accent': return 'rgba(255, 107, 107, 0.55)'
    default: return 'rgba(74, 144, 217, 0.55)'
  }
})

function onKeydown(e) {
  if (e.key === 'Escape') {
    emit('minimize')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="timer-overlay" @click.self="emit('minimize')">
        <div class="timer-modal">
          <!-- 顶部操作栏 -->
          <div class="timer-header">
            <button class="header-btn" @click="emit('minimize')">⬇ 缩小</button>
            <button class="header-btn" @click="emit('close')">✕ 关闭</button>
          </div>

          <!-- 圆环进度 + 时间显示 -->
          <div class="timer-ring-container" :class="{ 'is-running': !isPaused, [`phase-${colorPhase}`]: true }">
            <svg
              class="timer-ring-svg"
              :width="DIAMETER"
              :height="DIAMETER"
              :viewBox="`0 0 ${DIAMETER} ${DIAMETER}`"
            >
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="var(--primary)" />
                  <stop offset="100%" stop-color="var(--success)" />
                </linearGradient>
              </defs>
              <!-- 背景轨道 -->
              <circle
                class="ring-track"
                :cx="DIAMETER / 2"
                :cy="DIAMETER / 2"
                :r="RADIUS"
                fill="none"
                :stroke-width="STROKE_WIDTH"
              />
              <!-- 进度弧 -->
              <circle
                class="ring-progress"
                :cx="DIAMETER / 2"
                :cy="DIAMETER / 2"
                :r="RADIUS"
                fill="none"
                :stroke-width="STROKE_WIDTH"
                stroke-linecap="round"
                :stroke="progressColor"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="dashOffset"
              />
            </svg>

            <!-- 圆环内部内容 -->
            <div class="timer-ring-content">
              <div class="timer-display">{{ displayTime }}</div>
              <div class="timer-task-name">{{ taskName || '专注中...' }}</div>
            </div>
          </div>

          <!-- 控制按钮 -->
          <div class="timer-controls">
            <button class="control-btn ghost" @click="emit('stop')">
              <span class="btn-icon">⏹</span>
              <span>结束</span>
            </button>
            <button
              class="control-btn filled"
              :class="{ 'phase-warning': colorPhase === 'warning', 'phase-accent': colorPhase === 'accent' }"
              @click="isPaused ? emit('resume') : emit('pause')"
            >
              <span class="btn-icon">{{ isPaused ? '▶' : '⏸' }}</span>
              <span>{{ isPaused ? '继续' : '暂停' }}</span>
            </button>
          </div>

          <!-- 不知道做什么 -->
          <button class="micro-task-btn" @click="onShowMicroTask">
            💡 不知道做什么？点我
          </button>

          <!-- 微任务建议弹窗 -->
          <Transition name="toast">
            <div v-if="showMicroTask" class="micro-task-toast">
              <div class="toast-content">
                <span class="toast-icon">💡</span>
                <span>{{ currentMicroTask }}</span>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ========== 遮罩层 ========== */
.timer-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* ========== 模态框主体 ========== */
.timer-modal {
  position: relative;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 380px;
  padding: 20px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18), 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* ========== 顶部栏 ========== */
.timer-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.header-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  transition: background 0.2s ease, color 0.2s ease;
  user-select: none;
}

.header-btn:hover {
  background: var(--bg-hover, rgba(0, 0, 0, 0.04));
  color: var(--text-primary);
}

.header-btn:active {
  transform: scale(0.95);
}

/* ========== 圆环容器 ========== */
.timer-ring-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.6s ease;
}

/* 呼吸动画 - 仅运行中 */
.timer-ring-container.is-running {
  animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px v-bind(glowColor));
  }
  50% {
    transform: scale(1.02);
    filter: drop-shadow(0 0 20px v-bind(glowColorStrong));
  }
}

/* 不同阶段的发光 */
.timer-ring-container.phase-warning.is-running {
  animation: breathe-warning 3s ease-in-out infinite;
}

@keyframes breathe-warning {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(255, 152, 0, 0.35));
  }
  50% {
    transform: scale(1.02);
    filter: drop-shadow(0 0 20px rgba(255, 152, 0, 0.55));
  }
}

.timer-ring-container.phase-accent.is-running {
  animation: breathe-accent 3s ease-in-out infinite;
}

@keyframes breathe-accent {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(255, 107, 107, 0.3));
  }
  50% {
    transform: scale(1.02);
    filter: drop-shadow(0 0 18px rgba(255, 107, 107, 0.45));
  }
}

/* ========== SVG 圆环 ========== */
.timer-ring-svg {
  display: block;
  transform: rotate(-90deg);
}

.ring-track {
  stroke: var(--border-light);
  opacity: 0.6;
}

.ring-progress {
  transition: stroke-dashoffset 1s linear, stroke 0.8s ease;
}

/* ========== 圆环内部内容 ========== */
.timer-ring-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.timer-display {
  font-size: 48px;
  font-weight: 700;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: -1px;
  line-height: 1;
  transition: color 0.8s ease;
}

.phase-warning .timer-display {
  color: var(--warning);
}

.phase-accent .timer-display {
  color: var(--accent);
}

.timer-task-name {
  margin-top: 8px;
  font-size: 16px;
  color: var(--text-secondary);
  text-align: center;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

/* ========== 控制按钮 ========== */
.timer-controls {
  display: flex;
  gap: 16px;
  width: 100%;
}

.control-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 52px;
  padding: 12px 20px;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  user-select: none;
}

.control-btn:active {
  transform: scale(0.95);
}

.btn-icon {
  font-size: 18px;
  line-height: 1;
}

/* 幽灵按钮（结束） */
.control-btn.ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1.5px solid var(--border-light);
}

.control-btn.ghost:hover {
  background: var(--bg-hover, rgba(0, 0, 0, 0.04));
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

/* 填充按钮（暂停/继续） */
.control-btn.filled {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 4px 14px rgba(74, 144, 217, 0.3);
}

.control-btn.filled:hover {
  background: var(--primary-dark);
  box-shadow: 0 6px 20px rgba(74, 144, 217, 0.4);
}

.control-btn.filled.phase-warning {
  background: var(--warning);
  box-shadow: 0 4px 14px rgba(255, 152, 0, 0.3);
}

.control-btn.filled.phase-warning:hover {
  background: var(--warning-light, #FFB74D);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.control-btn.filled.phase-accent {
  background: var(--accent);
  box-shadow: 0 4px 14px rgba(255, 107, 107, 0.3);
}

.control-btn.filled.phase-accent:hover {
  background: var(--accent-dark);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

/* ========== 不知道做什么按钮 ========== */
.micro-task-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-family: inherit;
  transition: all 0.2s ease;
  user-select: none;
  opacity: 0.7;
}

.micro-task-btn:hover {
  opacity: 1;
  background: var(--bg-hover, rgba(0, 0, 0, 0.04));
  color: var(--primary);
}

.micro-task-btn:active {
  transform: scale(0.95);
}

/* ========== 微任务 Toast ========== */
.micro-task-toast {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 12px 20px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-light);
  white-space: nowrap;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
}

/* ========== 过渡动画 ========== */
.modal-enter-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .timer-modal {
  transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-leave-active .timer-modal {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-enter-from .timer-modal {
  opacity: 0;
  transform: scale(0.85);
}

.modal-leave-to {
  opacity: 0;
}

.modal-leave-to .timer-modal {
  opacity: 0;
  transform: scale(0.9);
}

.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(12px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px) scale(0.95);
}

/* ========== 减少动画偏好 ========== */
@media (prefers-reduced-motion: reduce) {
  .timer-ring-container.is-running,
  .timer-ring-container.phase-warning.is-running,
  .timer-ring-container.phase-accent.is-running {
    animation: none;
    filter: drop-shadow(0 0 8px v-bind(glowColor));
  }

  .ring-progress {
    transition: stroke-dashoffset 0.3s linear, stroke 0.3s ease;
  }

  .modal-enter-active .timer-modal,
  .modal-leave-active .timer-modal {
    transition-duration: 0.01s;
  }

  .toast-enter-active,
  .toast-leave-active {
    transition-duration: 0.01s;
  }
}
</style>
