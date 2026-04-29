<script setup>
import { ref, computed, watch } from 'vue'
import { useMeditation } from '../composables/useMeditation'
import BottomNav from '../components/BottomNav.vue'

const emit = defineEmits(['switch-page'])

const {
  inhaleDuration,
  holdDuration,
  exhaleDuration,
  isRunning,
  currentPhase,
  phaseRemaining,
  breathCount,
  elapsedSeconds,
  cycleDuration,
  frequency,
  displayElapsed,
  phaseText,
  phaseProgress,
  start,
  stop,
  resetDefaults
} = useMeditation()

const currentPage = ref('meditation')

// 呼吸圆的缩放比例
const breathScale = computed(() => {
  if (!isRunning.value) return 1
  switch (currentPhase.value) {
    case 'inhale':
      // 从 0.7 放大到 1.2
      return 0.7 + (phaseProgress.value * 0.5)
    case 'hold':
      return 1.2
    case 'exhale':
      // 从 1.2 缩小到 0.7
      return 1.2 - (phaseProgress.value * 0.5)
    default:
      return 1
  }
})

// 呼吸圆的颜色
const breathColor = computed(() => {
  if (!isRunning.value) return 'var(--med-primary)'
  switch (currentPhase.value) {
    case 'inhale': return '#5BC4B5'   // 吸气 - 浅蓝绿
    case 'hold': return '#7DD3C8'     // 屏住 - 更浅
    case 'exhale': return '#3CBAA8'   // 呼气 - 深蓝绿
    default: return 'var(--med-primary)'
  }
})

// 呼吸圆的光晕透明度
const breathGlow = computed(() => {
  if (!isRunning.value) return 0.15
  switch (currentPhase.value) {
    case 'inhale': return 0.15 + (phaseProgress.value * 0.25)
    case 'hold': return 0.4
    case 'exhale': return 0.4 - (phaseProgress.value * 0.25)
    default: return 0.15
  }
})

// 科普提示
const tips = [
  { icon: '🧘', title: '减轻压力', desc: '激活副交感神经，帮助身体自然放松' },
  { icon: '🎯', title: '提升专注', desc: '调节神经系统，减少杂念干扰' },
  { icon: '🌙', title: '改善睡眠', desc: '规律呼吸有助于平静入眠' }
]

function onSwitchPage(page) {
  if (isRunning.value) {
    stop()
  }
  emit('switch-page', page)
}

function onToggleSession() {
  if (isRunning.value) {
    stop()
  } else {
    start()
  }
}
</script>

