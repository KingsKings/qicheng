/**
 * useStorage - localStorage 响应式存储组合式函数
 *
 * 用法:
 *   const tasks = useStorage('adhd_tasks', [])
 *   const settings = useStorage('adhd_settings', { darkMode: false })
 *
 * 特性:
 *   - 初始化时从 localStorage 读取
 *   - 数据变化时自动保存到 localStorage
 *   - 返回响应式 ref
 */
import { ref, watch } from 'vue'

/**
 * 创建一个与 localStorage 同步的响应式 ref
 * @param {string} key - localStorage 的键名
 * @param {*} defaultValue - 默认值（localStorage 中无数据时使用）
 * @returns {import('vue').Ref} 响应式 ref
 */
export function useStorage(key, defaultValue) {
  // 尝试从 localStorage 读取已存储的值
  const stored = localStorage.getItem(key)
  let parsedValue = defaultValue

  if (stored !== null) {
    try {
      parsedValue = JSON.parse(stored)
    } catch (e) {
      console.warn(`[useStorage] 解析 localStorage key "${key}" 失败，使用默认值:`, e)
      parsedValue = defaultValue
    }
  }

  // 创建响应式 ref
  const data = ref(parsedValue)

  // 监听数据变化，自动保存到 localStorage
  watch(
    data,
    (newValue) => {
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch (e) {
        console.error(`[useStorage] 保存 localStorage key "${key}" 失败:`, e)
      }
    },
    { deep: true }
  )

  return data
}
