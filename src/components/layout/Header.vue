<script setup>
import { ref } from 'vue'
import {
  Bell,
  User,
  Sun,
  Moon,
  LogOut,
  Sliders
} from 'lucide-vue-next'
import { useTheme } from '../../composables/useTheme'
import { useToast } from '../../composables/useToast'

const { isDark, toggleTheme } = useTheme()
const toast = useToast()

const userMenuOpen = ref(false)

const triggerNotification = () => {
  toast.info('Belum ada notifikasi baru hari ini.', 'Notifikasi Digaji.id')
}
</script>

<template>
  <!-- Topbar on Dasar Pertama -->
  <header class="w-full px-2.5 sm:px-3 lg:px-3.5 py-2 sm:py-2.5 flex items-center justify-between select-none z-30">
    
    <!-- Kiri: Logo | Digaji.id (Bersih tanpa hamburger) -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Logo | Digaji.id (Kiri: logo + tulisan) -->
      <router-link
        to="/"
        class="group flex items-center gap-2.5 transition-transform"
      >
        <!-- Logo Box Bersudut Lengkung -->
        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 border-neutral-700 dark:border-neutral-300 bg-white dark:bg-[#18181b] flex items-center justify-center text-neutral-800 dark:text-neutral-100 shadow-2xs group-hover:scale-105 transition-all shrink-0">
          <div class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md bg-[var(--theme-primary)]" />
        </div>

        <!-- Garis Pemisah Vertikal | -->
        <span class="text-neutral-300 dark:text-neutral-700 font-light text-base sm:text-lg select-none">
          |
        </span>

        <!-- Nama Brand: Digaji.id -->
        <span class="font-bold text-sm sm:text-base tracking-tight text-neutral-900 dark:text-[#f4f4f5]">
          Digaji.id
        </span>
      </router-link>
    </div>

    <!-- Kanan (Urutan: Icon Tema | Icon Lonceng | Profile) -->
    <div class="flex items-center gap-2 sm:gap-2.5">
      
      <!-- 1. Single Icon Button Theme (Bukan Toggle, 1 Icon Gonta-Ganti Sun/Moon) -->
      <button
        type="button"
        @click="toggleTheme($event)"
        class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-neutral-300 dark:border-[#27272a] bg-white dark:bg-[#18181b] flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#27272a] transition cursor-pointer shadow-2xs group"
        :title="isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'"
        aria-label="Toggle theme"
      >
        <!-- Di mode terang: Icon Bulan (klik untuk ke dark) -->
        <Moon
          v-if="!isDark"
          class="w-4 h-4 text-neutral-700 group-hover:scale-110 transition-transform"
        />
        <!-- Di mode gelap: Icon Matahari (klik untuk ke light) -->
        <Sun
          v-else
          class="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform"
        />
      </button>

      <!-- 2. Icon Lonceng (Bell Notification) -->
      <button
        type="button"
        @click="triggerNotification"
        class="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-neutral-300 dark:border-[#27272a] bg-white dark:bg-[#18181b] flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#27272a] transition cursor-pointer shadow-2xs"
        title="Pemberitahuan"
        aria-label="Notifikasi"
      >
        <Bell class="w-4 h-4" />
        <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-neutral-900 dark:bg-amber-400 ring-2 ring-white dark:ring-[#18181b]" />
      </button>

      <!-- 3. Profile Avatar & Dropdown -->
      <div class="relative">
        <button
          type="button"
          @click="userMenuOpen = !userMenuOpen"
          class="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-neutral-700 dark:border-neutral-300 bg-white dark:bg-[#18181b] flex items-center justify-center text-neutral-700 dark:text-neutral-200 shadow-2xs hover:scale-105 transition cursor-pointer"
          aria-label="Profil Pengguna"
        >
          <User class="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <!-- Dropdown Menu Profil -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="userMenuOpen"
            @click="userMenuOpen = false"
            class="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-xl py-2 z-50 text-xs text-neutral-700 dark:text-neutral-300"
          >
            <div class="px-4 py-2 border-b border-neutral-100 dark:border-[#27272a]">
              <p class="font-bold text-neutral-900 dark:text-white">Admin Digaji.id</p>
              <p class="text-neutral-400 text-[11px] truncate">admin@digaji.id</p>
            </div>
            <router-link
              to="/setting"
              class="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-[#1e1e22] transition"
            >
              <Sliders class="w-3.5 h-3.5 text-neutral-400" />
              Buka Setting
            </router-link>
            <button
              type="button"
              @click="toast.info('Keluar dari akun')"
              class="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left cursor-pointer"
            >
              <LogOut class="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </Transition>
      </div>

    </div>

  </header>
</template>
