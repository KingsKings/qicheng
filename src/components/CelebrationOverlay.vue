<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  level: {
    type: String,
    default: 'small',
    validator: (v) => ['small', 'medium', 'large'].includes(v)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['done'])

// ===== 默认文案 =====
const defaultTitles = {
  small: '',
  medium: '',
  large: '今日清零！'
}

const defaultMessages = {
  small: '任务完成！',
  medium: '',
  large: '今天的你太棒了，好好休息吧'
}

const displayTitle = computed(() => {
  if (props.title) return props.title
  return defaultTitles[props.level] || ''
})

const displayMessage = computed(() => {
  if (props.message) return props.message
  return defaultMessages[props.level] || ''
})

// ===== 自动关闭计时器 =====
const autoDismissMs = computed(() => {
  if (props.level === 'small') return 1500
  if (props.level === 'medium') return 2500
  return 0 // large 不自动关闭
})

let dismissTimer = null

function startAutoDismiss() {
  clearAutoDismiss()
  if (autoDismissMs.value > 0) {
    dismissTimer = setTimeout(() => {
      emit('done')
    }, autoDismissMs.value)
  }
}

function clearAutoDismiss() {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}

// ===== 监听 show 变化 =====
watch(() => props.show, async (newVal) => {
  if (newVal) {
    await triggerConfetti()
    startAutoDismiss()
  } else {
    clearAutoDismiss()
  }
})

onUnmounted(() => {
  clearAutoDismiss()
})

// ===== 关闭 =====
function onClose() {
  clearAutoDismiss()
  emit('done')
}

function onBackdropClick() {
  // small 级别没有 backdrop，不会触发
  if (props.level === 'medium') {
    onClose()
  }
  // large 级别需要点击按钮关闭
}

