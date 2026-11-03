<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { menuItems } from '../../data/menuData'
import { useBackground } from '../../composables/useBackground'
import { useAuth } from '../../composables/useAuth'
import { useToast } from '../../composables/useToast'
import Header from './Header.vue'
import PrimarySidebar from './PrimarySidebar.vue'
import SubmenuSidebar from './SubmenuSidebar.vue'
import ToastContainer from '../ui/ToastContainer.vue'
import BaseCommandPalette from '../ui/BaseCommandPalette.vue'
import { ChevronRight, Eye, EyeOff } from 'lucide-vue-next'

const route = useRoute()
const toast = useToast()
const { bgType, solidColor, imageUrl, initBackground } = useBackground()
const { isAuthenticated, isLoggingOut, login, finishLogout } = useAuth()

const submenuCollapsed = ref(false)
const mobileDrawerOpen = ref(false)
const isCommandPaletteOpen = ref(false)

// Auth Morphing Card State
// 'form' (Frame 1) | 'loading' (Frames 2-4) | 'expanding' | 'authenticated' | 'collapsing'
const authStage = ref(isAuthenticated.value ? 'authenticated' : 'form')
const isExpanded = ref(isAuthenticated.value)
const buttonProgress = ref(0)
const showPassword = ref(false)

const loginForm = ref({
  identifier: 'admin@digaji.id',
  password: 'password123',
})

onMounted(() => {
  initBackground()
  // Check if session was already active
  if (isAuthenticated.value) {
    authStage.value = 'authenticated'
    isExpanded.value = true
  }
})

// Listen for logout triggers
watch(isLoggingOut, (loggingOut) => {
  if (loggingOut) {
    collapseToLogin()
  }
})

// Trigger Timeline Animation (Frames 2, 3, 4)
const startLoginFlow = (provider = 'Standard') => {
  if (authStage.value === 'loading' || authStage.value === 'expanding') return

  authStage.value = 'loading'
  buttonProgress.value = 0

  const startTime = performance.now()
  const duration = 1600 // 1.6s smooth progression across frames 2, 3, 4

  const updateProgress = (currentTime) => {
    const elapsed = currentTime - startTime
    const fraction = Math.min(elapsed / duration, 1)

    // Smooth ease-in-out easing
    const eased = fraction < 0.5
      ? 2 * fraction * fraction
      : 1 - Math.pow(-2 * fraction + 2, 2) / 2

    buttonProgress.value = Math.round(eased * 100)

    if (fraction < 1) {
      requestAnimationFrame(updateProgress)
    } else {
      buttonProgress.value = 100
      // Frame 4 reached (100% full bar): short pause then morph/expand card
      setTimeout(() => {
        expandToDashboard(provider)
      }, 250)
    }
  }

  requestAnimationFrame(updateProgress)
}

// Morphing Card Expansion from small card to full Dasar Kedua
const expandToDashboard = async (provider) => {
  authStage.value = 'expanding'
  isExpanded.value = true

  // Card transition takes 700ms
  setTimeout(async () => {
    await login(loginForm.value.identifier)
    authStage.value = 'authenticated'
    toast.success(`Selamat datang kembali di Digaji.id! (${provider === 'Google' ? 'Google SSO' : 'Kredensial Sesi'})`)
  }, 700)
}

