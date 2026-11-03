<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Sun,
  Moon,
  Check,
  Cpu,
  LayoutDashboard,
  Layers,
} from 'lucide-vue-next'
import { useBackground } from '../composables/useBackground'
import { useTheme } from '../composables/useTheme'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { bgType, solidColor, imageUrl, initBackground } = useBackground()
const { isDark, toggleTheme } = useTheme()
const { login, register } = useAuth()

// Active Mode: 'login' | 'register'
const activeTab = ref(route.path.includes('register') ? 'register' : 'login')

// Form State
const loginForm = ref({
  email: 'admin@digaji.id',
  password: 'password123',
  rememberMe: true,
})

const registerForm = ref({
  name: '',
  email: '',
  company: '',
  password: '',
  confirmPassword: '',
  agreeTerms: true,
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const welcomeName = ref('Admin Digaji.id')

// ========================================================
// 3 FASE AUTENTIKASI:
// 1. 'form'      -> Menampilkan form input login / register
// 2. 'loading'   -> Card tetap kecil, menampilkan animasi loading & timeline kiri ke kanan
// 3. 'expanding' -> Card kecil melebar & membesar menjadi card besar Dasar 2 dashboard!
// ========================================================
const authPhase = ref('form')
const timelineProgress = ref(0) // 0 - 100%

// Step Data untuk Timeline dari Kiri ke Kanan
const timelineSteps = [
  {
    id: 1,
    label: 'Kredensial',
    title: 'Memverifikasi Kredensial...',
    desc: 'Memeriksa hak akses dan token keamanan akun.',
  },
  {
    id: 2,
    label: 'Modul ERP',
    title: 'Sinkronisasi Modul ERP & Payroll...',
    desc: 'Menghubungkan data penggajian, karyawan, dan presensi.',
  },
  {
    id: 3,
    label: 'Workspace',
    title: 'Ruang Kerja Siap!',
    desc: 'Membuka dasbor live sync dan kartu kerja utama.',
  },
]

const activeStepInfo = computed(() => {
  if (timelineProgress.value < 40) return timelineSteps[0]
  if (timelineProgress.value < 85) return timelineSteps[1]
  return timelineSteps[2]
})

onMounted(() => {
  initBackground()
})

// Background Style Layer 1 (Dasar Pertama)
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

// Demo Quick Login Credentials
const demoAccounts = [
  { label: '👑 Super Admin', email: 'admin@digaji.id', role: 'Super Admin' },
  { label: '💼 HR Lead', email: 'hr@digaji.id', role: 'HR & Payroll' },
  { label: '👤 Staf Operasional', email: 'staf@digaji.id', role: 'Staf' },
]

const fillDemo = (acc) => {
  activeTab.value = 'login'
  loginForm.value.email = acc.email
  loginForm.value.password = 'password123'
  toast.success(`Akun demo ${acc.label} terisi. Silakan klik Masuk!`)
}

// Logika Timeline Progress + Morphing Card Expansion
const runTimelineAndExpansion = async () => {
  // 1. Masuk ke fase Loading (Card tetap kecil)
  authPhase.value = 'loading'
  timelineProgress.value = 0

  // Jalankan animasi timeline progress mengalir dari kiri ke kanan (durasi total ~1.4 detik)
  const duration = 1400 // ms
  const interval = 25 // ms
  const step = 100 / (duration / interval)

  await new Promise((resolve) => {
    const timer = setInterval(() => {
      timelineProgress.value = Math.min(100, timelineProgress.value + step)
      if (timelineProgress.value >= 100) {
        clearInterval(timer)
        resolve()
      }
    }, interval)
  })

  // Jeda halus sejenak (200ms) agar pengguna melihat tanda centang siap
  await new Promise((r) => setTimeout(r, 200))

  // 2. Masuk ke fase EXPANDING: Card kecil melebar & membesar menjadi card besar dashboard!
  authPhase.value = 'expanding'

  // Setelah kartu membesar penuh (~700ms), pindah rute ke dashboard '/'
  setTimeout(() => {
    router.push('/')
  }, 720)
}

// Handle Login Submit
const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    toast.error('Harap masukkan email dan kata sandi!')
    return
  }

  isSubmitting.value = true

  // Simulasi validasi cepat
  await new Promise((r) => setTimeout(r, 350))

  await login(loginForm.value)
  welcomeName.value = loginForm.value.email.includes('hr')
    ? 'Sarah (HR Manager)'
    : loginForm.value.email.includes('staf')
    ? 'Budi Santoso'
    : 'Admin Digaji.id'

  toast.success('Kredensial diverifikasi!')
  isSubmitting.value = false

  // Jalankan animasi timeline lalu perbesaran kartu
  await runTimelineAndExpansion()
}

