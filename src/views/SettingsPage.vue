<script setup>
import { ref, inject } from 'vue'
import { useTasks } from '../composables/useTasks'
import { useSettings } from '../composables/useSettings'
import { useStreak } from '../composables/useStreak'
import BottomNav from '../components/BottomNav.vue'

const emit = defineEmits(['switch-page'])
const showToast = inject('showToast')

const { clearAll: clearTasks } = useTasks()
const {
  darkMode, notifications, voiceBroadcast, soundEffect,
  toggleDarkMode, toggleNotifications, toggleVoiceBroadcast,
  setSoundEffect
} = useSettings()
const { reset: resetStreak } = useStreak()

const showClearConfirm = ref(false)

const soundOptions = [
  { value: 'gentle', label: '轻柔' },
  { value: 'cheerful', label: '欢快' },
  { value: 'pixel', label: '像素风' }
]

function onToggleDarkMode() {
  toggleDarkMode()
  showToast?.(darkMode.value ? '已开启深色模式' : '已关闭深色模式', 'info')
}

function onToggleNotifications() {
  toggleNotifications()
  showToast?.(notifications.value ? '已开启通知提醒' : '已关闭通知提醒', 'info')
}

function onToggleVoiceBroadcast() {
  toggleVoiceBroadcast()
  showToast?.(voiceBroadcast.value ? '已开启语音播报' : '已关闭语音播报', 'info')
}

function onSoundEffectChange(e) {
  setSoundEffect(e.target.value)
  showToast?.('音效已切换', 'success')
}

function onClearData() {
  showClearConfirm.value = true
}

function confirmClear() {
  clearTasks()
  resetStreak()
  showClearConfirm.value = false
  showToast?.('所有数据已清除', 'success')
}

function cancelClear() {
  showClearConfirm.value = false
}



function onPageSwitch(page) {
  emit('switch-page', page)
}
</script>

<template>
  <div class="settings-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">设置</h1>
    </div>

    <!-- 偏好设置 -->
    <div class="settings-section">
      <div class="section-title">偏好设置</div>
      <div class="settings-card">
        <!-- 深色模式 -->
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-icon">🌙</span>
            <div>
              <span class="setting-name">深色模式</span>
              <span class="setting-desc">夜间使用更舒适</span>
            </div>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              :checked="darkMode"
              @change="onToggleDarkMode"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-divider"></div>

        <!-- 通知提醒 -->
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-icon">🔔</span>
            <div>
              <span class="setting-name">通知提醒</span>
              <span class="setting-desc">任务完成时发送通知</span>
            </div>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              :checked="notifications"
              @change="onToggleNotifications"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-divider"></div>

        <!-- 语音播报 -->
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-icon">🗣️</span>
            <div>
              <span class="setting-name">语音播报</span>
              <span class="setting-desc">完成任务时语音提示</span>
            </div>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              :checked="voiceBroadcast"
              @change="onToggleVoiceBroadcast"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-divider"></div>

        <!-- 反馈音效 -->
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-icon">🎵</span>
            <div>
              <span class="setting-name">反馈音效</span>
              <span class="setting-desc">操作时的声音反馈</span>
            </div>
          </div>
          <select
            class="setting-select"
            :value="soundEffect"
            @change="onSoundEffectChange"
          >
            <option
              v-for="opt in soundOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="settings-section">
      <div class="section-title">数据管理</div>
      <div class="settings-card">
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-icon">🗑️</span>
            <div>
              <span class="setting-name">清除所有数据</span>
              <span class="setting-desc">删除所有任务和设置</span>
            </div>
          </div>
          <button class="btn-danger-sm" @click="onClearData">
            清除
          </button>
        </div>
      </div>
    </div>

    <!-- 清除确认对话框 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showClearConfirm" class="confirm-overlay" @click.self="cancelClear">
          <div class="confirm-dialog">
            <h3 class="confirm-title">确认清除所有数据？</h3>
            <p class="confirm-desc">此操作不可撤销，所有任务、连续记录和设置都将被删除。</p>
            <div class="confirm-actions">
              <button class="confirm-btn cancel" @click="cancelClear">取消</button>
              <button class="confirm-btn danger" @click="confirmClear">确认清除</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 关于 -->
    <div class="settings-section">
      <div class="section-title">关于</div>
      <div class="settings-card about-card">
        <div class="about-logo">🚀</div>
        <h3 class="about-name">启程</h3>
        <p class="about-version">版本 1.0.0</p>
        <p class="about-desc">
          专为 ADHD 人群设计的每日规划工具。通过脑暴输入、专注计时和连续打卡，帮助你建立每日习惯，一步步完成目标。
        </p>
      </div>
    </div>



    <!-- 底部导航 -->
    <BottomNav current="settings" @switch="onPageSwitch" />
  </div>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.page-header {
  padding: var(--space-md) 0;
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
}

/* 设置区块 */
.settings-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.section-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  gap: var(--space-md);
}

.setting-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex: 1;
  min-width: 0;
}

.setting-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.setting-info > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-name {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-primary);
}

.setting-desc {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.setting-divider {
  height: 1px;
  background: var(--border-light);
  margin: 0 var(--space-lg);
}

/* Toggle 开关 */
.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
  flex-shrink: 0;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--border);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.toggle input:checked + .toggle-slider {
  background: var(--primary);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

/* Select */
.setting-select {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-family: inherit;
  color: var(--text-primary);
  background: var(--bg-input);
  outline: none;
  cursor: pointer;
}

.setting-select:focus {
  border-color: var(--primary);
}

/* 危险按钮 */
.btn-danger-sm {
  padding: var(--space-sm) var(--space-md);
  background: var(--danger-bg);
  color: var(--danger);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.btn-danger-sm:active {
  transform: scale(0.95);
  background: var(--danger);
  color: white;
}

/* 确认对话框 */
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.confirm-dialog {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  width: 100%;
  max-width: 320px;
  animation: scaleIn 0.2s ease;
}

.confirm-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.confirm-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-xl);
}

.confirm-actions {
  display: flex;
  gap: var(--space-md);
}

.confirm-btn {
  flex: 1;
  padding: var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.confirm-btn:active {
  transform: scale(0.96);
}

.confirm-btn.cancel {
  background: var(--bg-input);
  color: var(--text-secondary);
}

.confirm-btn.danger {
  background: var(--danger);
  color: white;
}

/* 关于 */
.about-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-2xl) var(--space-xl);
}

.about-logo {
  font-size: 48px;
  margin-bottom: var(--space-md);
}

.about-name {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.about-version {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--space-md);
}

.about-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}


</style>
