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

  const toggleTheme = async (event) => {
    const isAppearanceTransition =
      document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isAppearanceTransition) {
      isDark.value = !isDark.value
      applyTheme(isDark.value)
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

    // Animasi Circular Reveal / Wipe identik di kedua arah (Light->Dark & Dark->Light)
    // Durasi diatur 850ms dengan kurva yang lebih tenang dan halus (tidak terburu-buru)
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 850,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    )
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
