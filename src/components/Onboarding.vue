<template>
  <Teleport to="body">
    <Transition name="onboarding">
      <div v-if="visible && !dismissed" class="onboarding">
        <div class="onboarding__overlay" @click.self="complete"></div>
        <div class="onboarding__card">
          <!-- 步骤 1 -->
          <div v-if="step === 1" class="onboarding__step">
            <div class="onboarding__icon">&#127881;</div>
            <h2 class="onboarding__title">欢迎来到启程</h2>
            <p class="onboarding__desc">
              一个极简的专注计时工具。<br />
              只需两步：选择任务，开始专注。<br />
              让我们一起养成好习惯吧！
            </p>
            <button class="onboarding__btn" @click="step = 2">
              开始体验
            </button>
          </div>

          <!-- 步骤 2 -->
          <div v-if="step === 2" class="onboarding__step">
            <div class="onboarding__icon">&#9201;</div>
            <h2 class="onboarding__title">试试完成你的第一个任务</h2>
            <p class="onboarding__desc">
              点击下方的快速按钮，<br />
              挑选一个时长开始你的第一次专注。<br />
              每一次完成都是进步！
            </p>
            <div class="onboarding__hint-arrow">&#8595;</div>
            <button class="onboarding__btn onboarding__btn--ghost" @click="complete">
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['complete'])

const step = ref(1)
const dismissed = ref(false)

onMounted(() => {
  const seen = localStorage.getItem('qicheng_onboarding_seen')
  if (seen) {
    dismissed.value = true
  }
})

function complete() {
  localStorage.setItem('qicheng_onboarding_seen', 'true')
  dismissed.value = true
  emit('complete')
}
</script>

<style scoped>
.onboarding {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.onboarding__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.onboarding__card {
  position: relative;
  z-index: 1;
  background: var(--bg, #fff);
  border-radius: 20px;
  padding: 40px 32px 32px;
  width: 340px;
  max-width: 90vw;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.onboarding__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.onboarding__icon {
  font-size: 48px;
  margin-bottom: 4px;
}

.onboarding__title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-h, #08060d);
  margin: 0;
}

.onboarding__desc {
  font-size: 14px;
  color: var(--text, #6b6375);
  line-height: 1.7;
  margin: 0;
}

.onboarding__hint-arrow {
  font-size: 28px;
  color: var(--accent, #aa3bff);
  animation: bounce-arrow 1.5s ease-in-out infinite;
  margin: 8px 0;
}

@keyframes bounce-arrow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

.onboarding__btn {
  margin-top: 12px;
  padding: 12px 32px;
  border: none;
  border-radius: 12px;
  background: var(--accent, #aa3bff);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}

.onboarding__btn:hover {
  opacity: 0.85;
}

.onboarding__btn:active {
  transform: scale(0.96);
}

.onboarding__btn--ghost {
  background: transparent;
  color: var(--text, #6b6375);
  border: 1px solid var(--border, #e5e4e7);
}

.onboarding__btn--ghost:hover {
  background: var(--code-bg, #f4f3ec);
  opacity: 1;
}

/* 过渡 */
.onboarding-enter-active {
  transition: opacity 0.3s ease;
}

.onboarding-enter-active .onboarding__card {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.onboarding-leave-active {
  transition: opacity 0.25s ease;
}

.onboarding-leave-active .onboarding__card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.onboarding-enter-from {
  opacity: 0;
}

.onboarding-enter-from .onboarding__card {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

.onboarding-leave-to {
  opacity: 0;
}

.onboarding-leave-to .onboarding__card {
  transform: scale(0.95);
  opacity: 0;
}
</style>
