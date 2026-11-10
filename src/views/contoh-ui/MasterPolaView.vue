<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import ConfirmationModal from '../../components/ui/ConfirmationModal.vue'
import BaseSearchableSelect from '../../components/ui/BaseSearchableSelect.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import BaseSwitch from '../../components/ui/BaseSwitch.vue'
import BaseDataTable from '../../components/ui/BaseDataTable.vue'
import BaseStatCard from '../../components/ui/BaseStatCard.vue'
import BaseSegmentedControl from '../../components/ui/BaseSegmentedControl.vue'
import { useToast } from '../../composables/useToast'
import { rosterTemplates as initialTemplates, shiftTypes, fullMonthDays } from '../../data/hrisRosterData'
import {
  CalendarRange,
  Plus,
  Pencil,
  Trash2,
  Search,
  Copy,
  Sparkles,
  Database,
  Zap,
  CheckCircle2,
  RotateCcw,
  Download,
  LayoutGrid,
  Table as TableIcon,
  Clock,
  Users,
  ChevronDown,
  Check,
} from 'lucide-vue-next'

const router = useRouter()
const toast = useToast()

// ========================================================
// 1. DATA MASTER POLA & STATE
// ========================================================
const polaList = ref(JSON.parse(JSON.stringify(initialTemplates)))

// View Mode: Kartu Visual vs Tabel Ringkas
const viewMode = ref('cards') // 'cards' | 'table'

// Filter & Search State
const searchQuery = ref('')
const selectedType = ref('all') // 'all' | 'weekly' | 'monthly'
const selectedStorage = ref('all') // 'all' | 'db' | 'temp'
const selectedDivisi = ref('all')

const typeFilterOptions = [
  { value: 'all', label: 'Semua Siklus' },
  { value: 'weekly', label: 'Mingguan (7 Hari)' },
  { value: 'monthly', label: 'Bulanan (30 Hari)' },
]

const storageFilterOptions = [
  { value: 'all', label: 'Semua Sumber' },
  { value: 'db', label: 'Tersimpan di DB' },
  { value: 'temp', label: 'Temporary / Draft' },
]

const divisiFilterOptions = [
  { value: 'all', label: 'Semua Target Divisi' },
  { value: 'Teknologi & IT', label: 'Teknologi & IT' },
  { value: 'Keamanan & Fasilitas', label: 'Keamanan & Fasilitas' },
  { value: 'Operasional Gudang', label: 'Operasional Gudang' },
  { value: 'Layanan & CS', label: 'Layanan & CS' },
  { value: 'Administrasi', label: 'Administrasi & HR' },
]

// Day Labels for Weekly (Senin - Minggu)
const weekDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

// Helper lookup shift
const getShiftInfo = (code) => {
  return (
    shiftTypes.find((s) => s.code === code) || {
      code,
      name: code,
      badgeVariant: 'neutral',
      time: '-',
    }
  )
}

// ========================================================
// 2. COMPUTED METRICS & FILTERED DATA
// ========================================================
const totalPola = computed(() => polaList.value.length)
const weeklyCount = computed(() => polaList.value.filter((p) => p.type === 'weekly').length)
const monthlyCount = computed(() => polaList.value.filter((p) => p.type === 'monthly').length)
const databaseCount = computed(() => polaList.value.filter((p) => p.isDatabase).length)

const filteredPolaList = computed(() => {
  return polaList.value.filter((p) => {
    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchName = p.name?.toLowerCase().includes(q)
      const matchDesc = p.desc?.toLowerCase().includes(q)
      const matchDiv = p.suitableFor?.toLowerCase().includes(q)
      if (!matchName && !matchDesc && !matchDiv) return false
    }

    // Type filter
    if (selectedType.value !== 'all' && p.type !== selectedType.value) return false

    // Storage filter
    if (selectedStorage.value === 'db' && !p.isDatabase) return false
    if (selectedStorage.value === 'temp' && p.isDatabase) return false

    // Divisi filter
    if (selectedDivisi.value !== 'all' && !p.suitableFor?.toLowerCase().includes(selectedDivisi.value.toLowerCase())) {
      return false
    }

    return true
  })
})

// ========================================================
// 3. TABLE COLUMNS FOR TABLE VIEW
// ========================================================
const tableColumns = [
  { key: 'name', label: 'Nama Pola & Divisi', sortable: true },
  { key: 'type', label: 'Siklus', width: '160px', align: 'center', sortable: true },
  { key: 'preview', label: 'Pratinjau Sekuens Shift', width: '340px' },
  { key: 'isDatabase', label: 'Penyimpanan', width: '130px', align: 'center', sortable: true },
  { key: 'actions', label: 'Aksi', width: '140px', align: 'center' },
]

