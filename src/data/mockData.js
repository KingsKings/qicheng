/**
 * mockData - 演示用模拟数据
 *
 * 包含:
 *   - 示例任务（新用户引导）
 *   - 微任务建议（不知道做什么按钮）
 *   - 每日鼓励语录
 *   - 任务分解模板
 */

/** 示例任务 - 用于新用户引导 */
export const exampleTasks = [
  {
    name: '喝一杯水',
    duration: 2
  },
  {
    name: '伸个懒腰',
    duration: 2
  },
  {
    name: '回一条消息',
    duration: 5
  }
]

/** 微任务建议 - "不知道做什么"按钮随机推荐 */
export const microTaskSuggestions = [
  '站起来走动2分钟',
  '深呼吸3次',
  '整理桌面上的一个东西',
  '喝一杯水',
  '看窗外30秒',
  '伸个懒腰',
  '给植物浇水',
  '整理手机桌面',
  '写下一件开心的事',
  '听一首喜欢的歌'
]

/**
 * 随机获取一条微任务建议
 * @returns {string} 随机微任务
 */
export function getRandomMicroTask() {
  const index = Math.floor(Math.random() * microTaskSuggestions.length)
  return microTaskSuggestions[index]
}

/** 每日鼓励语录 */
export const dailyQuotes = [
  '新的一天，不需要完美，只需要开始',
  '你不需要做完所有事，做一件就很好',
  '每一步都算数，即使是很小的一步',
  '休息也是进步的一部分',
  '今天能打开这个应用，已经很棒了',
  '慢慢来，比较快',
  '你比你想象的更有能力',
  '完成比完美更重要',
  '给自己一点耐心',
  '你值得为自己花时间',
  '每一次尝试都是勇敢的表现',
  '不完美也没关系，重要的是你在行动',
  '今天的小努力，是明天的积累',
  '允许自己慢慢来，你已经在路上了',
  '你的存在本身就是一件有意义的事'
]

/**
 * 获取今日鼓励语录（基于日期，每天不同）
 * @returns {string} 今日语录
 */
export function getDailyQuote() {
  const today = new Date()
  // 用日期作为种子，确保同一天显示同一条
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  )
  const index = dayOfYear % dailyQuotes.length
  return dailyQuotes[index]
}

/**
 * 随机获取一条鼓励语录
 * @returns {string} 随机语录
 */
export function getRandomQuote() {
  const index = Math.floor(Math.random() * dailyQuotes.length)
  return dailyQuotes[index]
}

/** 任务分解模板 - 帮助用户将大任务拆分为小步骤 */
export const decompositionTemplates = {
  '写周报': [
    '打开周报模板',
    '列出本周完成的3件事',
    '写总结和下周计划'
  ],
  '打扫房间': [
    '先整理桌面',
    '收起脏衣服',
    '扫地或拖地'
  ],
  '运动': [
    '换上运动服',
    '做5分钟热身',
    '运动15分钟'
  ],
  '做饭': [
    '决定吃什么',
    '拿出需要的食材',
    '开始烹饪'
  ],
  '学习': [
    '打开学习材料',
    '阅读10分钟',
    '做一个小练习'
  ],
  '整理文件': [
    '打开文件夹',
    '删除不需要的文件',
    '把文件分类归档'
  ]
}

/**
 * 获取任务分解建议
 * @param {string} taskName - 任务名称
 * @returns {Array<string>|null} 分解步骤，无匹配时返回 null
 */
export function getDecomposition(taskName) {
  // 精确匹配
  if (decompositionTemplates[taskName]) {
    return decompositionTemplates[taskName]
  }

  // 模糊匹配：检查任务名是否包含模板的关键词
  for (const [key, steps] of Object.entries(decompositionTemplates)) {
    if (taskName.includes(key) || key.includes(taskName)) {
      return steps
    }
  }

  return null
}

/**
 * 获取所有可用的分解模板名称
 * @returns {Array<string>} 模板名称列表
 */
export function getTemplateNames() {
  return Object.keys(decompositionTemplates)
}
