<template>
  <Teleport to="body">
    <Transition name="pending-drawer">
      <div v-if="visible" class="pending-drawer">
        <div class="pending-drawer__overlay" @click="$emit('close')"></div>
        <Transition name="pending-drawer__panel">
          <div v-if="visible" class="pending-drawer__panel">
            <div class="pending-drawer__header">
              <h3 class="pending-drawer__title">稍后做</h3>
              <button class="pending-drawer__close" @click="$emit('close')">&times;</button>
            </div>

            <div v-if="pendingTasks.length === 0" class="pending-drawer__empty">
              <p>暂无待设置的任务</p>
            </div>

            <div class="pending-drawer__list">
              <div
                v-for="task in pendingTasks"
                :key="task.id"
                class="pending-drawer__item"
              >
                <span class="pending-drawer__item-name">{{ task.name }}</span>

                <!-- 时长选择 -->
                <div v-if="!task.duration" class="pending-drawer__duration-picker">
                  <button
                    v-for="d in durationPresets"
                    :key="d"
                    class="pending-drawer__duration-btn"
                    @click="$emit('setDuration', { taskId: task.id, duration: d })"
                  >
                    {{ d }}分钟
                  </button>
                </div>

                <div class="pending-drawer__item-actions">
                  <button
                    v-if="task.duration"
                    class="pending-drawer__start-btn"
                    @click="$emit('restore', task.id)"
                  >
                    拉回任务列表
                  </button>
                  <button
                    class="pending-drawer__delete-btn"
                    @click="$emit('delete', task.id)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  tasks: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['restore', 'delete', 'setDuration', 'close'])

const visible = computed(() => props.show)

// 直接使用传入的 tasks，不再二次过滤
const pendingTasks = computed(() => props.tasks || [])

const durationPresets = [2, 5, 10, 15, 25, 30]
</script>

<style scoped>
.pending-drawer {
  position: fixed;
  inset: 0;
  z-index: 800;
}

.pending-drawer__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
}

.pending-drawer__panel {
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

.pending-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pending-drawer__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.pending-drawer__close {
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

.pending-drawer__close:hover {
  background: var(--border);
}

.pending-drawer__empty {
  text-align: center;
  padding: 32px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.pending-drawer__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pending-drawer__item {
  padding: 14px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pending-drawer__item-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 15px;
}

.pending-drawer__duration-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pending-drawer__duration-btn {
  padding: 4px 12px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.pending-drawer__duration-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-bg);
}

.pending-drawer__item-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pending-drawer__start-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.pending-drawer__start-btn:hover {
  opacity: 0.85;
}

.pending-drawer__pull-btn {
  padding: 6px 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.pending-drawer__pull-btn:hover {
  background: var(--bg-hover);
}

.pending-drawer__delete-btn {
  padding: 6px 16px;
  border: 1px solid var(--danger-bg);
  border-radius: 8px;
  background: transparent;
  color: var(--danger);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.pending-drawer__delete-btn:hover {
  background: var(--danger-bg);
}

/* 遮罩层过渡 */
.pending-drawer-enter-active {
  transition: opacity 0.3s ease;
}

.pending-drawer-leave-active {
  transition: opacity 0.2s ease;
}

.pending-drawer-enter-from,
.pending-drawer-leave-to {
  opacity: 0;
}

/* 面板滑入过渡 */
.pending-drawer__panel-enter-active {
  transition: transform 0.3s ease;
}

.pending-drawer__panel-leave-active {
  transition: transform 0.2s ease;
}

.pending-drawer__panel-enter-from,
.pending-drawer__panel-leave-to {
  transform: translateY(100%);
}
</style>
