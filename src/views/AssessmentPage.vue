<script setup>
import { ref, computed } from 'vue'
import { useAssessment } from '../composables/useAssessment'
import BottomNav from '../components/BottomNav.vue'

const emit = defineEmits(['switch-page'])

const {
  questions,
  answers,
  currentIndex,
  isCompleted,
  isStarted,
  savedResult,
  currentQuestion,
  progress,
  canGoNext,
  canGoPrev,
  answeredCount,
  totalCount,
  selectAnswer,
  nextQuestion,
  prevQuestion,
  startAssessment,
  submitAssessment,
  retakeAssessment
} = useAssessment()

const result = ref(null)

// 当前选中的值
const selectedValue = computed(() => {
  if (!currentQuestion.value) return null
  return answers.value[currentQuestion.value.id] ?? null
})

// 选择答案并自动前进
function onSelect(value) {
  selectAnswer(currentQuestion.value.id, value)
  // 短暂延迟后自动前进
  setTimeout(() => {
    if (currentIndex.value < questions.length - 1) {
      nextQuestion()
    }
  }, 300)
}

// 提交
function onSubmit() {
  result.value = submitAssessment()
}

// 返回
function onBack() {
  if (isCompleted.value) {
    retakeAssessment()
    return
  }
  if (isStarted.value) {
    retakeAssessment()
    return
  }
  emit('switch-page', 'achievements')
}

// 重新测试
function onRetake() {
  result.value = null
  retakeAssessment()
}

function onSwitchPage(page) {
  emit('switch-page', page)
}
</script>