<template>
  <div class="meditation-page">
    <!-- 页面头部 -->
    <header class="med-header">
      <h1 class="med-title">🌿 呼吸练习</h1>
      <p class="med-subtitle">跟随节奏，放松身心</p>
    </header>

    <!-- 统计区域 -->
    <div class="med-stats">
      <div class="stat-item">
        <span class="stat-value">{{ breathCount }}</span>
        <span class="stat-label">呼吸次数</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ displayElapsed }}</span>
        <span class="stat-label">已练习</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ frequency }}</span>
        <span class="stat-label">次/分钟</span>
      </div>
    </div>

    <!-- 呼吸引导区域 -->
    <div class="breath-area">
      <!-- 外圈光晕 -->
      <div
        class="breath-glow"
        :style="{
          transform: `scale(${breathScale * 1.3})`,
          opacity: breathGlow
        }"
      ></div>

      <!-- 主呼吸圆 -->
      <div
        class="breath-circle"
        :class="{ breathing: isRunning }"
        :style="{
          transform: `scale(${breathScale})`,
          background: `radial-gradient(circle at 40% 35%, ${breathColor}dd, ${breathColor}88)`,
          boxShadow: `0 0 ${isRunning ? 40 : 20}px ${breathColor}44`
        }"
      >
        <!-- 内部装饰 -->
        <div class="breath-inner-ring"></div>
      </div>

      <!-- 阶段文字 -->
      <div class="phase-text" :class="{ active: isRunning }">
        {{ phaseText }}
      </div>

      <!-- 阶段倒计时（练习中显示） -->
      <div class="phase-countdown" v-if="isRunning && phaseRemaining > 0">
        {{ phaseRemaining }}s
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="med-actions">
      <button
        class="btn-start"
        :class="{ running: isRunning }"
        @click="onToggleSession"
      >
        <span class="btn-icon">{{ isRunning ? '⏹' : '▶' }}</span>
        <span class="btn-label">{{ isRunning ? '结束练习' : '开始呼吸' }}</span>
      </button>
    </div>

    <!-- 参数调节（非练习中可调） -->
    <div class="params-section" :class="{ disabled: isRunning }">
      <div class="params-header">
        <span class="params-title">自定义节奏</span>
        <button class="btn-reset" @click="resetDefaults" v-if="!isRunning">
          恢复默认
        </button>
      </div>

      <div class="slider-group">
        <div class="slider-item">
          <div class="slider-label">
            <span>吸气</span>
            <span class="slider-value">{{ inhaleDuration }}s</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            v-model.number="inhaleDuration"
            :disabled="isRunning"
            class="slider"
          />
        </div>

        <div class="slider-item">
          <div class="slider-label">
            <span>屏住</span>
            <span class="slider-value">{{ holdDuration }}s</span>
          </div>
          <input
            type="range"
            min="0"
            max="8"
            step="1"
            v-model.number="holdDuration"
            :disabled="isRunning"
            class="slider"
          />
        </div>

        <div class="slider-item">
          <div class="slider-label">
            <span>呼气</span>
            <span class="slider-value">{{ exhaleDuration }}s</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            v-model.number="exhaleDuration"
            :disabled="isRunning"
            class="slider"
          />
        </div>
      </div>
    </div>

    <!-- 科普提示 -->
    <div class="tips-section">
      <div class="tips-title">💡 呼吸的好处</div>
      <div class="tips-list">
        <div class="tip-card" v-for="tip in tips" :key="tip.title">
          <span class="tip-icon">{{ tip.icon }}</span>
          <div class="tip-content">
            <span class="tip-title">{{ tip.title }}</span>
            <span class="tip-desc">{{ tip.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <BottomNav :current="currentPage" @switch="onSwitchPage" />
  </div>
</template>

<style scoped>
.meditation-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--space-lg);
  padding-bottom: calc(var(--nav-height) + var(--space-xl) + var(--safe-bottom));
  background: linear-gradient(180deg, #F0FAF8 0%, #F5F7FA 40%);
  max-width: 480px;
  margin: 0 auto;
}

/* 头部 */
.med-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.med-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: #2A7A6E;
  margin-bottom: var(--space-xs);
}

.med-subtitle {
  font-size: var(--font-size-sm);
  color: #6BA89E;
}

/* 统计区域 */
.med-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-xl);
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: #2A7A6E;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: #8BBFB5;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: #D4EDE8;
}

/* 呼吸引导区域 */
.breath-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 260px;
  margin-bottom: var(--space-xl);
}

/* 外圈光晕 */
.breath-glow {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, #5BC4B544 0%, transparent 70%);
  transition: transform 0.3s ease, opacity 0.3s ease;
  pointer-events: none;
}

/* 主呼吸圆 */
.breath-circle {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}

.breath-circle.breathing {
  /* 练习中添加柔和脉动 */
}

.breath-inner-ring {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.breath-circle.breathing .breath-inner-ring {
  animation: innerPulse 3s ease-in-out infinite;
}

@keyframes innerPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 1; }
}

/* 阶段文字 */
.phase-text {
  margin-top: var(--space-lg);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: #8BBFB5;
  transition: color 0.3s ease;
  min-height: 28px;
}

.phase-text.active {
  color: #2A7A6E;
}

/* 阶段倒计时 */
.phase-countdown {
  margin-top: var(--space-xs);
  font-size: var(--font-size-sm);
  color: #6BA89E;
  font-variant-numeric: tabular-nums;
}

/* 操作按钮 */
.med-actions {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-xl);
}

.btn-start {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 14px 40px;
  border: none;
  border-radius: var(--radius-full);
  background: #2A7A6E;
  color: white;
  font-size: var(--font-size-base);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: 0 4px 16px rgba(42, 122, 110, 0.3);
}

.btn-start:active {
  transform: scale(0.96);
}

.btn-start.running {
  background: #E8F6F3;
  color: #2A7A6E;
  box-shadow: 0 2px 8px rgba(42, 122, 110, 0.15);
}

.btn-icon {
  font-size: 18px;
  line-height: 1;
}

/* 参数调节 */
.params-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  backdrop-filter: blur(10px);
  transition: opacity var(--transition);
}

.params-section.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.params-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.params-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: #2A7A6E;
}