// Handle Register Submit
const handleRegister = async () => {
  if (!registerForm.value.name || !registerForm.value.email || !registerForm.value.password) {
    toast.error('Harap isi semua kolom wajib!')
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    toast.error('Konfirmasi kata sandi tidak cocok!')
    return
  }

  isSubmitting.value = true

  await new Promise((r) => setTimeout(r, 450))
  await register(registerForm.value)
  welcomeName.value = registerForm.value.name

  toast.success('Pendaftaran akun berhasil!')
  isSubmitting.value = false

  await runTimelineAndExpansion()
}
</script>

<template>
  <!-- ======================================================== -->
  <!-- 1. DASAR PERTAMA (Layer 1 - Backdrop Luar Grid / Dots)   -->
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
    <!-- Topbar Minimalis: Logo Digaji.id di kiri, Theme Switcher di kanan -->
    <header class="w-full px-3.5 sm:px-6 py-3 flex items-center justify-between select-none z-20">
      <div class="flex items-center gap-2.5">
        <!-- Logo Box Bersudut Lengkung -->
        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 border-neutral-700 dark:border-neutral-300 bg-white dark:bg-[#18181b] flex items-center justify-center text-neutral-800 dark:text-neutral-100 shadow-2xs">
          <div class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md bg-[var(--theme-primary)]" />
        </div>

        <span class="text-neutral-300 dark:text-neutral-700 font-light text-base sm:text-lg">|</span>

        <!-- Nama Brand -->
        <span class="font-bold text-sm sm:text-base tracking-tight text-neutral-900 dark:text-[#f4f4f5]">
          Digaji.id
        </span>

        <BaseBadge variant="neutral" size="sm" class="hidden sm:inline-flex">
          ERP & Payroll Suite
        </BaseBadge>
      </div>

      <!-- Theme Switch Button (Sun / Moon) -->
      <button
        type="button"
        @click="toggleTheme"
        class="w-8.5 h-8.5 rounded-xl border border-neutral-300 dark:border-[#27272a] bg-white dark:bg-[#18181b] flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#27272a] transition cursor-pointer shadow-2xs"
        :title="isDark ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'"
      >
        <Sun v-if="isDark" class="w-4 h-4 text-amber-400" />
        <Moon v-else class="w-4 h-4 text-neutral-600" />
      </button>
    </header>

    <!-- ======================================================== -->
    <!-- 2. DASAR KEDUA (Layer 2 - Morphing Floating Card)        -->
    <!-- Berawal dari card kecil membesar ke ukuran penuh Dasar 2 -->
    <!-- ======================================================== -->
    <main class="flex-1 min-h-0 flex items-center justify-center p-3 sm:p-4 relative">
      <!-- Floating Card Container -->
      <div
        class="transition-all ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden bg-white dark:bg-[#121214] border-2 border-neutral-300 dark:border-[#27272a] shadow-2xl relative"
        :class="[
          authPhase === 'expanding'
            ? 'fixed inset-0 sm:inset-1.5 md:inset-2 lg:inset-2.5 rounded-t-[32px] sm:rounded-2xl lg:rounded-3xl z-50 flex items-center justify-center duration-700'
            : 'w-full max-w-[440px] sm:max-w-[460px] rounded-3xl duration-300'
        ]"
      >
        <!-- ==================================================== -->
        <!-- STATE 1: ISI FORMULIR LOGIN / REGISTER (Awal)        -->
        <!-- ==================================================== -->
        <div
          v-if="authPhase === 'form'"
          class="p-6 sm:p-7 flex flex-col justify-between space-y-5"
        >
          <!-- Card Header & Badge -->
          <div class="text-center space-y-1.5">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] text-[11px] font-semibold mb-1">
              <ShieldCheck class="w-3.5 h-3.5" />
              <span>Akses Keamanan Enterprise</span>
            </div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {{ activeTab === 'login' ? 'Masuk ke Akun Anda' : 'Daftarkan Perusahaan' }}
            </h1>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ activeTab === 'login' ? 'Kelola payroll, anggaran divisi, dan modul ERP dengan mudah.' : 'Mulai uji coba sistem penggajian terpadu dalam hitungan menit.' }}
            </p>
          </div>

          <!-- Sliding Tab Switcher: Masuk vs Daftar -->
          <div class="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-[#1c1c20] rounded-xl text-xs font-semibold select-none border border-neutral-200/80 dark:border-[#27272a]">
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

          <!-- ================================================== -->
          <!-- TAB 1: FORM LOGIN                                  -->
          <!-- ================================================== -->
          <form
            v-if="activeTab === 'login'"
            @submit.prevent="handleLogin"
            class="space-y-3.5"
          >
            <!-- Email / NIP -->
            <BaseInput
              v-model="loginForm.email"
              type="email"
              label="Email Kantor atau NIP"
              required
              placeholder="admin@digaji.id"
              :leading-icon="Mail"
              size="md"
            />

            <!-- Password with Show/Hide Toggle -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Kata Sandi <span class="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  @click="toast.info('Gunakan akun demo instan di bawah!')"
                  class="text-[11px] font-medium text-[var(--theme-primary)] hover:underline"
                >
                  Lupa kata sandi?
                </button>
              </div>

              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Masukkan kata sandi..."
                  required
                  class="w-full pl-9 pr-10 py-2 rounded-xl text-xs border border-neutral-300 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer"
                  title="Lihat kata sandi"
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
                <span class="text-neutral-600 dark:text-neutral-400 text-[11.5px]">Ingat sesi saya di perangkat ini</span>
              </label>
            </div>

            <!-- Tombol Masuk Submit -->
            <BaseButton
              type="submit"
              variant="primary"
              size="md"
              class="w-full justify-center text-xs font-bold shadow-md shadow-[var(--theme-primary)]/20"
              :loading="isSubmitting"
            >
              <span>Masuk ke Dashboard ERP</span>
              <ArrowRight class="w-3.5 h-3.5 ml-1" />
            </BaseButton>

            <!-- Divider Demo Instant Accounts -->
            <div class="pt-2">
              <div class="relative flex items-center justify-center">
                <div class="border-t border-neutral-200 dark:border-[#27272a] w-full" />
                <span class="bg-white dark:bg-[#121214] px-2.5 text-[10.5px] text-neutral-400 uppercase tracking-wider shrink-0 font-medium">
                  Atau Akun Demo Instan
                </span>
              </div>

              <!-- 3 Demo Quick Buttons -->
              <div class="grid grid-cols-3 gap-1.5 mt-2.5">
                <button
                  v-for="acc in demoAccounts"
                  :key="acc.email"
                  type="button"
                  @click="fillDemo(acc)"
                  class="p-1.5 rounded-xl border border-neutral-200 dark:border-[#27272a] bg-neutral-50 dark:bg-[#17171a] hover:border-neutral-300 dark:hover:border-neutral-600 text-[10.5px] font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer text-center truncate"
                >
                  {{ acc.label }}
                </button>
              </div>
            </div>
          </form>

          <!-- ================================================== -->
          <!-- TAB 2: FORM REGISTER                               -->
          <!-- ================================================== -->
          <form
            v-else
            @submit.prevent="handleRegister"
            class="space-y-3.5"
          >
            <BaseInput
              v-model="registerForm.name"
              label="Nama Lengkap Penanggung Jawab"
              required
              placeholder="Contoh: Raden Wijaya"
              :leading-icon="User"
              size="md"
            />

            <BaseInput
              v-model="registerForm.email"
              type="email"
              label="Email Perusahaan Resmi"
              required
              placeholder="hr@perusahaan.co.id"
              :leading-icon="Mail"
              size="md"
            />

            <BaseInput
              v-model="registerForm.company"
              label="Nama Perusahaan / Organisasi"
              required
              placeholder="PT Maju Bersama Digital"
              :leading-icon="Building2"
              size="md"
            />

            <!-- Kata Sandi Register -->
            <div>
              <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Kata Sandi <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  v-model="registerForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Minimal 8 karakter..."
                  required
                  class="w-full pl-9 pr-10 py-2 rounded-xl text-xs border border-neutral-300 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer"
                >
                  <EyeOff v-if="showPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Konfirmasi Kata Sandi -->
            <div>
              <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Ulangi Kata Sandi <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  v-model="registerForm.confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Ulangi kata sandi..."
                  required
                  class="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-neutral-300 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition"
                />
              </div>
            </div>

            <!-- Checkbox Terms -->
            <label class="flex items-start gap-2 cursor-pointer select-none text-[11px] text-neutral-500 pt-1">
              <input
                v-model="registerForm.agreeTerms"
                type="checkbox"
                required
                class="mt-0.5 rounded border-neutral-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] cursor-pointer"
              />
              <span>Saya menyetujui Ketentuan Layanan dan Kebijakan Privasi PT Digaji.id.</span>
            </label>

            <!-- Tombol Submit Register -->
            <BaseButton
              type="submit"
              variant="primary"
              size="md"
              class="w-full justify-center text-xs font-bold shadow-md shadow-[var(--theme-primary)]/20"
              :loading="isSubmitting"
            >
              <Sparkles class="w-3.5 h-3.5 mr-1" />
              <span>Daftarkan Perusahaan</span>
            </BaseButton>
          </form>
        </div>

        <!-- ==================================================== -->
        <!-- STATE 2: LOADING & TIMELINE (Card Tetap Kecil)       -->
        <!-- Animasi timeline berjalan dari kiri ke kanan         -->
        <!-- ==================================================== -->
        <div
          v-else-if="authPhase === 'loading'"
          class="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in"
        >
          <!-- Logo Orbit Animasi -->
          <div class="relative flex items-center justify-center my-2">
            <div class="w-16 h-16 rounded-2xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] border border-[var(--theme-primary)]/30 flex items-center justify-center shadow-lg">
              <div class="w-7 h-7 rounded-lg bg-[var(--theme-primary)] animate-pulse" />
            </div>
            <!-- Decorative Spinning Ring -->
            <div
              class="absolute -inset-2.5 rounded-3xl border-2 border-dashed border-[var(--theme-primary)]/40 animate-spin"
              style="animation-duration: 8s;"
            />
          </div>

          <!-- Judul & Keterangan Step Aktif -->
          <div class="space-y-1">
            <h2 class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white transition-all">
              {{ activeStepInfo.title }}
            </h2>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
              {{ activeStepInfo.desc }}
            </p>
          </div>

          <!-- TIMELINE PROGRESS DARI KIRI KE KANAN -->
          <div class="w-full space-y-3 pt-2">
            <!-- 3 Step Checkpoint Nodes -->
            <div class="relative flex items-center justify-between px-2">
              <!-- Garis Latar Abu-abu -->
              <div class="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-neutral-200 dark:bg-[#25252b] z-0 rounded-full" />

              <!-- Garis Progress Aktif Berjalan Mengalir dari Kiri ke Kanan -->
              <div
                class="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[var(--theme-primary)] z-0 rounded-full transition-all duration-150 ease-out"
                :style="{ width: `calc(${timelineProgress}% * 0.82)` }"
              />

              <!-- Node 1: Kredensial -->
              <div class="relative z-10 flex flex-col items-center">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
                  :class="timelineProgress >= 15 ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-sm scale-110' : 'bg-neutral-200 dark:bg-[#27272f] text-neutral-400'"
                >
                  <Check v-if="timelineProgress >= 38" class="w-3.5 h-3.5 stroke-[3]" />
                  <span v-else>1</span>
                </div>
                <span class="text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 mt-1.5">
                  Kredensial
                </span>
              </div>

              <!-- Node 2: Modul ERP -->
              <div class="relative z-10 flex flex-col items-center">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
                  :class="timelineProgress >= 60 ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-sm scale-110' : 'bg-neutral-200 dark:bg-[#27272f] text-neutral-400'"
                >
                  <Check v-if="timelineProgress >= 80" class="w-3.5 h-3.5 stroke-[3]" />
                  <span v-else>2</span>
                </div>
                <span class="text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 mt-1.5">
                  Modul ERP
                </span>
              </div>

              <!-- Node 3: Workspace Siap -->
              <div class="relative z-10 flex flex-col items-center">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
                  :class="timelineProgress >= 100 ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-sm scale-110' : 'bg-neutral-200 dark:bg-[#27272f] text-neutral-400'"
                >
                  <Check v-if="timelineProgress >= 100" class="w-3.5 h-3.5 stroke-[3]" />
                  <span v-else>3</span>
                </div>
                <span class="text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 mt-1.5">
                  Siap
                </span>
              </div>
            </div>

            <!-- Glowing Bottom Progress Bar Mengalir dari Kiri ke Kanan -->
            <div class="h-2 w-full rounded-full bg-neutral-200 dark:bg-[#202025] overflow-hidden p-0.5 relative">
              <div
                class="h-full rounded-full bg-gradient-to-r from-[var(--theme-primary)] to-emerald-500 transition-all duration-150 ease-out relative"
                :style="{ width: `${timelineProgress}%` }"
              >
                <!-- Shimmer highlight -->
                <div class="absolute inset-0 bg-white/30 animate-pulse" />
              </div>
            </div>

            <!-- Persentase & Status -->
            <div class="flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1 pt-1">
              <span>Proses Autentikasi</span>
              <span class="font-bold text-[var(--theme-primary)]">{{ Math.round(timelineProgress) }}%</span>
            </div>
          </div>
        </div>

        <!-- ==================================================== -->
        <!-- STATE 3: CARD MEMBESAR (MORPHING KE DASHBOARD)       -->
        <!-- Card melebar jadi card besar seperti di dashboard    -->
        <!-- ==================================================== -->
        <div
          v-else-if="authPhase === 'expanding'"
          class="w-full h-full flex flex-col justify-between p-6 sm:p-10 animate-fade-in relative select-none"
        >
          <!-- Silhouette Outline Sidebar & Header Preview -->
          <div class="flex items-center justify-between border-b border-neutral-200/80 dark:border-[#26262c] pb-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-[var(--theme-primary)] text-[var(--theme-primary-text)] flex items-center justify-center font-bold">
                <CheckCircle2 class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                  Selamat Datang, {{ welcomeName }}!
                </h2>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                  Memperluas kanvas kerja ERP & Payroll Digaji.id...
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Sync
              </span>
            </div>
          </div>

          <!-- Expanding Content Shimmer Skeleton Preview -->
          <div class="flex-1 my-6 flex flex-col justify-center items-center text-center space-y-4">
            <div class="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-xl animate-bounce">
              <Sparkles class="w-7 h-7" />
            </div>
            <div class="space-y-1">
              <h3 class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                Membuka Dashboard Utama...
              </h3>
              <p class="text-xs text-neutral-400 max-w-sm">
                Mengalihkan kartu autentikasi ke ruang kerja penuh Dasar Kedua.
              </p>
            </div>
          </div>

          <!-- Footer Status -->
          <div class="text-center text-[11px] text-neutral-400 font-mono">
            PT Digaji.id — Sistem Manajemen ERP & Penggajian Terpadu
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Copyright Bawah -->
    <footer class="py-2.5 text-center text-[11px] text-neutral-400 select-none z-10">
      &copy; 2025 PT Digaji.id — Sistem Manajemen ERP & Penggajian Terpadu Indonesia
    </footer>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in {
  animation: fadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
