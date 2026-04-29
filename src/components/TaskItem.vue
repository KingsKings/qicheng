<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  timerActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle', 'delete', 'pending', 'start-timer', 'edit', 'decompose'])

// ===== 编辑模式（长按触发） =====
const isEditing = ref(false)
const editName = ref('')
const editDuration = ref(25)
let pressTimer = null
let hasMoved = false

// ===== 计算属性 =====
const isCompleted = computed(() => props.task.completed)

const completionTime = computed(() => {
  if (!props.task.duration || isCompleted.value) return ''
  const seconds = props.task.remainingSeconds ?? props.task.duration * 60
  const now = new Date()
  const target = new Date(now.getTime() + seconds * 1000)
  const h = String(target.getHours()).padStart(2, '0')
  const m = String(target.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
})

const showTimeAnchor = computed(() => {
  return props.task.duration && !isCompleted.value
})

const durationLabel = computed(() => {
  if (!props.task.duration) return ''
  return `${props.task.duration}分钟`
})

// ===== 长按编辑 =====
function onPointerDown(e) {
  hasMoved = false
  pressTimer = setTimeout(() => {
    if (!hasMoved) {
      isEditing.value = true
      editName.value = props.task.name
      editDuration.value = props.task.duration || 25
    }
  }, 500)
}

function onPointerMove() {
  hasMoved = true
}

function onPointerUp() {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

function saveEdit() {
  if (editName.value.trim()) {
    emit('edit', {
      ...props.task,
      name: editName.value.trim(),
      duration: editDuration.value
    })
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

// ===== 事件处理 =====
function onStart() {
  emit('start-timer', props.task.id)
}

function onToggle() {
  emit('toggle', props.task.id)
}

function onDelete() {
  emit('delete', props.task.id)
}

function onPending() {
  emit('pending', props.task.id)
}

function onDecompose() {
  emit('decompose', props.task.id)
}
</script>

<template>
  <div
    class="task-item"
    :class="{
      completed: isCompleted,
      'timer-active': timerActive,
      'is-editing': isEditing
    }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
  >
    <!-- ===== 编辑模式 ===== -->
    <div v-if="isEditing" class="task-item__edit">
      <div class="task-item__edit-row">
        <label class="task-item__edit-label">名称</label>
        <input
          v-model="editName"
          class="task-item__edit-input"
          type="text"
          placeholder="任务名称"
          @keyup.enter="saveEdit"
        />
      </div>
      <div class="task-item__edit-row">
        <label class="task-item__edit-label">时长（分钟）</label>
        <input
          v-model.number="editDuration"
          class="task-item__edit-input"
          type="number"
          min="1"
          max="120"
          placeholder="25"
          @keyup.enter="saveEdit"
        />
      </div>
      <div class="task-item__edit-actions">
        <button class="task-item__save-btn" @click.stop="saveEdit">保存</button>
        <button class="task-item__cancel-btn" @click.stop="cancelEdit">取消</button>
      </div>
    </div>

    <!-- ===== 正常显示模式 ===== -->
    <template v-else>
      <!-- 第一行：开始按钮 + 任务名 + 时长徽章 -->
      <div class="task-item__row">
        <button
          v-if="!isCompleted && !timerActive"
          class="task-item__start-btn"
          title="开始"
          @click.stop="onStart"
        >
          <svg class="task-item__play-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <div v-else-if="timerActive" class="task-item__start-btn task-item__start-btn--active">
          <span class="task-item__pulse-dot"></span>
        </div>
        <div v-else class="task-item__start-btn task-item__start-btn--done">
          <svg class="task-item__check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <span class="task-item__name" :class="{ done: isCompleted }">
          {{ task.name }}
        </span>

        <span v-if="durationLabel" class="task-item__duration-badge">
          {{ durationLabel }}
        </span>
      </div>

      <!-- 第二行：时间锚点 -->
      <div v-if="showTimeAnchor" class="task-item__anchor">
        <span class="task-item__arrow">&rarr;</span>
        <span class="task-item__anchor-time">{{ completionTime }}</span>
        <span class="task-item__anchor-label">完成</span>
      </div>

      <!-- 第三行：操作按钮 -->
      <div class="task-item__actions">
        <button class="task-item__action-btn" title="拆解" @click.stop="onDecompose">
          <svg class="task-item__action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        </button>
        <button
          v-if="!isCompleted"
          class="task-item__action-btn"
          title="稍后做"
          @click.stop="onPending"
        >
          <svg class="task-item__action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
        <button class="task-item__action-btn task-item__action-btn--delete" title="删除" @click.stop="onDelete">
          <svg class="task-item__action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.task-item {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-md) var(--space-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition);
  user-select: none;
  cursor: default;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.task-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* ===== 计时器激活状态 ===== */
.task-item.timer-active {
  border-left: 3px solid var(--primary);
  background: var(--primary-bg);
  box-shadow: 0 0 0 1px var(--primary-border), var(--shadow-sm);
}

.task-item.timer-active:hover {
  box-shadow: 0 0 0 1px var(--primary-border), var(--shadow-md);
}

/* ===== 已完成状态 ===== */
.task-item.completed {
  opacity: 0.5;
}

.task-item.completed:hover {
  opacity: 0.65;
}

/* ===== 编辑状态 ===== */
.task-item.is-editing {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-bg);
}

/* ===== 第一行：开始按钮 + 名称 + 时长 ===== */
.task-item__row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

/* 开始按钮 */
.task-item__start-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--primary);
  color: var(--text-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all var(--transition-fast);
}

.task-item__start-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.08);
}

