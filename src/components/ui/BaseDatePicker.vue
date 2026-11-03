<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Clock,
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [String, Object, Array],
    default: '',
  },
  range: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Pilih tanggal...',
  },
  presets: {
    type: Boolean,
    default: true,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md'
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const containerRef = ref(null)

// Current View Year & Month
const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth()) // 0 - 11

// Date Selection State
const selectedSingle = ref('')
const selectedRangeStart = ref('')
const selectedRangeEnd = ref('')
const hoverDate = ref('')

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

// Format Helper YYYY-MM-DD
const formatDateStr = (d) => {
  if (!d) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

// Format Helper Display ID (e.g., 27 Jan 2025)
const formatDisplay = (str) => {
  if (!str) return ''
  const parts = str.split('-')
  if (parts.length !== 3) return str
  const year = parts[0]
  const monthIdx = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)
  return `${day} ${monthNames[monthIdx]?.slice(0, 3)} ${year}`
}

// Display Value in Input Field
const displayValue = computed(() => {
  if (props.range) {
    if (selectedRangeStart.value && selectedRangeEnd.value) {
      const s = selectedRangeStart.value.split('-')
      const e = selectedRangeEnd.value.split('-')
      if (s.length === 3 && e.length === 3) {
        const sYear = s[0]
        const sMonth = monthNames[parseInt(s[1], 10) - 1]?.slice(0, 3)
        const sDay = parseInt(s[2], 10)
        const eYear = e[0]
        const eMonth = monthNames[parseInt(e[1], 10) - 1]?.slice(0, 3)
        const eDay = parseInt(e[2], 10)

        if (sYear === eYear && sMonth === eMonth) {
          return `${sDay} – ${eDay} ${eMonth} ${eYear}`
        } else if (sYear === eYear) {
          return `${sDay} ${sMonth} – ${eDay} ${eMonth} ${eYear}`
        }
      }
      return `${formatDisplay(selectedRangeStart.value)} — ${formatDisplay(selectedRangeEnd.value)}`
    }
    if (selectedRangeStart.value) {
      return `${formatDisplay(selectedRangeStart.value)} — ...`
    }
    return ''
  }
  return formatDisplay(selectedSingle.value)
})

// Initialize from prop
const initFromProp = () => {
  if (props.range) {
    if (typeof props.modelValue === 'object' && props.modelValue) {
      selectedRangeStart.value = props.modelValue.start || ''
      selectedRangeEnd.value = props.modelValue.end || ''
    }
  } else {
    selectedSingle.value = typeof props.modelValue === 'string' ? props.modelValue : ''
  }
}

watch(() => props.modelValue, initFromProp, { immediate: true })

// Calendar Grid Days Generation
const calendarDays = computed(() => {
  const year = viewYear.value
  const month = viewMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startingDayOfWeek = firstDay.getDay() // 0 is Sunday
  const totalDays = lastDay.getDate()

  // Previous month filler days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  const days = []

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    days.push({
      dateStr: formatDateStr(d),
      dayNumber: d.getDate(),
      isCurrentMonth: false,
    })
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i)
    days.push({
      dateStr: formatDateStr(d),
      dayNumber: i,
      isCurrentMonth: true,
      isToday: formatDateStr(d) === formatDateStr(today),
    })
  }

  // Next month filler days to complete grid (42 cells: 6 weeks)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({
      dateStr: formatDateStr(d),
      dayNumber: i,
      isCurrentMonth: false,
    })
  }

  return days
})

// Navigation
const prevMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

// Day Selection Click
const handleDayClick = (day) => {
  const dateStr = day.dateStr

  if (!props.range) {
    selectedSingle.value = dateStr
    emit('update:modelValue', dateStr)
    emit('change', dateStr)
    isOpen.value = false
    return
  }

  // Range logic
  if (!selectedRangeStart.value || (selectedRangeStart.value && selectedRangeEnd.value)) {
    selectedRangeStart.value = dateStr
    selectedRangeEnd.value = ''
  } else {
    if (new Date(dateStr) < new Date(selectedRangeStart.value)) {
      selectedRangeEnd.value = selectedRangeStart.value
      selectedRangeStart.value = dateStr
    } else {
      selectedRangeEnd.value = dateStr
    }

    const res = { start: selectedRangeStart.value, end: selectedRangeEnd.value }
    emit('update:modelValue', res)
    emit('change', res)
    isOpen.value = false
  }
}

// Check Day State (Selected, In Range)
const isDaySelected = (dateStr) => {
  if (!props.range) {
    return selectedSingle.value === dateStr
  }
  return selectedRangeStart.value === dateStr || selectedRangeEnd.value === dateStr
}

const isDayInRange = (dateStr) => {
  if (!props.range || !selectedRangeStart.value) return false

  const start = new Date(selectedRangeStart.value).getTime()
  const end = selectedRangeEnd.value
    ? new Date(selectedRangeEnd.value).getTime()
    : hoverDate.value && new Date(hoverDate.value).getTime() > start
    ? new Date(hoverDate.value).getTime()
    : null

  if (!end) return false
  const current = new Date(dateStr).getTime()
  return current > start && current < end
}