// ===== Confetti 效果 =====
async function triggerConfetti() {
  try {
    const confetti = (await import('canvas-confetti')).default

    if (props.level === 'small') {
      // 简短的一次性彩纸爆发
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#4A90D9', '#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0'],
        ticks: 120,
        gravity: 1.2,
        scalar: 0.9
      })
    } else if (props.level === 'medium') {
      // 两波彩纸
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4A90D9', '#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0'],
        ticks: 150
      })

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4A90D9', '#FF6B6B', '#4CAF50', '#FF9800']
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4A90D9', '#FF6B6B', '#4CAF50', '#FF9800']
        })
      }, 300)
    } else if (props.level === 'large') {
      // 三波烟花式彩纸，从底部向上发射
      // 第一波：正中间向上
      confetti({
        particleCount: 100,
        spread: 80,
        startVelocity: 45,
        origin: { x: 0.5, y: 1 },
        colors: ['#FF6B6B', '#FFD700', '#FF69B4', '#FF4500', '#FF1493'],
        ticks: 200,
        gravity: 0.8
      })

      // 第二波：左侧向上
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 70,
          spread: 60,
          startVelocity: 50,
          origin: { x: 0.2, y: 1 },
          colors: ['#4A90D9', '#00CED1', '#7B68EE', '#00FA9A'],
          ticks: 200,
          gravity: 0.8
        })
      }, 400)

      // 第三波：右侧向上
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 110,
          spread: 60,
          startVelocity: 50,
          origin: { x: 0.8, y: 1 },
          colors: ['#9C27B0', '#E040FB', '#FF6B6B', '#FFD700'],
          ticks: 200,
          gravity: 0.8
        })
      }, 800)

      // 持续的小型彩纸
      setTimeout(() => {
        const duration = 2000
        const end = Date.now() + duration

        const interval = setInterval(() => {
          if (Date.now() > end) {
            clearInterval(interval)
            return
          }
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 45,
            origin: { x: 0, y: 0.8 },
            colors: ['#FFD700', '#FF6B6B', '#4A90D9'],
            ticks: 100,
            gravity: 1.5
          })
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 45,
            origin: { x: 1, y: 0.8 },
            colors: ['#FFD700', '#FF6B6B', '#4A90D9'],
            ticks: 100,
            gravity: 1.5
          })
        }, 200)
      }, 1200)
    }
  } catch (e) {
    console.warn('confetti not available:', e)
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- ===== Small: 顶部 Toast ===== -->
    <Transition name="toast-slide">
      <div
        v-if="show && level === 'small'"
        class="celebration-toast"
        @click="onClose"
      >
        <span class="celebration-toast__icon">&#10003;</span>
        <span class="celebration-toast__text">{{ displayMessage }}</span>
      </div>
    </Transition>

    <!-- ===== Medium: 半透明遮罩 + 居中弹窗 ===== -->
    <Transition name="fade">
      <div
        v-if="show && level === 'medium'"
        class="celebration-backdrop"
        @click="onBackdropClick"
      >
        <Transition name="scale">
          <div v-if="show" class="celebration-popup" @click.stop>
            <div class="celebration-popup__emoji">&#127881;</div>
            <h3 class="celebration-popup__title">{{ displayTitle }}</h3>
            <p class="celebration-popup__message">{{ displayMessage }}</p>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ===== Large: 全屏遮罩 + 庆祝内容 ===== -->
    <Transition name="fade">
      <div
        v-if="show && level === 'large'"
        class="celebration-overlay"
      >
        <div class="celebration-overlay__content" @click.stop>
          <div class="celebration-overlay__emoji">&#127882;</div>
          <h2 class="celebration-overlay__title">{{ displayTitle }}</h2>
          <p class="celebration-overlay__message">{{ displayMessage }} &#127769;</p>
          <button class="celebration-overlay__btn" @click="onClose">
            太棒了！
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ========================================
   Small - 顶部 Toast
   ======================================== */
.celebration-toast {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px 20px;
  background: var(--success);
  color: var(--text-white);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  font-family: var(--font-family);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
}

.celebration-toast__icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.celebration-toast__text {
  line-height: 1.3;
}

/* Toast 进入/离开动画 */
.toast-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-leave-active {
  transition: all 0.2s ease-in;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px) scale(0.9);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px) scale(0.95);
}

/* ========================================
   Medium - 半透明遮罩 + 弹窗
   ======================================== */
.celebration-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.celebration-popup {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl) var(--space-xl);
  text-align: center;
  max-width: 300px;
  width: 100%;
  box-shadow: var(--shadow-lg);
}

.celebration-popup__emoji {
  font-size: 48px;
  margin-bottom: var(--space-md);
  animation: bounce 0.6s ease infinite;
}

.celebration-popup__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary);
  margin-bottom: var(--space-sm);
}

.celebration-popup__message {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* ========================================
   Large - 全屏庆祝遮罩
   ======================================== */
.celebration-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.celebration-overlay__content {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-3xl) var(--space-2xl);
  text-align: center;
  max-width: 320px;
  width: 100%;
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: var(--shadow-lg);
}

.celebration-overlay__emoji {
  font-size: 64px;
  margin-bottom: var(--space-lg);
  animation: bounce 0.6s ease infinite;
}

.celebration-overlay__title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--primary);
  margin-bottom: var(--space-md);
}

.celebration-overlay__message {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
  line-height: 1.6;
}

.celebration-overlay__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md) var(--space-2xl);
  background: var(--primary);
  color: var(--text-white);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-lg);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}

.celebration-overlay__btn:hover {
  background: var(--primary-dark);
  box-shadow: var(--shadow);
}

.celebration-overlay__btn:active {
  transform: scale(0.96);
}

/* ========================================
   通用过渡动画
   ======================================== */
.fade-enter-active {
  transition: opacity 0.25s ease;
}

.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-leave-active {
  transition: all 0.2s ease-in;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* ========================================
   关键帧动画
   ======================================== */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>