// Reverse morphing on Logout
const collapseToLogin = () => {
  authStage.value = 'collapsing'
  isExpanded.value = false

  setTimeout(() => {
    finishLogout()
    authStage.value = 'form'
    buttonProgress.value = 0
  }, 700)
}

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
    <!-- Topbar: Logo | Digaji.id di kiri, Theme Icon | Profile di kanan -->
    <Header
      :mobile-drawer-open="mobileDrawerOpen"
      @toggle-sidebar="mobileDrawerOpen = !mobileDrawerOpen"
      @open-search="isCommandPaletteOpen = true"
    />

    <!-- ======================================================== -->
    <!-- 2. DASAR KEDUA (Layer 2 - Floating Card Morphing)        -->
    <!-- Keadaan 1 (Login Wireframe): Card Kecil Centered          -->
    <!-- Keadaan 2 (Loading Wireframe): Lingkaran + Timeline Btn   -->
    <!-- Keadaan 3 (Dashboard): Card Melebar Membesar Full Layout  -->
    <!-- ======================================================== -->
    <div
      class="flex-1 min-h-0 flex items-center justify-center overflow-hidden relative transition-all duration-700"
      :class="isExpanded ? 'p-0 sm:px-1.5 md:px-2 lg:px-2.5 sm:pb-2' : 'p-3 sm:p-4'"
    >
      <!-- THE DASAR KEDUA CARD -->
      <div
        class="relative bg-white dark:bg-[#121214] shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex"
        :class="[
          isExpanded
            ? 'w-full h-full max-w-full max-h-full rounded-t-[32px] sm:rounded-2xl lg:rounded-3xl border-t-2 sm:border-2 border-neutral-300 dark:border-[#27272a] border-x-0 sm:border-x-2 border-b-0 sm:border-b-2'
            : 'w-[calc(100vw-32px)] max-w-[390px] h-[510px] max-h-[85vh] rounded-3xl border-2 border-neutral-300 dark:border-[#27272a]'
        ]"
      >

        <!-- ==================================================== -->
        <!-- VIEW A: WIREFRAME AUTH (FRAME 1 S/D 4)               -->
        <!-- Tampil saat pengguna belum masuk atau saat transisi   -->
        <!-- Diposisikan Absolute Inset-0 agar transisi morphing   -->
        <!-- tidak mengganggu layout dashboard di baliknya         -->
        <!-- ==================================================== -->
        <div
          v-if="authStage !== 'authenticated'"
          class="absolute inset-0 z-20 w-full h-full flex flex-col bg-white dark:bg-[#121214] transition-all duration-400 ease-out"
          :class="authStage === 'expanding' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'"
        >
          <!-- -------------------------------------------------- -->
          <!-- FRAME 1: FORM MASUK KE AKUN ANDA                   -->
          <!-- -------------------------------------------------- -->
          <div
            v-if="authStage === 'form' || authStage === 'collapsing'"
            class="w-full h-full flex flex-col justify-between p-6 sm:p-7 select-none"
          >
            <!-- Header Title -->
            <div class="text-center pt-1">
              <h2 class="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Masuk ke Akun Anda
              </h2>
            </div>

            <!-- Form Fields -->
            <form @submit.prevent="startLoginFlow('Standard')" class="flex flex-col gap-4 my-auto">
              <!-- Field 1: Username / email / no hp -->
              <div>
                <label class="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Username / email / no hp
                </label>
                <input
                  type="text"
                  v-model="loginForm.identifier"
                  placeholder="admin@digaji.id / 08123456789"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#18181b] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition"
                  required
                />
              </div>

              <!-- Field 2: Kata Sandi -->
              <div>
                <label class="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Kata Sandi
                </label>
                <div class="relative">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="loginForm.password"
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#18181b] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition"
                    required
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer"
                    tabindex="-1"
                  >
                    <EyeOff v-if="showPassword" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Button 1: Masuk (Rounded Wireframe Button) -->
              <div class="pt-1">
                <button
                  type="submit"
                  class="w-full py-2.5 px-4 rounded-xl sm:rounded-2xl border-2 border-neutral-400 dark:border-neutral-600 hover:border-neutral-800 dark:hover:border-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1f1f23] text-neutral-900 dark:text-white font-semibold text-sm transition cursor-pointer shadow-2xs active:scale-[0.98]"
                >
                  Masuk
                </button>
              </div>

              <!-- Button 2: Google (Icon Circle + Google) -->
              <div class="flex justify-center pt-0.5">
                <button
                  type="button"
                  @click="startLoginFlow('Google')"
                  class="flex items-center justify-center gap-2.5 px-5 py-2 rounded-xl sm:rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#18181b] hover:bg-neutral-50 dark:hover:bg-[#202024] text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm font-medium transition cursor-pointer shadow-2xs group"
                >
                  <!-- Lingkaran icon persis wireframe -->
                  <div class="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center bg-white dark:bg-[#121214] shrink-0">
                    <svg class="w-3 h-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>
                  <span>Google</span>
                </button>
              </div>
            </form>

            <!-- Bottom Hint -->
            <div class="text-center pt-2">
              <span class="text-[11px] text-neutral-400 dark:text-neutral-500">
                Klik <strong>Masuk</strong> untuk memulai animasi login wireframe
              </span>
            </div>
          </div>

          <!-- -------------------------------------------------- -->
          <!-- FRAMES 2, 3, 4: LINGKARAN "LOADING" & TIMELINE BTN -->
          <!-- -------------------------------------------------- -->
          <div
            v-else
            class="w-full h-full flex flex-col justify-between p-6 sm:p-7 select-none"
          >
            <!-- Top Spacer -->
            <div class="h-2" />

            <!-- Lingkaran Besar dengan teks "LOADING" di tengahnya -->
            <div class="my-auto flex flex-col items-center justify-center">
              <div class="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full border-2 border-neutral-400 dark:border-neutral-600 bg-white dark:bg-[#151518] shadow-inner flex items-center justify-center">
                <!-- Orbiting accent subtle ring -->
                <div
                  class="absolute -inset-1 rounded-full border-2 border-transparent border-t-amber-500 dark:border-t-amber-400 animate-spin"
                  style="animation-duration: 2.5s;"
                />

                <!-- Text "LOADING" persis wireframe -->
                <span class="text-base sm:text-lg font-bold tracking-widest text-neutral-800 dark:text-neutral-100 font-mono">
                  LOADING
                </span>
              </div>
            </div>

            <!-- Tombol "Masuk" yang menjadi timeline progress dari kiri ke kanan -->
            <div class="w-full pt-4">
              <div
                class="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-neutral-400 dark:border-neutral-600 relative overflow-hidden bg-neutral-100/70 dark:bg-[#18181b] flex items-center justify-center shadow-xs"
              >
                <!-- Timeline Fill (Orange / Amber persis warna wireframe) -->
                <div
                  class="absolute left-0 top-0 bottom-0 bg-amber-200/90 dark:bg-amber-500/40 border-r-2 border-amber-500/90 transition-[width] duration-75 ease-linear"
                  :style="{ width: `${buttonProgress}%` }"
                />

                <!-- Label "Masuk" di tengah timeline -->
                <div class="relative z-10 flex items-center gap-2 font-semibold text-xs sm:text-sm text-neutral-800 dark:text-neutral-100">
                  <span>Masuk</span>
                  <span class="font-mono text-xs text-neutral-500 dark:text-neutral-400">({{ buttonProgress }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================================================== -->
        <!-- VIEW B: DASHBOARD CONTAINER (EXPANDED DASAR KEDUA)   -->
        <!-- Tampil saat authStage === 'authenticated'             -->
        <!-- ==================================================== -->
        <div
          v-if="authStage === 'authenticated' || authStage === 'expanding'"
          class="flex-1 min-h-0 flex overflow-hidden w-full relative transition-opacity duration-500"
          :class="authStage === 'authenticated' ? 'opacity-100' : 'opacity-0'"
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
        v-if="mobileDrawerOpen && isAuthenticated"
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
        v-if="mobileDrawerOpen && isAuthenticated"
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

    <!-- Global Toast Component -->
    <ToastContainer />

    <!-- Global Command Palette (Ctrl + K) -->
    <BaseCommandPalette v-model="isCommandPaletteOpen" />
  </div>
</template>