// Quick Presets
const applyPreset = (daysOffset) => {
  const end = new Date()
  const start = new Date()

  if (daysOffset === 0) {
    // Hari ini
    start.setDate(end.getDate())
  } else if (daysOffset === -1) {
    // Kemarin
    start.setDate(end.getDate() - 1)
    end.setDate(end.getDate() - 1)
  } else if (daysOffset === 'month') {
    // Bulan ini
    start.setDate(1)
  } else {
    start.setDate(end.getDate() - (daysOffset - 1))
  }

  const startStr = formatDateStr(start)
  const endStr = formatDateStr(end)

  if (props.range) {
    selectedRangeStart.value = startStr
    selectedRangeEnd.value = endStr
    const res = { start: startStr, end: endStr }
    emit('update:modelValue', res)
    emit('change', res)
  } else {
    selectedSingle.value = startStr
    emit('update:modelValue', startStr)
    emit('change', startStr)
  }

  viewYear.value = start.getFullYear()
  viewMonth.value = start.getMonth()
  isOpen.value = false
}

// Clear Value
const clear = () => {
  selectedSingle.value = ''
  selectedRangeStart.value = ''
  selectedRangeEnd.value = ''
  if (props.range) {
    emit('update:modelValue', { start: '', end: '' })
  } else {
    emit('update:modelValue', '')
  }
}

// Click outside handling
const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="containerRef" class="relative inline-block w-full select-none text-left">
    <!-- Label -->
    <label
      v-if="label"
      class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
    >
      {{ label }}
    </label>

    <!-- Trigger Input Box -->
    <div
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between rounded-xl border border-neutral-300 dark:border-[#27272a] bg-white dark:bg-[#141417] text-xs text-neutral-800 dark:text-neutral-200 transition-all duration-150 cursor-pointer shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-600 focus-within:ring-2 focus-within:ring-[var(--theme-primary)]"
      :class="[
        size === 'sm' ? 'h-8.5 px-2.5' : 'h-9.5 px-3',
        isOpen ? 'ring-2 ring-[var(--theme-primary)] border-[var(--theme-primary)]' : '',
      ]"
    >
      <div class="flex items-center gap-2 truncate">
        <Calendar class="w-4 h-4 text-neutral-400 shrink-0" />
        <span v-if="displayValue" class="truncate font-medium font-mono text-[11.5px]">
          {{ displayValue }}
        </span>
        <span v-else class="text-neutral-400 truncate">
          {{ placeholder }}
        </span>
      </div>

      <div class="flex items-center gap-1 shrink-0 ml-1">
        <button
          v-if="clearable && displayValue"
          type="button"
          @click.stop="clear"
          class="p-0.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#202025] transition"
          title="Reset Tanggal"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Dropdown Calendar Popover -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 top-full mt-1.5 z-50 rounded-2xl bg-white dark:bg-[#18181c] border border-neutral-200 dark:border-[#2b2b32] shadow-xl p-3 flex flex-col sm:flex-row gap-3 will-change-transform max-w-[calc(100vw-32px)]"
      >
        <!-- Quick Presets Sidebar -->
        <div
          v-if="presets"
          class="sm:w-32 border-b sm:border-b-0 sm:border-r border-neutral-100 dark:border-[#242428] pb-2 sm:pb-0 sm:pr-2.5 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible shrink-0 text-xs"
        >
          <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-0.5 hidden sm:block">
            Preset
          </span>
          <button
            type="button"
            @click="applyPreset(0)"
            class="text-left px-2.5 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#222228] transition whitespace-nowrap cursor-pointer text-[11px]"
          >
            Hari Ini
          </button>
          <button
            type="button"
            @click="applyPreset(7)"
            class="text-left px-2.5 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#222228] transition whitespace-nowrap cursor-pointer text-[11px]"
          >
            7 Hari Terakhir
          </button>
          <button
            type="button"
            @click="applyPreset(30)"
            class="text-left px-2.5 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#222228] transition whitespace-nowrap cursor-pointer text-[11px]"
          >
            30 Hari Terakhir
          </button>
          <button
            type="button"
            @click="applyPreset('month')"
            class="text-left px-2.5 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#222228] transition whitespace-nowrap cursor-pointer text-[11px]"
          >
            Bulan Ini
          </button>
        </div>

        <!-- Main Calendar Matrix -->
        <div class="w-64">
          <!-- Calendar Header: Month + Year Navigator -->
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-[#242428]">
            <span class="font-bold text-xs text-neutral-900 dark:text-white">
              {{ monthNames[viewMonth] }} {{ viewYear }}
            </span>

            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="prevMonth"
                class="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#222228] transition cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft class="w-4 h-4" />
              </button>
              <button
                type="button"
                @click="nextMonth"
                class="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#222228] transition cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Day Names Row -->
          <div class="grid grid-cols-7 gap-1 text-center mb-1">
            <span
              v-for="d in dayNames"
              :key="d"
              class="text-[10px] font-bold text-neutral-400 uppercase py-1"
            >
              {{ d }}
            </span>
          </div>

          <!-- Days Grid (42 Cells) -->
          <div class="grid grid-cols-7 gap-1 text-center text-xs">
            <button
              v-for="day in calendarDays"
              :key="day.dateStr"
              type="button"
              @click="handleDayClick(day)"
              @mouseenter="hoverDate = day.dateStr"
              class="h-7.5 w-7.5 mx-auto rounded-lg flex items-center justify-center font-mono text-[11px] transition-all cursor-pointer relative"
              :class="[
                !day.isCurrentMonth
                  ? 'text-neutral-300 dark:text-neutral-600 opacity-60'
                  : 'text-neutral-700 dark:text-neutral-200',
                isDaySelected(day.dateStr)
                  ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] font-bold shadow-xs z-10'
                  : isDayInRange(day.dateStr)
                  ? 'bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] font-medium rounded-none'
                  : 'hover:bg-neutral-100 dark:hover:bg-[#24242a]',
                day.isToday && !isDaySelected(day.dateStr)
                  ? 'border border-[var(--theme-primary)] font-bold'
                  : '',
              ]"
            >
              {{ day.dayNumber }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

