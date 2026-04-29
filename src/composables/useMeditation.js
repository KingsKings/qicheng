import { ref, computed, watch, onUnmounted } from 'vue'
import { useStorage } from './useStorage'

// 默认呼吸参数
const DEFAULTS = {
  inhale: 4,    // 吸气秒数
  hold: 0,      // 屏住秒数
  exhale: 6     // 呼气秒数
}

export function useMeditation() {
  // 呼吸参数（可自定义，有默认值）
  const inhaleDuration = ref(DEFAULTS.inhale)
  const holdDuration = ref(DEFAULTS.hold)
  const exhaleDuration = ref(DEFAULTS.exhale)

  // 练习状态
  const isRunning = ref(false)
  const currentPhase = ref('idle') // idle | inhale | hold | exhale
  const phaseRemaining = ref(0)   // 当前阶段剩余秒数
  const breathCount = ref(0)      // 完成的呼吸次数
  const elapsedSeconds = ref(0)   // 已练习总秒数

  // 内部计时器
  let phaseTimer = null
  let elapsedTimer = null

  // 计算属性
  const cycleDuration = computed(() =>
    inhaleDuration.value + holdDuration.value + exhaleDuration.value
  )

  const frequency = computed(() => {
    if (cycleDuration.value === 0) return 0
    return Math.round((60 / cycleDuration.value) * 10) / 10
  })

  const displayElapsed = computed(() => {
    const mins = Math.floor(elapsedSeconds.value / 60)
    const secs = elapsedSeconds.value % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  })

  // 阶段文字
  const phaseText = computed(() => {
    switch (currentPhase.value) {
      case 'inhale': return '吸气...'
      case 'hold': return '屏住...'
      case 'exhale': return '呼气...'
      default: return '准备开始'
    }
  })

  // 阶段进度 (0~1)
  const phaseProgress = computed(() => {
    let total = 0
    switch (currentPhase.value) {
      case 'inhale': total = inhaleDuration.value; break
      case 'hold': total = holdDuration.value; break
      case 'exhale': total = exhaleDuration.value; break
      default: return 0
    }
    if (total === 0) return 0
    return 1 - (phaseRemaining.value / total)
  })

  // 开始练习
  function start() {
    if (isRunning.value) return
    isRunning.value = true
    breathCount.value = 0
    elapsedSeconds.value = 0
    startPhase('inhale')
    startElapsedTimer()
  }

  // 停止练习
  function stop() {
    isRunning.value = false
    currentPhase.value = 'idle'
    phaseRemaining.value = 0
    clearTimers()
  }

  // 恢复默认参数
  function resetDefaults() {
    inhaleDuration.value = DEFAULTS.inhale
    holdDuration.value = DEFAULTS.hold
    exhaleDuration.value = DEFAULTS.exhale
  }

  // 内部：开始一个呼吸阶段
  function startPhase(phase) {
    currentPhase.value = phase
    let duration = 0
    switch (phase) {
      case 'inhale': duration = inhaleDuration.value; break
      case 'hold': duration = holdDuration.value; break
      case 'exhale': duration = exhaleDuration.value; break
    }

    // 如果该阶段时长为0，直接跳到下一阶段
    if (duration <= 0) {
      nextPhase(phase)
      return
    }

    phaseRemaining.value = duration
    phaseTimer = setInterval(() => {
      phaseRemaining.value--
      if (phaseRemaining.value <= 0) {
        clearInterval(phaseTimer)
        phaseTimer = null
        nextPhase(phase)
      }
    }, 1000)
  }

  // 内部：切换到下一阶段
  function nextPhase(current) {
    switch (current) {
      case 'inhale':
        if (holdDuration.value > 0) {
          startPhase('hold')
        } else {
          startPhase('exhale')
        }
        break
      case 'hold':
        startPhase('exhale')
        break
      case 'exhale':
        breathCount.value++
        startPhase('inhale')
        break
    }
  }

  // 内部：已练习时间计时器
  function startElapsedTimer() {
    elapsedTimer = setInterval(() => {
      elapsedSeconds.value++
    }, 1000)
  }

  // 内部：清除计时器
  function clearTimers() {
    if (phaseTimer) {
      clearInterval(phaseTimer)
      phaseTimer = null
    }
    if (elapsedTimer) {
      clearInterval(elapsedTimer)
      elapsedTimer = null
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    clearTimers()
  })

  return {
    // 参数
    inhaleDuration,
    holdDuration,
    exhaleDuration,
    // 状态
    isRunning,
    currentPhase,
    phaseRemaining,
    breathCount,
    elapsedSeconds,
    // 计算属性
    cycleDuration,
    frequency,
    displayElapsed,
    phaseText,
    phaseProgress,
    // 方法
    start,
    stop,
    resetDefaults
  }
}
