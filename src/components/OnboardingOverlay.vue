<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['done'])

const steps = [
  { emoji: '👋', title: '你好！', desc: '欢迎使用启程' },
  { emoji: '🧠', title: '脑暴输入', desc: '把脑海中的想法全部倒出来，自动拆分为任务' },
  { emoji: '⏱️', title: '专注计时', desc: '为每个任务计时，记录你的专注时间' },
  { emoji: '🔥', title: '连续打卡', desc: '每天完成任务，积累连续天数' },
  { emoji: '🎉', title: '开始吧！', desc: '今天就是最好的开始' }
]

const currentStep = ref(0)
const isLast = computed(() => currentStep.value === steps.length - 1)

import { ref, computed } from 'vue'

function next() {
  if (isLast.value) {
    emit('done')
  } else {
    currentStep.value++
  }
}

function skip() {
  emit('done')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="onboarding-overlay">
        <div class="onboarding-content">
          <div class="onboarding-emoji">{{ steps[currentStep].emoji }}</div>
          <h2 class="onboarding-title">{{ steps[currentStep].title }}</h2>
          <p class="onboarding-desc">{{ steps[currentStep].desc }}</p>

          <!-- 步骤指示器 -->
          <div class="onboarding-dots">
            <span
              v-for="(_, i) in steps"
              :key="i"
              class="dot"
              :class="{ active: i === currentStep }"
            ></span>
          </div>

          <div class="onboarding-actions">
            <button class="btn-skip" @click="skip">跳过</button>
            <button class="btn-next" @click="next">
              {{ isLast ? '开始使用' : '下一步' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.onboarding-overlay {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: linear-gradient(135deg, #6C5CE7 0%, #A29BFE 50%, #74B9FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.onboarding-content {
  text-align: center;
  color: white;
  max-width: 320px;
  width: 100%;
  animation: scaleIn 0.3s ease;
}

.onboarding-emoji {
  font-size: 80px;
  margin-bottom: var(--space-xl);
  line-height: 1;
}

.onboarding-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin-bottom: var(--space-md);
}

.onboarding-desc {
  font-size: var(--text-lg);
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: var(--space-2xl);
}

.onboarding-dots {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-2xl);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all var(--transition-fast);
}

.dot.active {
  background: white;
  width: 24px;
  border-radius: var(--radius-full);
}

.onboarding-actions {
  display: flex;
  gap: var(--space-lg);
  justify-content: center;
}

.btn-skip {
  padding: var(--space-md) var(--space-xl);
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-md);
  color: white;
  font-size: var(--text-base);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.btn-skip:active {
  background: rgba(255, 255, 255, 0.1);
}

.btn-next {
  padding: var(--space-md) var(--space-2xl);
  background: white;
  border: none;
  border-radius: var(--radius-md);
  color: #6C5CE7;
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.btn-next:active {
  transform: scale(0.96);
}
</style>
