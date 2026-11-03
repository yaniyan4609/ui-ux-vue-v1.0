<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './components/layout/AppLayout.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import { useTheme } from './composables/useTheme'
import { useThemeColor } from './composables/useThemeColor'

const route = useRoute()
const { initTheme } = useTheme()
const { initThemeColor } = useThemeColor()

onMounted(() => {
  initTheme()
  initThemeColor()
})

const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})
</script>

<template>
  <!-- Halaman Auth (Login / Register): Langsung Tampil dengan Layer 1 & Morphing Layer 2 -->
  <div v-if="isAuthPage">
    <router-view />
    <ToastContainer />
  </div>

  <!-- Halaman Utama Aplikasi: Dibungkus dengan AppLayout Dual-Sidebar & Dasar 2 -->
  <AppLayout v-else>
    <router-view v-slot="{ Component }">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
        mode="out-in"
      >
        <component :is="Component" />
      </Transition>
    </router-view>
  </AppLayout>
</template>
