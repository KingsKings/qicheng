<template>
  <div class="quick-add">
    <button
      v-for="preset in presets"
      :key="preset.duration"
      class="quick-add__btn"
      @click="onAddPreset(preset)"
    >
      {{ preset.label }}
    </button>
    <button v-if="!showCustom" class="quick-add__btn quick-add__btn--custom" @click="showCustom = true">
      自定义
    </button>
    <Transition name="quick-add__expand">
      <div v-if="showCustom" class="quick-add__custom">
        <input
          v-model="customName"
          class="quick-add__input"
          type="text"
          placeholder="任务名称"
          @keyup.enter="addCustom"
        />
        <input
          v-model.number="customDuration"
          class="quick-add__input quick-add__input--short"
          type="number"
          min="1"
          max="120"
          placeholder="分钟"
          @keyup.enter="addCustom"
        />
        <button class="quick-add__btn quick-add__btn--go" @click="addCustom">开始</button>
        <button class="quick-add__btn quick-add__btn--cancel" @click="showCustom = false">取消</button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['add'])

const showCustom = ref(false)
const customName = ref('')
const customDuration = ref(25)

const presets = [
  { label: '2分钟', name: '快速任务', duration: 2 },
  { label: '5分钟', name: '小任务', duration: 5 },
  { label: '15分钟', name: '中等任务', duration: 15 },
]

function onAddPreset(preset) {
  emit('add', preset.name, preset.duration)
}

function addCustom() {
  if (!customName.value.trim() || !customDuration.value || customDuration.value < 1) return
  emit('add', customName.value.trim(), customDuration.value)
  customName.value = ''
  customDuration.value = 25
  showCustom.value = false
}
</script>

<style scoped>
.quick-add {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.quick-add__btn {
  padding: 8px 18px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.quick-add__btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-bg);
}

.quick-add__btn:active {
  transform: scale(0.96);
}

.quick-add__btn--custom {
  border-style: dashed;
  color: var(--text-secondary);
}

.quick-add__custom {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
}

.quick-add__input {
  padding: 8px 12px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  font-size: 14px;
  background: var(--bg-card);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
  min-width: 120px;
}

.quick-add__input:focus {
  border-color: var(--primary);
}

.quick-add__input--short {
  min-width: 80px;
  width: 80px;
}

.quick-add__btn--go {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.quick-add__btn--go:hover {
  opacity: 0.85;
  color: #fff;
}

.quick-add__btn--cancel {
  color: var(--text-secondary);
  font-size: 13px;
}

/* 展开动画 */
.quick-add__expand-enter-active {
  transition: all 0.25s ease;
}

.quick-add__expand-leave-active {
  transition: all 0.2s ease;
}

.quick-add__expand-enter-from,
.quick-add__expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
