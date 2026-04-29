<template>
  <Teleport to="body">
    <Transition name="decompose-drawer">
      <div v-if="visible" class="decompose-drawer">
        <div class="decompose-drawer__overlay" @click="$emit('close')"></div>
        <Transition name="decompose-drawer__panel">
          <div v-if="visible" class="decompose-drawer__panel">
            <div class="decompose-drawer__header">
              <h3 class="decompose-drawer__title">拆解「{{ taskName }}」</h3>
              <button class="decompose-drawer__close" @click="$emit('close')">&times;</button>
            </div>

            <div v-if="!suggestions" class="decompose-drawer__empty">
              <div class="decompose-drawer__empty-icon">💡</div>
              <p>暂无拆解建议</p>
              <p class="decompose-drawer__empty-hint">试试把任务描述得更具体一些</p>
            </div>

            <div v-else class="decompose-drawer__list">
              <div
                v-for="(step, index) in suggestions"
                :key="index"
                class="decompose-drawer__item"
                :class="{ 'decompose-drawer__item--added': addedSteps.has(index) }"
              >
                <div class="decompose-drawer__item-left">
                  <span class="decompose-drawer__item-num">{{ index + 1 }}</span>
                  <span class="decompose-drawer__item-text">{{ step }}</span>
                </div>
                <button
                  class="decompose-drawer__add-btn"
                  :class="{ 'decompose-drawer__add-btn--done': addedSteps.has(index) }"
                  :disabled="addedSteps.has(index)"
                  @click="onAddStep(step, index)"
                >
                  {{ addedSteps.has(index) ? '已添加 ✓' : '添加' }}
                </button>
              </div>
            </div>

            <div v-if="suggestions && addedCount > 0" class="decompose-drawer__footer">
              <p class="decompose-drawer__footer-text">
                已添加 {{ addedCount }} 个子任务到列表
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getDecomposition } from '../data/mockData'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  taskName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'add-task'])

const visible = computed(() => props.show)
const addedSteps = ref(new Set())

const suggestions = computed(() => {
  if (!props.taskName) return null
  return getDecomposition(props.taskName)
})

const addedCount = computed(() => addedSteps.value.size)

function onAddStep(stepName, index) {
  if (addedSteps.value.has(index)) return
  addedSteps.value.add(index)
  emit('add-task', stepName)
}
</script>

<style scoped>
.decompose-drawer {
  position: fixed;
  inset: 0;
  z-index: 800;
}

.decompose-drawer__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
}

.decompose-drawer__panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 70vh;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

.decompose-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.decompose-drawer__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.decompose-drawer__close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.decompose-drawer__close:hover {
  background: var(--border);
}

.decompose-drawer__empty {
  text-align: center;
  padding: 32px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.decompose-drawer__empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.decompose-drawer__empty-hint {
  font-size: 12px;
  color: var(--text-hint);
  margin-top: 4px;
}

.decompose-drawer__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.decompose-drawer__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  transition: all 0.2s;
}

.decompose-drawer__item--added {
  background: rgba(76, 175, 80, 0.05);
  border-color: rgba(76, 175, 80, 0.2);
}

.decompose-drawer__item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.decompose-drawer__item-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-bg);
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.decompose-drawer__item--added .decompose-drawer__item-num {
  background: rgba(76, 175, 80, 0.15);
  color: var(--success);
}

.decompose-drawer__item-text {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.decompose-drawer__item--added .decompose-drawer__item-text {
  color: var(--text-hint);
}

.decompose-drawer__add-btn {
  padding: 6px 16px;
  border: 1px solid var(--primary);
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}

.decompose-drawer__add-btn:hover {
  opacity: 0.85;
}

.decompose-drawer__add-btn--done {
  background: transparent;
  border-color: rgba(76, 175, 80, 0.3);
  color: var(--success);
  cursor: default;
}

.decompose-drawer__footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
  text-align: center;
}

.decompose-drawer__footer-text {
  font-size: 13px;
  color: var(--success);
  font-weight: 500;
  margin: 0;
}

/* 过渡动画 */
.decompose-drawer-enter-active {
  transition: opacity 0.3s ease;
}

.decompose-drawer-leave-active {
  transition: opacity 0.2s ease;
}

.decompose-drawer-enter-from,
.decompose-drawer-leave-to {
  opacity: 0;
}

.decompose-drawer__panel-enter-active {
  transition: transform 0.3s ease;
}

.decompose-drawer__panel-leave-active {
  transition: transform 0.2s ease;
}

.decompose-drawer__panel-enter-from,
.decompose-drawer__panel-leave-to {
  transform: translateY(100%);
}
</style>