<template>
  <div class="assessment-page">
    <!-- ===== 入口页 ===== -->
    <div v-if="!isStarted && !isCompleted" class="entry-view">
      <div class="entry-header">
        <button class="back-btn" @click="onBack">← 返回</button>
        <div class="entry-icon">🧠</div>
        <h1 class="entry-title">ADHD 自测</h1>
        <p class="entry-subtitle">了解自己的注意力状态</p>
      </div>

      <div class="entry-info">
        <div class="info-card">
          <div class="info-row">
            <span class="info-icon">📝</span>
            <span>共 <strong>{{ totalCount }}</strong> 道题</span>
          </div>
          <div class="info-row">
            <span class="info-icon">⏱️</span>
            <span>约 3-5 分钟</span>
          </div>
          <div class="info-row">
            <span class="info-icon">📊</span>
            <span>覆盖 5 个维度评估</span>
          </div>
        </div>
      </div>

      <!-- 历史结果 -->
      <div v-if="savedResult" class="history-card">
        <div class="history-header">
          <span class="history-label">上次测试结果</span>
          <span class="history-badge" :style="{ color: savedResult.levelColor, borderColor: savedResult.levelColor }">
            {{ savedResult.levelText }}
          </span>
        </div>
        <div class="history-score">
          <span class="history-num">{{ savedResult.percentage }}</span>
          <span class="history-unit">分</span>
        </div>
        <p class="history-date">
          {{ new Date(savedResult.date).toLocaleDateString('zh-CN') }}
        </p>
      </div>

      <div class="entry-notice">
        <p>⚠️ 本测试仅供参考，不构成医学诊断。如有需要，请咨询专业医生。</p>
      </div>

      <button class="start-btn" @click="startAssessment">
        开始测试
      </button>

      <BottomNav current="achievements" @switch="onSwitchPage" />
    </div>

    <!-- ===== 答题页 ===== -->
    <div v-else-if="isStarted && !isCompleted" class="quiz-view">
      <!-- 顶部进度条 -->
      <div class="quiz-header">
        <button class="back-btn" @click="onBack">✕</button>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="progress-text">{{ answeredCount }}/{{ totalCount }}</span>
      </div>

      <!-- 题目分类标签 -->
      <div class="category-tag" v-if="currentQuestion">
        {{ currentQuestion.category }}
      </div>

      <!-- 题目内容 -->
      <div class="question-area" v-if="currentQuestion">
        <div class="question-number">第 {{ currentIndex + 1 }} 题</div>
        <div class="question-text">{{ currentQuestion.text }}</div>
      </div>

      <!-- 选项 -->
      <div class="options-area" v-if="currentQuestion">
        <button
          v-for="option in currentQuestion.options"
          :key="option.value"
          class="option-btn"
          :class="{ selected: selectedValue === option.value }"
          @click="onSelect(option.value)"
        >
          <span class="option-dot"></span>
          <span class="option-label">{{ option.label }}</span>
        </button>
      </div>

      <!-- 底部导航 -->
      <div class="quiz-footer">
        <button
          class="nav-btn prev-btn"
          :disabled="!canGoPrev"
          @click="prevQuestion"
        >
          上一题
        </button>

        <button
          v-if="currentIndex === questions.length - 1 && answeredCount === totalCount"
          class="nav-btn submit-btn"
          @click="onSubmit"
        >
          提交
        </button>
        <span v-else class="quiz-hint">
          {{ answeredCount === totalCount ? '请检查后提交' : '选择后自动下一题' }}
        </span>
      </div>
    </div>

    <!-- ===== 结果页 ===== -->
    <div v-else-if="isCompleted && result" class="result-view">
      <div class="result-header">
        <div class="result-icon">📊</div>
        <h2 class="result-title">评估结果</h2>
      </div>

      <!-- 总分 -->
      <div class="score-card">
        <div class="score-circle" :style="{ borderColor: result.levelColor }">
          <span class="score-num" :style="{ color: result.levelColor }">{{ result.percentage }}</span>
          <span class="score-unit">分</span>
        </div>
        <div class="score-level" :style="{ color: result.levelColor }">
          {{ result.levelText }}
        </div>
        <p class="score-desc">{{ result.levelDesc }}</p>
      </div>

      <!-- 维度得分 -->
      <div class="dimensions-section">
        <div class="dim-title">各维度得分</div>
        <div class="dim-list">
          <div
            v-for="dim in result.dimensions"
            :key="dim.name"
            class="dim-item"
          >
            <div class="dim-header">
              <span class="dim-icon">{{ dim.icon }}</span>
              <span class="dim-name">{{ dim.name }}</span>
              <span class="dim-score">{{ dim.score }}/{{ dim.max }}</span>
            </div>
            <div class="dim-bar">
              <div
                class="dim-fill"
                :style="{
                  width: Math.round((dim.score / dim.max) * 100) + '%',
                  background: result.levelColor
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 免责声明 -->
      <div class="disclaimer">
        <p>⚠️ 本评估基于自评量表，仅供参考，不构成医学诊断。如需专业评估，请咨询精神科医生或临床心理师。</p>
      </div>

      <!-- 操作按钮 -->
      <div class="result-actions">
        <button class="retake-btn" @click="onRetake">
          重新测试
        </button>
        <button class="back-home-btn" @click="onBack">
          返回
        </button>
      </div>

      <BottomNav current="achievements" @switch="onSwitchPage" />
    </div>
  </div>
</template>

<style scoped>
.assessment-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: calc(var(--nav-height) + var(--space-xl) + var(--safe-bottom));
}

/* ===== 入口页 ===== */
.entry-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-lg);
  padding-top: var(--space-xl);
}

.back-btn {
  align-self: flex-start;
  background: none;
  border: none;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-sm);
  font-family: inherit;
}

.entry-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.entry-icon {
  font-size: 56px;
  margin-bottom: var(--space-md);
}

.entry-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  background: linear-gradient(135deg, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-xs);
}

.entry-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.entry-info {
  width: 100%;
  margin-bottom: var(--space-lg);
}

.info-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.info-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.info-icon {
  font-size: 20px;
}

.info-row strong {
  color: var(--text);
}

/* 历史结果 */
.history-card {
  width: 100%;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  border: 1px solid var(--border-light);
  margin-bottom: var(--space-lg);
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.history-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.history-badge {
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  border: 1px solid;
}

.history-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: var(--space-xs);
}