.task-item__start-btn:active {
  transform: scale(0.95);
}

.task-item__play-icon {
  width: 16px;
  height: 16px;
  margin-left: 2px;
}

/* 计时中按钮 */
.task-item__start-btn--active {
  background: var(--primary);
  cursor: default;
}

.task-item__pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--text-white);
  animation: pulse 1.5s ease-in-out infinite;
}

/* 已完成按钮 */
.task-item__start-btn--done {
  background: var(--success);
  cursor: pointer;
}

.task-item__start-btn--done:hover {
  background: var(--success-light);
}

.task-item__check-icon {
  width: 16px;
  height: 16px;
  color: var(--text-white);
}

/* 任务名称 */
.task-item__name {
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-word;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-item__name.done {
  text-decoration: line-through;
  color: var(--text-hint);
}

/* 时长徽章 */
.task-item__duration-badge {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 10px;
  background: var(--primary-bg);
  color: var(--primary);
  white-space: nowrap;
  line-height: 1.5;
}

/* ===== 第二行：时间锚点 ===== */
.task-item__anchor {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-left: 40px;
  font-size: 12px;
  color: var(--text-hint);
  line-height: 1.5;
}

.task-item__arrow {
  color: var(--primary);
  font-weight: 700;
}

.task-item__anchor-time {
  font-family: ui-monospace, 'SF Mono', Consolas, monospace;
  font-weight: 600;
  color: var(--text-secondary);
}

.task-item__anchor-label {
  color: var(--text-hint);
}

/* ===== 第三行：操作按钮 ===== */
.task-item__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-xs);
  padding-left: 40px;
}

.task-item__action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all var(--transition-fast);
  color: var(--text-tertiary);
}

.task-item__action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.task-item__action-btn:active {
  transform: scale(0.9);
}

.task-item__action-btn--delete:hover {
  background: var(--danger-bg);
  color: var(--danger);
}

.task-item__action-icon {
  width: 16px;
  height: 16px;
}

/* ===== 编辑模式 ===== */
.task-item__edit {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.task-item__edit-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.task-item__edit-label {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  min-width: 80px;
}

.task-item__edit-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--bg-input);
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
  transition: border-color var(--transition-fast);
}

.task-item__edit-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-bg);
}

.task-item__edit-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.task-item__save-btn,
.task-item__cancel-btn {
  padding: 6px 16px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.task-item__save-btn {
  background: var(--primary);
  color: var(--text-white);
}

.task-item__save-btn:hover {
  background: var(--primary-dark);
}

.task-item__save-btn:active {
  transform: scale(0.96);
}

.task-item__cancel-btn {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.task-item__cancel-btn:hover {
  background: var(--bg-active);
}

.task-item__cancel-btn:active {
  transform: scale(0.96);
}

/* ===== 脉冲动画 ===== */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3);
  }
}
</style>
