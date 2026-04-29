<script setup>
import { computed } from 'vue'
import TaskItem from './TaskItem.vue'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  },
  currentTimerTaskId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['toggle', 'delete', 'pending', 'start-timer', 'decompose'])

const activeTasks = computed(() => props.tasks.filter(t => !t.completed && !t.pending))
const completedTasks = computed(() => props.tasks.filter(t => t.completed))
</script>

<template>
  <div class="task-list">
    <!-- 进行中的任务 -->
    <div v-if="activeTasks.length > 0" class="task-section">
      <div class="section-header">
        <span class="section-title">进行中</span>
        <span class="section-count">{{ activeTasks.length }}</span>
      </div>
      <div class="task-items">
        <TaskItem
          v-for="task in activeTasks"
          :key="task.id"
          :task="task"
          :timer-active="currentTimerTaskId === task.id"
          @toggle="emit('toggle', $event)"
          @delete="emit('delete', $event)"
          @pending="emit('pending', $event)"
          @start-timer="emit('start-timer', $event)"
          @decompose="emit('decompose', $event)"
        />
      </div>
    </div>

    <!-- 已完成的任务 -->
    <div v-if="completedTasks.length > 0" class="task-section">
      <div class="section-header">
        <span class="section-title">已完成</span>
        <span class="section-count done">{{ completedTasks.length }}</span>
      </div>
      <div class="task-items">
        <TaskItem
          v-for="task in completedTasks"
          :key="task.id"
          :task="task"
          @toggle="emit('toggle', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="tasks.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p class="empty-text">还没有任务</p>
      <p class="empty-hint">在上方脑暴输入框中添加你的第一个任务吧</p>
    </div>
  </div>
</template>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.task-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--space-xs);
}

.section-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.section-count {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-bg);
  padding: 1px 8px;
  border-radius: var(--radius-full);
}

.section-count.done {
  color: var(--success);
  background: rgba(0, 184, 148, 0.1);
}

.task-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-3xl) var(--space-xl);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--space-lg);
  animation: bounce 2s infinite;
}

.empty-text {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.empty-hint {
  font-size: var(--text-sm);
  color: var(--text-hint);
  max-width: 240px;
}
</style>
