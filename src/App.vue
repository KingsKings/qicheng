<script setup>
import { ref, provide, watch, onMounted } from 'vue'
import { useSettings } from './composables/useSettings'
import TaskPage from './views/TaskPage.vue'
import MeditationPage from './views/MeditationPage.vue'
import AchievementPage from './views/AchievementPage.vue'
import SettingsPage from './views/SettingsPage.vue'
import Toast from './components/Toast.vue'
import OnboardingOverlay from './components/OnboardingOverlay.vue'

// 页面路由
const currentPage = ref('tasks')

// 设置
const { darkMode, onboarded, setOnboarded } = useSettings()

// 深色模式
watch(darkMode, (val) => {
  if (val) {
    document.body.classList.add('dark')
  } else {
    document.body.classList.remove('dark')
  }
}, { immediate: true })

// Toast 系统
const toasts = ref([])
let toastId = 0

function showToast(message, type = 'info', duration = 2500) {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}

provide('toasts', toasts)
provide('showToast', showToast)

// 引导页
const showOnboarding = ref(false)

onMounted(() => {
  if (!onboarded.value) {
    showOnboarding.value = true
  }
})

function onOnboardingDone() {
  showOnboarding.value = false
  setOnboarded()
}

function onSwitchPage(page) {
  currentPage.value = page
}
</script>

<template>
  <div class="app">
    <!-- 页面内容 -->
    <main class="main-content">
      <Transition name="fade" mode="out-in">
        <TaskPage
          v-if="currentPage === 'tasks'"
          key="tasks"
          @switch-page="onSwitchPage"
        />
        <MeditationPage
          v-else-if="currentPage === 'meditation'"
          key="meditation"
          @switch-page="onSwitchPage"
        />
        <AchievementPage
          v-else-if="currentPage === 'achievements'"
          key="achievements"
          @switch-page="onSwitchPage"
        />
        <SettingsPage
          v-else-if="currentPage === 'settings'"
          key="settings"
          @switch-page="onSwitchPage"
        />
      </Transition>
    </main>

    <!-- 全局 Toast -->
    <Toast />

    <!-- 引导页 -->
    <OnboardingOverlay
      :show="showOnboarding"
      @done="onOnboardingDone"
    />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-page);
}

.main-content {
  flex: 1;
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
  padding: var(--space-lg);
  padding-bottom: calc(var(--nav-height) + var(--space-xl) + var(--safe-bottom));
}
</style>
