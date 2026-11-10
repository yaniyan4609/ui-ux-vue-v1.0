<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import BaseBadge from './BaseBadge.vue'
import BaseAvatar from './BaseAvatar.vue'
import BaseInput from './BaseInput.vue'
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
  durationMode: 'weekly', // 'weekly' | 'monthly'
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
    badge: p.pattern.slice(0, 4).join('-'),
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
// 4. FILTER KARYAWAN (WILAYAH, KANTOR, JABATAN)
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
    // Hapus dari draft lain jika ada
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
// 5. GENERATE & PREVIEW LOGIC
// ========================================================
const durationOptions = [
  { label: 'Mingguan (7 Hari)', value: 'weekly' },
  { label: '1 Bulan Penuh', value: 'monthly' },
]

const activeDaysList = computed(() => {
  const mode = activeDraft.value?.durationMode || 'weekly'
  if (mode === 'monthly') {
    return props.days
  }
  return props.days.slice(0, 7)
})

// Cari pola aktif
const getSelectedPattern = (draft) => {
  const list = draft.patternSource === 'temp' ? tempPatterns.value : dbPatterns.value
  return list.find((p) => p.id === draft.selectedPatternId) || list[0] || dbPatterns.value[0]
}

// Generate jadwal berdasarkan pola untuk draft tertentu
const generateRosterForDraft = (draft) => {
  if (!draft) return
  const patternObj = getSelectedPattern(draft)
  const pattern = patternObj?.pattern || ['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF']

  const newSchedule = { ...draft.generatedSchedule }

  draft.selectedEmployeeIds.forEach((empId, empIndex) => {
    if (!newSchedule[empId]) {
      newSchedule[empId] = {}
    }

    props.days.forEach((day, dayIndex) => {
      // Rotasi shift berdasarkan hari dan index karyawan (staggered offset agar terbagi merata)
      const shiftIndex = (dayIndex + empIndex) % pattern.length
      newSchedule[empId][day.date] = pattern[shiftIndex]
    })
  })

  draft.generatedSchedule = newSchedule
}

// Override cell shift manual pada preview
const activePopoverCell = ref(null) // { empId, date }
const cellShiftPopoverPlacement = ref('bottom')

const openCellShiftPopover = (empId, date, event) => {
  if (activePopoverCell.value && activePopoverCell.value.empId === empId && activePopoverCell.value.date === date) {
    activePopoverCell.value = null
  } else {
    activePopoverCell.value = { empId, date }
  }
}

const setCellShift = (code) => {
  if (!activePopoverCell.value || !activeDraft.value) return
  const { empId, date } = activePopoverCell.value
  if (!activeDraft.value.generatedSchedule[empId]) {
    activeDraft.value.generatedSchedule[empId] = {}
  }
  activeDraft.value.generatedSchedule[empId][date] = code
  activePopoverCell.value = null
}

// Helper badge shift
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

const getShiftBadgeClasses = (code) => {
  switch (code) {
    case 'P':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40 hover:bg-emerald-100'
    case 'S':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40 hover:bg-amber-100'
    case 'M':
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40 hover:bg-purple-100'
    case 'C':
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/40 hover:bg-blue-100'
    case 'OFF':
    default:
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-[var(--theme-border)] hover:bg-neutral-200/60'
  }
}

// Total jam kerja karyawan dalam periode preview
const calculateEmpTotalHours = (empId) => {
  if (!activeDraft.value?.generatedSchedule?.[empId]) return 0
  let total = 0
  activeDaysList.value.forEach((day) => {
    const code = activeDraft.value.generatedSchedule[empId][day.date]
    const meta = getShiftMeta(code)
    total += meta.hours || 0
  })
  return total
}

// Ringkasan coverage harian draft aktif
const dailyCoverageSummary = computed(() => {
  const summary = {}
  activeDaysList.value.forEach((day) => {
    summary[day.date] = { P: 0, S: 0, M: 0, OFF: 0, total: 0 }
    activeDraft.value?.selectedEmployeeIds.forEach((empId) => {
      const code = activeDraft.value.generatedSchedule?.[empId]?.[day.date] || 'OFF'
      if (summary[day.date][code] !== undefined) {
        summary[day.date][code]++
      }
      if (code !== 'OFF' && code !== 'C') {
        summary[day.date].total++
      }
    })
  })
  return summary
})

