<template>
  <div
    class="task-card"
    :class="{ 'task-card--editing': isEditing }"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
  >
    <!-- 正常显示模式 -->
    <div v-if="!isEditing" class="task-card__content">
      <div class="task-card__info">
        <span class="task-card__name">{{ task.name }}</span>
        <span class="task-card__duration">{{ task.duration }}分钟</span>
      </div>
      <div class="task-card__anchor">
        <span class="task-card__arrow">&rarr;</span>
        <span class="task-card__time">{{ completionTime }}</span>
        <span class="task-card__label">完成</span>
      </div>
      <div class="task-card__actions">
        <button class="task-card__btn task-card__btn--start" @click.stop="$emit('start', task)" title="开始">
          &#9654;
        </button>
        <button class="task-card__btn task-card__btn--decompose" @click.stop="$emit('decompose', task)" title="分解">
          &#128161;
        </button>
        <button class="task-card__btn task-card__btn--later" @click.stop="$emit('later', task)" title="稍后">
          &#9203;
        </button>
        <button class="task-card__btn task-card__btn--delete" @click.stop="$emit('delete', task)" title="删除">
          &#128465;
        </button>
      </div>
    </div>

    <!-- 编辑模式 -->
    <div v-else class="task-card__edit">
      <div class="task-card__edit-row">
        <label class="task-card__label">名称</label>
        <input
          v-model="editName"
          class="task-card__input"
          type="text"
          placeholder="任务名称"
        />
      </div>
      <div class="task-card__edit-row">
        <label class="task-card__label">时长（分钟）</label>
        <input
          v-model.number="editDuration"
          class="task-card__input"
          type="number"
          min="1"
          max="120"
          placeholder="25"
        />
      </div>
      <div class="task-card__edit-actions">
        <button class="task-card__save-btn" @click.stop="saveEdit">保存</button>
        <button class="task-card__cancel-btn" @click.stop="cancelEdit">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['start', 'delete', 'edit', 'decompose', 'later'])

const isEditing = ref(false)
const editName = ref('')
const editDuration = ref(25)

let pressTimer = null
let hasMoved = false

const completionTime = computed(() => {
  const seconds = props.task.remainingSeconds ?? props.task.duration * 60
  const now = new Date()
  const target = new Date(now.getTime() + seconds * 1000)
  const h = String(target.getHours()).padStart(2, '0')
  const m = String(target.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
})

function onPointerDown(e) {
  hasMoved = false
  pressTimer = setTimeout(() => {
    if (!hasMoved) {
      isEditing.value = true
      editName.value = props.task.name
      editDuration.value = props.task.duration
    }
  }, 500)
}

function onPointerUp() {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

function saveEdit() {
  emit('edit', {
    ...props.task,
    name: editName.value,
    duration: editDuration.value,
  })
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}
</script>

<style scoped>
.task-card {
  background: var(--bg, #fff);
  border: 1px solid var(--border, #e5e4e7);
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s, transform 0.15s;
  user-select: none;
  cursor: default;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.task-card--editing {
  border-color: var(--accent, #aa3bff);
  box-shadow: 0 0 0 2px var(--accent-bg, rgba(170, 59, 255, 0.15));
}

.task-card__content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-card__info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.task-card__name {
  font-weight: 500;
  color: var(--text-h, #08060d);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-card__duration {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--accent-bg, rgba(170, 59, 255, 0.1));
  color: var(--accent, #aa3bff);
  white-space: nowrap;
  font-weight: 500;
}

.task-card__anchor {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text, #6b6375);
  white-space: nowrap;
}

.task-card__arrow {
  color: var(--accent, #aa3bff);
  font-weight: bold;
}

.task-card__time {
  font-family: var(--mono, ui-monospace, Consolas, monospace);
  font-weight: 600;
  color: var(--text-h, #08060d);
}

.task-card__actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.task-card__btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, transform 0.1s;
}

.task-card__btn:hover {
  background: var(--code-bg, #f4f3ec);
}

.task-card__btn:active {
  transform: scale(0.92);
}

.task-card__btn--start {
  background: var(--accent-bg, rgba(170, 59, 255, 0.1));
  color: var(--accent, #aa3bff);
  font-size: 12px;
}

.task-card__btn--start:hover {
  background: var(--accent, #aa3bff);
  color: #fff;
}

.task-card__btn--delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* 编辑模式 */
.task-card__edit {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-card__edit-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-card__label {
  font-size: 13px;
  color: var(--text, #6b6375);
  white-space: nowrap;
  min-width: 80px;
}

.task-card__input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border, #e5e4e7);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg, #fff);
  color: var(--text-h, #08060d);
  outline: none;
  transition: border-color 0.2s;
}

.task-card__input:focus {
  border-color: var(--accent, #aa3bff);
}

.task-card__edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.task-card__save-btn,
.task-card__cancel-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.task-card__save-btn {
  background: var(--accent, #aa3bff);
  color: #fff;
}

.task-card__save-btn:hover {
  opacity: 0.85;
}

.task-card__cancel-btn {
  background: var(--code-bg, #f4f3ec);
  color: var(--text, #6b6375);
}

.task-card__cancel-btn:hover {
  opacity: 0.75;
}
</style>
