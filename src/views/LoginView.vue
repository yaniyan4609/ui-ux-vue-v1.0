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
const isExpanding = ref(false)
const welcomeName = ref('')

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

// Handle Login Submit with Morphing Expansion
const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    toast.error('Harap masukkan email dan kata sandi!')
    return
  }

  isSubmitting.value = true

  // Simulasi validasi cepat
  await new Promise((r) => setTimeout(r, 450))

  await login(loginForm.value)
  welcomeName.value = loginForm.value.email.includes('hr')
    ? 'Sarah (HR Manager)'
    : loginForm.value.email.includes('staf')
    ? 'Budi Santoso'
    : 'Admin Digaji.id'

  toast.success('Autentikasi berhasil!')

  // Mulai animasi pembesaran kartu (Morphing Card Expansion)
  isExpanding.value = true

  // Berpindah ke Dashboard setelah animasi ekspansi mencapai ukuran penuh
  setTimeout(() => {
    router.push('/')
  }, 650)
}

// Handle Register Submit with Morphing Expansion
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

  await new Promise((r) => setTimeout(r, 550))
  await register(registerForm.value)
  welcomeName.value = registerForm.value.name

  toast.success('Pendaftaran akun berhasil!')

  // Mulai animasi pembesaran kartu
  isExpanding.value = true

  setTimeout(() => {
    router.push('/')
  }, 650)
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
          isExpanding
            ? 'fixed inset-1.5 sm:inset-2 lg:inset-2.5 rounded-t-[32px] sm:rounded-2xl lg:rounded-3xl z-50 flex items-center justify-center duration-650'
            : 'w-full max-w-[440px] sm:max-w-[460px] rounded-3xl duration-300'
        ]"
      >
        <!-- ==================================================== -->
        <!-- STATE 1: ISI FORMULIR LOGIN / REGISTER               -->
        <!-- ==================================================== -->
        <div
          v-if="!isExpanding"
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
        <!-- STATE 2: OVERLAY SUKSES SAAT MEMBESAR (MORPHING)     -->
        <!-- ==================================================== -->
        <div
          v-else
          class="flex flex-col items-center justify-center p-8 text-center space-y-4 animate-fade-in"
        >
          <!-- Pulsing Success Ring -->
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-lg animate-bounce">
            <CheckCircle2 class="w-8 h-8" />
          </div>

          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              Selamat Datang, {{ welcomeName }}!
            </h2>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
              Autentikasi terverifikasi. Membuka kartu ruang kerja ERP & Dashboard...
            </p>
          </div>

          <!-- Loading Shimmer Progress Line -->
          <div class="w-48 h-1.5 rounded-full bg-neutral-200 dark:bg-[#25252b] overflow-hidden">
            <div class="h-full bg-[var(--theme-primary)] rounded-full animate-pulse w-full" />
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
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in {
  animation: fadeIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
