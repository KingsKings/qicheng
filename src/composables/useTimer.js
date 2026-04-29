/**
 * useTimer - 计时器组合式函数
 *
 * 功能:
 *   - 为任务提供倒计时功能
 *   - 支持开始、暂停、恢复、最小化、关闭
 *   - 倒计时结束时触发完成事件
 *   - 使用 setInterval(1000) 进行倒计时
 */
import { ref, computed, onUnmounted } from 'vue'

/**
 * 计时器组合式函数
 * @param {Function} onComplete - 倒计时结束时的回调函数
 */
export function useTimer(onComplete) {
  /** 当前正在计时的任务 */
  const currentTask = ref(null)
  /** 是否正在运行 */
  const isRunning = ref(false)
  /** 是否暂停 */
  const isPaused = ref(false)
  /** 是否最小化 */
  const isMinimized = ref(false)
  /** 剩余秒数 */
  const remainingSeconds = ref(0)
  /** 原始时长（秒），用于重置 */
  const originalSeconds = ref(0)

  /** setInterval 的定时器 ID */
  let timerId = null

  /** 当前计时任务的 ID */
  const currentTaskId = computed(() => currentTask.value?.id || null)

  /** 格式化显示时间 MM:SS */
  const displayTime = computed(() => {
    const totalSec = remainingSeconds.value
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  /** 已经过的分钟数（用于进度条） */
  const displayMinutes = computed(() => {
    if (originalSeconds.value === 0) return 0
    return Math.floor((originalSeconds.value - remainingSeconds.value) / 60)
  })

  /**
   * 清除定时器
   */
  function clearTimer() {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
  }

  /**
   * 倒计时结束处理
   */
  function onTimerEnd() {
    clearTimer()
    isRunning.value = false
    isPaused.value = false
    isMinimized.value = false

    if (currentTask.value) {
      currentTask.value.remainingSeconds = 0
      currentTask.value.status = 'idle'
    }

    if (onComplete && typeof onComplete === 'function') {
      onComplete(currentTask.value)
    }
  }

  /**
   * 启动任务计时
   * @param {string|Object} taskIdOrTask - 任务 ID 或任务对象
   */
  function start(taskIdOrTask) {
    clearTimer()

    // 支持传入 taskId 或 task 对象
    let task = null
    if (typeof taskIdOrTask === 'string') {
      // 只传了 ID，需要外部设置 currentTask
      currentTask.value = { id: taskIdOrTask }
    } else {
      currentTask.value = taskIdOrTask
    }

    isRunning.value = true
    isPaused.value = false
    isMinimized.value = false

    // 如果有任务对象，设置倒计时
    if (currentTask.value && currentTask.value.duration) {
      const totalSeconds = currentTask.value.duration * 60
      remainingSeconds.value = totalSeconds
      originalSeconds.value = totalSeconds
    } else {
      remainingSeconds.value = 0
      originalSeconds.value = 0
    }

    // 开始倒计时
    timerId = setInterval(() => {
      if (remainingSeconds.value > 0) {
        remainingSeconds.value -= 1
      } else {
        onTimerEnd()
      }
    }, 1000)
  }

  /**
   * 暂停计时器
   */
  function pause() {
    if (!isRunning.value || isPaused.value) return

    clearTimer()
    isPaused.value = true

    if (currentTask.value) {
      currentTask.value.remainingSeconds = remainingSeconds.value
      currentTask.value.status = 'paused'
    }
  }

  /**
   * 从暂停恢复计时
   */
  function resume() {
    if (!isPaused.value) return

    isPaused.value = false
    isRunning.value = true

    if (currentTask.value) {
      currentTask.value.status = 'running'
    }

    timerId = setInterval(() => {
      if (remainingSeconds.value > 0) {
        remainingSeconds.value -= 1
      } else {
        onTimerEnd()
      }
    }, 1000)
  }

  /**
   * 切换暂停/恢复
   */
  function togglePause() {
    if (isPaused.value) {
      resume()
    } else {
      pause()
    }
  }

  /**
   * 停止计时器（返回结果）
   */
  function stop() {
    const result = {
      taskId: currentTask.value?.id || null,
      seconds: originalSeconds.value - remainingSeconds.value
    }

    clearTimer()
    isRunning.value = false
    isPaused.value = false
    isMinimized.value = false

    if (currentTask.value) {
      currentTask.value.remainingSeconds = remainingSeconds.value
      currentTask.value.status = 'idle'
    }

    currentTask.value = null
    remainingSeconds.value = 0
    originalSeconds.value = 0

    return result
  }

  /**
   * 最小化计时器
   */
  function minimize() {
    isMinimized.value = true
  }

  /**
   * 从最小化恢复
   */
  function restore() {
    isMinimized.value = false
  }

  /**
   * 重置计时器到原始时长
   */
  function reset() {
    clearTimer()
    remainingSeconds.value = originalSeconds.value
    isPaused.value = false
    isRunning.value = false
    isMinimized.value = false

    if (currentTask.value) {
      currentTask.value.remainingSeconds = originalSeconds.value
      currentTask.value.status = 'idle'
    }
  }

  /**
   * 关闭计时器（别名，同 stop）
   */
  function close() {
    return stop()
  }

  /**
   * 设置剩余秒数（供外部设置任务后调用）
   */
  function setDuration(durationMinutes) {
    const totalSeconds = durationMinutes * 60
    remainingSeconds.value = totalSeconds
    originalSeconds.value = totalSeconds
  }

  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearTimer()
  })

  return {
    currentTask,
    isRunning,
    isPaused,
    isMinimized,
    remainingSeconds,
    currentTaskId,
    displayTime,
    displayMinutes,
    start,
    pause,
    resume,
    togglePause,
    stop,
    minimize,
    restore,
    reset,
    close,
    setDuration
  }
}
