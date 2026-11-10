<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import BaseAvatar from './BaseAvatar.vue'
import BaseBadge from './BaseBadge.vue'
import {
  Sun,
  Sunset,
  Moon,
  Coffee,
  Plane,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Sparkles,
} from 'lucide-vue-next'

const props = defineProps({
  days: {
    type: Array,
    required: true,
    // [ { date: '2026-11-10', dayName: 'Senin', shortDay: 'Sen', dateLabel: '10 Nov', dayNumber: 10, isToday: true, isWeekend: false }, ... ]
  },
  rows: {
    type: Array,
    required: true,
    // [ { id: 1, name: 'Budi', nip: 'EMP-001', role: 'Security', divisi: 'Keamanan', avatar: 'BS', schedules: { '2026-11-10': 'P' } }, ... ]
  },
  shiftTypes: {
    type: Array,
    default: () => [
      { code: 'P', name: 'Shift Pagi', time: '07:00 - 15:00', hours: 8, color: 'emerald', icon: Sun },
      { code: 'S', name: 'Shift Siang', time: '15:00 - 23:00', hours: 8, color: 'amber', icon: Sunset },
      { code: 'M', name: 'Shift Malam', time: '23:00 - 07:00', hours: 8, color: 'purple', icon: Moon },
      { code: 'OFF', name: 'Libur (Off)', time: 'Bebas Tugas', hours: 0, color: 'neutral', icon: Coffee },
      { code: 'C', name: 'Cuti / Izin', time: 'Cuti Resmi', hours: 0, color: 'blue', icon: Plane },
    ],
  },
  mode: {
    type: String,
    default: 'weekly', // 'weekly' | 'monthly'
  },
  editable: {
    type: Boolean,
    default: true,
  },
  minCoverage: {
    type: Object,
    default: () => ({ P: 2, S: 2, M: 1 }),
  },
  canPrevWeek: {
    type: Boolean,
    default: true,
  },
  canNextWeek: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  'cell-change',
  'cell-click',
  'row-click',
  'column-shift-change',
  'prev-week',
  'next-week',
])

// ========================================================
// 1. REF CONTAINER & THEAD SCROLL INTERACTION
// Wheel di thead -> scroll horizontal
// Wheel di tbody -> scroll vertical
// ========================================================
const scrollContainerRef = ref(null)
const theadRef = ref(null)

const onTheadWheel = (e) => {
  if (!scrollContainerRef.value) return
  // Jangan scroll horizontal tabel jika kursor sedang di dalam popover dropdown
  if (e.target.closest('.dropdown-popover')) return

  if (Math.abs(e.deltaY) > 0) {
    e.preventDefault()
    // Scroll horizontal secara mulus
    scrollContainerRef.value.scrollLeft += e.deltaY * 1.2
  }
}

// Handler khusus untuk mencegah scroll chaining saat scroll list shift di dalam popover
const onDropdownListWheel = (e) => {
  e.stopPropagation()
  const el = e.currentTarget
  if (!el) return
  const isScrollingDown = e.deltaY > 0
  const isScrollingUp = e.deltaY < 0

  const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1
  const isAtTop = el.scrollTop <= 0

  if ((isScrollingDown && isAtBottom) || (isScrollingUp && isAtTop)) {
    e.preventDefault()
  }
}

// Click outside & Escape listener untuk menutup popover
const handleDocumentClick = (e) => {
  if (
    !e.target.closest('.dropdown-popover') &&
    !e.target.closest('.roster-trigger-btn')
  ) {
    activeCell.value = null
    activeColumnHeader.value = null
  }
}

const handleDocumentKeydown = (e) => {
  if (e.key === 'Escape') {
    activeCell.value = null
    activeColumnHeader.value = null
  }
}

onMounted(() => {
  if (theadRef.value) {
    theadRef.value.addEventListener('wheel', onTheadWheel, { passive: false })
  }
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleDocumentKeydown)

  if (props.mode === 'monthly') {
    setTimeout(() => {
      scrollToToday(false)
    }, 120)
  }
})

