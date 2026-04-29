<template>
  <div class="celebration" :class="`celebration--${level}`">
    <!-- small: 屏幕闪烁 -->
    <Transition name="celebration__flash">
      <div v-if="showFlash" class="celebration__flash"></div>
    </Transition>

    <!-- medium: 屏幕边缘发光 -->
    <div v-if="level === 'medium' || level === 'large'" class="celebration__edge-glow"></div>

    <!-- large: 特殊消息 -->
    <Transition name="celebration__message">
      <div v-if="level === 'large' && showMessage" class="celebration__message">
        <span class="celebration__message-text">{{ specialMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps({
  level: {
    type: String,
    default: 'small',
    validator: (v) => ['small', 'medium', 'large'].includes(v),
  },
})

const showFlash = ref(false)
const showMessage = ref(false)

const specialMessage = '太棒了！你完成了所有任务！'

onMounted(() => {
  triggerCelebration()
})

function triggerCelebration() {
  switch (props.level) {
    case 'small':
      triggerSmall()
      break
    case 'medium':
      triggerMedium()
      break
    case 'large':
      triggerLarge()
      break
  }
}

function triggerSmall() {
  // 简短的彩纸爆发
  showFlash.value = true
  setTimeout(() => { showFlash.value = false }, 400)

  confetti({
    particleCount: 60,
    spread: 55,
    origin: { y: 0.7 },
    colors: ['#aa3bff', '#c084fc', '#a78bfa'],
  })
}

function triggerMedium() {
  // 更大的彩纸 + 边缘发光
  showFlash.value = true
  setTimeout(() => { showFlash.value = false }, 500)

  const duration = 1500
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#aa3bff', '#c084fc', '#22c55e'],
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#aa3bff', '#c084fc', '#22c55e'],
    })
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

function triggerLarge() {
  // 全屏庆祝
  showFlash.value = true
  setTimeout(() => { showFlash.value = false }, 600)

  showMessage.value = true
  setTimeout(() => { showMessage.value = false }, 3000)

  // 多波次彩纸
  const fire = (origin, angle) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin,
      angle,
      colors: ['#aa3bff', '#c084fc', '#22c55e', '#fbbf24', '#f472b6'],
    })
  }

  fire({ x: 0.3, y: 0.6 }, 60)
  setTimeout(() => fire({ x: 0.7, y: 0.6 }, 120), 300)
  setTimeout(() => fire({ x: 0.5, y: 0.5 }, 90), 600)
}
</script>

<style scoped>
.celebration {
  position: fixed;
  inset: 0;
  z-index: 3000;
  pointer-events: none;
}

.celebration__flash {
  position: absolute;
  inset: 0;
  background: rgba(170, 59, 255, 0.08);
  animation: flash 0.4s ease-out;
}

@keyframes flash {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

.celebration__edge-glow {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 60px rgba(170, 59, 255, 0.3);
  animation: edge-glow 1.5s ease-out forwards;
}

@keyframes edge-glow {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

.celebration__message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3001;
}

.celebration__message-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-h, #08060d);
  background: var(--bg, #fff);
  padding: 16px 32px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

/* 过渡 */
.celebration__flash-enter-active {
  transition: opacity 0.2s ease;
}

.celebration__flash-leave-active {
  transition: opacity 0.4s ease;
}

.celebration__flash-enter-from,
.celebration__flash-leave-to {
  opacity: 0;
}

.celebration__message-enter-active {
  transition: all 0.4s ease;
}

.celebration__message-leave-active {
  transition: all 0.3s ease;
}

.celebration__message-enter-from {
  opacity: 0;
  transform: translate(-50%, -40%);
}

.celebration__message-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}
</style>
