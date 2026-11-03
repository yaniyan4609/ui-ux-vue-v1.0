import { ref, nextTick } from 'vue'

const isDark = ref(false)

export function useTheme() {
  const applyTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('template_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('template_theme', 'light')
    }
  }

  // Deteksi perangkat spesifikasi rendah (Low-End Hardware)
  // Menghindari stuttering clip-path pada GPU dengan bandwidth sempit
  const isLowEndDevice = () => {
    if (typeof window === 'undefined') return false
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return true

    const cores = navigator.hardwareConcurrency || 4
    const memory = navigator.deviceMemory || 4 // dalam GB (Chromium/Android)
    return cores < 4 || memory < 4
  }

  const toggleTheme = async (event) => {
    const isAppearanceTransition =
      typeof document !== 'undefined' &&
      document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isAppearanceTransition) {
      isDark.value = !isDark.value
      applyTheme(isDark.value)
      return
    }

    // Pada perangkat low-end, gunakan transisi crossfade native ringan tanpa kalkulasi clip-path berat
    if (isLowEndDevice()) {
      document.startViewTransition(async () => {
        isDark.value = !isDark.value
        applyTheme(isDark.value)
        await nextTick()
      })
      return
    }

    // Pusat lingkaran: koordinat tengah tombol icon tema yang diklik
    const rect = event?.currentTarget?.getBoundingClientRect?.()
    const x = rect ? rect.left + rect.width / 2 : (event?.clientX ?? window.innerWidth - 40)
    const y = rect ? rect.top + rect.height / 2 : (event?.clientY ?? 20)

    // Jarak terjauh ke sudut layar
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(async () => {
      isDark.value = !isDark.value
      applyTheme(isDark.value)
      await nextTick()
    })

    await transition.ready

    // Animasi Circular Reveal dioptimasi ke 650ms dengan kurva GPU-friendly
    // Mencegah fill-rate starvation dan memory bandwidth bottleneck
    const animation = document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 650,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    )

    try {
      await animation.finished
    } catch {
      // ignore
    }
  }

  const initTheme = () => {
    const saved = localStorage.getItem('template_theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    if (saved === 'dark' || (!saved && prefersDark)) {
      isDark.value = true
      applyTheme(true)
    } else {
      isDark.value = false
      applyTheme(false)
    }
  }

  return {
    isDark,
    toggleTheme,
    initTheme,
  }
}