onUnmounted(() => {
  if (theadRef.value) {
    theadRef.value.removeEventListener('wheel', onTheadWheel)
  }
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})

// ========================================================
// 2. DYNAMIC POPOVER PLACEMENT (SMART AUTO FLIP & ALIGN)
// Bawah -> flip ke atas (bottom-full mb-1.5)
// Kanan -> melebar ke kiri (right-0 left-auto)
// Kiri -> melebar ke kanan (left-0 right-auto)
// Tengah -> center (left-1/2 -translate-x-1/2)
// ========================================================
const computePopoverPlacement = (targetEl) => {
  if (!targetEl) return { vertical: 'bottom', horizontal: 'center' }

  const rect = targetEl.getBoundingClientRect()
  const container = scrollContainerRef.value
  const containerRect = container?.getBoundingClientRect() || {
    top: 0,
    bottom: window.innerHeight,
    left: 0,
    right: window.innerWidth,
  }

  // thead sticky ~48px, tfoot sticky ~56px
  const effectiveContainerTop = containerRect.top + 48
  const effectiveContainerBottom = Math.min(containerRect.bottom - 56, window.innerHeight - 10)

  const spaceBelow = effectiveContainerBottom - rect.bottom
  const spaceAbove = rect.top - effectiveContainerTop

  // Popover butuh tinggi ~250px - 270px
  let vertical = 'bottom'
  if (spaceBelow < 265 && spaceAbove > spaceBelow) {
    vertical = 'top'
  } else if (spaceBelow < 220) {
    vertical = 'top'
  }

  // Tentukan batas horizontal
  const effectiveContainerRight = Math.min(containerRect.right, window.innerWidth)
  const effectiveContainerLeft = Math.max(containerRect.left + 240, 0) // setelah sticky Pegawai (~240px)
  const centerX = rect.left + rect.width / 2

  let horizontal = 'center'
  if (effectiveContainerRight - centerX < 115 || effectiveContainerRight - rect.left < 215) {
    horizontal = 'right'
  } else if (centerX - effectiveContainerLeft < 115 || rect.right - effectiveContainerLeft < 215) {
    horizontal = 'left'
  }

  return { vertical, horizontal }
}

const getPlacementClasses = (placement) => {
  if (!placement) return 'top-full mt-1.5 left-1/2 -translate-x-1/2 bottom-auto'

  const vClass = placement.vertical === 'top' ? 'bottom-full mb-1.5 top-auto' : 'top-full mt-1.5 bottom-auto'

  let hClass = 'left-1/2 -translate-x-1/2'
  if (placement.horizontal === 'right') {
    hClass = 'right-0 left-auto'
  } else if (placement.horizontal === 'left') {
    hClass = 'left-0 right-auto'
  }

  return `${vClass} ${hClass}`
}

// ========================================================
// 3. STATE POPOVER CELL INDIVIDU (SEARCHABLE DROPDOWN)
// ========================================================
const activeCell = ref(null) // { rowId, rowName, date, dayLabel, currentCode, placement }
const cellSearchQuery = ref('')
const cellSearchInputRef = ref(null)

const openShiftSelector = (row, day, event) => {
  if (!props.editable) {
    emit('cell-click', { row, day, currentCode: row.schedules?.[day.date] || 'OFF' })
    return
  }

  // Tutup dropdown thead jika sedang terbuka
  activeColumnHeader.value = null

  const currentCode = row.schedules?.[day.date] || 'OFF'
  if (activeCell.value && activeCell.value.rowId === row.id && activeCell.value.date === day.date) {
    activeCell.value = null
  } else {
    cellSearchQuery.value = ''
    const placement = computePopoverPlacement(event?.currentTarget)
    activeCell.value = {
      rowId: row.id,
      rowName: row.name,
      date: day.date,
      dayLabel: `${day.dayName}, ${day.dateLabel}`,
      currentCode,
      placement,
    }
    nextTick(() => {
      cellSearchInputRef.value?.focus()
    })
  }
}

