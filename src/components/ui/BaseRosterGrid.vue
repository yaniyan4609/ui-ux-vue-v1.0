<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
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
})

const emit = defineEmits([
  'cell-change',
  'cell-click',
  'row-click',
  'column-shift-change',
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
  if (Math.abs(e.deltaY) > 0) {
    e.preventDefault()
    // Scroll horizontal secara mulus
    scrollContainerRef.value.scrollLeft += e.deltaY * 1.2
  }
}

onMounted(() => {
  if (theadRef.value) {
    theadRef.value.addEventListener('wheel', onTheadWheel, { passive: false })
  }
})

onUnmounted(() => {
  if (theadRef.value) {
    theadRef.value.removeEventListener('wheel', onTheadWheel)
  }
})

// ========================================================
// 2. STATE POPOVER CELL INDIVIDU (SEARCHABLE DROPDOWN)
// ========================================================
const activeCell = ref(null) // { rowId, rowName, date, dayLabel, currentCode }
const cellSearchQuery = ref('')
const cellSearchInputRef = ref(null)

const openShiftSelector = (row, day) => {
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
    activeCell.value = {
      rowId: row.id,
      rowName: row.name,
      date: day.date,
      dayLabel: `${day.dayName}, ${day.dateLabel}`,
      currentCode,
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
// 3. STATE POPOVER THEAD COLUMN (SEARCHABLE DROPDOWN MASSAL)
// ========================================================
const activeColumnHeader = ref(null) // { date, dayName, dateLabel }
const columnSearchQuery = ref('')
const columnSearchInputRef = ref(null)

const toggleColumnShiftSelector = (day) => {
  if (!props.editable) return

  // Tutup popover cell jika sedang terbuka
  activeCell.value = null

  if (activeColumnHeader.value && activeColumnHeader.value.date === day.date) {
    activeColumnHeader.value = null
  } else {
    columnSearchQuery.value = ''
    activeColumnHeader.value = {
      date: day.date,
      dayName: day.dayName,
      dateLabel: day.dateLabel,
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
          class="sticky top-0 z-20 bg-neutral-50/95 dark:bg-[var(--theme-surface-raised)]/95 backdrop-blur-xs border-b border-neutral-200 dark:border-[var(--theme-border)] text-neutral-600 dark:text-neutral-300 font-semibold shadow-2xs cursor-ew-resize"
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
              v-for="day in days"
              :key="day.date"
              class="py-2 px-2 text-center border-r border-neutral-200/60 dark:border-[var(--theme-border)] last:border-r-0 relative group/th min-w-[125px] w-[130px]"
              :class="[
                day.isToday ? 'bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]' : '',
                day.isWeekend && !day.isToday ? 'bg-neutral-100/50 dark:bg-neutral-900/20 text-neutral-400' : ''
              ]"
            >
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
                    @click.stop="toggleColumnShiftSelector(day)"
                    class="p-0.5 rounded-md text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-[var(--theme-surface-muted)] transition opacity-60 group-hover/th:opacity-100 cursor-pointer"
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
                class="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-40 w-52 p-2.5 rounded-2xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-xl animate-in fade-in zoom-in-95 duration-150 text-left font-normal cursor-default"
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
                <div class="space-y-1 max-h-48 overflow-y-auto pr-0.5">
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
                day.isToday ? 'bg-[var(--theme-primary-soft)]/20' : '',
                day.isWeekend && !day.isToday ? 'bg-neutral-50/30 dark:bg-neutral-900/10' : ''
              ]"
            >
              <!-- Cell Shift Button: Tampilan Pill Bulat Sesuai Screenshot Pengguna -->
              <button
                type="button"
                @click="openShiftSelector(row, day)"
                class="w-full py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between gap-1.5 shadow-2xs group/cell cursor-pointer whitespace-nowrap"
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
                class="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-40 w-52 p-2.5 rounded-2xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-xl animate-in fade-in zoom-in-95 duration-150 text-left font-normal cursor-default"
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
                <div class="space-y-1 max-h-48 overflow-y-auto pr-0.5">
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
