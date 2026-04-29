<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const text = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

import { computed, ref } from 'vue'

const isExpanded = ref(false)

function onFocus() {
  isExpanded.value = true
}

function onBlur() {
  // 延迟收起，让按钮点击先触发
  setTimeout(() => {
    isExpanded.value = false
  }, 200)
}

function onSubmit() {
  if (text.value.trim()) {
    emit('submit')
  }
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    onSubmit()
  }
}
</script>

<template>
  <div class="brain-dump" :class="{ expanded: isExpanded }">
    <div class="brain-dump-header">
      <span class="brain-dump-icon">🧠</span>
      <span class="brain-dump-title">脑暴输入</span>
      <span class="brain-dump-hint">把想法全倒出来</span>
    </div>
    <div class="brain-dump-input-wrap">
      <textarea
        v-model="text"
        class="brain-dump-input"
        :class="{ expanded: isExpanded }"
        placeholder="随便写点什么...&#10;支持换行、逗号分隔多个任务"
        rows="1"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      ></textarea>
      <button
        v-if="text.trim()"
        class="brain-dump-submit"
        @click="onSubmit"
      >
        添加
      </button>
    </div>
  </div>
</template>

<style scoped>
.brain-dump {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-md) var(--space-lg);
  border: 1.5px dashed var(--border);
  transition: all var(--transition-base);
}

.brain-dump.expanded {
  border-color: var(--primary-border);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.brain-dump-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.brain-dump-icon {
  font-size: 18px;
}

.brain-dump-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.brain-dump-hint {
  font-size: var(--text-xs);
  color: var(--text-hint);
  margin-left: auto;
}

.brain-dump-input-wrap {
  display: flex;
  align-items: flex-end;
  gap: var(--space-sm);
}

.brain-dump-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--text-base);
  font-family: inherit;
  color: var(--text-primary);
  resize: none;
  outline: none;
  line-height: 1.5;
  min-height: 28px;
  max-height: 120px;
  overflow-y: auto;
  padding: var(--space-xs) 0;
}

.brain-dump-input.expanded {
  min-height: 60px;
}

.brain-dump-input::placeholder {
  color: var(--text-hint);
}

.brain-dump-submit {
  flex-shrink: 0;
  padding: var(--space-sm) var(--space-lg);
  background: var(--primary);
  color: var(--text-white);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.brain-dump-submit:active {
  transform: scale(0.95);
}
</style>
