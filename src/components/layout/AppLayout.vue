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
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronRight,
} from 'lucide-vue-next'

const route = useRoute()
const toast = useToast()
const { bgType, solidColor, imageUrl, initBackground } = useBackground()
const { isAuthenticated, isLoggingOut, login, finishLogout } = useAuth()

const submenuCollapsed = ref(false)
const mobileDrawerOpen = ref(false)
const isCommandPaletteOpen = ref(false)

// Active Tab for Form: 'login' | 'register'
const activeTab = ref('login')

// Auth Morphing Card State
// 'form' (Frame 1) | 'loading' (Frames 2-4) | 'expanding' | 'authenticated' | 'collapsing'
const authStage = ref(isAuthenticated.value ? 'authenticated' : 'form')
const isExpanded = ref(isAuthenticated.value)
const buttonProgress = ref(0)
const showPassword = ref(false)

// Form States
const loginForm = ref({
  identifier: 'admin@digaji.id',
  password: 'password123',
  rememberMe: true,
})

const registerForm = ref({
  name: '',
  email: '',
  company: '',
  password: '',
  agreeTerms: true,
})

// Demo Quick Accounts
const demoAccounts = [
  { label: '👑 Admin', email: 'admin@digaji.id', role: 'Super Admin' },
  { label: '💼 HR Lead', email: 'hr@digaji.id', role: 'HR & Payroll' },
  { label: '👤 Staf', email: 'staf@digaji.id', role: 'Staf Operasional' },
]

const fillDemo = (acc) => {
  activeTab.value = 'login'
  loginForm.value.identifier = acc.email
  loginForm.value.password = 'password123'
  toast.success(`Akun demo ${acc.label} terisi. Silakan klik Masuk!`)
}

// Active Step Label for Circular Loading
const activeStepLabel = computed(() => {
  if (buttonProgress.value < 40) return 'Memverifikasi Kredensial...'
  if (buttonProgress.value < 85) return 'Sinkronisasi Modul ERP...'
  return 'Ruang Kerja Siap!'
})

onMounted(() => {
  initBackground()
  if (isAuthenticated.value) {
    authStage.value = 'authenticated'
    isExpanded.value = true
  }
})

// Listen for logout triggers from Header or Command Palette
watch(isLoggingOut, (loggingOut) => {
  if (loggingOut) {
    collapseToLogin()
  }
})

