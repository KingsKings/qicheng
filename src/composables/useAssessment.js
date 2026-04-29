import { ref, computed } from 'vue'
import { useStorage } from './useStorage'

// ASRS-v1.1 简化版 18 题（Demo 用精选题目）
const questions = [
  {
    id: 1,
    category: '注意力',
    text: '在完成需要持续脑力任务时（如阅读长文、写报告），我很难保持专注',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 2,
    category: '注意力',
    text: '我很难把注意力集中在无聊或重复的事情上',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 3,
    category: '注意力',
    text: '当别人直接对我说话时，我发现自己可能在走神',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 4,
    category: '注意力',
    text: '我经常在组织任务或项目时感到困难，不知道从哪里开始',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 5,
    category: '注意力',
    text: '我经常把东西放在找不到的地方，或忘记要做的事情',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 6,
    category: '注意力',
    text: '我很容易被外界的事物或自己的想法分散注意力',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 7,
    category: '多动',
    text: '我经常坐不住，手脚不停地动来动去',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 8,
    category: '多动',
    text: '在需要安静坐着的场合（如开会、看电影），我很难保持安静',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 9,
    category: '多动',
    text: '我经常感觉内心像有个马达在不停地转，停不下来',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 10,
    category: '冲动',
    text: '我经常在别人还没说完话时就忍不住插嘴或打断',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 11,
    category: '冲动',
    text: '我很难耐心等待轮到自己（如排队、等别人回复）',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 12,
    category: '冲动',
    text: '我经常在没有仔细考虑的情况下就做出决定或采取行动',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 13,
    category: '日常功能',
    text: '我经常拖延开始需要完成的任务，即使知道很重要',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 14,
    category: '日常功能',
    text: '我经常同时开始多个项目，但很难把它们完成',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 15,
    category: '日常功能',
    text: '我经常因为粗心大意而在工作或学习中犯错',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 16,
    category: '情绪',
    text: '我的情绪变化很快，容易从兴奋变成沮丧',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 17,
    category: '情绪',
    text: '我经常对感兴趣的事情过度投入，但很快又失去兴趣',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  },
  {
    id: 18,
    category: '情绪',
    text: '我经常感到内心不安或焦虑，很难真正放松下来',
    options: [
      { label: '从不', value: 0 },
      { label: '很少', value: 1 },
      { label: '有时', value: 2 },
      { label: '经常', value: 3 },
      { label: '非常频繁', value: 4 }
    ]
  }
]

export function useAssessment() {
  const answers = ref({})        // { questionId: optionValue }
  const currentIndex = ref(0)    // 当前题目索引
  const isCompleted = ref(false)  // 是否完成
  const isStarted = ref(false)    // 是否开始

  // 使用 localStorage 保存历史结果
  const { data: savedResult, set: saveResult } = useStorage('assessment_result', null)

  // 当前题目
  const currentQuestion = computed(() => {
    if (currentIndex.value >= questions.length) return null
    return questions[currentIndex.value]
  })

  // 进度百分比
  const progress = computed(() => {
    return Math.round((Object.keys(answers.value).length / questions.length) * 100)
  })

  // 是否可以前进
  const canGoNext = computed(() => {
    return answers.value[currentQuestion.value?.id] !== undefined
  })

  // 是否可以后退
  const canGoPrev = computed(() => {
    return currentIndex.value > 0
  })

  // 已回答数量
  const answeredCount = computed(() => {
    return Object.keys(answers.value).length
  })

  // 总题数
  const totalCount = computed(() => questions.length)

  // 选择答案
  function selectAnswer(questionId, value) {
    answers.value[questionId] = value
  }

  // 下一题
  function nextQuestion() {
    if (currentIndex.value < questions.length - 1) {
      currentIndex.value++
    }
  }

  // 上一题
  function prevQuestion() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  // 开始测试
  function startAssessment() {
    answers.value = {}
    currentIndex.value = 0
    isCompleted.value = false
    isStarted.value = true
  }

  // 提交并计算结果
  function submitAssessment() {
    // 计算各维度得分
    const scores = { attention: 0, hyperactivity: 0, impulsivity: 0, daily: 0, emotion: 0 }
    const counts = { attention: 0, hyperactivity: 0, impulsivity: 0, daily: 0, emotion: 0 }

    questions.forEach(q => {
      const answer = answers.value[q.id] ?? 0
      switch (q.category) {
        case '注意力':
          scores.attention += answer
          counts.attention++
          break
        case '多动':
          scores.hyperactivity += answer
          counts.hyperactivity++
          break
        case '冲动':
          scores.impulsivity += answer
          counts.impulsivity++
          break
        case '日常功能':
          scores.daily += answer
          counts.daily++
          break
        case '情绪':
          scores.emotion += answer
          counts.emotion++
          break
      }
    })

    // 计算总分和平均分
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
    const maxScore = questions.length * 4
    const percentage = Math.round((totalScore / maxScore) * 100)

    // 判定等级
    let level, levelText, levelColor, levelDesc
    if (percentage <= 25) {
      level = 'low'
      levelText = '注意力状态良好'
      levelColor = '#4CAF50'
      levelDesc = '你的自评结果显示注意力状态整体良好，继续保持健康的生活习惯。'
    } else if (percentage <= 50) {
      level = 'medium'
      levelText = '存在轻微注意力挑战'
      levelColor = '#FF9800'
      levelDesc = '你在某些方面可能存在轻微的注意力挑战，建议尝试一些专注力训练方法。'
    } else if (percentage <= 75) {
      level = 'high'
      levelText = '可能存在中度注意力困难'
      levelColor = '#FF6B6B'
      levelDesc = '你的自评结果显示可能存在中度的注意力困难，建议咨询专业医生进行进一步评估。'
    } else {
      level = 'very-high'
      levelText = '建议寻求专业评估'
      levelColor = '#F44336'
      levelDesc = '你的自评结果显示可能存在较明显的注意力困难，强烈建议尽早咨询专业医生。'
    }

    const result = {
      date: new Date().toISOString(),
      totalScore,
      maxScore,
      percentage,
      level,
      levelText,
      levelColor,
      levelDesc,
      dimensions: [
        { name: '注意力', score: scores.attention, max: counts.attention * 4, icon: '🎯' },
        { name: '多动', score: scores.hyperactivity, max: counts.hyperactivity * 4, icon: '🏃' },
        { name: '冲动', score: scores.impulsivity, max: counts.impulsivity * 4, icon: '⚡' },
        { name: '日常功能', score: scores.daily, max: counts.daily * 4, icon: '📋' },
        { name: '情绪', score: scores.emotion, max: counts.emotion * 4, icon: '💭' }
      ]
    }

    isCompleted.value = true
    saveResult(result)
    return result
  }

  // 重新测试
  function retakeAssessment() {
    isCompleted.value = false
    isStarted.value = false
    answers.value = {}
    currentIndex.value = 0
  }

  return {
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
  }
}
