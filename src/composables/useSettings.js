/**
 * useSettings - 应用设置组合式函数
 *
 * 功能:
 *   - 管理应用全局设置
 *   - 深色模式切换
 *   - 通知、语音等偏好设置
 *   - 自动持久化到 localStorage
 */
import { ref, watch, computed } from 'vue'

const STORAGE_KEY = 'adhd_settings'
const ONBOARDED_KEY = 'adhd_onboarded'

/** 默认设置 */
const DEFAULT_SETTINGS = {
  darkMode: false,
  notificationEnabled: true,
  voiceEnabled: true,
  soundStyle: 'gentle' // 'gentle' | 'energetic' | 'silent'
}

/**
 * 从 localStorage 加载设置
 */
function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // 合并默认值，确保新增的设置项有默认值
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (e) {
    console.warn('[useSettings] 读取设置失败:', e)
  }
  return { ...DEFAULT_SETTINGS }
}

/**
 * 保存设置到 localStorage
 */
function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('[useSettings] 保存设置失败:', e)
  }
}

// 模块级别的共享状态（单例模式）
let sharedSettings = null
let sharedOnboarded = null

/**
 * 应用设置组合式函数
 */
export function useSettings() {
  // 单例模式：所有组件共享同一个设置状态
  if (!sharedSettings) {
    sharedSettings = ref(loadSettings())
  }

  if (!sharedOnboarded) {
    const stored = localStorage.getItem(ONBOARDED_KEY)
    sharedOnboarded = ref(stored === 'true')
  }

  // 计算属性
  const darkMode = computed({
    get: () => sharedSettings.value.darkMode,
    set: (val) => { sharedSettings.value.darkMode = val }
  })

  const onboarded = computed({
    get: () => sharedOnboarded.value,
    set: (val) => { sharedOnboarded.value = val }
  })

  const notifications = computed({
    get: () => sharedSettings.value.notificationEnabled,
    set: (val) => { sharedSettings.value.notificationEnabled = val }
  })

  const voiceBroadcast = computed({
    get: () => sharedSettings.value.voiceEnabled,
    set: (val) => { sharedSettings.value.voiceEnabled = val }
  })

  const soundEffect = computed({
    get: () => sharedSettings.value.soundStyle,
    set: (val) => { sharedSettings.value.soundStyle = val }
  })

  /**
   * 切换深色模式
   */
  function toggleDarkMode() {
    sharedSettings.value.darkMode = !sharedSettings.value.darkMode
  }

  /**
   * 切换通知
   */
  function toggleNotifications() {
    sharedSettings.value.notificationEnabled = !sharedSettings.value.notificationEnabled
  }

  /**
   * 切换语音播报
   */
  function toggleVoiceBroadcast() {
    sharedSettings.value.voiceEnabled = !sharedSettings.value.voiceEnabled
  }

  /**
   * 设置音效风格
   */
  function setSoundEffect(value) {
    sharedSettings.value.soundStyle = value
  }

  /**
   * 更新单个设置项
   */
  function updateSetting(key, value) {
    if (key in sharedSettings.value) {
      sharedSettings.value[key] = value
    } else {
      console.warn(`[useSettings] 未知的设置项: ${key}`)
    }
  }

  /**
   * 标记已完成引导
   */
  function setOnboarded() {
    sharedOnboarded.value = true
    localStorage.setItem(ONBOARDED_KEY, 'true')
  }

  /**
   * 清除所有数据
   */
  function clearAll() {
    sharedSettings.value = { ...DEFAULT_SETTINGS }
    sharedOnboarded.value = false
    localStorage.removeItem(ONBOARDED_KEY)
  }

  // 监听设置变化，自动保存并同步深色模式到 DOM
  watch(
    sharedSettings,
    (newSettings) => {
      saveSettings(newSettings)

      // 同步深色模式到 document
      if (newSettings.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    },
    { deep: true, immediate: true }
  )

  return {
    settings: sharedSettings,
    darkMode,
    onboarded,
    notifications,
    voiceBroadcast,
    soundEffect,
    toggleDarkMode,
    toggleNotifications,
    toggleVoiceBroadcast,
    setSoundEffect,
    updateSetting,
    setOnboarded,
    clearAll
  }
}