const selectShift = (code) => {
  if (!activeCell.value) return
  emit('cell-change', {
    rowId: activeCell.value.rowId,
    date: activeCell.value.date,
    newShiftCode: code,
  })
  activeCell.value = null
}

const filteredCellShiftTypes = computed(() => {
  if (!cellSearchQuery.value.trim()) return props.shiftTypes
  const q = cellSearchQuery.value.toLowerCase().trim()
  return props.shiftTypes.filter(
    (s) =>
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.time.toLowerCase().includes(q)
  )
})

// ========================================================
// 4. STATE POPOVER THEAD COLUMN (SEARCHABLE DROPDOWN MASSAL)
// ========================================================
const activeColumnHeader = ref(null) // { date, dayName, dateLabel, placement }
const columnSearchQuery = ref('')
const columnSearchInputRef = ref(null)

const toggleColumnShiftSelector = (day, event) => {
  if (!props.editable) return

  // Tutup popover cell jika sedang terbuka
  activeCell.value = null

  if (activeColumnHeader.value && activeColumnHeader.value.date === day.date) {
    activeColumnHeader.value = null
  } else {
    columnSearchQuery.value = ''
    const placement = computePopoverPlacement(event?.currentTarget)
    // Di thead, arah vertikal selalu muncul ke bawah
    placement.vertical = 'bottom'
    activeColumnHeader.value = {
      date: day.date,
      dayName: day.dayName,
      dateLabel: day.dateLabel,
      placement,
    }
    nextTick(() => {
      columnSearchInputRef.value?.focus()
    })
  }
}

const selectColumnShift = (code) => {
  if (!activeColumnHeader.value) return
  emit('column-shift-change', {
    date: activeColumnHeader.value.date,
    dayLabel: `${activeColumnHeader.value.dayName}, ${activeColumnHeader.value.dateLabel}`,
    shiftCode: code,
  })
  activeColumnHeader.value = null
}

const filteredColumnShiftTypes = computed(() => {
  if (!columnSearchQuery.value.trim()) return props.shiftTypes
  const q = columnSearchQuery.value.toLowerCase().trim()
  return props.shiftTypes.filter(
    (s) =>
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.time.toLowerCase().includes(q)
  )
})

// ========================================================
// 4. UTILITY & BADGE STYLING
// ========================================================
const getShiftMeta = (code) => {
  const found = props.shiftTypes.find((s) => s.code === code)
  if (found) return found
  return {
    code: code || 'OFF',
    name: 'Libur',
    time: 'Off',
    hours: 0,
    color: 'neutral',
  }
}

const getShiftBadgeClasses = (code) => {
  switch (code) {
    case 'P':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
    case 'S':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-950/60'
    case 'M':
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40 hover:bg-purple-100 dark:hover:bg-purple-950/60'
    case 'C':
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-950/60'
    case 'OFF':
    default:
      return 'bg-neutral-100 dark:bg-[var(--theme-surface-muted)] text-neutral-500 dark:text-neutral-400 border-neutral-200/60 dark:border-[var(--theme-border)] hover:bg-neutral-200/60 dark:hover:bg-[var(--theme-surface-raised)]'
  }
}

// Menghitung total jam kerja per pegawai
const calculateEmployeeTotalHours = (row) => {
  if (!row.schedules) return 0
  let total = 0
  props.days.forEach((day) => {
    const code = row.schedules[day.date]
    const meta = getShiftMeta(code)
    total += meta.hours || 0
  })
  return total
}

// Menghitung shift summary per hari
const dailyCoverageSummary = computed(() => {
  const summary = {}

  props.days.forEach((day) => {
    const counts = { P: 0, S: 0, M: 0, OFF: 0, C: 0 }
    props.rows.forEach((row) => {
      const code = row.schedules?.[day.date] || 'OFF'
      if (counts[code] !== undefined) {
        counts[code]++
      } else {
        counts.OFF++
      }
    })

    const minP = props.minCoverage.P || 0
    const minS = props.minCoverage.S || 0
    const minM = props.minCoverage.M || 0
    const isCoverageMet = counts.P >= minP && counts.S >= minS && counts.M >= minM

    summary[day.date] = {
      ...counts,
      isCoverageMet,
    }
  })

  return summary
})

