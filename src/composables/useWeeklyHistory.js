/**
 * useWeeklyHistory - 每周完成历史记录组合式函数
 *
 * 功能:
 *   - 记录每天完成的任务数量
 *   - 获取最近7天的数据用于图表展示
 *   - 自动清理超过7天的旧数据
 */
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'adhd_weekly_history'

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
 * 获取 N 天前的日期字符串
 */
function getDateStr(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 从 localStorage 加载历史记录
 */
function loadHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.warn('[useWeeklyHistory] 读取历史记录失败:', e)
  }
  return {}
}

/**
 * 保存历史记录到 localStorage
 */
function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (e) {
    console.error('[useWeeklyHistory] 保存历史记录失败:', e)
  }
}

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

// 模块级别的共享状态（单例模式）
let sharedHistory = null

/**
 * 每周完成历史记录组合式函数
 */
export function useWeeklyHistory() {
  // 单例模式：所有组件共享同一个历史状态
  if (!sharedHistory) {
    sharedHistory = ref(loadHistory())
  }

  /**
   * 记录一次任务完成
   */
  function recordCompletion() {
    const today = getTodayStr()
    const current = sharedHistory.value[today] || 0
    sharedHistory.value = {
      ...sharedHistory.value,
      [today]: current + 1
    }
  }

  /**
   * 获取最近7天的完成数据
   */
  function getLast7Days() {
    const result = []
    for (let i = 6; i >= 0; i--) {
      const date = getDateStr(i)
      result.push({
        date,
        count: sharedHistory.value[date] || 0
      })
    }
    return result
  }

  /**
   * 清理超过7天的旧数据
   */
  function cleanup() {
    const cutoffDate = getDateStr(7)
    const newHistory = {}
    for (const [date, count] of Object.entries(sharedHistory.value)) {
      if (date >= cutoffDate) {
        newHistory[date] = count
      }
    }
    sharedHistory.value = newHistory
  }

  // 为 WeeklyChart 组件准备的 weeklyData
  const weeklyData = computed(() => {
    const days = getLast7Days()
    return days.map(d => {
      const dateObj = new Date(d.date)
      const weekday = WEEKDAY_LABELS[dateObj.getDay()]
      return {
        key: d.date,
        label: weekday,
        shortLabel: (dateObj.getMonth() + 1) + '/' + dateObj.getDate(),
        count: d.count
      }
    })
  })

  const weekTotal = computed(() => {
    return getLast7Days().reduce((sum, d) => sum + d.count, 0)
  })

  const weekAverage = computed(() => {
    const total = weekTotal.value
    return total > 0 ? (total / 7).toFixed(1) : '0'
  })

  // 监听历史变化，自动保存
  watch(
    sharedHistory,
    (newHistory) => {
      saveHistory(newHistory)
    },
    { deep: true }
  )

  // 初始化时清理旧数据
  cleanup()

  return {
    history: sharedHistory,
    weeklyData,
    weekTotal,
    weekAverage,
    recordCompletion,
    getLast7Days,
    cleanup
  }
}
