<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { menuItems } from '../../data/menuData'
import { useBackground } from '../../composables/useBackground'
import Header from './Header.vue'
import PrimarySidebar from './PrimarySidebar.vue'
import SubmenuSidebar from './SubmenuSidebar.vue'
import ToastContainer from '../ui/ToastContainer.vue'
import BaseCommandPalette from '../ui/BaseCommandPalette.vue'
import { ChevronRight } from 'lucide-vue-next'

const route = useRoute()
const { bgType, solidColor, imageUrl, initBackground } = useBackground()

const submenuCollapsed = ref(false)
const mobileDrawerOpen = ref(false)
const isCommandPaletteOpen = ref(false)

onMounted(() => {
  initBackground()
})

const activeMenuId = computed(() => {
  if (route.path.startsWith('/pesanan')) {
    return 'pesanan'
  }
  if (route.path.startsWith('/data')) {
    return 'data'
  }
  if (route.path.startsWith('/setting')) {
    return 'setting'
  }
  return 'beranda'
})

const currentMenuItem = computed(() => {
  return menuItems.find((m) => m.id === activeMenuId.value) || menuItems[0]
})

const toggleSubmenu = () => {
  submenuCollapsed.value = !submenuCollapsed.value
}

// Mobile Menu Selection Logic
const handleMobileMenuSelect = (menuId) => {
  const item = menuItems.find((m) => m.id === menuId)
  // Bila menu tidak memiliki submenu (seperti Beranda), langsung tutup drawer
  if (!item?.submenus || item.submenus.length === 0) {
    mobileDrawerOpen.value = false
  }
}