// ========================================================
// 4. DUPLIKASI & NAVIGASI KE ROSTER
// ========================================================
const handleDuplicatePola = (pola) => {
  const newPola = {
    ...JSON.parse(JSON.stringify(pola)),
    id: `tpl-${Date.now()}`,
    name: `${pola.name} (Salinan)`,
    isDatabase: false,
  }
  polaList.value.unshift(newPola)
  toast.success(`Pola "${newPola.name}" berhasil diduplikasi.`, 'Pola Diduplikasi')
}

const handleApplyToRoster = (pola) => {
  toast.info(`Membuka generator jadwal roster dengan pola ${pola.name}...`)
  router.push('/contoh-ui/roster')
}

// ========================================================
// 5. MODAL FORM: BUAT & UBAH POLA ROSTER
// ========================================================
const isFormModalOpen = ref(false)
const isEditMode = ref(false)

const formPolaCycle = ref('weekly') // 'weekly' | 'monthly'
const formPolaName = ref('')
const formPolaDivisi = ref('Teknologi & IT')
const formPolaDesc = ref('')
const formSaveToDb = ref(true)
const formActiveDayEditing = ref(null)

// 7 Days Weekly Pattern Editing
const formWeeklyShifts = ref(['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF'])

// 30 Days Monthly Pattern Editing
const formMonthlyShifts = ref(Array.from({ length: 30 }, (_, i) => {
  const d = (i % 7) + 1
  return d <= 5 ? 'P' : 'OFF'
}))

const formErrors = ref({})
const currentEditingId = ref(null)

const openAddModal = () => {
  isEditMode.value = false
  currentEditingId.value = null
  formErrors.value = {}
  formPolaCycle.value = 'weekly'
  formPolaName.value = ''
  formPolaDivisi.value = 'Teknologi & IT'
  formPolaDesc.value = ''
  formSaveToDb.value = true
  formWeeklyShifts.value = ['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF']
  formMonthlyShifts.value = Array.from({ length: 30 }, (_, i) => {
    const d = (i % 7) + 1
    return d <= 5 ? 'P' : 'OFF'
  })
  isFormModalOpen.value = true
}

const openEditModal = (pola) => {
  isEditMode.value = true
  currentEditingId.value = pola.id
  formErrors.value = {}
  formPolaCycle.value = pola.type || 'weekly'
  formPolaName.value = pola.name
  formPolaDivisi.value = pola.suitableFor?.split(',')[0]?.trim() || 'Teknologi & IT'
  formPolaDesc.value = pola.desc || ''
  formSaveToDb.value = !!pola.isDatabase

  if (pola.type === 'monthly') {
    const pat = [...(pola.pattern || [])]
    while (pat.length < 30) pat.push('OFF')
    formMonthlyShifts.value = pat.slice(0, 30)
  } else {
    const pat = [...(pola.pattern || [])]
    while (pat.length < 7) pat.push('OFF')
    formWeeklyShifts.value = pat.slice(0, 7)
  }

  isFormModalOpen.value = true
}

// Quick fill templates
const applyQuickPreset = (preset) => {
  if (preset === '5-2') {
    if (formPolaCycle.value === 'weekly') {
      formWeeklyShifts.value = ['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF']
    } else {
      formMonthlyShifts.value = Array.from({ length: 30 }, (_, i) => ((i % 7) < 5 ? 'P' : 'OFF'))
    }
    toast.info('Pola diatur ke Standar 5 Hari Pagi, 2 Hari Off.')
  } else if (preset === '2-2-2-1') {
    const pat = ['P', 'P', 'S', 'S', 'M', 'M', 'OFF']
    if (formPolaCycle.value === 'weekly') {
      formWeeklyShifts.value = [...pat]
    } else {
      formMonthlyShifts.value = Array.from({ length: 30 }, (_, i) => pat[i % pat.length])
    }
    toast.info('Pola diatur ke Rotasi 2 Pagi, 2 Siang, 2 Malam, 1 Off.')
  } else if (preset === 'all-pagi') {
    const arr = formPolaCycle.value === 'weekly' ? formWeeklyShifts : formMonthlyShifts
    arr.value = arr.value.map(() => 'P')
    toast.info('Seluruh jadwal diatur ke Shift Pagi.')
  } else if (preset === 'all-siang') {
    const arr = formPolaCycle.value === 'weekly' ? formWeeklyShifts : formMonthlyShifts
    arr.value = arr.value.map(() => 'S')
    toast.info('Seluruh jadwal diatur ke Shift Siang.')
  }
}

const handleSetShiftAt = (index, shiftCode) => {
  if (formPolaCycle.value === 'weekly') {
    formWeeklyShifts.value[index] = shiftCode
  } else {
    formMonthlyShifts.value[index] = shiftCode
  }
  formActiveDayEditing.value = null
}