.btn-reset {
  font-size: var(--font-size-xs);
  color: #6BA89E;
  background: none;
  border: 1px solid #D4EDE8;
  border-radius: var(--radius-full);
  padding: 4px 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.btn-reset:active {
  background: #E8F6F3;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.slider-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.slider-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: #4A9A8E;
}

.slider-value {
  font-weight: 600;
  color: #2A7A6E;
  font-variant-numeric: tabular-nums;
}

/* 自定义滑块样式 */
.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #D4EDE8;
  outline: none;
  transition: background var(--transition-fast);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #2A7A6E;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(42, 122, 110, 0.3);
  transition: transform var(--transition-fast);
}

.slider::-webkit-slider-thumb:active {
  transform: scale(1.15);
}

.slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #2A7A6E;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(42, 122, 110, 0.3);
}

/* 科普提示 */
.tips-section {
  margin-bottom: var(--space-lg);
}

.tips-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: #6BA89E;
  margin-bottom: var(--space-md);
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.tip-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius);
  border: 1px solid #E8F6F3;
}

.tip-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.tip-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tip-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: #2A7A6E;
}

.tip-desc {
  font-size: var(--font-size-xs);
  color: #8BBFB5;
  line-height: 1.5;
}

/* 深色模式 */
:root[data-theme='dark'] .meditation-page,
[data-theme='dark'] .meditation-page {
  background: linear-gradient(180deg, #0D1F1C 0%, #121212 40%);
}

:root[data-theme='dark'] .med-title,
[data-theme='dark'] .med-title {
  color: #7DD3C8;
}

:root[data-theme='dark'] .med-subtitle,
[data-theme='dark'] .med-subtitle {
  color: #5BA89E;
}

:root[data-theme='dark'] .med-stats,
[data-theme='dark'] .med-stats {
  background: rgba(30, 46, 42, 0.7);
}

:root[data-theme='dark'] .stat-value,
[data-theme='dark'] .stat-value {
  color: #7DD3C8;
}

:root[data-theme='dark'] .stat-label,
[data-theme='dark'] .stat-label {
  color: #4A8A7E;
}

:root[data-theme='dark'] .stat-divider,
[data-theme='dark'] .stat-divider {
  background: #2A5A50;
}

:root[data-theme='dark'] .phase-text,
[data-theme='dark'] .phase-text {
  color: #4A8A7E;
}

:root[data-theme='dark'] .phase-text.active,
[data-theme='dark'] .phase-text.active {
  color: #7DD3C8;
}

:root[data-theme='dark'] .phase-countdown,
[data-theme='dark'] .phase-countdown {
  color: #5BA89E;
}

:root[data-theme='dark'] .btn-start,
[data-theme='dark'] .btn-start {
  background: #3CBAA8;
  box-shadow: 0 4px 16px rgba(60, 186, 168, 0.25);
}

:root[data-theme='dark'] .btn-start.running,
[data-theme='dark'] .btn-start.running {
  background: #1A3A34;
  color: #7DD3C8;
}

:root[data-theme='dark'] .params-section,
[data-theme='dark'] .params-section {
  background: rgba(30, 46, 42, 0.7);
}

:root[data-theme='dark'] .params-title,
[data-theme='dark'] .params-title {
  color: #7DD3C8;
}

:root[data-theme='dark'] .btn-reset,
[data-theme='dark'] .btn-reset {
  color: #5BA89E;
  border-color: #2A5A50;
}

:root[data-theme='dark'] .slider-label,
[data-theme='dark'] .slider-label {
  color: #5BA89E;
}

:root[data-theme='dark'] .slider-value,
[data-theme='dark'] .slider-value {
  color: #7DD3C8;
}

:root[data-theme='dark'] .slider,
[data-theme='dark'] .slider {
  background: #2A5A50;
}

:root[data-theme='dark'] .slider::-webkit-slider-thumb,
[data-theme='dark'] .slider::-webkit-slider-thumb {
  background: #5BC4B5;
}

:root[data-theme='dark'] .slider::-moz-range-thumb,
[data-theme='dark'] .slider::-moz-range-thumb {
  background: #5BC4B5;
}

:root[data-theme='dark'] .tips-title,
[data-theme='dark'] .tips-title {
  color: #5BA89E;
}

:root[data-theme='dark'] .tip-card,
[data-theme='dark'] .tip-card {
  background: rgba(30, 46, 42, 0.5);
  border-color: #1A3A34;
}

:root[data-theme='dark'] .tip-title,
[data-theme='dark'] .tip-title {
  color: #7DD3C8;
}

:root[data-theme='dark'] .tip-desc,
[data-theme='dark'] .tip-desc {
  color: #4A8A7E;
}
</style>