// ========================================================
// 6. SUB-MODAL: BUAT POLA ROSTER BARU
// ========================================================
const isCreatePatternModalOpen = ref(false)
const newPatternForm = ref({
  name: '',
  desc: '',
  type: 'weekly', // 'weekly' | 'cycle'
  saveDestination: 'db', // 'db' | 'temp'
  days: ['P', 'P', 'S', 'S', 'M', 'OFF', 'OFF'],
})

const dayNamesIndo = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const openCreatePatternModal = () => {
  newPatternForm.value = {
    name: '',
    desc: '',
    type: 'weekly',
    saveDestination: activeDraft.value?.patternSource || 'db',
    days: ['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF'],
  }
  isCreatePatternModalOpen.value = true
}

const handleSaveNewPattern = () => {
  if (!newPatternForm.value.name.trim()) return

  const newId = `pattern-${Date.now()}`
  const createdPattern = {
    id: newId,
    name: newPatternForm.value.name.trim(),
    desc: newPatternForm.value.desc.trim() || 'Pola shift buatan pengguna.',
    pattern: [...newPatternForm.value.days],
    type: newPatternForm.value.type,
    source: newPatternForm.value.saveDestination,
    suitableFor: 'Kelompok Khusus',
  }

  if (newPatternForm.value.saveDestination === 'db') {
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
// 7. INTI DRAFT PERSISTENCE & APPLY
// ========================================================
// Inisialisasi draft awal jika ada prop initialDrafts
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

// Tutup modal dan kirim sinyal simpan draft
const handleCloseModal = () => {
  emit('save-draft', JSON.parse(JSON.stringify(drafts.value)))
  emit('update:modelValue', false)
}

// Terapkan seluruh draft ke jadwal roster utama
const handleApplyAllDrafts = () => {
  // Kumpulkan jadwal dari semua draft
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

// Reset dan inisialisasi ketika modal dibuka
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (drafts.value.length === 0) {
        drafts.value = [createDefaultDraft(1)]
        activeDraftId.value = drafts.value[0].id
      }
      // Pastikan ada default schedule
      drafts.value.forEach((d) => {
        if (d.selectedEmployeeIds.length === 0 && props.employees.length > 0 && drafts.value.length === 1) {
          // Pilih 4 karyawan pertama secara default untuk draft 1
          d.selectedEmployeeIds = props.employees.slice(0, 4).map((e) => e.id)
        }
        generateRosterForDraft(d)
      })
    }
  }
)
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    size="full"
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
    <div class="flex flex-col lg:flex-row h-[72vh] min-h-[550px] gap-3 -m-4 sm:-m-6 overflow-hidden">
      
      <!-- ======================================================== -->
      <!-- 1. LEFT SIDEBAR: PENGATURAN POLA & DAFTAR KARYAWAN       -->
      <!-- ======================================================== -->
      <div class="w-full lg:w-80 shrink-0 border-r border-neutral-200 dark:border-[var(--theme-border)] bg-neutral-50/70 dark:bg-[var(--theme-surface)] flex flex-col min-h-0 overflow-hidden">
        
        <!-- Header Panel Kiri: 3 Tombol Sumber Pola [Dari DB] [Dari Temp] [+] -->
        <div class="p-3.5 border-b border-neutral-200 dark:border-[var(--theme-border)] space-y-3 shrink-0 bg-white dark:bg-[var(--theme-surface-raised)]">
          <div>
            <span class="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1.5">
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
                title="Buat Pola Roster Baru"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Dropdown Pilih Pola -->
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
            <span class="text-[10.5px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1">
              <Users class="w-3.5 h-3.5 text-neutral-400" />
              <span>Pilih Pegawai ({{ activeDraft?.selectedEmployeeIds.length || 0 }})</span>
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

          <!-- Quick Filters: Wilayah & Divisi -->
          <div class="grid grid-cols-2 gap-1.5 text-xs">
            <select
              v-model="selectedLocationFilter"
              class="py-1 px-2 rounded-lg border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] text-[11px] text-neutral-700 dark:text-neutral-300 truncate"
            >
              <option value="all">Semua Lokasi</option>
              <option v-for="loc in uniqueLocations" :key="loc" :value="loc">
                {{ loc }}
              </option>
            </select>

            <select
              v-model="selectedOrgFilter"
              class="py-1 px-2 rounded-lg border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] text-[11px] text-neutral-700 dark:text-neutral-300 truncate"
            >
              <option value="all">Semua Divisi</option>
              <option v-for="div in uniqueDivisi" :key="div" :value="div">
                {{ div }}
              </option>
            </select>
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
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-xs text-neutral-900 dark:text-white truncate block">
                    {{ emp.name }}
                  </span>
                </div>
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
      <!-- 2. RIGHT PANEL: TABS DRAFT, KONTROL & TABEL ROSTER       -->
      <!-- ======================================================== -->
      <div class="flex-1 min-w-0 flex flex-col min-h-0 bg-white dark:bg-[var(--theme-surface)] overflow-hidden">
        
        <!-- Top Bar: KELOMPOK DRAFT (Tabs horizontal) -->
        <div class="px-4 py-2.5 border-b border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between gap-3 shrink-0 bg-neutral-50/50 dark:bg-[var(--theme-surface-raised)]/50">
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

              <!-- Tombol Hapus Draft (hanya tampil jika draft > 1) -->
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

        <!-- Controls Bar: Pilih Shift, Durasi Generate, Mingguan/Bulanan -->
        <div class="px-4 py-2.5 border-b border-neutral-200 dark:border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-3 shrink-0 bg-white dark:bg-[var(--theme-surface)]">
          <div class="flex items-center gap-2">
            <!-- Durasi Generate Preset -->
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

          <!-- Shift Aktif Badges -->
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-neutral-400 text-[11px] mr-1">Shift Pola:</span>
            <div class="flex items-center gap-1">
              <span class="px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Pagi (P)
              </span>
              <span class="px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                Siang (S)
              </span>
              <span class="px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
                Malam (M)
              </span>
              <span class="px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                Off
              </span>
            </div>
          </div>
        </div>

        <!-- TABEL ROSTER PREVIEW (Matrix) -->
        <div class="flex-1 min-h-0 overflow-auto relative">
          <div v-if="activeDraft && activeDraft.selectedEmployeeIds.length === 0" class="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-400">
            <Users class="w-10 h-10 mb-2 opacity-30" />
            <h4 class="font-bold text-sm text-neutral-600 dark:text-neutral-300">Belum ada pegawai dipilih untuk {{ activeDraft.name }}</h4>
            <p class="text-xs max-w-sm mt-1">
              Centang pegawai di panel kiri untuk memasukkannya ke kelompok draft ini dan melihat pratinjau roster.
            </p>
          </div>

          <table v-else class="w-full border-collapse text-left text-xs min-w-max">
            <!-- Thead Header Hari -->
            <thead class="sticky top-0 z-20 bg-neutral-50 dark:bg-[var(--theme-surface-raised)] border-b border-neutral-200 dark:border-[var(--theme-border)] text-neutral-600 dark:text-neutral-300 font-semibold">
              <tr>
                <th class="sticky left-0 z-30 bg-neutral-50 dark:bg-[var(--theme-surface-raised)] py-2.5 px-3.5 w-56 min-w-[220px] border-r border-neutral-200 dark:border-[var(--theme-border)]">
                  <div class="flex items-center justify-between">
                    <span class="uppercase text-[10px] tracking-wider font-bold text-neutral-500">
                      Pegawai ({{ activeDraft?.selectedEmployeeIds.length }})
                    </span>
                    <span class="text-[10px] text-neutral-400 font-mono">Total Jam</span>
                  </div>
                </th>

                <th
                  v-for="day in activeDaysList"
                  :key="day.date"
                  class="py-2 px-2 text-center border-r border-neutral-200/60 dark:border-[var(--theme-border)] last:border-r-0 min-w-[110px] w-[120px]"
                  :class="day.isToday ? 'bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]' : ''"
                >
                  <div class="font-bold text-xs">{{ day.dayName }}</div>
                  <div class="text-[10.5px] font-mono opacity-80">{{ day.dateLabel }}</div>
                </th>
              </tr>
            </thead>

            <!-- Tbody Rows Pegawai -->
            <tbody class="divide-y divide-neutral-200/70 dark:divide-[var(--theme-border)]">
              <tr
                v-for="empId in activeDraft?.selectedEmployeeIds"
                :key="empId"
                class="hover:bg-neutral-50/70 dark:hover:bg-[var(--theme-surface-raised)]/40 transition"
              >
                <!-- Sticky Employee Cell -->
                <td class="sticky left-0 z-10 bg-white dark:bg-[var(--theme-surface)] py-2 px-3 border-r border-neutral-200 dark:border-[var(--theme-border)] shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <BaseAvatar :name="employees.find(e => e.id === empId)?.name || 'Emp'" size="sm" class="shrink-0" />
                      <div class="min-w-0">
                        <span class="font-bold text-xs text-neutral-900 dark:text-white truncate block">
                          {{ employees.find(e => e.id === empId)?.name }}
                        </span>
                        <span class="text-[10.5px] text-neutral-400 truncate block">
                          {{ employees.find(e => e.id === empId)?.role }}
                        </span>
                      </div>
                    </div>
                    <span class="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 shrink-0">
                      {{ calculateEmpTotalHours(empId) }}j
                    </span>
                  </div>
                </td>

                <!-- Date Shift Cells (Clickable to override) -->
                <td
                  v-for="day in activeDaysList"
                  :key="day.date"
                  class="p-1 text-center border-r border-neutral-100 dark:border-[var(--theme-border)] last:border-r-0 relative"
                >
                  <button
                    type="button"
                    @click.stop="openCellShiftPopover(empId, day.date, $event)"
                    class="w-full py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between gap-1 shadow-2xs cursor-pointer whitespace-nowrap"
                    :class="getShiftBadgeClasses(activeDraft.generatedSchedule?.[empId]?.[day.date])"
                    :title="`Klik untuk ubah shift ${day.dayName}, ${day.dateLabel}`"
                  >
                    <div class="flex items-center gap-1.5 min-w-0">
                      <span class="w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black font-mono shrink-0 bg-white/70 dark:bg-black/30">
                        {{ activeDraft.generatedSchedule?.[empId]?.[day.date] || 'OFF' }}
                      </span>
                      <span class="text-[11px] font-semibold truncate">
                        {{ getShiftMeta(activeDraft.generatedSchedule?.[empId]?.[day.date]).name }}
                      </span>
                    </div>
                    <ChevronDown class="w-3 h-3 opacity-40 shrink-0" />
                  </button>

                  <!-- Popover Ganti Shift Cepat -->
                  <div
                    v-if="activePopoverCell && activePopoverCell.empId === empId && activePopoverCell.date === day.date"
                    class="absolute z-50 top-full mt-1 left-1/2 -translate-x-1/2 w-48 p-2 rounded-xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-xl text-left"
                    @click.stop
                  >
                    <div class="text-[10px] uppercase font-bold text-neutral-400 mb-1.5 px-1">
                      Pilih Shift ({{ day.dayName }})
                    </div>
                    <div class="space-y-1">
                      <button
                        v-for="st in shiftTypes"
                        :key="st.code"
                        type="button"
                        @click="setCellShift(st.code)"
                        class="w-full px-2 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                        :class="activeDraft.generatedSchedule?.[empId]?.[day.date] === st.code ? 'font-bold text-[var(--theme-primary)] bg-[var(--theme-primary-soft)]' : 'text-neutral-700 dark:text-neutral-200'"
                      >
                        <div class="flex items-center gap-2">
                          <span class="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold bg-neutral-200 dark:bg-neutral-700">
                            {{ st.code }}
                          </span>
                          <span>{{ st.name }}</span>
                        </div>
                        <Check v-if="activeDraft.generatedSchedule?.[empId]?.[day.date] === st.code" class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>

            <!-- Tfoot Coverage Shift -->
            <tfoot class="sticky bottom-0 z-20 bg-neutral-50 dark:bg-[var(--theme-surface-raised)] border-t border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs">
              <tr>
                <td class="sticky left-0 z-30 bg-neutral-50 dark:bg-[var(--theme-surface-raised)] py-2 px-3 border-r border-neutral-200 dark:border-[var(--theme-border)]">
                  <span class="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Coverage Shift</span>
                  <span class="text-[10.5px] text-neutral-400 block">{{ activeDraft?.name }}</span>
                </td>
                <td
                  v-for="day in activeDaysList"
                  :key="day.date"
                  class="p-1.5 text-center border-r border-neutral-200/60 dark:border-[var(--theme-border)] last:border-r-0 min-w-[110px]"
                >
                  <div class="flex items-center justify-center gap-1 text-[10px] font-mono">
                    <span class="px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold" title="Pagi">
                      P:{{ dailyCoverageSummary[day.date]?.P || 0 }}
                    </span>
                    <span class="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold" title="Siang">
                      S:{{ dailyCoverageSummary[day.date]?.S || 0 }}
                    </span>
                    <span class="px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold" title="Malam">
                      M:{{ dailyCoverageSummary[day.date]?.M || 0 }}
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
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
  <!-- 3. SUB-MODAL: BUAT POLA ROSTER BARU                      -->
  <!-- ======================================================== -->
  <BaseModal
    v-model="isCreatePatternModalOpen"
    title="Buat Pola Roster Baru"
    subtitle="Definisikan urutan rotasi shift untuk diterapkan ke kelompok karyawan"
    size="lg"
  >
    <div class="space-y-4 text-xs">
      <!-- Nama & Deskripsi Pola -->
      <div class="space-y-1.5">
        <label class="font-bold text-neutral-700 dark:text-neutral-300 block">Nama Pola Shift *</label>
        <BaseInput
          v-model="newPatternForm.name"
          placeholder="Contoh: Pola Rotasi Security 3-Shift, Pola 4-2 CS..."
          size="sm"
        />
      </div>

      <div class="space-y-1.5">
        <label class="font-bold text-neutral-700 dark:text-neutral-300 block">Deskripsi Pola</label>
        <BaseInput
          v-model="newPatternForm.desc"
          placeholder="Contoh: 2 hari pagi, 2 siang, 2 malam, 1 libur untuk operasional 24 jam..."
          size="sm"
        />
      </div>

      <!-- Tipe Pola & Simpan Ke Mana (DB / Temp) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)]">
        <div>
          <label class="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Simpan Pola Ke:</label>
          <div class="flex items-center gap-3 mt-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="db"
                v-model="newPatternForm.saveDestination"
                class="text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]"
              />
              <span class="font-medium text-xs">Database (Permanen)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="temp"
                v-model="newPatternForm.saveDestination"
                class="text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]"
              />
              <span class="font-medium text-xs">Temporary (Sesi Ini)</span>
            </label>
          </div>
        </div>

        <div>
          <label class="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Model Siklus:</label>
          <span class="text-neutral-500 text-[11px] block mt-1">
            Rotasi Mingguan berulang (7 hari kalender)
          </span>
        </div>
      </div>

      <!-- Urutan Shift 7 Hari (Senin - Minggu) -->
      <div>
        <label class="font-bold text-neutral-700 dark:text-neutral-300 block mb-2">
          Urutan Shift Mingguan (Hari 1 s/d 7):
        </label>
        <div class="grid grid-cols-7 gap-1.5">
          <div
            v-for="(dayName, dIdx) in dayNamesIndo"
            :key="dIdx"
            class="p-2 rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] text-center space-y-1.5"
          >
            <span class="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block">
              {{ dayName }}
            </span>
            <select
              v-model="newPatternForm.days[dIdx]"
              class="w-full py-1 px-1 rounded-lg border border-neutral-200 dark:border-[var(--theme-border)] text-[11px] font-bold text-center bg-neutral-50 dark:bg-neutral-800"
            >
              <option value="P">P (Pagi)</option>
              <option value="S">S (Siang)</option>
              <option value="M">M (Malam)</option>
              <option value="OFF">OFF (Libur)</option>
              <option value="C">C (Cuti)</option>
            </select>
          </div>
        </div>
      </div>
    </div>

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
