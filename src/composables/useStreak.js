/**
 * useStreak - 每日连续完成记录组合式函数
 *
 * 功能:
 *   - 记录每天完成的任务数
 *   - 检测日期变化自动重置
 *   - 里程碑庆祝消息（3、5、10）
 */
import { ref, computed } from 'vue'

const STORAGE_KEY = 'adhd_daily_streak'
const BEST_STREAK_KEY = 'adhd_best_streak'

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
function getTodayStr() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 从 localStorage 加载连续记录
 */
function loadStreak() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.warn('[useStreak] 读取连续记录失败:', e)
  }
  return { streak: 0, lastDate: '' }
}

/**
 * 保存连续记录到 localStorage
 */
function saveStreak(streakData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(streakData))
  } catch (e) {
    console.error('[useStreak] 保存连续记录失败:', e)
  }
}

function loadBestStreak() {
  try {
    const stored = localStorage.getItem(BEST_STREAK_KEY)
    if (stored) return parseInt(stored, 10) || 0
  } catch (e) {
    console.warn('[useStreak] 读取最佳连续记录失败:', e)
  }
  return 0
}

function saveBestStreak(val) {
  try {
    localStorage.setItem(BEST_STREAK_KEY, String(val))
  } catch (e) {
    console.error('[useStreak] 保存最佳连续记录失败:', e)
  }
}

// 模块级别的共享状态（单例模式）
let sharedStreak = null
let sharedLastDate = null
let sharedBestStreak = null

/**
 * 连续完成记录组合式函数
 */
export function useStreak() {
  // 单例模式：所有组件共享同一个状态
  if (!sharedStreak) {
    const saved = loadStreak()
    sharedStreak = ref(saved.streak || 0)
    sharedLastDate = ref(saved.lastDate || '')
    sharedBestStreak = ref(loadBestStreak())
  }

  // 别名，兼容不同使用方式
  const currentStreak = computed(() => sharedStreak.value)
  const bestStreak = computed(() => sharedBestStreak.value)

  /**
   * 检查是否需要每日重置
   */
  function checkDailyReset() {
    const today = getTodayStr()
    if (sharedLastDate.value && sharedLastDate.value !== today) {
      // 日期变了，重置连续记录
      sharedStreak.value = 0
      sharedLastDate.value = today
      saveStreak({ streak: 0, lastDate: today })
    }
  }

  /**
   * 增加连续计数
   */
  function incrementStreak() {
    const today = getTodayStr()
    checkDailyReset()
    sharedStreak.value += 1
    sharedLastDate.value = today
    saveStreak({
      streak: sharedStreak.value,
      lastDate: sharedLastDate.value
    })
    // 更新最佳记录
    if (sharedStreak.value > sharedBestStreak.value) {
      sharedBestStreak.value = sharedStreak.value
      saveBestStreak(sharedBestStreak.value)
    }
  }

  /**
   * 记录今天有完成任务（供 TaskPage 调用）
   */
  function recordToday() {
    incrementStreak()
  }

  /**
   * 重置连续记录
   */
  function reset() {
    sharedStreak.value = 0
    sharedLastDate.value = ''
    sharedBestStreak.value = 0
    saveStreak({ streak: 0, lastDate: '' })
    saveBestStreak(0)
  }

  /**
   * 获取里程碑庆祝消息
   */
  function getStreakMessage(streakNum) {
    const messages = {
      3: '连续完成3个任务！你正在建立好习惯！',
      5: '太棒了！连续完成5个任务！继续保持！',
      10: '了不起！连续完成10个任务！你是行动派！'
    }
    return messages[streakNum] || ''
  }

  // 初始化时检查是否需要重置
  checkDailyReset()

  return {
    streak: sharedStreak,
    currentStreak,
    bestStreak,
    lastDate: sharedLastDate,
    incrementStreak,
    recordToday,
    checkDailyReset,
    reset,
    getStreakMessage
  }
}
