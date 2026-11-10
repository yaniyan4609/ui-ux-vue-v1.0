<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import BaseBadge from './BaseBadge.vue'
import BaseAvatar from './BaseAvatar.vue'
import BaseInput from './BaseInput.vue'
import BaseSwitch from './BaseSwitch.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseSegmentedControl from './BaseSegmentedControl.vue'
import BaseSearchableSelect from './BaseSearchableSelect.vue'
import {
  Sparkles,
  Plus,
  Trash2,
  Database,
  Clock,
  Calendar,
  CalendarDays,
  Users,
  Search,
  Check,
  X,
  ChevronDown,
  Layers,
  Settings2,
  Building2,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Plane,
  Wand2,
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  employees: {
    type: Array,
    default: () => [],
  },
  shiftTypes: {
    type: Array,
    default: () => [
      { code: 'P', name: 'Shift Pagi', time: '07:00 - 15:00', hours: 8, badgeVariant: 'success' },
      { code: 'S', name: 'Shift Siang', time: '15:00 - 23:00', hours: 8, badgeVariant: 'warning' },
      { code: 'M', name: 'Shift Malam', time: '23:00 - 07:00', hours: 8, badgeVariant: 'purple' },
      { code: 'OFF', name: 'Libur (Off)', time: 'Bebas Tugas', hours: 0, badgeVariant: 'neutral' },
      { code: 'C', name: 'Cuti / Izin', time: 'Disetujui HR', hours: 0, badgeVariant: 'info' },
    ],
  },
  rosterTemplates: {
    type: Array,
    default: () => [],
  },
  days: {
    type: Array,
    default: () => [],
  },
  initialDrafts: {
    type: Array,
    default: null,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'apply',
  'save-draft',
  'discard-draft',
])

// ========================================================
// 1. DATA MASTER POLA (DB & TEMP)
// ========================================================
const defaultDbPatterns = [
  {
    id: 'tpl-5-2',
    name: 'Pola Standar 5-2 (Office Hours)',
    desc: '5 hari kerja shift pagi berturut-turut, 2 hari libur akhir pekan (Sabtu & Minggu).',
    pattern: ['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF'],
    type: 'weekly',
    source: 'db',
    suitableFor: 'Administrasi, Keuangan, HR, dan Tim Non-Shift',
  },
  {
    id: 'tpl-2-2-2-1',
    name: 'Pola Kontinu 2-2-2-1 (Rotasi 24 Jam)',
    desc: '2 hari Pagi, 2 hari Siang, 2 hari Malam, 1 hari Libur Off.',
    pattern: ['P', 'P', 'S', 'S', 'M', 'M', 'OFF'],
    type: 'weekly',
    source: 'db',
    suitableFor: 'IT Operations 24/7, Security Satpam, Tenaga Medis',
  },
  {
    id: 'tpl-3-3-1',
    name: 'Pola Bergilir 3-3-1 (Maintenance)',
    desc: '3 hari Siang, 3 hari Malam, 1 hari Libur untuk tim pemeliharaan fasilitas.',
    pattern: ['S', 'S', 'S', 'M', 'M', 'M', 'OFF'],
    type: 'weekly',
    source: 'db',
    suitableFor: 'Teknisi Mesin, Pemeliharaan Gedung & Gardu Listrik',
  },
  {
    id: 'tpl-4-2',
    name: 'Pola Rotasi 4-2 (Operasional Fleksibel)',
    desc: '2 hari Pagi, 2 hari Siang, 2 hari Libur bergilir.',
    pattern: ['P', 'P', 'S', 'S', 'OFF', 'OFF', 'P'],
    type: 'weekly',
    source: 'db',
    suitableFor: 'Layanan Pelanggan & Gudang Logistik',
  },
]

const dbPatterns = ref([...defaultDbPatterns])
const tempPatterns = ref([
  {
    id: 'temp-1',
    name: 'Pola Weekend Standby (Temp)',
    desc: 'Pagi di hari kerja, Siang di akhir pekan.',
    pattern: ['P', 'P', 'P', 'P', 'P', 'S', 'OFF'],
    type: 'weekly',
    source: 'temp',
    suitableFor: 'Sesi Khusus Event Akhir Pekan',
  },
])

// ========================================================
// 2. KELOMPOK DRAFT STATE
// ========================================================
const createDefaultDraft = (index = 1) => ({
  id: `draft-${Date.now()}-${index}`,
  name: `Draft ${index}`,
  patternSource: 'db', // 'db' | 'temp'
  selectedPatternId: 'tpl-5-2',
  selectedEmployeeIds: [],
  selectedShifts: ['P', 'S', 'M', 'OFF'],
  durationMode: 'monthly', // 'weekly' | 'monthly' (default bulanan)
  generatedSchedule: {}, // { [empId]: { [date]: shiftCode } }
})

const drafts = ref([createDefaultDraft(1)])
const activeDraftId = ref(drafts.value[0]?.id || '')

const activeDraft = computed(() => {
  return drafts.value.find((d) => d.id === activeDraftId.value) || drafts.value[0]
})

// Beralih draft tab
const setActiveDraft = (draftId) => {
  activeDraftId.value = draftId
}

// Tambah draft baru
const handleAddDraft = () => {
  const nextNum = drafts.value.length + 1
  const newDraft = createDefaultDraft(nextNum)
  drafts.value.push(newDraft)
  activeDraftId.value = newDraft.id
  generateRosterForDraft(newDraft)
}

// Hapus draft
const handleDeleteDraft = (draftId, event) => {
  event?.stopPropagation()
  if (drafts.value.length <= 1) return

  const idx = drafts.value.findIndex((d) => d.id === draftId)
  if (idx !== -1) {
    drafts.value.splice(idx, 1)
    if (activeDraftId.value === draftId) {
      activeDraftId.value = drafts.value[Math.max(0, idx - 1)]?.id || drafts.value[0]?.id
    }
  }
}