// Background Style for "Dasar Pertama"
const baseLayerStyle = computed(() => {
  if (bgType.value === 'solid') {
    return { backgroundColor: solidColor.value }
  }
  if (bgType.value === 'image') {
    return {
      backgroundImage: `url(${imageUrl.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return {}
})
</script>

<template>
  <!-- ======================================================== -->
  <!-- 1. DASAR PERTAMA (Base Layer 1 - Backdrop Luar)          -->
  <!-- Switchable: grid, dots, solid, image                      -->
  <!-- Pure Neutral Dark: #09090b (Zero Blue Tint)               -->
  <!-- ======================================================== -->
  <div
    class="min-h-screen h-screen overflow-hidden flex flex-col relative select-none"
    :class="[
      bgType === 'grid' ? 'bg-grid-pattern' : '',
      bgType === 'dots' ? 'bg-dots-pattern' : '',
      bgType !== 'solid' && bgType !== 'image' ? 'bg-neutral-100 dark:bg-[#09090b] text-neutral-800 dark:text-[#f4f4f5]' : 'text-neutral-800 dark:text-[#f4f4f5]',
    ]"
    :style="baseLayerStyle"
  >
    <!-- Topbar: Logo | Digaji.id di kiri, Theme Icon | Lonceng | Profile di kanan -->
    <Header @open-search="isCommandPaletteOpen = true" />

    <!-- ======================================================== -->
    <!-- 2. DASAR KEDUA (Layer 2 - Floating Card Besar)           -->
    <!-- Mobile: rounded-t-[32px] mepet kanan-kiri                 -->
    <!-- Desktop: Super mepet (px-1 / px-2) & rounded-2xl/3xl      -->
    <!-- Pure Neutral Dark: bg-[#121214] border-[#27272a]          -->
    <!-- ======================================================== -->
    <div class="flex-1 min-h-0 p-0 sm:px-1.5 md:px-2 lg:px-2.5 sm:pb-2 flex flex-col overflow-hidden">
      <div
        class="flex-1 min-h-0 flex overflow-hidden w-full rounded-t-[32px] sm:rounded-2xl lg:rounded-3xl border-t-2 sm:border-2 border-neutral-300 dark:border-[#27272a] border-x-0 sm:border-x-2 border-b-0 sm:border-b-2 bg-white dark:bg-[#121214] shadow-xl relative"
      >
        <!-- Kolom MENU (Primary Rail: Beranda & Setting) -->
        <PrimarySidebar
          :items="menuItems"
          :active-id="activeMenuId"
          :submenu-collapsed="submenuCollapsed"
          @open-submenu="submenuCollapsed = false"
          class="hidden lg:flex"
        />

        <!-- Kolom SUBMENU (Muncul bila menu memiliki sub-items, e.g. Setting) -->
        <SubmenuSidebar
          v-if="currentMenuItem.submenus && currentMenuItem.submenus.length > 0"
          :submenus="currentMenuItem.submenus"
          :menu-title="currentMenuItem.label"
          :collapsed="submenuCollapsed"
          @toggle-collapse="toggleSubmenu"
          class="hidden lg:flex"
        />

        <!-- Floating button icon ">" di antara garis pembatas menu dan sub menu -->
        <button
          v-if="submenuCollapsed && currentMenuItem.submenus && currentMenuItem.submenus.length > 0"
          type="button"
          @click="toggleSubmenu"
          class="hidden lg:flex absolute left-20 sm:left-22 top-7 -translate-x-1/2 z-30 w-6 h-6 rounded-full items-center justify-center bg-white dark:bg-[#18181b] border border-neutral-300 dark:border-[#27272a] shadow-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#222226] transition-all hover:scale-110 cursor-pointer"
          title="Buka Submenu"
          aria-label="Buka Submenu"
        >
          <ChevronRight class="w-3.5 h-3.5" />
        </button>

        <!-- Area Content (Main Class Content Area - Pure Neutral Dark: #0c0c0e) -->
        <main
          class="flex-1 min-h-0 flex flex-col p-3.5 sm:p-5 lg:p-6 bg-neutral-50/60 dark:bg-[#0c0c0e] text-neutral-800 dark:text-[#f4f4f5]"
          :class="activeMenuId === 'data' ? 'overflow-hidden' : 'overflow-y-auto'"
        >
          <slot />
        </main>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 1. MOBILE BACKDROP OVERLAY (FADE TRANSITION)             -->
    <!-- ======================================================== -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-250 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileDrawerOpen"
        class="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        @click="mobileDrawerOpen = false"
      />
    </Transition>

    <!-- ======================================================== -->
    <!-- 2. MOBILE DRAWER PANEL (PERSIS WIREFRAME 1)              -->
    <!-- Mepet Atas-Bawah (inset-y-0 h-full) + Slide X Animasi    -->
    <!-- Geser ke Kanan untuk Buka, Geser ke Kiri untuk Menutup   -->
    <!-- ======================================================== -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="mobileDrawerOpen"
        class="lg:hidden fixed inset-y-0 left-0 z-50 flex shadow-2xl h-full rounded-r-[32px] sm:rounded-r-[36px] border-r-2 border-neutral-300 dark:border-[#2e2e34] bg-white dark:bg-[#121214] select-none overflow-hidden max-w-[calc(100vw-24px)]"
      >
        <!-- Left Column: Capsule "MENU" Pill (Rounded Top & Bottom persis Wireframe 1) -->
        <PrimarySidebar
          :items="menuItems"
          :active-id="activeMenuId"
          capsule
          @select="handleMobileMenuSelect"
        />

        <!-- Right Column: "SUBMENU" Inside the Same Outer Rounded Card -->
        <SubmenuSidebar
          v-if="currentMenuItem.submenus && currentMenuItem.submenus.length > 0"
          :submenus="currentMenuItem.submenus"
          :menu-title="currentMenuItem.label"
          :collapsed="false"
          drawer-mode
          @toggle-collapse="mobileDrawerOpen = false"
          @navigate="mobileDrawerOpen = false"
        />
      </div>
    </Transition>

    <!-- ======================================================== -->
    <!-- 3. FLOATING SIDEBAR TOGGLE BUTTON DI BAWAH KIRI          -->
    <!-- Icon Panel Sidebar Persis Gambar 2 (PanelLeftClose/Open) -->
    <!-- ======================================================== -->
    <button
      type="button"
      @click="mobileDrawerOpen = !mobileDrawerOpen"
      class="lg:hidden fixed bottom-7 left-6 sm:bottom-8 sm:left-7 z-60 w-11 h-11 rounded-2xl border-2 border-neutral-300 dark:border-[#383842] bg-white dark:bg-[#18181b] shadow-xl text-neutral-800 dark:text-neutral-100 flex items-center justify-center cursor-pointer active:scale-90 transition-all select-none hover:border-neutral-400 dark:hover:border-neutral-500"
      :class="mobileDrawerOpen ? 'ring-2 ring-[var(--theme-primary)] text-[var(--theme-primary)]' : ''"
      title="Buka/Tutup Sidebar"
      aria-label="Toggle Sidebar"
    >
      <!-- Saat terbuka: Icon persis Gambar 2 (media_1793628109257_5bee3696.png: divider di kiri + chevron <) -->
      <svg
        v-if="mobileDrawerOpen"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-6 h-6 text-[var(--theme-primary)] transition-transform duration-200"
      >
        <rect x="3" y="3" width="18" height="18" rx="4.5" />
        <line x1="8" y1="3" x2="8" y2="21" />
        <path d="M15.5 8.5 L12 12 L15.5 15.5" />
      </svg>

      <!-- Saat tertutup: Icon persis Gambar 1 (media_1793627647321_a56e7b01.png: chevron > + divider di kanan) -->
      <svg
        v-else
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-6 h-6 text-neutral-800 dark:text-neutral-100 transition-transform duration-200"
      >
        <rect x="3" y="3" width="18" height="18" rx="4.5" />
        <line x1="16" y1="3" x2="16" y2="21" />
        <path d="M8.5 8.5 L12 12 L8.5 15.5" />
      </svg>
    </button>

    <!-- Global Toast Component -->
    <ToastContainer />

    <!-- Global Command Palette (Ctrl + K) -->
    <BaseCommandPalette v-model="isCommandPaletteOpen" />
  </div>
</template>