// Trigger Timeline Animation (Frames 2, 3, 4)
const startLoginFlow = (provider = 'Standard') => {
  if (authStage.value === 'loading' || authStage.value === 'expanding') return

  if (activeTab.value === 'register' && provider === 'Standard') {
    if (!registerForm.value.name || !registerForm.value.email || !registerForm.value.company) {
      toast.error('Harap lengkapi semua kolom pendaftaran!')
      return
    }
  }

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
    const identifier = activeTab.value === 'login'
      ? loginForm.value.identifier
      : registerForm.value.email
    await login(identifier)
    authStage.value = 'authenticated'
    toast.success(`Selamat datang kembali di Digaji.id! (${provider === 'Google SSO' ? 'Google SSO' : 'Kredensial Sesi'})`)
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
    <!-- Keadaan 1 (Login UI Pertama): Card Polished Centered      -->
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
            : 'w-[calc(100vw-32px)] max-w-[430px] sm:max-w-[460px] h-[590px] sm:h-[620px] max-h-[92vh] rounded-3xl border-2 border-neutral-200 dark:border-[#27272a]'
        ]"
      >

        <!-- ==================================================== -->
        <!-- VIEW A: WIREFRAME AUTH (FRAME 1 S/D 4) DENGAN UI V1  -->
        <!-- Tampil saat pengguna belum masuk atau saat transisi   -->
        <!-- Diposisikan Absolute Inset-0 agar transisi morphing   -->
        <!-- tidak mengganggu layout dashboard di baliknya         -->
        <!-- ==================================================== -->
        <div
          v-if="authStage !== 'authenticated'"
          class="absolute inset-0 z-20 w-full h-full flex flex-col bg-white dark:bg-[#121214] transition-all duration-400 ease-out overflow-hidden"
          :class="authStage === 'expanding' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'"
        >
          <!-- -------------------------------------------------- -->
          <!-- FRAME 1: POLISHED FORMULIR MASUK / DAFTAR (UI V1)  -->
          <!-- -------------------------------------------------- -->
          <div
            v-if="authStage === 'form' || authStage === 'collapsing'"
            class="w-full h-full flex flex-col justify-between p-5 sm:p-6 select-none overflow-y-auto"
          >
            <!-- Card Header: Badge & Title -->
            <div class="text-center space-y-1">
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] text-[11px] font-semibold">
                <ShieldCheck class="w-3.5 h-3.5" />
                <span>Akses Keamanan Enterprise</span>
              </div>
              <h1 class="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {{ activeTab === 'login' ? 'Masuk ke Akun Anda' : 'Daftarkan Perusahaan' }}
              </h1>
              <p class="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400">
                {{ activeTab === 'login' ? 'Kelola payroll, anggaran divisi, dan modul ERP dengan mudah.' : 'Mulai uji coba sistem penggajian terpadu dalam hitungan menit.' }}
              </p>
            </div>

            <!-- Tab Switcher: Masuk Sesi vs Daftar Baru -->
            <div class="grid grid-cols-2 p-1 my-2 bg-neutral-100 dark:bg-[#1c1c20] rounded-xl text-xs font-semibold select-none border border-neutral-200/80 dark:border-[#27272a]">
              <button
                type="button"
                @click="activeTab = 'login'"
                class="py-1.5 rounded-lg transition-all duration-150 cursor-pointer text-center"
                :class="activeTab === 'login' ? 'bg-white dark:bg-[#27272e] text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'"
              >
                Masuk Sesi
              </button>
              <button
                type="button"
                @click="activeTab = 'register'"
                class="py-1.5 rounded-lg transition-all duration-150 cursor-pointer text-center"
                :class="activeTab === 'register' ? 'bg-white dark:bg-[#27272e] text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'"
              >
                Daftar Baru
              </button>
            </div>

            <!-- ================================================ -->
            <!-- TAB 1: FORM LOGIN                                -->
            <!-- ================================================ -->
            <form
              v-if="activeTab === 'login'"
              @submit.prevent="startLoginFlow('Standard')"
              class="space-y-3"
            >
              <!-- Field 1: Username / email / no hp -->
              <div>
                <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Username / Email / No. HP <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Mail class="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    v-model="loginForm.identifier"
                    placeholder="admin@digaji.id / 08123456789"
                    class="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm border border-neutral-300 dark:border-[#27272a] bg-neutral-50/50 dark:bg-[#18181b] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition"
                    required
                  />
                </div>
              </div>

              <!-- Field 2: Kata Sandi -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Kata Sandi <span class="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    @click="toast.info('Gunakan 1-klik Akun Demo di bawah!')"
                    class="text-[11px] font-medium text-[var(--theme-primary)] hover:underline"
                    tabindex="-1"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Lock class="w-4 h-4" />
                  </div>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="loginForm.password"
                    placeholder="Masukkan kata sandi..."
                    class="w-full pl-9 pr-10 py-2 rounded-xl text-xs sm:text-sm border border-neutral-300 dark:border-[#27272a] bg-neutral-50/50 dark:bg-[#18181b] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition"
                    required
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer"
                    tabindex="-1"
                  >
                    <EyeOff v-if="showPassword" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Remember Me Checkbox -->
              <div class="flex items-center justify-between text-xs pt-0.5">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    v-model="loginForm.rememberMe"
                    type="checkbox"
                    class="rounded border-neutral-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] cursor-pointer"
                  />
                  <span class="text-neutral-600 dark:text-neutral-400 text-[11px]">Ingat sesi saya di perangkat ini</span>
                </label>
              </div>

              <!-- Tombol Masuk Submit -->
              <button
                type="submit"
                class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl sm:rounded-2xl bg-[var(--theme-primary)] text-[var(--theme-primary-text)] font-bold text-xs sm:text-sm shadow-md shadow-[var(--theme-primary)]/20 hover:opacity-95 transition cursor-pointer active:scale-[0.98]"
              >
                <span>Masuk ke Dashboard ERP</span>
                <ArrowRight class="w-4 h-4" />
              </button>

              <!-- Divider Google & Demo -->
              <div class="relative flex items-center justify-center pt-1">
                <div class="border-t border-neutral-200 dark:border-[#27272a] w-full" />
                <span class="bg-white dark:bg-[#121214] px-2.5 text-[10.5px] text-neutral-400 uppercase tracking-wider shrink-0 font-medium">
                  Atau Lanjutkan Dengan
                </span>
              </div>

              <!-- Button Google SSO (Sesuai Wireframe dengan Desain Polished) -->
              <button
                type="button"
                @click="startLoginFlow('Google SSO')"
                class="w-full flex items-center justify-center gap-2.5 py-2 px-4 rounded-xl sm:rounded-2xl border border-neutral-300 dark:border-[#27272a] bg-white dark:bg-[#18181b] hover:bg-neutral-50 dark:hover:bg-[#202024] text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition cursor-pointer shadow-2xs group"
              >
                <div class="w-5 h-5 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center bg-white dark:bg-[#121214] shrink-0">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>
                <span>Masuk dengan Akun Google</span>
              </button>

              <!-- Quick Demo 1-Click Accounts -->
              <div class="pt-0.5">
                <div class="text-[10px] text-center font-medium text-neutral-400 mb-1.5">
                  1-Klik Akun Demo Cepat:
                </div>
                <div class="grid grid-cols-3 gap-1.5">
                  <button
                    v-for="acc in demoAccounts"
                    :key="acc.email"
                    type="button"
                    @click="fillDemo(acc)"
                    class="py-1 px-1.5 rounded-lg border border-neutral-200 dark:border-[#27272a] bg-neutral-50 dark:bg-[#18181b] hover:border-[var(--theme-primary)] dark:hover:border-[var(--theme-primary)] text-[10.5px] font-semibold text-neutral-700 dark:text-neutral-300 hover:text-[var(--theme-primary)] transition cursor-pointer text-center truncate"
                  >
                    {{ acc.label }}
                  </button>
                </div>
              </div>
            </form>

            <!-- ================================================ -->
            <!-- TAB 2: FORM REGISTER                             -->
            <!-- ================================================ -->
            <form
              v-else
              @submit.prevent="startLoginFlow('Register')"
              class="space-y-2.5"
            >
              <div>
                <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nama Lengkap Penanggung Jawab <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <User class="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    v-model="registerForm.name"
                    placeholder="Contoh: Raden Wijaya"
                    class="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm border border-neutral-300 dark:border-[#27272a] bg-neutral-50/50 dark:bg-[#18181b] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Perusahaan Resmi <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Mail class="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    v-model="registerForm.email"
                    placeholder="hr@perusahaan.co.id"
                    class="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm border border-neutral-300 dark:border-[#27272a] bg-neutral-50/50 dark:bg-[#18181b] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nama Perusahaan / Organisasi <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Building2 class="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    v-model="registerForm.company"
                    placeholder="PT Digaji Mitra Digital"
                    class="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm border border-neutral-300 dark:border-[#27272a] bg-neutral-50/50 dark:bg-[#18181b] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition"
                    required
                  />
                </div>
              </div>

              <div class="pt-1">
                <button
                  type="submit"
                  class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl sm:rounded-2xl bg-[var(--theme-primary)] text-[var(--theme-primary-text)] font-bold text-xs sm:text-sm shadow-md shadow-[var(--theme-primary)]/20 hover:opacity-95 transition cursor-pointer active:scale-[0.98]"
                >
                  <span>Daftarkan Perusahaan Sekarang</span>
                  <ArrowRight class="w-4 h-4" />
                </button>
              </div>
            </form>

            <!-- Bottom Brand Info -->
            <div class="text-center pt-2">
              <span class="text-[10.5px] text-neutral-400 dark:text-neutral-500">
                Dilindungi enkripsi perbankan 256-bit TLS &bull; Digaji.id Enterprise
              </span>
            </div>
          </div>

          <!-- -------------------------------------------------- -->
          <!-- FRAMES 2, 3, 4: LINGKARAN "LOADING" & TIMELINE BTN -->
          <!-- Desain Mewah & Elegan Sesuai Wireframe Flow        -->
          <!-- -------------------------------------------------- -->
          <div
            v-else
            class="w-full h-full flex flex-col justify-between p-6 sm:p-8 select-none"
          >
            <!-- Header Status Sesi -->
            <div class="flex items-center justify-between border-b border-neutral-200/80 dark:border-[#26262c] pb-3">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)] animate-ping" />
                <span class="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Autentikasi Sesi Digaji.id
                </span>
              </div>
              <span class="text-[11px] font-mono text-[var(--theme-primary)] font-semibold">
                {{ buttonProgress }}% Selesai
              </span>
            </div>

            <!-- Lingkaran Besar dengan teks "LOADING" di tengahnya -->
            <div class="my-auto flex flex-col items-center justify-center">
              <div class="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full border-2 border-neutral-300 dark:border-[#2b2b32] bg-gradient-to-b from-neutral-50/80 to-neutral-100/50 dark:from-[#18181c] dark:to-[#121215] shadow-xl flex items-center justify-center">
                <!-- Outer Multi-Layer Rotating Rings -->
                <div
                  class="absolute -inset-1.5 rounded-full border-2 border-transparent border-t-[var(--theme-primary)] border-r-[var(--theme-primary)]/50 animate-spin"
                  style="animation-duration: 2.2s;"
                />
                <div
                  class="absolute -inset-3 rounded-full border border-dashed border-[var(--theme-primary)]/20 animate-spin"
                  style="animation-duration: 12s; animation-direction: reverse;"
                />

                <!-- Text "LOADING" persis wireframe dengan tipografi premium -->
                <div class="flex flex-col items-center justify-center text-center px-4 space-y-1">
                  <span class="text-base sm:text-lg font-bold tracking-[0.25em] text-neutral-800 dark:text-neutral-100 font-mono">
                    LOADING
                  </span>
                  <span class="text-[11px] font-semibold text-[var(--theme-primary)]">
                    {{ activeStepLabel }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Tombol "Masuk" yang menjadi timeline progress dari kiri ke kanan -->
            <div class="w-full space-y-3 pt-2">
              <div
                class="w-full h-12 rounded-xl sm:rounded-2xl border-2 border-neutral-300 dark:border-[#2e2e36] relative overflow-hidden bg-neutral-100 dark:bg-[#18181b] flex items-center justify-center shadow-md"
              >
                <!-- Timeline Fill (Gradient Beranimasi Halus dari Kiri ke Kanan) -->
                <div
                  class="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[var(--theme-primary)] via-amber-400 to-emerald-500 opacity-90 transition-[width] duration-75 ease-linear"
                  :style="{ width: `${buttonProgress}%` }"
                >
                  <!-- Shimmer Pulse Glow -->
                  <div class="absolute inset-0 bg-white/20 animate-pulse" />
                </div>

                <!-- Label "Masuk" di tengah timeline persis wireframe -->
                <div class="relative z-10 flex items-center gap-2 font-bold text-xs sm:text-sm text-neutral-900 dark:text-white drop-shadow-xs">
                  <span>Masuk</span>
                  <span class="font-mono text-xs opacity-90">({{ buttonProgress }}%)</span>
                </div>
              </div>

              <!-- 3 Indikator Timeline Sesuai Frame 2, 3, 4 -->
              <div class="grid grid-cols-3 gap-1.5 text-center">
                <div
                  class="py-1 px-1.5 rounded-lg border text-[10px] font-semibold transition-all duration-200"
                  :class="buttonProgress >= 20 ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400'"
                >
                  1. Kredensial
                </div>
                <div
                  class="py-1 px-1.5 rounded-lg border text-[10px] font-semibold transition-all duration-200"
                  :class="buttonProgress >= 55 ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400'"
                >
                  2. Modul ERP
                </div>
                <div
                  class="py-1 px-1.5 rounded-lg border text-[10px] font-semibold transition-all duration-200"
                  :class="buttonProgress >= 100 ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'border-neutral-200 dark:border-neutral-800 text-neutral-400'"
                >
                  3. Workspace
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
