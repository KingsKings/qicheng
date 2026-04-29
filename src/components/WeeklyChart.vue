<script setup>
const props = defineProps({
  weeklyData: {
    type: Array,
    default: () => []
  }
})

const maxCount = computed(() => {
  if (props.weeklyData.length === 0) return 1
  return Math.max(1, ...props.weeklyData.map(d => d.count))
})

import { computed } from 'vue'
</script>

<template>
  <div class="weekly-chart">
    <div class="chart-title">本周回顾</div>
    <div class="chart-bars">
      <div
        v-for="day in weeklyData"
        :key="day.key"
        class="chart-bar-col"
      >
        <div class="chart-bar-track">
          <div
            class="chart-bar-fill"
            :style="{
              height: (day.count / maxCount * 100) + '%',
              background: day.count > 0 ? 'var(--primary)' : 'var(--border-light)'
            }"
          >
            <span v-if="day.count > 0" class="chart-bar-value">{{ day.count }}</span>
          </div>
        </div>
        <span class="chart-bar-label">{{ day.label }}</span>
        <span class="chart-bar-date">{{ day.shortLabel }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weekly-chart {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  border: 1px solid var(--border-light);
}

.chart-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-lg);
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-sm);
  height: 140px;
}

.chart-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  height: 100%;
}

.chart-bar-track {
  flex: 1;
  width: 100%;
  max-width: 36px;
  background: var(--border-light);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.chart-bar-fill {
  width: 100%;
  min-height: 4px;
  border-radius: var(--radius-sm);
  transition: height 0.6s ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
}

.chart-bar-value {
  font-size: 10px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.chart-bar-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
}

.chart-bar-date {
  font-size: 10px;
  color: var(--text-hint);
}
</style>