const validatePolaForm = () => {
  const errors = {}
  if (!formPolaName.value.trim()) {
    errors.name = 'Nama pola wajib diisi (mis. Pola Shift IT 24/7)'
  }
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSavePola = () => {
  if (!validatePolaForm()) {
    toast.error('Periksa nama pola yang belum terisi.', 'Validasi Gagal')
    return
  }

  const patternArray = formPolaCycle.value === 'weekly'
    ? [...formWeeklyShifts.value]
    : [...formMonthlyShifts.value]

  const payload = {
    id: isEditMode.value ? currentEditingId.value : `tpl-${Date.now()}`,
    name: formPolaName.value.trim(),
    type: formPolaCycle.value,
    desc: formPolaDesc.value.trim() || `Pola rotasi ${formPolaCycle.value === 'weekly' ? 'mingguan 7 hari' : 'bulanan 30 hari'} terstandarisasi.`,
    suitableFor: formPolaDivisi.value,
    pattern: patternArray,
    isDatabase: formSaveToDb.value,
    activeEmployees: isEditMode.value ? (polaList.value.find((p) => p.id === currentEditingId.value)?.activeEmployees || 0) : 0,
  }

  if (isEditMode.value) {
    const idx = polaList.value.findIndex((p) => p.id === payload.id)
    if (idx !== -1) {
      polaList.value[idx] = payload
    }
    toast.success(`Pola "${payload.name}" berhasil diperbarui!`, 'Pola Diperbarui')
  } else {
    polaList.value.unshift(payload)
    toast.success(`Pola "${payload.name}" berhasil disimpan ke sistem!`, 'Pola Ditambahkan')
  }

  isFormModalOpen.value = false
}

// ========================================================
// 6. CONFIRMATION MODAL DELETE POLA
// ========================================================
const isDeleteModalOpen = ref(false)
const itemToDelete = ref(null)

const openDeleteConfirm = (pola) => {
  itemToDelete.value = pola
  isDeleteModalOpen.value = true
}

const handleDeleteConfirm = () => {
  if (!itemToDelete.value) return
  const deleted = itemToDelete.value
  polaList.value = polaList.value.filter((p) => p.id !== deleted.id)
  isDeleteModalOpen.value = false
  itemToDelete.value = null
  toast.error(`Pola "${deleted.name}" telah dihapus dari sistem.`, 'Pola Dihapus')
}

// ========================================================
// 7. RESET & EKSPOR CSV
// ========================================================
const handleResetDefault = () => {
  polaList.value = JSON.parse(JSON.stringify(initialTemplates))
  searchQuery.value = ''
  selectedType.value = 'all'
  selectedStorage.value = 'all'
  selectedDivisi.value = 'all'
  toast.info('Pustaka pola roster telah dikembalikan ke bawaan sistem.')
}

const exportToCSV = () => {
  const items = filteredPolaList.value
  if (!items.length) {
    toast.warning('Tidak ada data pola untuk diekspor.')
    return
  }

  const headers = ['ID Pola', 'Nama Pola', 'Siklus', 'Target Divisi', 'Sumber Penyimpanan', 'Urutan Shift', 'Deskripsi']
  const rows = items.map((p) => [
    `"${p.id}"`,
    `"${p.name}"`,
    p.type === 'weekly' ? 'Mingguan (7 Hari)' : 'Bulanan (30 Hari)',
    `"${p.suitableFor || ''}"`,
    p.isDatabase ? 'Database' : 'Temporary',
    `"${(p.pattern || []).join('-')}"`,
    `"${(p.desc || '').replace(/"/g, '""')}"`,
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `master_pola_roster_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success(`Berhasil mengunduh ${items.length} pola roster ke format CSV!`, 'Ekspor CSV')
}
</script>

<template>
  <!-- Main View Container -->
  <div class="h-full flex flex-col min-h-0 overflow-hidden gap-2.5 w-full max-w-7xl mx-auto select-none relative">
    
    <!-- 1. HEADER HALAMAN MASTER POLA ROSTER -->
    <div class="flex items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-[var(--theme-border)] shrink-0">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shrink-0 shadow-2xs">
          <CalendarRange class="w-4 h-4 text-sky-400 dark:text-sky-600" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-[var(--theme-text-primary)] leading-none truncate">
              Master Pola Roster
            </h1>
            <BaseBadge variant="info" size="sm">
              {{ totalPola }} Pola Tersedia
            </BaseBadge>
          </div>
          <p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
            Pustaka pola rotasi shift kerja (mingguan 7 hari & bulanan 30 hari) untuk percepatan dan konsistensi jadwal pegawai.
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <BaseButton
          variant="outline"
          size="sm"
          @click="exportToCSV"
          title="Unduh daftar pola ke CSV"
        >
          <Download class="w-3.5 h-3.5 text-neutral-500" />
          <span class="hidden sm:inline">Ekspor CSV</span>
        </BaseButton>

        <BaseButton
          variant="outline"
          size="sm"
          @click="handleResetDefault"
          title="Kembalikan data pola ke pengaturan bawaan"
        >
          <RotateCcw class="w-3.5 h-3.5 text-neutral-500" />
          <span class="hidden sm:inline">Reset</span>
        </BaseButton>

        <BaseButton
          variant="primary"
          size="sm"
          @click="openAddModal"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Buat Pola Baru</span>
        </BaseButton>
      </div>
    </div>

    <!-- 2. QUICK STATS CARDS -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
      <BaseStatCard
        title="Total Pola Roster"
        :value="totalPola"
        unit="Pola"
        description="Pustaka pola siap digunakan"
      >
        <template #icon>
          <CalendarRange class="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </template>
      </BaseStatCard>

      <BaseStatCard
        title="Pola Mingguan (7 Hari)"
        :value="weeklyCount"
        unit="Pola"
        description="Siklus rolling per 7 hari kalender"
      >
        <template #icon>
          <Clock class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </template>
      </BaseStatCard>

      <BaseStatCard
        title="Pola Bulanan (30 Hari)"
        :value="monthlyCount"
        unit="Pola"
        description="Siklus lengkap 1 bulan penuh"
      >
        <template #icon>
          <Sparkles class="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </template>
      </BaseStatCard>

      <BaseStatCard
        title="Penyimpanan Database"
        :value="databaseCount"
        unit="Pola DB"
        description="Tersimpan permanen di cloud DB"
      >
        <template #icon>
          <Database class="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </template>
      </BaseStatCard>
    </div>

    <!-- 3. TOOLBAR: PENCARIAN & FILTER & VIEW TOGGLE -->
    <div class="flex flex-wrap items-center justify-between gap-2.5 p-2.5 bg-neutral-50/80 dark:bg-[var(--theme-surface-muted)]/50 rounded-xl border border-neutral-200/80 dark:border-[var(--theme-border)] shrink-0">
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
        <!-- Search Input -->
        <div class="w-full sm:w-60">
          <BaseInput
            v-model="searchQuery"
            placeholder="Cari nama pola atau divisi..."
            size="sm"
            clearable
          >
            <template #prefix>
              <Search class="w-3.5 h-3.5 text-neutral-400" />
            </template>
          </BaseInput>
        </div>

        <!-- Filter Siklus -->
        <div class="w-44">
          <BaseSearchableSelect
            v-model="selectedType"
            :options="typeFilterOptions"
            placeholder="Semua Siklus"
            size="sm"
          />
        </div>

        <!-- Filter Penyimpanan -->
        <div class="w-40">
          <BaseSearchableSelect
            v-model="selectedStorage"
            :options="storageFilterOptions"
            placeholder="Semua Sumber"
            size="sm"
          />
        </div>

        <!-- Filter Target Divisi -->
        <div class="w-44">
          <BaseSearchableSelect
            v-model="selectedDivisi"
            :options="divisiFilterOptions"
            placeholder="Semua Target Divisi"
            size="sm"
          />
        </div>

        <!-- Reset Button -->
        <button
          v-if="searchQuery || selectedType !== 'all' || selectedStorage !== 'all' || selectedDivisi !== 'all'"
          @click="searchQuery = ''; selectedType = 'all'; selectedStorage = 'all'; selectedDivisi = 'all'"
          class="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center gap-1 px-2 py-1 transition-colors"
        >
          <RotateCcw class="w-3 h-3" />
          Bersihkan
        </button>
      </div>

      <!-- View Switcher: Card View vs Table View -->
      <div class="flex items-center gap-1 bg-white dark:bg-[var(--theme-surface)] p-0.5 rounded-lg border border-neutral-200 dark:border-[var(--theme-border)] shrink-0">
        <button
          type="button"
          @click="viewMode = 'cards'"
          class="p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          :class="[
            viewMode === 'cards'
              ? 'bg-[var(--theme-primary)] text-white shadow-2xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
          ]"
          title="Tampilan Kartu Visual"
        >
          <LayoutGrid class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Visual Kartu</span>
        </button>
        <button
          type="button"
          @click="viewMode = 'table'"
          class="p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          :class="[
            viewMode === 'table'
              ? 'bg-[var(--theme-primary)] text-white shadow-2xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
          ]"
          title="Tampilan Tabel Ringkas"
        >
          <TableIcon class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Tabel</span>
        </button>
      </div>
    </div>

    <!-- 4A. TAMPILAN KARTU VISUAL (GRID CARDS) -->
    <div
      v-if="viewMode === 'cards'"
      class="flex-1 min-h-0 overflow-y-auto pr-1"
    >
      <div v-if="filteredPolaList.length" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="pola in filteredPolaList"
          :key="pola.id"
          class="bg-white dark:bg-[var(--theme-surface)] rounded-xl border border-neutral-200/90 dark:border-[var(--theme-border)] p-3.5 flex flex-col justify-between shadow-2xs hover:border-[var(--theme-primary)]/50 transition-all gap-3"
        >
          <!-- Card Header -->
          <div>
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[var(--theme-text-primary)] leading-snug">
                    {{ pola.name }}
                  </h3>
                  <BaseBadge
                    :variant="pola.type === 'monthly' ? 'purple' : 'info'"
                    size="sm"
                  >
                    {{ pola.type === 'monthly' ? 'Bulanan (30 Hari)' : 'Mingguan (7 Hari)' }}
                  </BaseBadge>
                  <BaseBadge
                    :variant="pola.isDatabase ? 'success' : 'warning'"
                    size="sm"
                  >
                    <component :is="pola.isDatabase ? Database : Zap" class="w-3 h-3 mr-1" />
                    {{ pola.isDatabase ? 'Database' : 'Temp Draft' }}
                  </BaseBadge>
                </div>
                <p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {{ pola.desc }}
                </p>
              </div>
            </div>

            <!-- Target Divisi Tag -->
            <div class="flex items-center gap-1.5 mt-2 text-[11px] text-neutral-500">
              <span class="font-medium text-neutral-700 dark:text-neutral-300">Cocok Untuk:</span>
              <span class="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-medium truncate">
                {{ pola.suitableFor || 'Semua Divisi' }}
              </span>
            </div>
          </div>

          <!-- Card Body: Visual Sequence Preview -->
          <div class="bg-neutral-50/80 dark:bg-[var(--theme-surface-muted)]/50 p-2.5 rounded-lg border border-neutral-100 dark:border-[var(--theme-border)]">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Pratinjau Rotasi Shift ({{ pola.type === 'monthly' ? 'Siklus 30 Hari' : 'Siklus 7 Hari' }})
              </span>
              <span class="text-[10px] text-neutral-400">
                {{ (pola.pattern || []).length }} Hari Terjadwal
              </span>
            </div>

            <!-- Pratinjau Mingguan (7 Kolom Lengkap) -->
            <div v-if="pola.type === 'weekly'" class="grid grid-cols-7 gap-1">
              <div
                v-for="(dayName, dIdx) in weekDays"
                :key="dIdx"
                class="flex flex-col items-center bg-white dark:bg-[var(--theme-surface)] p-1 rounded border border-neutral-200/70 dark:border-[var(--theme-border)] text-center min-w-0"
              >
                <span class="text-[9px] font-semibold text-neutral-500 truncate w-full">
                  {{ dayName.slice(0, 3) }}
                </span>
                <div class="mt-1">
                  <BaseBadge
                    :variant="getShiftInfo(pola.pattern[dIdx] || 'OFF').badgeVariant"
                    size="sm"
                    class="font-bold font-mono px-1.5 py-0 text-[10px]"
                  >
                    {{ pola.pattern[dIdx] || 'OFF' }}
                  </BaseBadge>
                </div>
              </div>
            </div>

            <!-- Pratinjau Bulanan (Ringkasan Kalender Mini & Distribusi) -->
            <div v-else class="space-y-1.5">
              <div class="grid grid-cols-10 gap-1">
                <div
                  v-for="(shiftCode, sIdx) in (pola.pattern || []).slice(0, 30)"
                  :key="sIdx"
                  class="flex flex-col items-center justify-center p-0.5 rounded bg-white dark:bg-[var(--theme-surface)] border border-neutral-200/70 dark:border-[var(--theme-border)]"
                >
                  <span class="text-[8px] text-neutral-400">{{ sIdx + 1 }}</span>
                  <span
                    class="text-[9px] font-bold font-mono px-1 rounded mt-0.5"
                    :class="[
                      shiftCode === 'P' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' :
                      shiftCode === 'S' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400' :
                      shiftCode === 'M' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400' :
                      'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    ]"
                  >
                    {{ shiftCode }}
                  </span>
                </div>
              </div>
              <div class="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-200/50 dark:border-[var(--theme-border)]">
                <span>Distribusi:</span>
                <div class="flex items-center gap-2">
                  <span class="text-emerald-600 dark:text-emerald-400 font-semibold">P: {{ (pola.pattern || []).filter(c => c === 'P').length }}x</span>
                  <span class="text-amber-600 dark:text-amber-400 font-semibold">S: {{ (pola.pattern || []).filter(c => c === 'S').length }}x</span>
                  <span class="text-purple-600 dark:text-purple-400 font-semibold">M: {{ (pola.pattern || []).filter(c => c === 'M').length }}x</span>
                  <span class="text-neutral-500 font-semibold">OFF: {{ (pola.pattern || []).filter(c => c === 'OFF').length }}x</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Footer Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-[var(--theme-border)]">
            <BaseButton
              variant="outline"
              size="xs"
              @click="handleApplyToRoster(pola)"
              title="Terapkan pola ini pada jadwal roster"
            >
              <Sparkles class="w-3 h-3 text-sky-500 mr-1" />
              <span>Terapkan ke Roster</span>
            </BaseButton>

            <div class="flex items-center gap-1">
              <BaseButton
                variant="ghost"
                size="xs"
                @click="handleDuplicatePola(pola)"
                title="Salin Pola"
              >
                <Copy class="w-3.5 h-3.5 text-neutral-500" />
              </BaseButton>
              <BaseButton
                variant="ghost"
                size="xs"
                @click="openEditModal(pola)"
                title="Ubah Pola"
              >
                <Pencil class="w-3.5 h-3.5 text-neutral-500" />
              </BaseButton>
              <BaseButton
                variant="ghost"
                size="xs"
                @click="openDeleteConfirm(pola)"
                title="Hapus Pola"
              >
                <Trash2 class="w-3.5 h-3.5 text-rose-500" />
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-[var(--theme-surface)] rounded-xl border border-neutral-200 dark:border-[var(--theme-border)]">
        <CalendarRange class="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-2" />
        <p class="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Tidak ada pola roster yang cocok</p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
          Coba ubah kata kunci pencarian atau bersihkan filter siklus dan penyimpanan.
        </p>
        <BaseButton
          variant="outline"
          size="sm"
          class="mt-3"
          @click="searchQuery = ''; selectedType = 'all'; selectedStorage = 'all'; selectedDivisi = 'all'"
        >
          Bersihkan Filter
        </BaseButton>
      </div>
    </div>

    <!-- 4B. TAMPILAN TABEL RINGKAS (BASE DATA TABLE) -->
    <div
      v-else
      class="flex-1 min-h-0 bg-white dark:bg-[var(--theme-surface)] rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] overflow-hidden shadow-2xs"
    >
      <BaseDataTable
        :columns="tableColumns"
        :rows="filteredPolaList"
        row-key="id"
        :paginated="true"
        :items-per-page="10"
        :per-page-options="[10, 20, 50]"
        :show-index="false"
      >
        <!-- Cell: Nama Pola -->
        <template #cell-name="{ row }">
          <div class="py-1">
            <span class="font-semibold text-xs text-neutral-900 dark:text-[var(--theme-text-primary)] block truncate">
              {{ row.name }}
            </span>
            <span class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate block mt-0.5">
              {{ row.suitableFor || 'Semua Divisi' }}
            </span>
          </div>
        </template>

        <!-- Cell: Siklus -->
        <template #cell-type="{ row }">
          <div class="flex items-center justify-center">
            <BaseBadge
              :variant="row.type === 'monthly' ? 'purple' : 'info'"
              size="sm"
            >
              {{ row.type === 'monthly' ? 'Bulanan (30 Hari)' : 'Mingguan (7 Hari)' }}
            </BaseBadge>
          </div>
        </template>

        <!-- Cell: Preview Sequence -->
        <template #cell-preview="{ row }">
          <div class="flex items-center gap-1 overflow-x-auto py-1">
            <span
              v-for="(code, idx) in (row.pattern || []).slice(0, 7)"
              :key="idx"
              class="font-mono font-bold text-[9px] px-1.5 py-0.5 rounded"
              :class="[
                code === 'P' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' :
                code === 'S' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400' :
                code === 'M' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400' :
                'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
              ]"
            >
              {{ code }}
            </span>
            <span v-if="(row.pattern || []).length > 7" class="text-[10px] text-neutral-400 font-medium ml-1">
              +{{ (row.pattern || []).length - 7 }} hari
            </span>
          </div>
        </template>

        <!-- Cell: Penyimpanan -->
        <template #cell-isDatabase="{ row }">
          <div class="flex items-center justify-center">
            <BaseBadge
              :variant="row.isDatabase ? 'success' : 'warning'"
              size="sm"
            >
              {{ row.isDatabase ? 'Database' : 'Temp Draft' }}
            </BaseBadge>
          </div>
        </template>

        <!-- Cell: Aksi -->
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-center gap-1">
            <button
              type="button"
              @click="handleApplyToRoster(row)"
              class="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-sky-600 dark:hover:bg-[var(--theme-surface-hover)] transition-colors"
              title="Terapkan ke Roster"
            >
              <Sparkles class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              @click="handleDuplicatePola(row)"
              class="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 dark:hover:bg-[var(--theme-surface-hover)] transition-colors"
              title="Salin Pola"
            >
              <Copy class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              @click="openEditModal(row)"
              class="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 dark:hover:bg-[var(--theme-surface-hover)] transition-colors"
              title="Ubah Pola"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              @click="openDeleteConfirm(row)"
              class="p-1 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
              title="Hapus Pola"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </BaseDataTable>
    </div>

    <!-- 5. MODAL FORM: BUAT / UBAH POLA ROSTER -->
    <BaseModal
      v-model="isFormModalOpen"
      :title="isEditMode ? 'Ubah Master Pola Roster' : 'Buat Pola Roster Baru'"
      :subtitle="isEditMode ? 'Sesuaikan susunan shift per hari dan target divisi' : 'Rancang pola rotasi shift mingguan atau bulanan untuk digunakan saat generate jadwal'"
      size="xl"
    >
      <div class="space-y-4 text-xs">
        
        <!-- Pilihan Siklus: Segmented Control -->
        <div class="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-neutral-50 dark:bg-[var(--theme-surface-muted)]/60 rounded-xl border border-neutral-200/80 dark:border-[var(--theme-border)]">
          <div>
            <span class="font-semibold text-neutral-900 dark:text-[var(--theme-text-primary)] block">
              Siklus Rotasi Jadwal
            </span>
            <span class="text-[11px] text-neutral-500">
              Pilih apakah pola ini berulang per minggu (7 hari) atau per 1 bulan penuh (30 hari)
            </span>
          </div>

          <BaseSegmentedControl
            v-model="formPolaCycle"
            :options="[
              { value: 'weekly', label: 'Mingguan (7 Hari)' },
              { value: 'monthly', label: '1 Bulan Penuh (30 Hari)' },
            ]"
            size="sm"
          />
        </div>

        <!-- Nama Pola & Divisi -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BaseInput
              v-model="formPolaName"
              label="Nama Pola Roster"
              placeholder="Mis. Pola Shift IT 24/7 (2-2-2-1)"
              required
              :error="formErrors.name"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Target Divisi / Departemen
            </label>
            <BaseSearchableSelect
              v-model="formPolaDivisi"
              :options="divisiFilterOptions.filter(o => o.value !== 'all')"
              placeholder="Pilih divisi..."
              size="md"
            />
          </div>
        </div>

        <!-- Deskripsi Pola -->
        <div>
          <BaseInput
            v-model="formPolaDesc"
            label="Keterangan / Catatan Pola"
            placeholder="Mis. 2 hari Pagi, 2 hari Siang, 2 hari Malam, 1 hari Libur Off untuk tim operasional"
          />
        </div>

        <!-- EDITOR VISUAL SHIFT PER HARI -->
        <div class="p-3 bg-neutral-50 dark:bg-[var(--theme-surface-muted)]/50 rounded-xl border border-neutral-200/80 dark:border-[var(--theme-border)] space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="font-semibold text-neutral-900 dark:text-[var(--theme-text-primary)] block">
                Susunan Shift Per Hari
              </span>
              <span class="text-[11px] text-neutral-500">
                Klik pada kotak hari untuk memilih shift yang bertugas
              </span>
            </div>

            <!-- Preset Cepat -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] text-neutral-400">Preset Cepat:</span>
              <button
                type="button"
                @click="applyQuickPreset('5-2')"
                class="px-2 py-0.5 text-[10px] font-medium rounded border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] hover:bg-neutral-100 transition-colors"
              >
                Pola 5-2
              </button>
              <button
                type="button"
                @click="applyQuickPreset('2-2-2-1')"
                class="px-2 py-0.5 text-[10px] font-medium rounded border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] hover:bg-neutral-100 transition-colors"
              >
                Pola 2-2-2-1
              </button>
              <button
                type="button"
                @click="applyQuickPreset('all-pagi')"
                class="px-2 py-0.5 text-[10px] font-medium rounded border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] hover:bg-neutral-100 transition-colors"
              >
                Semua Pagi
              </button>
            </div>
          </div>

          <!-- A. MODE MINGGUAN (7 HARI: SENIN - MINGGU) -->
          <div v-if="formPolaCycle === 'weekly'" class="grid grid-cols-7 gap-2">
            <div
              v-for="(dayName, dIdx) in weekDays"
              :key="dIdx"
              class="flex flex-col items-center bg-white dark:bg-[var(--theme-surface)] p-2 rounded-xl border border-neutral-200/90 dark:border-[var(--theme-border)] text-center relative"
            >
              <span class="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                {{ dayName }}
              </span>
              <span class="text-[9px] text-neutral-400 mt-0.5">Hari {{ dIdx + 1 }}</span>

              <!-- Shift Selector Pill -->
              <div class="mt-2 w-full">
                <button
                  type="button"
                  @click="formActiveDayEditing = formActiveDayEditing === dIdx ? null : dIdx"
                  class="w-full py-1 px-1 rounded-lg border text-xs font-bold transition-all flex items-center justify-between"
                  :class="[
                    formWeeklyShifts[dIdx] === 'P' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40' :
                    formWeeklyShifts[dIdx] === 'S' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40' :
                    formWeeklyShifts[dIdx] === 'M' ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/40' :
                    'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                  ]"
                >
                  <span class="truncate">{{ getShiftInfo(formWeeklyShifts[dIdx]).name }}</span>
                  <ChevronDown class="w-3 h-3 shrink-0 ml-1 text-neutral-400" />
                </button>

                <!-- Popover Pilihan Shift -->
                <div
                  v-if="formActiveDayEditing === dIdx"
                  class="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-[var(--theme-surface)] rounded-lg shadow-lg border border-neutral-200 dark:border-[var(--theme-border)] p-1 text-left space-y-0.5"
                >
                  <button
                    v-for="s in shiftTypes"
                    :key="s.code"
                    type="button"
                    @click="handleSetShiftAt(dIdx, s.code)"
                    class="w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-hover)]"
                    :class="{ 'font-bold bg-neutral-50 dark:bg-neutral-800': formWeeklyShifts[dIdx] === s.code }"
                  >
                    <div class="flex items-center gap-1.5 truncate">
                      <BaseBadge :variant="s.badgeVariant" size="sm" class="px-1 py-0 text-[9px] font-mono">
                        {{ s.code }}
                      </BaseBadge>
                      <span class="truncate">{{ s.name }}</span>
                    </div>
                    <Check v-if="formWeeklyShifts[dIdx] === s.code" class="w-3 h-3 text-[var(--theme-primary)] shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- B. MODE BULANAN (30 HARI: KALENDER 7 KOLOM SENIN - MINGGU) -->
          <div v-else class="space-y-2">
            <!-- Header Kolom Kalender -->
            <div class="grid grid-cols-7 gap-1.5 text-center font-bold text-[11px] text-neutral-500 border-b border-neutral-200 dark:border-[var(--theme-border)] pb-1">
              <span v-for="d in weekDays" :key="d">{{ d }}</span>
            </div>

            <!-- Kalender Grid 30 Hari -->
            <div class="grid grid-cols-7 gap-1.5 max-h-[260px] overflow-y-auto pr-1">
              <div
                v-for="(shiftCode, mIdx) in formMonthlyShifts"
                :key="mIdx"
                class="flex flex-col bg-white dark:bg-[var(--theme-surface)] p-1.5 rounded-lg border border-neutral-200/90 dark:border-[var(--theme-border)] relative"
              >
                <div class="flex items-center justify-between text-[10px] text-neutral-400">
                  <span class="font-bold text-neutral-700 dark:text-neutral-300">Tgl {{ mIdx + 1 }}</span>
                </div>

                <!-- Shift Selector Button -->
                <button
                  type="button"
                  @click="formActiveDayEditing = formActiveDayEditing === mIdx ? null : mIdx"
                  class="mt-1 w-full py-0.5 px-1 rounded border text-[10px] font-bold flex items-center justify-between transition-colors"
                  :class="[
                    shiftCode === 'P' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40' :
                    shiftCode === 'S' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40' :
                    shiftCode === 'M' ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/40' :
                    'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                  ]"
                >
                  <span class="truncate">{{ getShiftInfo(shiftCode).name }}</span>
                  <ChevronDown class="w-2.5 h-2.5 shrink-0 ml-0.5 text-neutral-400" />
                </button>

                <!-- Popover Pilihan Shift -->
                <div
                  v-if="formActiveDayEditing === mIdx"
                  class="absolute top-full left-0 w-36 mt-1 z-30 bg-white dark:bg-[var(--theme-surface)] rounded-lg shadow-lg border border-neutral-200 dark:border-[var(--theme-border)] p-1 text-left space-y-0.5"
                >
                  <button
                    v-for="s in shiftTypes"
                    :key="s.code"
                    type="button"
                    @click="handleSetShiftAt(mIdx, s.code)"
                    class="w-full text-left px-2 py-1 rounded text-[10px] flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-hover)]"
                    :class="{ 'font-bold bg-neutral-50 dark:bg-neutral-800': shiftCode === s.code }"
                  >
                    <div class="flex items-center gap-1.5 truncate">
                      <BaseBadge :variant="s.badgeVariant" size="sm" class="px-1 py-0 text-[8px] font-mono">
                        {{ s.code }}
                      </BaseBadge>
                      <span class="truncate">{{ s.name }}</span>
                    </div>
                    <Check v-if="shiftCode === s.code" class="w-3 h-3 text-[var(--theme-primary)] shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Toggle Simpan ke Database -->
        <div class="pt-2 border-t border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between">
          <div>
            <span class="font-semibold text-neutral-900 dark:text-[var(--theme-text-primary)] block">
              Simpan Permanen ke Database
            </span>
            <span class="text-[11px] text-neutral-500">
              Jika aktif, pola akan selalu tersedia untuk seluruh tim HR di database cloud
            </span>
          </div>
          <BaseSwitch v-model="formSaveToDb" />
        </div>
      </div>

      <!-- Footer Modal -->
      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <BaseButton variant="outline" size="sm" @click="isFormModalOpen = false">
            Batal
          </BaseButton>
          <BaseButton variant="primary" size="sm" @click="handleSavePola">
            {{ isEditMode ? 'Simpan Perubahan' : 'Simpan Pola' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- 6. CONFIRMATION MODAL: HAPUS POLA -->
    <ConfirmationModal
      v-model="isDeleteModalOpen"
      type="delete"
      title="Hapus Pola Roster?"
      :message="`Apakah Anda yakin ingin menghapus pola '${itemToDelete?.name}'? Pola yang sudah dihapus tidak dapat dipulihkan.`"
      confirm-text="Hapus Pola"
      cancel-text="Batal"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

