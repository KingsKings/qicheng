/**
 * useTasks - 任务管理组合式函数
 *
 * 功能:
 *   - 任务列表的增删改查
 *   - 待办任务池（brain dump）
 *   - 今日已完成列表
 *   - 删除撤销支持（3秒）
 *   - 自动持久化到 localStorage
 */
import { ref, computed, watch } from 'vue'
import { useStorage } from './useStorage'
import { useStreak } from './useStreak'
import { useWeeklyHistory } from './useWeeklyHistory'

/**
 * 生成唯一 ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

/**
 * 任务管理组合式函数
 */
export function useTasks() {
  // 从 localStorage 加载数据
  const tasks = useStorage('adhd_tasks', [])
  const pendingTasks = useStorage('adhd_pending_tasks', [])
  const completedToday = useStorage('adhd_completed_today', [])

  // 脑暴输入文本
  const brainDumpText = ref('')

  // 连续记录和历史记录
  const { incrementStreak, getStreakMessage } = useStreak()
  const { recordCompletion } = useWeeklyHistory()

  // 计算属性
  const activeTasks = computed(() => tasks.value.filter(t => !t.completed && !t.pending))
  const completedTasks = computed(() => tasks.value.filter(t => t.completed))
  const totalCount = computed(() => tasks.value.filter(t => !t.pending).length)
  const completedCount = computed(() => completedTasks.value.length)
  const pendingCount = computed(() => pendingTasks.value.length)
  const progress = computed(() => {
    if (totalCount.value === 0) return 0
    return Math.round((completedCount.value / totalCount.value) * 100)
  })
  const allCompleted = computed(() => totalCount.value > 0 && completedCount.value === totalCount.value)

  // 删除撤销相关
  const undoTimers = {}

  /**
   * 创建任务对象
   */
  function createTask(name, durationMinutes) {
    return {
      id: generateId(),
      name: name.trim(),
      duration: durationMinutes || 0,
      remainingSeconds: (durationMinutes || 0) * 60,
      timerSeconds: 0,
      status: 'idle', // 'idle' | 'running' | 'paused'
      completed: false,
      pending: false,
      createdAt: new Date().toISOString()
    }
  }

  /**
   * 添加新任务到任务列表
   */
  function addTask(name, durationMinutes) {
    const task = createTask(name, durationMinutes)
    tasks.value.push(task)
    return task
  }

  /**
   * 从脑暴输入添加任务到待办池（无时长）
   */
  function addFromBrainDump() {
    const text = brainDumpText.value.trim()
    if (!text) return 0

    // 支持换行、逗号、中文逗号分隔
    const items = text.split(/[\n,，;；、]+/).map(s => s.trim()).filter(s => s.length > 0)

    let count = 0
    for (const item of items) {
      const task = createTask(item, 0)
      pendingTasks.value.push(task)
      count++
    }

    brainDumpText.value = ''
    return count
  }

  /**
   * 切换任务完成状态
   */
  function toggleTask(taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    task.completed = !task.completed

    if (task.completed) {
      // 记录完成时间
      task.completedAt = new Date().toISOString()
      // 更新连续记录
      incrementStreak()
      // 更新每周历史
      recordCompletion()
    } else {
      delete task.completedAt
    }
  }

  /**
   * 将任务标记为稍后做（移到待办池）
   */
  function markPending(taskId) {
    const taskIndex = tasks.value.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return

    const task = tasks.value[taskIndex]
    task.status = 'idle'
    task.remainingSeconds = task.duration * 60
    task.pending = true

    tasks.value.splice(taskIndex, 1)
    pendingTasks.value.push(task)
  }

  /**
   * 从待办池恢复任务到任务列表
   */
  function restoreFromPending(taskId) {
    const taskIndex = pendingTasks.value.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return

    const task = pendingTasks.value[taskIndex]
    task.pending = false

    pendingTasks.value.splice(taskIndex, 1)
    tasks.value.push(task)
  }

  /**
   * 删除任务
   */
  function deleteTask(taskId) {
    // 先尝试从任务列表中查找
    let taskIndex = tasks.value.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
      tasks.value.splice(taskIndex, 1)
      return
    }

    // 尝试从待办池中查找
    taskIndex = pendingTasks.value.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
      pendingTasks.value.splice(taskIndex, 1)
      return
    }

    // 尝试从已完成列表中查找
    taskIndex = completedToday.value.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
      completedToday.value.splice(taskIndex, 1)
    }
  }

  /**
   * 更新任务的计时时间
   */
  function updateTaskTimer(taskId, seconds) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.timerSeconds = (task.timerSeconds || 0) + seconds
    }
  }

  /**
   * 编辑任务
   */
  function editTask(taskId, updates) {
    let task = tasks.value.find(t => t.id === taskId)
    if (!task) {
      task = pendingTasks.value.find(t => t.id === taskId)
    }
    if (!task) return

    if (updates.name !== undefined) {
      task.name = updates.name.trim()
    }
    if (updates.duration !== undefined) {
      task.duration = updates.duration
      task.remainingSeconds = updates.duration * 60
    }
  }

  /**
   * 清除所有数据
   */
  function clearAll() {
    tasks.value = []
    pendingTasks.value = []
    completedToday.value = []
    brainDumpText.value = ''
  }

  return {
    tasks,
    pendingTasks,
    completedToday,
    brainDumpText,
    activeTasks,
    completedTasks,
    totalCount,
    completedCount,
    pendingCount,
    progress,
    allCompleted,
    addTask,
    addFromBrainDump,
    toggleTask,
    markPending,
    restoreFromPending,
    deleteTask,
    updateTaskTimer,
    editTask,
    clearAll
  }
}