// ========================================================
// 3. SUMBER POLA (DB / TEMP / TAMBAH)
// ========================================================
const currentPatternList = computed(() => {
  if (!activeDraft.value) return []
  return activeDraft.value.patternSource === 'temp' ? tempPatterns.value : dbPatterns.value
})

const patternOptions = computed(() => {
  return currentPatternList.value.map((p) => ({
    label: p.name,
    value: p.id,
    badge: p.type === 'monthly' ? '30 Hari' : p.pattern.slice(0, 4).join('-'),
  }))
})

const setPatternSource = (source) => {
  if (!activeDraft.value) return
  activeDraft.value.patternSource = source
  const list = source === 'temp' ? tempPatterns.value : dbPatterns.value
  if (list.length > 0) {
    activeDraft.value.selectedPatternId = list[0].id
    generateRosterForDraft(activeDraft.value)
  }
}

// ========================================================
// 4. FILTER KARYAWAN (SEARCH + BASE SEARCHABLE SELECT)
// ========================================================
const empSearchQuery = ref('')
const selectedLocationFilter = ref('all')
const selectedOrgFilter = ref('all')

const uniqueLocations = computed(() => {
  const set = new Set(props.employees.map((e) => e.cabang).filter(Boolean))
  return Array.from(set)
})

const uniqueDivisi = computed(() => {
  const set = new Set(props.employees.map((e) => e.divisi).filter(Boolean))
  return Array.from(set)
})

const locationFilterOptions = computed(() => [
  { label: 'Semua Lokasi', value: 'all' },
  ...uniqueLocations.value.map((loc) => ({ label: loc, value: loc })),
])

const orgFilterOptions = computed(() => [
  { label: 'Semua Divisi', value: 'all' },
  ...uniqueDivisi.value.map((div) => ({ label: div, value: div })),
])

// Mapping status alokasi karyawan ke kelompok draft mana
const employeeDraftMap = computed(() => {
  const map = {}
  drafts.value.forEach((d) => {
    d.selectedEmployeeIds.forEach((empId) => {
      map[empId] = d
    })
  })
  return map
})

const filteredEmployees = computed(() => {
  let list = props.employees

  if (empSearchQuery.value.trim()) {
    const q = empSearchQuery.value.toLowerCase().trim()
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.nip && e.nip.toLowerCase().includes(q)) ||
        (e.role && e.role.toLowerCase().includes(q))
    )
  }

  if (selectedLocationFilter.value !== 'all') {
    list = list.filter((e) => e.cabang === selectedLocationFilter.value)
  }

  if (selectedOrgFilter.value !== 'all') {
    list = list.filter((e) => e.divisi === selectedOrgFilter.value)
  }

  return list
})

// Toggle karyawan di draft aktif
const toggleEmployeeInActiveDraft = (empId) => {
  if (!activeDraft.value) return

  const idx = activeDraft.value.selectedEmployeeIds.indexOf(empId)
  if (idx > -1) {
    activeDraft.value.selectedEmployeeIds.splice(idx, 1)
  } else {
    // Jika karyawan sudah ada di draft lain, pindahkan ke draft aktif
    drafts.value.forEach((d) => {
      if (d.id !== activeDraft.value.id) {
        const otherIdx = d.selectedEmployeeIds.indexOf(empId)
        if (otherIdx > -1) {
          d.selectedEmployeeIds.splice(otherIdx, 1)
        }
      }
    })
    activeDraft.value.selectedEmployeeIds.push(empId)
  }

  generateRosterForDraft(activeDraft.value)
}

const selectAllFilteredEmployees = () => {
  if (!activeDraft.value) return
  filteredEmployees.value.forEach((e) => {
    drafts.value.forEach((d) => {
      if (d.id !== activeDraft.value.id) {
        const otherIdx = d.selectedEmployeeIds.indexOf(e.id)
        if (otherIdx > -1) d.selectedEmployeeIds.splice(otherIdx, 1)
      }
    })
    if (!activeDraft.value.selectedEmployeeIds.includes(e.id)) {
      activeDraft.value.selectedEmployeeIds.push(e.id)
    }
  })
  generateRosterForDraft(activeDraft.value)
}

const clearAllEmployeesInActiveDraft = () => {
  if (!activeDraft.value) return
  activeDraft.value.selectedEmployeeIds = []
  generateRosterForDraft(activeDraft.value)
}

// ========================================================
// 5. HELPER DATA PEGAWAI & SHIFT
// ========================================================
const getEmployeeName = (empId) => {
  return props.employees.find((e) => e.id === empId)?.name || 'Pegawai'
}