// ========================================================
// 5. AUTO-SCROLL KE HARI INI DI TENGAH TABEL (MODE BULANAN)
// ========================================================
const scrollToToday = (smooth = true) => {
  nextTick(() => {
    requestAnimationFrame(() => {
      if (!scrollContainerRef.value) return
      const container = scrollContainerRef.value
      const todayTh = container.querySelector('th[data-today="true"]')
      if (!todayTh) return

      const stickyTh = container.querySelector('th.sticky')
      const stickyWidth = stickyTh ? stickyTh.offsetWidth : 240

      const availableWidth = container.clientWidth - stickyWidth
      const thLeft = todayTh.offsetLeft
      const thWidth = todayTh.offsetWidth

      // Hitung posisi scrollLeft agar kolom Hari Ini berada tepat di tengah area terlihat
      const targetScrollLeft = thLeft - stickyWidth - (availableWidth / 2) + (thWidth / 2)

      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: smooth ? 'smooth' : 'auto',
      })
    })
  })
}

// Watch pergantian mode: jika masuk bulanan, otomatis scroll ke hari ini di tengah tabel
watch(
  () => props.mode,
  (newMode) => {
    if (newMode === 'monthly') {
      setTimeout(() => {
        scrollToToday(true)
      }, 50)
    } else {
      nextTick(() => {
        scrollContainerRef.value?.scrollTo({ left: 0, behavior: 'smooth' })
      })
    }
  }
)

// Watch days jika ada pembaruan hari pada mode bulanan
watch(
  () => props.days,
  () => {
    if (props.mode === 'monthly') {
      setTimeout(() => {
        scrollToToday(true)
      }, 50)
    }
  }
)

defineExpose({
  scrollToToday,
})
</script>