.history-num {
  font-size: 36px;
  font-weight: 700;
  color: var(--text);
}

.history-unit {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.history-date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.entry-notice {
  width: 100%;
  margin-bottom: var(--space-xl);
}

.entry-notice p {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-align: center;
  line-height: 1.6;
}

.start-btn {
  width: 100%;
  max-width: 320px;
  padding: 14px 0;
  background: linear-gradient(135deg, #8B5CF6, #EC4899);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
  transition: all var(--transition);
}

.start-btn:active {
  transform: scale(0.97);
}

/* ===== 答题页 ===== */
.quiz-view {
  display: flex;
  flex-direction: column;
  padding: var(--space-lg);
  min-height: 100vh;
}

.quiz-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.quiz-header .back-btn {
  padding: 0;
  font-size: 20px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #EC4899);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
  min-width: 36px;
  text-align: right;
}

.category-tag {
  display: inline-flex;
  align-self: flex-start;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
  color: #8B5CF6;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  margin-bottom: var(--space-lg);
}

.question-area {
  margin-bottom: var(--space-xl);
}

.question-number {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--space-sm);
}

.question-text {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text);
  line-height: 1.6;
}

.options-area {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex: 1;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-card);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
  text-align: left;
}

.option-btn:active {
  transform: scale(0.98);
}

.option-btn.selected {
  border-color: #8B5CF6;
  background: rgba(139, 92, 246, 0.06);
}

.option-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.option-btn.selected .option-dot {
  border-color: #8B5CF6;
  background: #8B5CF6;
  box-shadow: inset 0 0 0 3px white;
}

.option-label {
  font-size: var(--font-size-base);
  color: var(--text);
}

.option-btn.selected .option-label {
  color: #8B5CF6;
  font-weight: 600;
}

.quiz-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) 0;
}

.nav-btn {
  padding: 10px 24px;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.prev-btn {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.submit-btn {
  background: linear-gradient(135deg, #8B5CF6, #EC4899);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.quiz-hint {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

/* ===== 结果页 ===== */
.result-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-lg);
  padding-top: var(--space-xl);
}

.result-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.result-icon {
  font-size: 48px;
  margin-bottom: var(--space-md);
}

.result-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text);
}

.score-card {
  width: 100%;
  text-align: center;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  border: 1px solid var(--border-light);
  margin-bottom: var(--space-xl);
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
}

.score-num {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.score-unit {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.score-level {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.score-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 维度得分 */
.dimensions-section {
  width: 100%;
  margin-bottom: var(--space-xl);
}

.dim-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}

.dim-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.dim-item {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: var(--space-md);
  border: 1px solid var(--border-light);
}

.dim-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.dim-icon {
  font-size: 18px;
}

.dim-name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text);
  font-weight: 500;
}

.dim-score {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
}

.dim-bar {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.dim-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

/* 免责声明 */
.disclaimer {
  width: 100%;
  margin-bottom: var(--space-xl);
}

.disclaimer p {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-align: center;
  line-height: 1.6;
  padding: var(--space-md);
  background: rgba(255, 152, 0, 0.06);
  border-radius: var(--radius);
}

/* 操作按钮 */
.result-actions {
  width: 100%;
  display: flex;
  gap: var(--space-md);
}

.retake-btn {
  flex: 1;
  padding: 12px 0;
  background: linear-gradient(135deg, #8B5CF6, #EC4899);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.retake-btn:active {
  transform: scale(0.97);
}

.back-home-btn {
  flex: 1;
  padding: 12px 0;
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.back-home-btn:active {
  transform: scale(0.97);
}

/* 深色模式 */
:root[data-theme='dark'] .category-tag,
[data-theme='dark'] .category-tag {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
}

:root[data-theme='dark'] .option-btn.selected,
[data-theme='dark'] .option-btn.selected {
  background: rgba(139, 92, 246, 0.12);
}

:root[data-theme='dark'] .disclaimer,
[data-theme='dark'] .disclaimer {
  background: rgba(255, 152, 0, 0.1);
}
</style>