const getEmployeeShortName = (empId) => {
  const full = getEmployeeName(empId)
  const parts = full.split(' ')
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[1]?.[0] || ''}.`
}

const getShiftMeta = (code) => {
  return (
    props.shiftTypes.find((s) => s.code === code) || {
      code: code || 'OFF',
      name: 'Libur (Off)',
      time: 'Bebas Tugas',
      hours: 0,
      badgeVariant: 'neutral',
    }
  )
}

// Warna-warni Badge Shift Sesuai Permintaan
const getShiftBadgeClasses = (code) => {
  switch (code) {
    case 'P':
      return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 shadow-2xs hover:bg-emerald-100'
    case 'S':
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 shadow-2xs hover:bg-amber-100'
    case 'M':
      return 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700 shadow-2xs hover:bg-purple-100'
    case 'C':
      return 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700 shadow-2xs hover:bg-blue-100'
    case 'OFF':
    default:
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 shadow-2xs hover:bg-neutral-200/60'
  }
}

// ========================================================
// 6. GENERATE & PREVIEW LOGIC: FORMAT KALENDER 7 KOLOM
//    (Hanya Menampilkan Nama Shift Saja di Setiap Cell)
// ========================================================
const durationOptions = [
  { label: 'Mingguan (7 Hari)', value: 'weekly' },
  { label: '1 Bulan Penuh', value: 'monthly' },
]

const dayNamesIndo = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

// Hari-hari aktif (Mingguan: 7 hari pertama; Bulanan: 30 hari penuh)
const activeDaysList = computed(() => {
  const mode = activeDraft.value?.durationMode || 'monthly'
  if (mode === 'weekly') {
    return props.days.slice(0, 7)
  }
  return props.days.slice(0, 30)
})

// Memecah hari-hari aktif ke dalam struktur baris mingguan (7 kolom per baris)
const previewCalendarWeeks = computed(() => {
  const daysArr = activeDaysList.value
  const weeks = []
  let currentWeek = []

  daysArr.forEach((day, idx) => {
    currentWeek.push({
      ...day,
      dayNumber: idx + 1,
    })
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    weeks.push(currentWeek)
  }

  return weeks
})

// Cari pola aktif
const getSelectedPattern = (draft) => {
  const list = draft.patternSource === 'temp' ? tempPatterns.value : dbPatterns.value
  return list.find((p) => p.id === draft.selectedPatternId) || list[0] || dbPatterns.value[0]
}

// Generate jadwal berdasarkan pola untuk draft tertentu (Semua pegawai di draft ini mengikuti shift draft)
const generateRosterForDraft = (draft) => {
  if (!draft) return
  const patternObj = getSelectedPattern(draft)
  const pattern = patternObj?.pattern || ['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF']

  const newSchedule = { ...draft.generatedSchedule }

  draft.selectedEmployeeIds.forEach((empId) => {
    if (!newSchedule[empId]) {
      newSchedule[empId] = {}
    }

    props.days.forEach((day, dayIndex) => {
      const shiftIndex = dayIndex % pattern.length
      newSchedule[empId][day.date] = pattern[shiftIndex]
    })
  })

  draft.generatedSchedule = newSchedule
}

// Mendapatkan shift untuk tanggal tertentu pada draft yang aktif
const getDayDraftShift = (date) => {
  if (!activeDraft.value) return 'OFF'
  const firstEmpId = activeDraft.value.selectedEmployeeIds[0]
  if (firstEmpId && activeDraft.value.generatedSchedule?.[firstEmpId]?.[date]) {
    return activeDraft.value.generatedSchedule[firstEmpId][date]
  }
  const patternObj = getSelectedPattern(activeDraft.value)
  const pattern = patternObj?.pattern || ['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF']
  const dayIndex = props.days.findIndex((d) => d.date === date)
  const pIdx = (dayIndex >= 0 ? dayIndex : 0) % pattern.length
  return pattern[pIdx] || 'OFF'
}

// Override cell shift manual pada preview kalender
const activePopoverCell = ref(null) // { date }

const openCellShiftPopover = (date) => {
  if (activePopoverCell.value && activePopoverCell.value.date === date) {
    activePopoverCell.value = null
  } else {
    activePopoverCell.value = { date }
  }
}

const setCellShift = (code) => {
  if (!activePopoverCell.value || !activeDraft.value) return
  const { date } = activePopoverCell.value

  // Terapkan ke seluruh pegawai di draft ini pada tanggal tersebut
  activeDraft.value.selectedEmployeeIds.forEach((empId) => {
    if (!activeDraft.value.generatedSchedule[empId]) {
      activeDraft.value.generatedSchedule[empId] = {}
    }
    activeDraft.value.generatedSchedule[empId][date] = code
  })

  activePopoverCell.value = null
}

// ========================================================
// 7. SUB-MODAL: BUAT POLA ROSTER BARU (MINGGUAN / BULANAN)
//    - Ukuran Lebar & Tinggi SAMA untuk Mingguan & Bulanan
//    - Shift Warna-Warni
//    - Simpan ke Pola Berbentuk Toggle Switch
// ========================================================
const isCreatePatternModalOpen = ref(false)

const patternTypeOptions = [
  { label: 'Mingguan (7 Hari)', value: 'weekly', icon: CalendarDays },
  { label: 'Bulanan (30 Hari)', value: 'monthly', icon: Calendar },
]

const newPatternForm = ref({
  name: '',
  desc: '',
  type: 'weekly', // 'weekly' | 'monthly'
  saveToDb: true, // boolean toggle (true = db, false = temp)
  weeklyDays: ['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF'],
  monthlyDays: Array.from({ length: 30 }, (_, i) => {
    const dayOfWeek = i % 7 // 0=Senin, 5=Sabtu, 6=Minggu
    return dayOfWeek === 5 || dayOfWeek === 6 ? 'OFF' : 'P'
  }),
})

// Popover shift warna-warni di dalam submodal buat pola
const activePatternPopover = ref(null) // { mode: 'weekly' | 'monthly', index: number }

const togglePatternShiftPopover = (mode, index) => {
  if (activePatternPopover.value?.mode === mode && activePatternPopover.value?.index === index) {
    activePatternPopover.value = null
  } else {
    activePatternPopover.value = { mode, index }
  }
}

const selectPatternShift = (code) => {
  if (!activePatternPopover.value) return
  const { mode, index } = activePatternPopover.value
  if (mode === 'weekly') {
    newPatternForm.value.weeklyDays[index] = code
  } else {
    newPatternForm.value.monthlyDays[index] = code
  }
  activePatternPopover.value = null
}

// Memecah 30 hari kalender bulanan pola ke dalam struktur baris mingguan (7 kolom)
const monthlyWeeks = computed(() => {
  const totalDays = 30
  const weeks = []
  let currentWeek = []

  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    currentWeek.push({
      dayNumber: dayNum,
      index: dayNum - 1,
    })
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    weeks.push(currentWeek)
  }

  return weeks
})

// Template preset pengisian cepat bulanan
const applyMonthlyPreset = (preset) => {
  if (preset === 'office') {
    newPatternForm.value.monthlyDays = newPatternForm.value.monthlyDays.map((_, i) => {
      const dayOfWeek = i % 7
      return dayOfWeek === 5 || dayOfWeek === 6 ? 'OFF' : 'P'
    })
  } else if (preset === 'pagi-semua') {
    newPatternForm.value.monthlyDays = newPatternForm.value.monthlyDays.map(() => 'P')
  } else if (preset === 'rotasi') {
    const rot = ['P', 'P', 'S', 'S', 'M', 'M', 'OFF']
    newPatternForm.value.monthlyDays = newPatternForm.value.monthlyDays.map((_, i) => rot[i % 7])
  } else if (preset === 'reset') {
    newPatternForm.value.monthlyDays = newPatternForm.value.monthlyDays.map(() => 'OFF')
  }
}

const openCreatePatternModal = () => {
  newPatternForm.value = {
    name: '',
    desc: '',
    type: 'weekly',
    saveToDb: activeDraft.value?.patternSource !== 'temp',
    weeklyDays: ['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF'],
    monthlyDays: Array.from({ length: 30 }, (_, i) => {
      const dayOfWeek = i % 7
      return dayOfWeek === 5 || dayOfWeek === 6 ? 'OFF' : 'P'
    }),
  }
  activePatternPopover.value = null
  isCreatePatternModalOpen.value = true
}

const handleSaveNewPattern = () => {
  if (!newPatternForm.value.name.trim()) return

  const newId = `pattern-${Date.now()}`
  const isMonthly = newPatternForm.value.type === 'monthly'
  const patternDays = isMonthly
    ? [...newPatternForm.value.monthlyDays]
    : [...newPatternForm.value.weeklyDays]

  const saveDestination = newPatternForm.value.saveToDb ? 'db' : 'temp'

  const createdPattern = {
    id: newId,
    name: newPatternForm.value.name.trim(),
    desc:
      newPatternForm.value.desc.trim() ||
      (isMonthly ? 'Pola jadwal bulanan 30 hari.' : 'Pola rotasi mingguan 7 hari.'),
    pattern: patternDays,
    type: newPatternForm.value.type,
    source: saveDestination,
    suitableFor: isMonthly ? 'Siklus Bulanan Penuh' : 'Kelompok Khusus',
  }

  if (saveDestination === 'db') {
    dbPatterns.value.push(createdPattern)
    if (activeDraft.value) {
      activeDraft.value.patternSource = 'db'
      activeDraft.value.selectedPatternId = newId
    }
  } else {
    tempPatterns.value.push(createdPattern)
    if (activeDraft.value) {
      activeDraft.value.patternSource = 'temp'
      activeDraft.value.selectedPatternId = newId
    }
  }

  isCreatePatternModalOpen.value = false
  generateRosterForDraft(activeDraft.value)
}

// ========================================================
// 8. INTI DRAFT PERSISTENCE & APPLY
// ========================================================
watch(
  () => props.initialDrafts,
  (init) => {
    if (init && Array.isArray(init) && init.length > 0) {
      drafts.value = JSON.parse(JSON.stringify(init))
      activeDraftId.value = drafts.value[0]?.id || ''
    }
  },
  { immediate: true }
)

const handleCloseModal = () => {
  emit('save-draft', JSON.parse(JSON.stringify(drafts.value)))
  emit('update:modelValue', false)
}

const handleApplyAllDrafts = () => {
  const finalSchedules = {}
  drafts.value.forEach((d) => {
    d.selectedEmployeeIds.forEach((empId) => {
      finalSchedules[empId] = d.generatedSchedule[empId] || {}
    })
  })

  emit('apply', {
    drafts: JSON.parse(JSON.stringify(drafts.value)),
    schedules: finalSchedules,
  })
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (drafts.value.length === 0) {
        drafts.value = [createDefaultDraft(1)]
        activeDraftId.value = drafts.value[0].id
      }
      drafts.value.forEach((d) => {
        if (d.selectedEmployeeIds.length === 0 && props.employees.length > 0 && drafts.value.length === 1) {
          d.selectedEmployeeIds = props.employees.slice(0, 4).map((e) => e.id)
        }
        generateRosterForDraft(d)
      })
    }
  }
)
</script>

<template>
  <!-- Modal Utama Generate Roster (Ukuran 2xl / max-w-5xl proporsional) -->
  <BaseModal
    :model-value="modelValue"
    size="2xl"
    :close-on-backdrop="false"
    @update:model-value="handleCloseModal"
  >
    <!-- Modal Header -->
    <template #header>
      <div class="flex items-center justify-between w-full pr-6">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[var(--theme-primary)] text-[var(--theme-primary-text)] flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                Generate Roster Kerja
              </h2>
              <BaseBadge variant="primary" size="sm">
                {{ drafts.length }} Kelompok Draft
              </BaseBadge>
            </div>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Atur jadwal otomatis per kelompok karyawan, rotasi pola shift, dan pratinjau sebelum diterapkan.
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal Content: Layout 2 Kolom Sesuai Wireframe -->
    <div class="flex flex-col lg:flex-row h-[68vh] min-h-[500px] gap-3 -m-4 sm:-m-6 overflow-hidden">
      
      <!-- ======================================================== -->
      <!-- 1. LEFT SIDEBAR: PENGATURAN POLA & DAFTAR KARYAWAN       -->
      <!-- ======================================================== -->
      <div class="w-full lg:w-72 shrink-0 border-r border-neutral-200 dark:border-[var(--theme-border)] bg-neutral-50/70 dark:bg-[var(--theme-surface)] flex flex-col min-h-0 overflow-hidden">
        
        <!-- Header Panel Kiri: 3 Tombol Sumber Pola [Dari DB] [Dari Temp] [+] -->
        <div class="p-3 border-b border-neutral-200 dark:border-[var(--theme-border)] space-y-2.5 shrink-0 bg-white dark:bg-[var(--theme-surface-raised)]">
          <div>
            <span class="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
              Sumber Pola Shift
            </span>
            <div class="grid grid-cols-12 gap-1.5">
              <button
                type="button"
                @click="setPatternSource('db')"
                class="col-span-5 py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer"
                :class="activeDraft?.patternSource === 'db'
                  ? 'bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] border-[var(--theme-primary)] font-bold shadow-2xs'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-[var(--theme-border)] hover:bg-neutral-100'"
              >
                <Database class="w-3.5 h-3.5 shrink-0" />
                <span class="truncate">Dari DB</span>
              </button>

              <button
                type="button"
                @click="setPatternSource('temp')"
                class="col-span-5 py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer"
                :class="activeDraft?.patternSource === 'temp'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold shadow-2xs'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-[var(--theme-border)] hover:bg-neutral-100'"
              >
                <Clock class="w-3.5 h-3.5 shrink-0" />
                <span class="truncate">Dari Temp</span>
              </button>

              <button
                type="button"
                @click="openCreatePatternModal"
                class="col-span-2 py-1.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 hover:border-[var(--theme-primary)] text-neutral-600 hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary-soft)] flex items-center justify-center transition cursor-pointer"
                title="Buat Pola Roster Baru (Mingguan / Bulanan)"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Dropdown Pilih Pola Menggunakan BaseSearchableSelect -->
          <div>
            <label class="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
              Pola Aktif ({{ activeDraft?.name }})
            </label>
            <BaseSearchableSelect
              v-if="activeDraft"
              v-model="activeDraft.selectedPatternId"
              :options="patternOptions"
              placeholder="Pilih Pola Shift..."
              size="sm"
              @change="generateRosterForDraft(activeDraft)"
            />
          </div>
        </div>

        <!-- Filter Karyawan: Search, Wilayah & Jabatan -->
        <div class="p-3 border-b border-neutral-200 dark:border-[var(--theme-border)] space-y-2 shrink-0 bg-neutral-50/50 dark:bg-[var(--theme-surface)]">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1">
              <Users class="w-3.5 h-3.5 text-neutral-400" />
              <span>Pegawai ({{ activeDraft?.selectedEmployeeIds.length || 0 }})</span>
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="selectAllFilteredEmployees"
                class="text-[10.5px] text-[var(--theme-primary)] hover:underline font-semibold cursor-pointer"
              >
                Pilih Semua
              </button>
              <span class="text-neutral-300">&bull;</span>
              <button
                type="button"
                @click="clearAllEmployeesInActiveDraft"
                class="text-[10.5px] text-neutral-400 hover:text-red-500 hover:underline cursor-pointer"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <!-- Input Search Pegawai -->
          <div class="relative">
            <Search class="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="empSearchQuery"
              type="text"
              placeholder="Cari nama, NIP, atau jabatan..."
              class="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
            />
            <button
              v-if="empSearchQuery"
              type="button"
              @click="empSearchQuery = ''"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X class="w-3 h-3" />
            </button>
          </div>

          <!-- Quick Filters: Wilayah (align left) & Divisi (align right agar melebar ke kiri) -->
          <div class="grid grid-cols-2 gap-1.5 text-xs">
            <BaseSearchableSelect
              v-model="selectedLocationFilter"
              :options="locationFilterOptions"
              placeholder="Semua Lokasi"
              size="sm"
              align="left"
            />
            <BaseSearchableSelect
              v-model="selectedOrgFilter"
              :options="orgFilterOptions"
              placeholder="Semua Divisi"
              size="sm"
              align="right"
            />
          </div>
        </div>

        <!-- List Karyawan (Scrollable) -->
        <div class="flex-1 min-h-0 overflow-y-auto divide-y divide-neutral-100 dark:divide-[var(--theme-border)] p-1.5 space-y-0.5">
          <div
            v-for="emp in filteredEmployees"
            :key="emp.id"
            @click="toggleEmployeeInActiveDraft(emp.id)"
            class="p-2 rounded-xl flex items-center justify-between gap-2 transition cursor-pointer select-none"
            :class="activeDraft?.selectedEmployeeIds.includes(emp.id)
              ? 'bg-[var(--theme-primary-soft)]/40 dark:bg-[var(--theme-primary-soft)]/20 border border-[var(--theme-primary)]/40'
              : 'hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-raised)] border border-transparent'"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <input
                type="checkbox"
                :checked="activeDraft?.selectedEmployeeIds.includes(emp.id)"
                class="rounded border-neutral-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] shrink-0 pointer-events-none"
              />
              <BaseAvatar :name="emp.name" size="sm" class="shrink-0" />
              <div class="min-w-0">
                <span class="font-bold text-xs text-neutral-900 dark:text-white truncate block">
                  {{ emp.name }}
                </span>
                <div class="flex items-center gap-1.5 text-[10.5px] text-neutral-400 truncate">
                  <span>{{ emp.role }}</span>
                  <span>&bull;</span>
                  <span>{{ emp.cabang }}</span>
                </div>
              </div>
            </div>

            <!-- Tag Indikator Draft Lain jika terdaftar di draft berbeda -->
            <div class="shrink-0">
              <span
                v-if="employeeDraftMap[emp.id] && employeeDraftMap[emp.id].id !== activeDraft?.id"
                class="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60"
                :title="`Saat ini berada di ${employeeDraftMap[emp.id].name}`"
              >
                {{ employeeDraftMap[emp.id].name }}
              </span>
            </div>
          </div>

          <div v-if="filteredEmployees.length === 0" class="py-8 text-center text-neutral-400 text-xs">
            Pegawai tidak ditemukan.
          </div>
        </div>

      </div>

      <!-- ======================================================== -->
      <!-- 2. RIGHT PANEL: TABS DRAFT & TABEL ROSTER KALENDER       -->
      <!--    REVISI TERAKHIR: Hanya Menampilkan Nama Shift Saja    -->
      <!-- ======================================================== -->
      <div class="flex-1 min-w-0 flex flex-col min-h-0 bg-white dark:bg-[var(--theme-surface)] overflow-hidden">
        
        <!-- Top Bar: KELOMPOK DRAFT (Tabs horizontal) -->
        <div class="px-3.5 py-2 border-b border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between gap-3 shrink-0 bg-neutral-50/50 dark:bg-[var(--theme-surface-raised)]/50">
          <div class="flex items-center gap-2 min-w-0 overflow-x-auto no-scrollbar py-0.5">
            <span class="text-[10px] uppercase font-bold text-neutral-400 tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Layers class="w-3.5 h-3.5" />
              <span>Kelompok Draft:</span>
            </span>

            <!-- Draft Tabs -->
            <div
              v-for="d in drafts"
              :key="d.id"
              @click="setActiveDraft(d.id)"
              class="group/tab px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition cursor-pointer shrink-0 shadow-2xs"
              :class="activeDraftId === d.id
                ? 'bg-white dark:bg-[var(--theme-surface-raised)] border-[var(--theme-primary)] text-[var(--theme-primary)] font-bold ring-2 ring-[var(--theme-primary)]/20 shadow-xs'
                : 'bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-[var(--theme-border)] hover:bg-neutral-200/60'"
            >
              <span>{{ d.name }}</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px] font-mono leading-none"
                :class="activeDraftId === d.id ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)]' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'"
              >
                {{ d.selectedEmployeeIds.length }}
              </span>

              <button
                v-if="drafts.length > 1"
                type="button"
                @click="handleDeleteDraft(d.id, $event)"
                class="w-4 h-4 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-60 group-hover/tab:opacity-100 transition cursor-pointer"
                title="Hapus kelompok draft ini"
              >
                <X class="w-3 h-3" />
              </button>
            </div>

            <!-- Tombol Tambah Draft Baru (+) -->
            <button
              type="button"
              @click="handleAddDraft"
              class="px-2.5 py-1.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 hover:border-[var(--theme-primary)] text-neutral-600 hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary-soft)] text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0"
              title="Tambah Kelompok Draft Baru"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Draft Baru</span>
            </button>
          </div>
        </div>

        <!-- Controls Bar: Periode & Daftar Pegawai di Draft Aktif -->
        <div class="px-3.5 py-2 border-b border-neutral-200 dark:border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-2.5 shrink-0 bg-white dark:bg-[var(--theme-surface)]">
          <div class="flex items-center gap-2">
            <!-- Toggle Periode Mingguan vs Bulanan -->
            <div class="flex items-center gap-1.5 text-xs">
              <Calendar class="w-3.5 h-3.5 text-neutral-400" />
              <span class="text-neutral-500 font-medium">Periode:</span>
              <BaseSegmentedControl
                v-if="activeDraft"
                v-model="activeDraft.durationMode"
                :options="durationOptions"
                size="sm"
              />
            </div>
          </div>

          <!-- Ringkasan Pegawai di Draft Aktif -->
          <div class="flex items-center gap-1.5 text-xs min-w-0">
            <Users class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span class="text-neutral-400 text-[11px] shrink-0">Pegawai ({{ activeDraft?.selectedEmployeeIds.length || 0 }}):</span>
            <span class="font-bold text-neutral-800 dark:text-neutral-200 truncate max-w-xs text-[11px]">
              {{ activeDraft?.selectedEmployeeIds.map(id => getEmployeeShortName(id)).join(', ') || 'Belum ada pegawai dipilih' }}
            </span>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- TABEL ROSTER KALENDER 7 KOLOM (SENIN - MINGGU)           -->
        <!-- HANYA MENAMPILKAN NAMA SHIFT SAJA DI SETIAP CELL         -->
        <!-- ======================================================== -->
        <div class="flex-1 min-h-0 overflow-y-auto p-3 relative">
          <div
            v-if="activeDraft && activeDraft.selectedEmployeeIds.length === 0"
            class="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-400"
          >
            <Users class="w-10 h-10 mb-2 opacity-30" />
            <h4 class="font-bold text-sm text-neutral-600 dark:text-neutral-300">
              Belum ada pegawai dipilih untuk {{ activeDraft.name }}
            </h4>
            <p class="text-xs max-w-sm mt-1">
              Centang pegawai di panel kiri untuk memasukkannya ke kelompok draft ini dan melihat pratinjau roster.
            </p>
          </div>

          <div v-else class="border border-neutral-200 dark:border-[var(--theme-border)] rounded-2xl overflow-hidden shadow-2xs bg-white dark:bg-[var(--theme-surface)]">
            <table class="w-full border-collapse text-left text-xs table-fixed">
              <!-- Thead 7 Kolom: Senin s/d Minggu -->
              <thead class="bg-neutral-100/80 dark:bg-[var(--theme-surface-raised)] border-b border-neutral-200 dark:border-[var(--theme-border)] text-neutral-700 dark:text-neutral-200 font-bold">
                <tr>
                  <th
                    v-for="dayName in dayNamesIndo"
                    :key="dayName"
                    class="py-2 px-1 text-center border-r border-neutral-200/80 dark:border-[var(--theme-border)] last:border-r-0 text-xs"
                  >
                    {{ dayName }}
                  </th>
                </tr>
              </thead>

              <!-- Tbody Baris Mingguan (Tersusun ke Bawah: Baris 1: tgl 1-7, dst) -->
              <tbody class="divide-y divide-neutral-200 dark:divide-[var(--theme-border)]">
                <tr
                  v-for="(week, wIdx) in previewCalendarWeeks"
                  :key="wIdx"
                  class="divide-x divide-neutral-200 dark:divide-[var(--theme-border)]"
                >
                  <td
                    v-for="(cell, cIdx) in week"
                    :key="cIdx"
                    class="p-1.5 transition align-top relative"
                    :class="cell ? 'bg-white dark:bg-[var(--theme-surface)] hover:bg-neutral-50/50' : 'bg-neutral-50/40 dark:bg-neutral-900/10'"
                  >
                    <template v-if="cell">
                      <!-- Header Tanggal Cell -->
                      <div class="flex items-center justify-between mb-1.5">
                        <span
                          class="w-5 h-5 rounded-md flex items-center justify-center text-[10.5px] font-bold shadow-2xs"
                          :class="cell.isToday
                            ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] font-extrabold'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'"
                        >
                          {{ cell.dayNumber }}
                        </span>
                        <span class="text-[9.5px] text-neutral-400 font-mono">{{ cell.dateLabel }}</span>
                      </div>

                      <!-- TOMBOL NAMA SHIFT NYA SAJA (Warna-warni sesuai jenis shift) -->
                      <button
                        type="button"
                        @click.stop="openCellShiftPopover(cell.date)"
                        class="w-full py-1.5 px-2 rounded-xl text-xs font-bold border transition flex items-center justify-between gap-1 shadow-2xs cursor-pointer"
                        :class="getShiftBadgeClasses(getDayDraftShift(cell.date))"
                        :title="`Ubah shift ${cell.dayName}, ${cell.dateLabel} untuk ${activeDraft.name}`"
                      >
                        <span class="truncate">{{ getShiftMeta(getDayDraftShift(cell.date)).name }}</span>
                        <ChevronDown class="w-3.5 h-3.5 opacity-60 shrink-0" />
                      </button>

                      <!-- Popover Ganti Shift Cepat -->
                      <div
                        v-if="activePopoverCell && activePopoverCell.date === cell.date"
                        class="absolute z-50 top-full mt-1 left-1 right-1 p-1.5 rounded-xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-xl text-left space-y-1"
                        @click.stop
                      >
                        <div class="text-[10px] uppercase font-bold text-neutral-400 mb-1 px-1 flex items-center justify-between">
                          <span>Pilih Shift ({{ cell.dayName }})</span>
                          <button type="button" @click="activePopoverCell = null" class="text-neutral-400 hover:text-neutral-600">
                            <X class="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          v-for="st in shiftTypes"
                          :key="st.code"
                          type="button"
                          @click="setCellShift(st.code)"
                          class="w-full px-2 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition cursor-pointer"
                          :class="getShiftBadgeClasses(st.code)"
                        >
                          <span>{{ st.name }}</span>
                          <span class="text-[10px] opacity-70 font-mono">{{ st.time }}</span>
                        </button>
                      </div>

                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>

    <!-- Modal Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2 text-xs text-neutral-500">
          <Sparkles class="w-4 h-4 text-[var(--theme-primary)]" />
          <span>
            Total <strong>{{ drafts.reduce((acc, d) => acc + d.selectedEmployeeIds.length, 0) }}</strong> pegawai terbagi dalam <strong>{{ drafts.length }}</strong> kelompok draft
          </span>
        </div>

        <div class="flex items-center gap-2">
          <BaseButton variant="outline" size="sm" @click="handleCloseModal">
            Batal (Simpan Draft)
          </BaseButton>
          <BaseButton variant="primary" size="sm" @click="handleApplyAllDrafts">
            <Check class="w-4 h-4 mr-1.5" />
            <span>Terapkan ke Roster</span>
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>

  <!-- ======================================================== -->
  <!-- 3. SUB-MODAL: BUAT POLA ROSTER BARU (MINGGUAN / BULANAN) -->
  <!-- ======================================================== -->
  <BaseModal
    v-model="isCreatePatternModalOpen"
    title="Buat Pola Roster Baru"
    subtitle="Definisikan urutan rotasi shift mingguan atau kalender bulanan penuh"
    size="balanced"
  >
    <div class="h-[490px] flex flex-col min-h-0 space-y-3 text-xs">
      
      <!-- Baris 1: Nama & Deskripsi Pola -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
        <div class="space-y-1">
          <label class="font-bold text-neutral-700 dark:text-neutral-300 block text-xs">Nama Pola Shift *</label>
          <BaseInput
            v-model="newPatternForm.name"
            placeholder="Contoh: Pola Rotasi Security 3-Shift, Pola 4-2 CS..."
            size="sm"
          />
        </div>
        <div class="space-y-1">
          <label class="font-bold text-neutral-700 dark:text-neutral-300 block text-xs">Deskripsi Pola</label>
          <BaseInput
            v-model="newPatternForm.desc"
            placeholder="Contoh: 2 hari pagi, 2 siang, 2 malam, 1 libur..."
            size="sm"
          />
        </div>
      </div>

      <!-- Baris 2: Model Siklus & Toggle Switch Simpan Permanen ke Database -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 rounded-2xl bg-neutral-50 dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shrink-0 items-center">
        <div>
          <label class="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Model Siklus Rotasi:</label>
          <BaseSegmentedControl
            v-model="newPatternForm.type"
            :options="patternTypeOptions"
            size="sm"
            :full-width="true"
          />
        </div>

        <div class="flex items-center justify-between pt-1 sm:pt-0">
          <div>
            <span class="font-bold text-xs text-neutral-800 dark:text-neutral-200 block">
              Simpan Permanen ke Database
            </span>
            <span class="text-[10.5px] text-neutral-400 block mt-0.5">
              {{ newPatternForm.saveToDb ? 'Tersimpan permanen di database' : 'Hanya sementara (temp) sesi ini' }}
            </span>
          </div>
          <BaseSwitch
            v-model="newPatternForm.saveToDb"
            size="sm"
          />
        </div>
      </div>

      <!-- Area Scrollable Kalender / Urutan Shift -->
      <div class="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
        
        <!-- OPSI A: POLA MINGGUAN (7 Hari: Senin s/d Minggu) -->
        <div v-if="newPatternForm.type === 'weekly'" class="space-y-2 pt-1">
          <div class="flex items-center justify-between">
            <label class="font-bold text-neutral-700 dark:text-neutral-300 block">
              Urutan Shift Mingguan (7 Hari):
            </label>
            <span class="text-[11px] text-neutral-400">Pola berulang setiap minggu</span>
          </div>

          <div class="grid grid-cols-7 gap-1.5">
            <div
              v-for="(dayName, dIdx) in dayNamesIndo"
              :key="dIdx"
              class="p-2 rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] text-center space-y-1.5 shadow-2xs relative"
            >
              <span class="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                {{ dayName }}
              </span>

              <!-- Tombol Shift Warna-Warni -->
              <button
                type="button"
                @click.stop="togglePatternShiftPopover('weekly', dIdx)"
                class="w-full py-1.5 px-1.5 rounded-xl text-xs font-bold border transition flex items-center justify-between gap-1 cursor-pointer"
                :class="getShiftBadgeClasses(newPatternForm.weeklyDays[dIdx])"
              >
                <span class="truncate">{{ getShiftMeta(newPatternForm.weeklyDays[dIdx]).name }}</span>
                <ChevronDown class="w-3 h-3 opacity-60 shrink-0" />
              </button>

              <!-- Popover Pilihan Shift -->
              <div
                v-if="activePatternPopover && activePatternPopover.mode === 'weekly' && activePatternPopover.index === dIdx"
                class="absolute z-50 top-full mt-1 left-0 right-0 p-1.5 rounded-xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-xl text-left space-y-1"
                @click.stop
              >
                <button
                  v-for="st in shiftTypes"
                  :key="st.code"
                  type="button"
                  @click="selectPatternShift(st.code)"
                  class="w-full px-2 py-1 rounded-lg text-xs font-bold flex items-center justify-between transition cursor-pointer"
                  :class="getShiftBadgeClasses(st.code)"
                >
                  <span>{{ st.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- OPSI B: POLA BULANAN (Tabel 7 Kolom Senin-Minggu) -->
        <div v-else class="space-y-2 pt-1">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label class="font-bold text-neutral-700 dark:text-neutral-300 block">
                Tabel Kalender Bulanan (Tanggal 1 s/d 30):
              </label>
              <span class="text-[10.5px] text-neutral-400">
                Tersusun 7 kolom (Senin s.d. Minggu) dengan baris ke bawah mengikuti.
              </span>
            </div>

            <!-- Quick Presets -->
            <div class="flex items-center gap-1.5 text-xs">
              <span class="text-neutral-400 text-[11px] flex items-center gap-1">
                <Wand2 class="w-3 h-3 text-[var(--theme-primary)]" />
                <span>Preset:</span>
              </span>
              <button
                type="button"
                @click="applyMonthlyPreset('office')"
                class="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 cursor-pointer"
              >
                Office 5-2
              </button>
              <button
                type="button"
                @click="applyMonthlyPreset('rotasi')"
                class="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 cursor-pointer"
              >
                Rotasi 2-2-2-1
              </button>
              <button
                type="button"
                @click="applyMonthlyPreset('pagi-semua')"
                class="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"
              >
                Pagi Semua
              </button>
              <button
                type="button"
                @click="applyMonthlyPreset('reset')"
                class="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-500 cursor-pointer"
              >
                Reset Off
              </button>
            </div>
          </div>

          <!-- Tabel Kalender Bulanan: 7 Kolom (Thead: Senin - Minggu) -->
          <div class="border border-neutral-200 dark:border-[var(--theme-border)] rounded-2xl overflow-hidden shadow-2xs">
            <table class="w-full border-collapse text-left text-xs table-fixed">
              <thead class="bg-neutral-100/80 dark:bg-[var(--theme-surface-raised)] border-b border-neutral-200 dark:border-[var(--theme-border)] text-neutral-700 dark:text-neutral-200 font-bold">
                <tr>
                  <th
                    v-for="dayName in dayNamesIndo"
                    :key="dayName"
                    class="py-2 px-1 text-center border-r border-neutral-200/80 dark:border-[var(--theme-border)] last:border-r-0 text-xs"
                  >
                    {{ dayName }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-200 dark:divide-[var(--theme-border)]">
                <tr
                  v-for="(week, wIdx) in monthlyWeeks"
                  :key="wIdx"
                  class="divide-x divide-neutral-200 dark:divide-[var(--theme-border)]"
                >
                  <td
                    v-for="(cell, cIdx) in week"
                    :key="cIdx"
                    class="p-1.5 transition align-top relative"
                    :class="cell ? 'bg-white dark:bg-[var(--theme-surface)] hover:bg-neutral-50/70' : 'bg-neutral-50/40 dark:bg-neutral-900/10'"
                  >
                    <template v-if="cell">
                      <div class="flex items-center justify-between mb-1">
                        <span class="w-5 h-5 rounded-md flex items-center justify-center text-[10.5px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shadow-2xs">
                          {{ cell.dayNumber }}
                        </span>
                        <span class="text-[9.5px] font-mono text-neutral-400">
                          {{ getShiftMeta(newPatternForm.monthlyDays[cell.index]).time }}
                        </span>
                      </div>

                      <!-- Tombol Shift Warna-Warni di Kalender Bulanan -->
                      <button
                        type="button"
                        @click.stop="togglePatternShiftPopover('monthly', cell.index)"
                        class="w-full py-1.5 px-1.5 rounded-xl text-xs font-bold border transition flex items-center justify-between gap-1 cursor-pointer"
                        :class="getShiftBadgeClasses(newPatternForm.monthlyDays[cell.index])"
                      >
                        <span class="truncate">{{ getShiftMeta(newPatternForm.monthlyDays[cell.index]).name }}</span>
                        <ChevronDown class="w-3 h-3 opacity-60 shrink-0" />
                      </button>

                      <!-- Popover Shift Warna-Warni -->
                      <div
                        v-if="activePatternPopover && activePatternPopover.mode === 'monthly' && activePatternPopover.index === cell.index"
                        class="absolute z-50 top-full mt-1 left-0 right-0 p-1.5 rounded-xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-xl text-left space-y-1"
                        @click.stop
                      >
                        <button
                          v-for="st in shiftTypes"
                          :key="st.code"
                          type="button"
                          @click="selectPatternShift(st.code)"
                          class="w-full px-2 py-1 rounded-lg text-xs font-bold flex items-center justify-between transition cursor-pointer"
                          :class="getShiftBadgeClasses(st.code)"
                        >
                          <span>{{ st.name }}</span>
                        </button>
                      </div>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>

    <!-- Sub-Modal Footer -->
    <template #footer="{ close }">
      <BaseButton variant="outline" size="sm" @click="close">
        Batal
      </BaseButton>
      <BaseButton
        variant="primary"
        size="sm"
        :disabled="!newPatternForm.name.trim()"
        @click="handleSaveNewPattern"
      >
        <Plus class="w-4 h-4 mr-1.5" />
        <span>Simpan Pola</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