<template>
  <div class="h-full flex flex-col min-h-0 bg-white dark:bg-[var(--theme-surface)] rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs overflow-hidden select-none relative">
    
    <!-- Table Matrix Scrollable Container -->
    <div ref="scrollContainerRef" class="flex-1 min-h-0 overflow-auto relative scroll-smooth">
      <table class="w-full border-collapse text-left text-xs min-w-max">
        
        <!-- ======================================================== -->
        <!-- 1. TABLE HEADER: PEGAWAI & HARI-HARI KERJA               -->
        <!-- Saat cursor di thead, scroll mouse menggeser ke samping  -->
        <!-- ======================================================== -->
        <thead
          ref="theadRef"
          class="sticky top-0 bg-neutral-50/95 dark:bg-[var(--theme-surface-raised)]/95 backdrop-blur-xs border-b border-neutral-200 dark:border-[var(--theme-border)] text-neutral-600 dark:text-neutral-300 font-semibold shadow-2xs cursor-ew-resize group/thead"
          :class="activeColumnHeader ? 'z-50' : 'z-20'"
          title="Scroll mouse saat kursor di header untuk menggeser ke samping"
        >
          <tr>
            <!-- Left Sticky Header: Karyawan -->
            <th class="sticky left-0 z-30 bg-neutral-50 dark:bg-[var(--theme-surface-raised)] py-2.5 px-3.5 w-64 min-w-[240px] border-r border-neutral-200/80 dark:border-[var(--theme-border)] shadow-[1px_0_0_0_rgba(0,0,0,0.05)] cursor-default">
              <div class="flex items-center justify-between">
                <span class="uppercase text-[10px] tracking-wider font-bold text-neutral-500">Pegawai ({{ rows.length }})</span>
                <span class="text-[10px] text-neutral-400 font-mono">Total Jam</span>
              </div>
            </th>

            <!-- Day Columns (Semua Mode Memiliki Lebar yang Nyaman untuk Format Badge [Icon | Nama Shift]) -->
            <th
              v-for="(day, index) in days"
              :key="day.date"
              :data-today="day.isToday ? 'true' : undefined"
              class="py-2 px-2 text-center border-r border-neutral-200/60 dark:border-[var(--theme-border)] last:border-r-0 relative group/th min-w-[125px] w-[130px]"
              :class="[
                (activeColumnHeader && activeColumnHeader.date === day.date) ? 'z-40' : '',
                day.isToday ? 'bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]' : '',
                day.isWeekend && !day.isToday ? 'bg-neutral-100/50 dark:bg-neutral-900/20 text-neutral-400' : ''
              ]"
            >
              <!-- Navigasi Minggu Sebelumnya (<) di tepi kiri kolom hari (hanya tampil saat kursor di thead pada mode mingguan) -->
              <button
                v-if="mode === 'weekly' && index === 0"
                type="button"
                @click.stop="emit('prev-week')"
                class="absolute -left-3.5 top-1/2 -translate-y-1/2 z-40 w-7 h-7 rounded-full bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-300 dark:border-[var(--theme-border)] shadow-md flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-[var(--theme-surface-muted)] transition-all opacity-0 group-hover/thead:opacity-100"
                :class="[
                  activeColumnHeader ? 'pointer-events-none !opacity-0' : '',
                  canPrevWeek ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                ]"
                :disabled="!canPrevWeek"
                title="Minggu Sebelumnya"
              >
                <ChevronLeft class="w-3.5 h-3.5" />
              </button>

              <!-- Navigasi Minggu Berikutnya (>) di tepi kanan kolom hari (hanya tampil saat kursor di thead pada mode mingguan) -->
              <button
                v-if="mode === 'weekly' && index === days.length - 1"
                type="button"
                @click.stop="emit('next-week')"
                class="absolute -right-3.5 top-1/2 -translate-y-1/2 z-40 w-7 h-7 rounded-full bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-300 dark:border-[var(--theme-border)] shadow-md flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-[var(--theme-surface-muted)] transition-all opacity-0 group-hover/thead:opacity-100"
                :class="[
                  activeColumnHeader ? 'pointer-events-none !opacity-0' : '',
                  canNextWeek ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                ]"
                :disabled="!canNextWeek"
                title="Minggu Berikutnya"
              >
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
              <div class="flex flex-col items-center justify-center gap-0.5">
                <!-- Day Name & Today Indicator -->
                <div class="flex items-center gap-1">
                  <span class="font-bold leading-tight text-xs">
                    {{ day.dayName }}
                  </span>
                  <span
                    v-if="day.isToday"
                    class="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-[var(--theme-primary)] text-[var(--theme-primary-text)] tracking-wider"
                  >
                    Hari Ini
                  </span>
                </div>

                <!-- Date Label & Trigger Dropdown Massal Kolom -->
                <div class="flex items-center justify-center gap-1">
                  <span
                    class="font-mono text-[11px]"
                    :class="day.isToday ? 'text-[var(--theme-primary)] font-extrabold' : 'opacity-80'"
                  >
                    {{ day.dateLabel }}
                  </span>

                  <!-- Tombol Trigger Dropdown Searchable di thead -->
                  <button
                    v-if="editable"
                    type="button"
                    @click.stop="toggleColumnShiftSelector(day, $event)"
                    class="roster-trigger-btn p-0.5 rounded-md text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-[var(--theme-surface-muted)] transition opacity-60 group-hover/th:opacity-100 cursor-pointer"
                    :title="`Terapkan shift massal kolom untuk ${day.dayName}, ${day.dateLabel}`"
                  >
                    <ChevronDown class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <!-- ============================================== -->
              <!-- POPOVER SEARCHABLE DROPDOWN KOLOM THEAD         -->
              <!-- ============================================== -->
              <div
                v-if="activeColumnHeader && activeColumnHeader.date === day.date"
                class="dropdown-popover absolute z-50 w-52 p-2.5 rounded-2xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-xl animate-in fade-in zoom-in-95 duration-150 text-left font-normal cursor-default"
                :class="getPlacementClasses(activeColumnHeader.placement)"
                @wheel.stop
              >
                <!-- Header Popover Kolom -->
                <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-neutral-100 dark:border-[var(--theme-border)]">
                  <div>
                    <span class="font-bold text-[11px] text-neutral-900 dark:text-white block leading-tight">
                      Shift Massal Kolom
                    </span>
                    <span class="text-[9.5px] text-neutral-400 block truncate">
                      {{ activeColumnHeader.dayName }}, {{ activeColumnHeader.dateLabel }}
                    </span>
                  </div>
                  <button
                    type="button"
                    @click.stop="activeColumnHeader = null"
                    class="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>

                <!-- Input Pencarian Shift (Searchable Dropdown) -->
                <div class="relative mb-2">
                  <Search class="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref="columnSearchInputRef"
                    v-model="columnSearchQuery"
                    type="text"
                    placeholder="Cari shift..."
                    class="w-full pl-8 pr-6 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[var(--theme-surface-muted)] border border-neutral-200 dark:border-[var(--theme-border)] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
                  />
                  <button
                    v-if="columnSearchQuery"
                    type="button"
                    @click.stop="columnSearchQuery = ''"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>

                <!-- Opsi Shift yang Difilter -->
                <div
                  class="space-y-1 max-h-48 overflow-y-auto pr-0.5 overscroll-contain"
                  @wheel="onDropdownListWheel"
                >
                  <button
                    v-for="st in filteredColumnShiftTypes"
                    :key="st.code"
                    type="button"
                    @click.stop="selectColumnShift(st.code)"
                    class="w-full px-2 py-1.5 rounded-xl text-left text-xs transition flex items-center justify-between gap-1.5 hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-muted)] text-neutral-800 dark:text-neutral-200 cursor-pointer"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span
                        class="w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold shrink-0"
                        :class="getShiftBadgeClasses(st.code)"
                      >
                        {{ st.code }}
                      </span>
                      <div class="min-w-0">
                        <span class="block leading-tight text-xs font-semibold">{{ st.name }}</span>
                        <span class="block text-[9.5px] text-neutral-400 font-mono">{{ st.time }}</span>
                      </div>
                    </div>
                  </button>

                  <div v-if="filteredColumnShiftTypes.length === 0" class="py-3 text-center text-neutral-400 text-[11px]">
                    Shift tidak ditemukan
                  </div>
                </div>

                <!-- Hint Keterangan Kolom -->
                <div class="pt-2 mt-1.5 border-t border-neutral-100 dark:border-[var(--theme-border)] text-[9.5px] text-neutral-400 text-center">
                  Terapkan ke seluruh pegawai pada hari ini
                </div>
              </div>
            </th>
          </tr>
        </thead>

        <!-- ======================================================== -->
        <!-- 2. TABLE BODY: EMPLOYEE ROWS & SCHEDULE CELLS            -->
        <!-- Format Selalu Menggunakan Badge: [Icon/Kode | Nama Shift]-->
        <!-- ======================================================== -->
        <tbody class="divide-y divide-neutral-100 dark:divide-[var(--theme-border)]">
          <tr
            v-for="row in rows"
            :key="row.id"
            class="hover:bg-neutral-50/70 dark:hover:bg-[var(--theme-surface-muted)]/50 transition-colors group"
            :class="[
              (activeCell && activeCell.rowId === row.id) ? 'relative z-40' : ''
            ]"
          >
            <!-- Left Sticky Column: Pegawai Info -->
            <td class="sticky left-0 z-10 bg-white dark:bg-[var(--theme-surface)] group-hover:bg-neutral-50/90 dark:group-hover:bg-[var(--theme-surface-raised)] py-2 px-3 border-r border-neutral-200/80 dark:border-[var(--theme-border)] transition-colors shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
              <div class="flex items-center justify-between gap-2">
                <div
                  class="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  @click="emit('row-click', row)"
                >
                  <BaseAvatar
                    :name="row.name"
                    size="sm"
                    class="shrink-0"
                  />
                  <div class="min-w-0">
                    <span class="font-bold text-neutral-900 dark:text-white block truncate leading-tight hover:text-[var(--theme-primary)] transition">
                      {{ row.name }}
                    </span>
                    <span class="text-[10px] text-neutral-400 block truncate mt-0.5">
                      {{ row.role }}
                    </span>
                  </div>
                </div>

                <!-- Total Hours Badge -->
                <div class="text-right shrink-0">
                  <span class="px-1.5 py-0.5 rounded-md text-[10.5px] font-mono font-bold bg-neutral-100 dark:bg-[var(--theme-surface-muted)] text-neutral-700 dark:text-neutral-300">
                    {{ calculateEmployeeTotalHours(row) }}j
                  </span>
                </div>
              </div>
            </td>

            <!-- Interactive Shift Cells: Selalu Format [Kode/Icon | Nama Shift] Sesuai Permintaan -->
            <td
              v-for="day in days"
              :key="day.date"
              class="p-1.5 text-center border-r border-neutral-100 dark:border-[var(--theme-border)] last:border-r-0 relative min-w-[125px]"
              :class="[
                (activeCell && activeCell.rowId === row.id && activeCell.date === day.date) ? 'z-40' : '',
                day.isToday ? 'bg-[var(--theme-primary-soft)]/20' : '',
                day.isWeekend && !day.isToday ? 'bg-neutral-50/30 dark:bg-neutral-900/10' : ''
              ]"
            >
              <!-- Cell Shift Button: Tampilan Pill Bulat Sesuai Screenshot Pengguna -->
              <button
                type="button"
                @click.stop="openShiftSelector(row, day, $event)"
                class="roster-trigger-btn w-full py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between gap-1.5 shadow-2xs group/cell cursor-pointer whitespace-nowrap"
                :class="getShiftBadgeClasses(row.schedules?.[day.date])"
                :title="`${row.name} - ${day.dayName}: ${getShiftMeta(row.schedules?.[day.date]).name} (${getShiftMeta(row.schedules?.[day.date]).time})`"
              >
                <!-- Badge Kiri: Kotak Kode Shift (P, S, M, OFF, C) -->
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black font-mono shrink-0 bg-white/70 dark:bg-black/30 shadow-2xs">
                    {{ row.schedules?.[day.date] || 'OFF' }}
                  </span>
                  <!-- Label Kanan: Nama Shift Lengkap (Shift Malam, Shift Pagi, dll) -->
                  <span class="text-[11px] font-semibold truncate">
                    {{ getShiftMeta(row.schedules?.[day.date]).name }}
                  </span>
                </div>

                <ChevronDown
                  v-if="editable"
                  class="w-3 h-3 opacity-0 group-hover/cell:opacity-80 transition shrink-0 ml-0.5"
                />
              </button>

              <!-- ============================================== -->
              <!-- POPOVER SEARCHABLE DROPDOWN CELL INDIVIDU       -->
              <!-- ============================================== -->
              <div
                v-if="activeCell && activeCell.rowId === row.id && activeCell.date === day.date"
                class="dropdown-popover absolute z-50 w-52 p-2.5 rounded-2xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-xl animate-in fade-in zoom-in-95 duration-150 text-left font-normal cursor-default"
                :class="getPlacementClasses(activeCell.placement)"
                @wheel.stop
              >
                <!-- Popover Header -->
                <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-neutral-100 dark:border-[var(--theme-border)]">
                  <div>
                    <span class="font-bold text-[11px] text-neutral-900 dark:text-white block leading-tight truncate">
                      Pilih Shift Pegawai
                    </span>
                    <span class="text-[9.5px] text-neutral-400 block truncate">
                      {{ activeCell.dayLabel }}
                    </span>
                  </div>
                  <button
                    type="button"
                    @click.stop="activeCell = null"
                    class="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>

                <!-- Input Searchable Dropdown Cell -->
                <div class="relative mb-2">
                  <Search class="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref="cellSearchInputRef"
                    v-model="cellSearchQuery"
                    type="text"
                    placeholder="Cari shift..."
                    class="w-full pl-8 pr-6 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[var(--theme-surface-muted)] border border-neutral-200 dark:border-[var(--theme-border)] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
                  />
                  <button
                    v-if="cellSearchQuery"
                    type="button"
                    @click.stop="cellSearchQuery = ''"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>

                <!-- Shift Options yang Difilter -->
                <div
                  class="space-y-1 max-h-48 overflow-y-auto pr-0.5 overscroll-contain"
                  @wheel="onDropdownListWheel"
                >
                  <button
                    v-for="st in filteredCellShiftTypes"
                    :key="st.code"
                    type="button"
                    @click.stop="selectShift(st.code)"
                    class="w-full px-2 py-1.5 rounded-xl text-left text-xs transition flex items-center justify-between gap-1.5 cursor-pointer"
                    :class="[
                      activeCell.currentCode === st.code
                        ? 'bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] font-bold'
                        : 'hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-muted)] text-neutral-800 dark:text-neutral-200'
                    ]"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span
                        class="w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold shrink-0"
                        :class="getShiftBadgeClasses(st.code)"
                      >
                        {{ st.code }}
                      </span>
                      <div class="min-w-0">
                        <span class="block leading-tight text-xs font-semibold">{{ st.name }}</span>
                        <span class="block text-[9.5px] text-neutral-400 font-mono">{{ st.time }}</span>
                      </div>
                    </div>
                  </button>

                  <div v-if="filteredCellShiftTypes.length === 0" class="py-3 text-center text-neutral-400 text-[11px]">
                    Shift tidak ditemukan
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- ======================================================== -->
        <!-- 3. TABLE FOOTER: SHIFT COVERAGE SUMMARY                  -->
        <!-- ======================================================== -->
        <tfoot class="sticky bottom-0 z-20 bg-neutral-50 dark:bg-[var(--theme-surface-raised)] border-t border-neutral-200 dark:border-[var(--theme-border)] shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
          <tr>
            <!-- Left Sticky Footer: Total Coverage -->
            <td class="sticky left-0 z-30 bg-neutral-50 dark:bg-[var(--theme-surface-raised)] py-2.5 px-3.5 border-r border-neutral-200/80 dark:border-[var(--theme-border)] shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
              <div>
                <span class="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Coverage Shift</span>
                <span class="text-[10.5px] text-neutral-400 block mt-0.5">Distribusi Petugas</span>
              </div>
            </td>

            <!-- Daily Coverage Badges -->
            <td
              v-for="day in days"
              :key="day.date"
              class="p-1.5 text-center border-r border-neutral-200/60 dark:border-[var(--theme-border)] last:border-r-0 min-w-[125px]"
              :class="day.isToday ? 'bg-[var(--theme-primary-soft)]/30' : ''"
            >
              <div class="space-y-1">
                <div class="flex items-center justify-center gap-1 text-[10px] font-mono">
                  <span class="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold" title="Shift Pagi">
                    P: {{ dailyCoverageSummary[day.date]?.P || 0 }}
                  </span>
                  <span class="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold" title="Shift Siang">
                    S: {{ dailyCoverageSummary[day.date]?.S || 0 }}
                  </span>
                  <span class="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold" title="Shift Malam">
                    M: {{ dailyCoverageSummary[day.date]?.M || 0 }}
                  </span>
                </div>

                <div class="flex items-center justify-center gap-1">
                  <span
                    class="text-[9.5px] font-medium flex items-center gap-1"
                    :class="dailyCoverageSummary[day.date]?.isCoverageMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400 font-bold'"
                  >
                    <component
                      :is="dailyCoverageSummary[day.date]?.isCoverageMet ? CheckCircle2 : AlertCircle"
                      class="w-3 h-3 shrink-0"
                    />
                    <span>{{ dailyCoverageSummary[day.date]?.isCoverageMet ? 'Lengkap' : 'Kurang' }}</span>
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>

      </table>
    </div>

  </div>
</template>
