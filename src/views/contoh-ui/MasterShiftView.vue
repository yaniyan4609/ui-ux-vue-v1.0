<script setup>
import { ref, computed } from 'vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import ConfirmationModal from '../../components/ui/ConfirmationModal.vue'
import BaseSearchableSelect from '../../components/ui/BaseSearchableSelect.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseTimePicker from '../../components/ui/BaseTimePicker.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import BaseSwitch from '../../components/ui/BaseSwitch.vue'
import BaseDataTable from '../../components/ui/BaseDataTable.vue'
import BaseDropdownMenu from '../../components/ui/BaseDropdownMenu.vue'
import BaseCheckbox from '../../components/ui/BaseCheckbox.vue'
import BaseCsvImporter from '../../components/ui/BaseCsvImporter.vue'
import { useToast } from '../../composables/useToast'
import { shiftTypes as initialShiftTypes } from '../../data/hrisRosterData'
import {
  Clock,
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Hourglass,
  Users,
  Coffee,
  Check,
  X,
  Eye,
  Copy,
  Sparkles,
  Layers,
} from 'lucide-vue-next'

const toast = useToast()

// ========================================================
// 1. DATA STATE & CRUD
// ========================================================
const initialShifts = initialShiftTypes
const listShifts = ref(JSON.parse(JSON.stringify(initialShiftTypes)))

// ========================================================
// 2. SEARCH, FILTER & SORTING
// ========================================================
const searchQuery = ref('')
const selectedKategori = ref('all')
const selectedStatus = ref('all')

const sortKey = ref('hours')
const sortOrder = ref('desc')

const currentPage = ref(1)
const itemsPerPage = ref(10)

// Multi-select & Batch Actions State
const selectedIds = ref([])
const isBatchDeleteModalOpen = ref(false)

// Dropdown Options: Kategori Shift (Searchable with Badge Counts)
const kategoriOptions = computed(() => {
  const counts = {}
  listShifts.value.forEach((s) => {
    const kat = s.kategori || 'Lainnya'
    counts[kat] = (counts[kat] || 0) + 1
  })

  return [
    { value: 'all', label: 'Semua Kategori', badge: listShifts.value.length },
    { value: 'Rotasi 24 Jam', label: 'Rotasi 24 Jam', badge: counts['Rotasi 24 Jam'] || 0 },
    { value: 'Kantor Reguler', label: 'Kantor Reguler', badge: counts['Kantor Reguler'] || 0 },
    { value: 'Fleksibel & Remote', label: 'Fleksibel & Remote', badge: counts['Fleksibel & Remote'] || 0 },
    { value: 'Libur & Bebas Tugas', label: 'Libur & Bebas Tugas', badge: counts['Libur & Bebas Tugas'] || 0 },
    { value: 'Cuti & Perizinan', label: 'Cuti & Perizinan', badge: counts['Cuti & Perizinan'] || 0 },
  ]
})

// Dropdown Options: Status Kerja
const statusOptions = computed(() => {
  const activeCount = listShifts.value.filter((s) => s.isActive).length
  const inactiveCount = listShifts.value.length - activeCount

  return [
    { value: 'all', label: 'Semua Status', badge: listShifts.value.length },
    { value: 'active', label: 'Shift Aktif', badge: activeCount },
    { value: 'inactive', label: 'Shift Nonaktif', badge: inactiveCount },
  ]
})

// Table Columns (Persis Pola Data Karyawan)
const tableColumns = [
  { key: 'nama', label: 'SHIFT', sortable: true, cellClass: 'whitespace-nowrap' },
  { key: 'kategori', label: 'JABATAN & KATEGORI', sortable: true, cellClass: 'whitespace-nowrap' },
  { key: 'jam', label: 'JAM OPERASIONAL', sortable: true, cellClass: 'whitespace-nowrap' },
  { key: 'status', label: 'STATUS', sortable: true, cellClass: 'whitespace-nowrap' },
  { key: 'toleransi', label: 'DISPENSASI', sortable: false, cellClass: 'whitespace-nowrap text-neutral-600 dark:text-neutral-400' },
  { key: 'pegawai', label: 'PEGAWAI', sortable: false, align: 'center', cellClass: 'whitespace-nowrap' },
]

// ========================================================
// 3. COMPUTED METRICS & FILTERED / PAGINATED DATA
// ========================================================
const activeShifts = computed(() => listShifts.value.filter((s) => s.isActive).length)
const totalAssignedEmployees = computed(() =>
  listShifts.value.reduce((acc, curr) => acc + (curr.employeeCount || 0), 0)
)
const averageWorkHours = computed(() => {
  const activeWorking = listShifts.value.filter((s) => s.isActive && s.hours > 0)
  if (!activeWorking.length) return 0
  const sum = activeWorking.reduce((acc, curr) => acc + (curr.hours || 0), 0)
  return (sum / activeWorking.length).toFixed(1)
})

// Filtered & Sorted List
const processedList = computed(() => {
  let list = [...listShifts.value]

  // Filter Kategori
  if (selectedKategori.value && selectedKategori.value !== 'all') {
    list = list.filter((s) => s.kategori === selectedKategori.value)
  }

  // Filter Status
  if (selectedStatus.value === 'active') {
    list = list.filter((s) => s.isActive)
  } else if (selectedStatus.value === 'inactive') {
    list = list.filter((s) => !s.isActive)
  }

  // Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.desc && s.desc.toLowerCase().includes(q)) ||
        (s.time && s.time.toLowerCase().includes(q)) ||
        (s.kategori && s.kategori.toLowerCase().includes(q))
    )
  }

  // Sorting
  list.sort((a, b) => {
    let aVal = a[sortKey.value]
    let bVal = b[sortKey.value]

    if (sortKey.value === 'nama') {
      aVal = a.name
      bVal = b.name
    } else if (sortKey.value === 'jam') {
      aVal = a.hours
      bVal = b.hours
    } else if (sortKey.value === 'status') {
      aVal = a.isActive ? 1 : 0
      bVal = b.isActive ? 1 : 0
    }

    if (typeof aVal === 'string') {
      const cmp = aVal.localeCompare(bVal)
      return sortOrder.value === 'asc' ? cmp : -cmp
    }
    if (typeof aVal === 'number') {
      return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
    }
    return 0
  })

  return list
})

const paginatedList = computed(() => {
  if (itemsPerPage.value === 'all') return processedList.value
  const start = (currentPage.value - 1) * Number(itemsPerPage.value)
  return processedList.value.slice(start, start + Number(itemsPerPage.value))
})

// Multi-select Logic
const isAllSelected = computed(() => {
  if (paginatedList.value.length === 0) return false
  return paginatedList.value.every((s) => selectedIds.value.includes(s.id))
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    const pageIds = paginatedList.value.map((s) => s.id)
    selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id))
  } else {
    const pageIds = paginatedList.value.map((s) => s.id)
    const set = new Set([...selectedIds.value, ...pageIds])
    selectedIds.value = Array.from(set)
  }
}

const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

// ========================================================
// 4. ACTION ITEMS UNTUK ROW DROPDOWN
// ========================================================
const getRowActionItems = (shift) => [
  {
    label: shift.isActive ? 'Nonaktifkan Shift' : 'Aktifkan Shift',
    icon: shift.isActive ? RotateCcw : CheckCircle2,
    action: () => handleToggleActive(shift),
  },
  {
    label: 'Duplikasi Shift',
    icon: Copy,
    action: () => handleDuplicateShift(shift),
  },
  {
    label: 'Ubah Data Shift',
    icon: Pencil,
    action: () => openEditModal(shift),
  },
  {
    label: 'Hapus dari Sistem',
    icon: Trash2,
    danger: true,
    action: () => openDeleteConfirm(shift),
  },
]

const handleToggleActive = (shift) => {
  shift.isActive = !shift.isActive
  if (shift.isActive) {
    toast.success(`Shift "${shift.name}" berhasil diaktifkan.`, 'Status Shift')
  } else {
    toast.warning(`Shift "${shift.name}" dinonaktifkan dari jadwal.`, 'Status Shift')
  }
}

const handleDuplicateShift = (shift) => {
  const newShift = {
    ...JSON.parse(JSON.stringify(shift)),
    id: Date.now(),
    code: `${shift.code}2`.slice(0, 5),
    name: `${shift.name} (Salinan)`,
    employeeCount: 0,
  }
  listShifts.value.unshift(newShift)
  toast.success(`Shift "${newShift.name}" berhasil diduplikasi.`, 'Duplikasi Berhasil')
}

// Batch Actions
const handleBatchDeleteConfirm = () => {
  const count = selectedIds.value.length
  listShifts.value = listShifts.value.filter((s) => !selectedIds.value.includes(s.id))
  selectedIds.value = []
  isBatchDeleteModalOpen.value = false
  toast.error(`${count} master shift terpilih telah dihapus dari sistem.`, 'Hapus Massal')
}

const handleBatchSetActive = (isActive) => {
  const count = selectedIds.value.length
  listShifts.value.forEach((s) => {
    if (selectedIds.value.includes(s.id)) {
      s.isActive = isActive
    }
  })
  selectedIds.value = []
  toast.success(
    `${count} shift terpilih berhasil di-${isActive ? 'aktifkan' : 'nonaktifkan'}.`,
    'Perubahan Massal'
  )
}

// ========================================================
// 5. MODAL FORM: TAMBAH & EDIT SHIFT
// ========================================================
const isFormModalOpen = ref(false)
const isEditMode = ref(false)

const formKategoriOptions = [
  { value: 'Rotasi 24 Jam', label: 'Rotasi 24 Jam' },
  { value: 'Kantor Reguler', label: 'Kantor Reguler' },
  { value: 'Fleksibel & Remote', label: 'Fleksibel & Remote' },
  { value: 'Libur & Bebas Tugas', label: 'Libur & Bebas Tugas' },
  { value: 'Cuti & Perizinan', label: 'Cuti & Perizinan' },
]

const availableVariants = [
  { value: 'success', label: 'Hijau Emerald', colorClass: 'bg-emerald-500' },
  { value: 'warning', label: 'Kuning Amber', colorClass: 'bg-amber-500' },
  { value: 'purple', label: 'Ungu Purple', colorClass: 'bg-purple-500' },
  { value: 'info', label: 'Biru Sky', colorClass: 'bg-sky-500' },
  { value: 'neutral', label: 'Abu Netral', colorClass: 'bg-neutral-500' },
  { value: 'danger', label: 'Merah Rose', colorClass: 'bg-rose-500' },
]

const formInitialState = {
  id: null,
  code: '',
  name: '',
  kategori: 'Rotasi 24 Jam',
  startTime: '08:00',
  endTime: '17:00',
  hours: 8,
  breakTime: 60,
  lateTolerance: 15,
  badgeVariant: 'success',
  isActive: true,
  employeeCount: 0,
  desc: '',
}

const formData = ref({ ...formInitialState })
const formErrors = ref({})

const openAddModal = () => {
  isEditMode.value = false
  formErrors.value = {}
  formData.value = {
    ...formInitialState,
    id: Date.now(),
    code: '',
    name: '',
  }
  isFormModalOpen.value = true
}

const openEditModal = (shift) => {
  isEditMode.value = true
  formErrors.value = {}
  formData.value = {
    ...shift,
    startTime: shift.startTime || (shift.time?.split(' - ')[0] || '08:00'),
    endTime: shift.endTime || (shift.time?.split(' - ')[1] || '17:00'),
  }
  isFormModalOpen.value = true
}

const calculateHours = (start, end) => {
  if (!start || !end || (start === '00:00' && end === '00:00')) return 0
  const [sH, sM] = start.split(':').map(Number)
  const [eH, eM] = end.split(':').map(Number)
  let diffMin = eH * 60 + eM - (sH * 60 + sM)
  if (diffMin <= 0) diffMin += 24 * 60
  return Math.round((diffMin / 60) * 10) / 10
}

const handleTimeChange = () => {
  formData.value.hours = calculateHours(formData.value.startTime, formData.value.endTime)
}

const validateForm = () => {
  const errors = {}
  if (!formData.value.code?.trim()) {
    errors.code = 'Kode shift wajib diisi (mis. P, S, M, REG)'
  } else if (formData.value.code.length > 5) {
    errors.code = 'Kode shift maksimal 5 karakter'
  }

  if (!formData.value.name?.trim()) {
    errors.name = 'Nama shift wajib diisi'
  }

  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSaveShift = () => {
  if (!validateForm()) {
    toast.error('Periksa kembali kolom isian yang bertanda merah.', 'Validasi Gagal')
    return
  }

  const payload = {
    ...formData.value,
    code: formData.value.code.toUpperCase().trim(),
    name: formData.value.name.trim(),
    time: formData.value.hours === 0 ? 'Bebas Tugas' : `${formData.value.startTime} - ${formData.value.endTime}`,
    hours: Number(formData.value.hours) || 0,
    breakTime: Number(formData.value.breakTime) || 0,
    lateTolerance: Number(formData.value.lateTolerance) || 0,
  }

  if (isEditMode.value) {
    const idx = listShifts.value.findIndex((s) => s.id === payload.id)
    if (idx !== -1) {
      listShifts.value[idx] = payload
    }
    toast.success(`Konfigurasi shift "${payload.name}" berhasil diperbarui!`, 'Shift Diperbarui')
  } else {
    const exists = listShifts.value.some((s) => s.code === payload.code)
    if (exists) {
      formErrors.value.code = `Kode shift "${payload.code}" sudah ada. Gunakan kode lain.`
      toast.error(`Kode shift ${payload.code} sudah ada.`, 'Kode Duplikat')
      return
    }
    listShifts.value.unshift(payload)
    toast.success(`Shift "${payload.name}" (${payload.code}) berhasil ditambahkan!`, 'Shift Ditambahkan')
  }

  isFormModalOpen.value = false
}

// ========================================================
// 6. CONFIRMATION MODAL DELETE SHIFT
// ========================================================
const isDeleteModalOpen = ref(false)
const itemToDelete = ref(null)

const openDeleteConfirm = (shift) => {
  itemToDelete.value = shift
  isDeleteModalOpen.value = true
}

const handleDeleteConfirm = () => {
  if (!itemToDelete.value) return
  const deleted = itemToDelete.value
  listShifts.value = listShifts.value.filter((s) => s.id !== deleted.id)
  isDeleteModalOpen.value = false
  itemToDelete.value = null
  toast.error(`Shift "${deleted.name}" (${deleted.code}) telah dihapus dari sistem.`, 'Shift Dihapus')
}

// Reset Default
const handleResetDefault = () => {
  listShifts.value = JSON.parse(JSON.stringify(initialShifts))
  searchQuery.value = ''
  selectedKategori.value = 'all'
  selectedStatus.value = 'all'
  selectedIds.value = []
  sortKey.value = 'hours'
  sortOrder.value = 'desc'
  toast.info('Data shift telah dikembalikan ke pengaturan awal.')
}

// ========================================================
// 7. CSV IMPORTER & EXPORTER
// ========================================================
const isCsvImporterOpen = ref(false)
const targetFieldsForImport = [
  { key: 'code', label: 'Kode Shift (P/S/M)', required: true },
  { key: 'name', label: 'Nama Shift', required: true },
  { key: 'kategori', label: 'Kategori Shift', required: false },
  { key: 'startTime', label: 'Jam Mulai (HH:mm)', required: false },
  { key: 'endTime', label: 'Jam Selesai (HH:mm)', required: false },
  { key: 'breakTime', label: 'Istirahat (Menit)', required: false },
]

const handleCsvImported = (importedRows) => {
  if (!importedRows || importedRows.length === 0) return

  let count = 0
  importedRows.forEach((row, idx) => {
    if (!row.name || !row.code) return
    listShifts.value.unshift({
      id: Date.now() + idx,
      code: row.code.toUpperCase().trim(),
      name: row.name,
      kategori: row.kategori || 'Rotasi 24 Jam',
      startTime: row.startTime || '08:00',
      endTime: row.endTime || '17:00',
      time: `${row.startTime || '08:00'} - ${row.endTime || '17:00'}`,
      hours: calculateHours(row.startTime || '08:00', row.endTime || '17:00'),
      breakTime: Number(row.breakTime) || 60,
      lateTolerance: 15,
      color: 'emerald',
      badgeVariant: 'success',
      isActive: true,
      employeeCount: 0,
      desc: 'Diimpor dari berkas CSV',
    })
    count++
  })

  toast.success(`Berhasil mengimpor ${count} shift baru dari CSV!`, 'Impor Berhasil')
}

const exportToCSV = (itemsToExport = null, filename = null) => {
  const items = itemsToExport || processedList.value
  if (items.length === 0) {
    toast.warning('Tidak ada data shift untuk diekspor.')
    return
  }

  const exportFilename = filename || `data-master-shift-${new Date().toISOString().slice(0, 10)}.csv`
  const headers = [
    'Kode Shift',
    'Nama Shift',
    'Kategori',
    'Jam Operasional',
    'Durasi (Jam)',
    'Istirahat (Mnt)',
    'Toleransi (Mnt)',
    'Pegawai Terkait',
    'Status Aktif',
  ]

  const rows = items.map((s) => [
    `"${s.code}"`,
    `"${s.name}"`,
    `"${s.kategori || ''}"`,
    `"${s.time}"`,
    s.hours,
    s.breakTime || 0,
    s.lateTolerance || 0,
    s.employeeCount || 0,
    s.isActive ? 'Aktif' : 'Nonaktif',
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', exportFilename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success(`Berhasil mengunduh ${items.length} master shift ke file CSV!`, 'Ekspor CSV')
}

const exportSelected = () => {
  const items = listShifts.value.filter((s) => selectedIds.value.includes(s.id))
  exportToCSV(items, `data-shift-terpilih-${items.length}.csv`)
}
</script>

<template>
  <!-- Main View Container: Sesuai Struktur Wajib Data View -->
  <div class="h-full flex flex-col min-h-0 overflow-hidden gap-2.5 w-full max-w-7xl mx-auto select-none relative">
    
    <!-- 1. Top Compact Header: Title & Action Buttons (Persis Layout Gambar Contoh) -->
    <div class="flex items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-[var(--theme-border)] shrink-0">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shrink-0 shadow-2xs">
          <Clock class="w-4 h-4" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-[var(--theme-text-primary)] leading-none truncate">
              Data Master Shift Kerja
            </h1>
            <BaseBadge variant="success" size="sm">
              {{ listShifts.length }} Shift
            </BaseBadge>
          </div>
          <p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
            Pengelolaan data jam kerja operasional, rotasi pergantian shift, toleransi keterlambatan, dan kode visual badge.
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <BaseButton
          variant="outline"
          size="sm"
          @click="isCsvImporterOpen = true"
          title="Impor data shift dari berkas CSV"
        >
          <Upload class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span class="hidden sm:inline">Impor CSV</span>
        </BaseButton>

        <BaseButton
          variant="outline"
          size="sm"
          @click="exportToCSV()"
          title="Ekspor seluruh data shift ke file CSV"
        >
          <Download class="w-3.5 h-3.5 text-neutral-500" />
          <span class="hidden sm:inline">Ekspor CSV</span>
        </BaseButton>

        <BaseButton
          variant="outline"
          size="sm"
          @click="handleResetDefault"
          title="Kembalikan data shift ke pengaturan default"
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
          <span>Tambah</span>
        </BaseButton>
      </div>
    </div>

    <!-- 2. Filter Bar: Search + Searchable Select Kategori + Status (Persis Baris ke-2 Gambar Contoh) -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama shift, kode, jam kerja, atau kategori..."
          class="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-[var(--theme-border-strong)] transition shadow-2xs"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Filter Kategori: BaseSearchableSelect -->
      <div class="w-full sm:w-56 shrink-0">
        <BaseSearchableSelect
          v-model="selectedKategori"
          :options="kategoriOptions"
          placeholder="Semua Kategori"
          clearable
        />
      </div>

      <!-- Filter Status Kerja: BaseSearchableSelect -->
      <div class="w-full sm:w-48 shrink-0">
        <BaseSearchableSelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="Semua Status"
          align="right"
          clearable
        />
      </div>
    </div>

    <!-- 3. Quick Stats Summary Strip (4 Kapsul Horizontal Persis Baris ke-3 Gambar Contoh) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
      <!-- Total Shift -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-[var(--theme-surface-muted)] text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
          <Clock class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-neutral-400 tracking-wider whitespace-nowrap">Total:</span>
          <span class="font-bold text-neutral-900 dark:text-white truncate">{{ listShifts.length }} Shift</span>
        </div>
      </div>

      <!-- Shift Aktif -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-emerald-400/80 tracking-wider whitespace-nowrap">Aktif:</span>
          <span class="font-bold text-emerald-600 dark:text-emerald-400 truncate">{{ activeShifts }} Shift</span>
        </div>
      </div>

      <!-- Rata-rata Durasi -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
          <Hourglass class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-sky-400/80 tracking-wider whitespace-nowrap">Rata-rata:</span>
          <span class="font-bold text-sky-600 dark:text-sky-400 truncate">{{ averageWorkHours }} Jam</span>
        </div>
      </div>

      <!-- Pegawai Terdaftar -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Users class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-amber-400/80 tracking-wider whitespace-nowrap">Pegawai:</span>
          <span class="font-bold text-amber-600 dark:text-amber-400 truncate">{{ totalAssignedEmployees }} Orang</span>
        </div>
      </div>
    </div>

    <!-- 4. BASE DATA TABLE (PERSIS TABEL GAMBAR KE-2) -->
    <BaseDataTable
      :columns="tableColumns"
      :rows="paginatedList"
      :total-items="processedList.length"
      selectable
      v-model:selected-ids="selectedIds"
      v-model:sort-key="sortKey"
      v-model:sort-order="sortOrder"
      v-model:current-page="currentPage"
      v-model:items-per-page="itemsPerPage"
      :per-page-options="[10, 20, 30, 'all']"
      selected-label="Shift Terpilih"
      empty-title="Data Shift Tidak Ditemukan"
      empty-description="Tidak ada master shift yang cocok dengan kriteria filter atau pencarian Anda."
      empty-action-text="Reset Filter Pencarian"
      @empty-action="handleResetDefault"
    >
      <!-- Kolom: SHIFT (Avatar Badge Code + Nama Shift) -->
      <template #cell-nama="{ row }">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border"
            :class="[
              row.badgeVariant === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50' :
              row.badgeVariant === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50' :
              row.badgeVariant === 'purple' ? 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900/50' :
              row.badgeVariant === 'info' ? 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-900/50' :
              'bg-neutral-100 text-neutral-700 border-neutral-200/80 dark:bg-[var(--theme-surface-muted)] dark:text-neutral-300 dark:border-[var(--theme-border-strong)]'
            ]"
          >
            {{ row.code }}
          </div>
          <div class="min-w-0">
            <span class="font-semibold text-neutral-900 dark:text-white block leading-tight truncate">
              {{ row.name }}
            </span>
            <span class="text-[10.5px] font-mono text-neutral-400 block mt-0.5">
              Kode: {{ row.code }}
            </span>
          </div>
        </div>
      </template>

      <!-- Kolom: KATEGORI & ROTASI -->
      <template #cell-kategori="{ row }">
        <span class="font-medium text-neutral-800 dark:text-neutral-200 block leading-tight">
          {{ row.kategori || 'Operasional Reguler' }}
        </span>
        <span class="text-[10.5px] text-neutral-400 block mt-0.5 truncate max-w-xs">
          {{ row.desc || 'Shift penugasan kerja' }}
        </span>
      </template>

      <!-- Kolom: JAM OPERASIONAL & DURASI -->
      <template #cell-jam="{ row }">
        <span class="font-bold text-neutral-900 dark:text-white font-mono block leading-tight">
          {{ row.time }}
        </span>
        <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">
          {{ row.hours > 0 ? `+${row.hours}.0 jam kerja` : 'Bebas jam kerja' }}
        </span>
      </template>

      <!-- Kolom: STATUS (BaseBadge dengan dot & pulse persis foto) -->
      <template #cell-status="{ row }">
        <BaseBadge
          :variant="row.isActive ? 'success' : 'neutral'"
          :dot="true"
          :pulse="row.isActive"
        >
          {{ row.isActive ? 'Aktif' : 'Nonaktif' }}
        </BaseBadge>
      </template>

      <!-- Kolom: DISPENSASI & ISTIRAHAT -->
      <template #cell-toleransi="{ row }">
        <div class="flex items-center gap-1.5 text-xs">
          <Clock class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span>{{ row.lateTolerance || 0 }} mnt disp. (istr. {{ row.breakTime || 0 }} mnt)</span>
        </div>
      </template>

      <!-- Kolom: PEGAWAI TERKAIT -->
      <template #cell-pegawai="{ row }">
        <BaseBadge :variant="row.employeeCount > 0 ? 'success' : 'neutral'" size="sm">
          {{ row.employeeCount || 0 }} Pegawai
        </BaseBadge>
      </template>

      <!-- Kolom: AKSI (Pencil Edit + BaseDropdownMenu ...) -->
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-1">
          <button
            type="button"
            @click="openEditModal(row)"
            class="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-[var(--theme-surface-muted)] transition cursor-pointer"
            title="Edit Shift"
          >
            <Pencil class="w-3.5 h-3.5" />
          </button>
          <BaseDropdownMenu :items="getRowActionItems(row)" align="right" />
        </div>
      </template>

      <!-- Custom Bulk Action Slot -->
      <template #bulk-actions="{ selectedCount }">
        <BaseButton variant="outline" size="sm" @click="exportSelected">
          <Download class="w-3.5 h-3.5" />
          <span>Ekspor CSV ({{ selectedCount }})</span>
        </BaseButton>
        <BaseButton variant="outline" size="sm" @click="handleBatchSetActive(true)">
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
          <span>Aktifkan ({{ selectedCount }})</span>
        </BaseButton>
        <BaseButton variant="outline" size="sm" @click="handleBatchSetActive(false)">
          <RotateCcw class="w-3.5 h-3.5 text-neutral-500" />
          <span>Nonaktifkan ({{ selectedCount }})</span>
        </BaseButton>
        <BaseButton variant="danger" size="sm" @click="isBatchDeleteModalOpen = true">
          <Trash2 class="w-3.5 h-3.5" />
          <span>Hapus ({{ selectedCount }})</span>
        </BaseButton>
      </template>

      <!-- Kartu Mobile Slot (Persis Data Karyawan) -->
      <template #mobile-card="{ row, isSelected, toggleSelect: onToggleSelect }">
        <div
          class="p-3.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-xs space-y-3"
          :class="isSelected ? 'ring-2 ring-[var(--theme-primary)]' : ''"
        >
          <!-- Top Row: Checkbox, Badge Code, Nama, Status -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <BaseCheckbox
                :model-value="isSelected"
                size="sm"
                class="mt-0.5"
                @change="onToggleSelect"
              />
              <div
                class="w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border"
                :class="[
                  row.badgeVariant === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400' :
                  row.badgeVariant === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-400' :
                  row.badgeVariant === 'purple' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400' :
                  'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                ]"
              >
                {{ row.code }}
              </div>
              <div>
                <h3 class="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                  {{ row.name }}
                </h3>
                <span class="text-[10.5px] font-mono text-neutral-400 block mt-0.5">
                  Kode: {{ row.code }} • {{ row.kategori }}
                </span>
              </div>
            </div>

            <BaseBadge
              :variant="row.isActive ? 'success' : 'neutral'"
              :dot="true"
              :pulse="row.isActive"
              size="sm"
            >
              {{ row.isActive ? 'Aktif' : 'Nonaktif' }}
            </BaseBadge>
          </div>

          <!-- Mid Row: Jam Kerja & Toleransi -->
          <div class="p-2.5 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface-raised)] border border-neutral-100 dark:border-[var(--theme-border)] flex items-center justify-between text-xs">
            <div>
              <span class="text-[10px] text-neutral-400 block font-semibold uppercase">Jam Operasional</span>
              <span class="font-bold font-mono text-neutral-900 dark:text-white">
                {{ row.time }}
              </span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-neutral-400 block font-semibold uppercase">Durasi Kerja</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                {{ row.hours > 0 ? `${row.hours} Jam` : 'Bebas' }}
              </span>
            </div>
          </div>

          <!-- Bottom Action Buttons Mobile -->
          <div class="flex items-center justify-between pt-1">
            <BaseBadge :variant="row.employeeCount > 0 ? 'success' : 'neutral'" size="sm">
              {{ row.employeeCount || 0 }} Pegawai
            </BaseBadge>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="openEditModal(row)"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-[var(--theme-surface-muted)] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                @click="openDeleteConfirm(row)"
                class="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </template>
    </BaseDataTable>

    <!-- 5. MODAL FORM: TAMBAH / UBAH SHIFT -->
    <BaseModal
      v-model="isFormModalOpen"
      :title="isEditMode ? 'Ubah Data Shift' : 'Tambah Shift Baru'"
      :subtitle="isEditMode ? 'Perbarui konfigurasi jam kerja, istirahat, dan warna penanda shift' : 'Daftarkan master shift baru untuk digunakan pada jadwal roster pegawai'"
      size="md"
    >
      <div class="space-y-4 text-xs">
        <!-- Kode Shift & Nama Shift -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-1">
            <BaseInput
              v-model="formData.code"
              label="Kode Shift"
              placeholder="Mis. P, S, REG"
              required
              :error="formErrors.code"
            />
          </div>
          <div class="sm:col-span-2">
            <BaseInput
              v-model="formData.name"
              label="Nama Shift"
              placeholder="Mis. Shift Pagi Operasional"
              required
              :error="formErrors.name"
            />
          </div>
        </div>

        <!-- Kategori Shift -->
        <div>
          <label class="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Kategori / Tipe Shift
          </label>
          <BaseSearchableSelect
            v-model="formData.kategori"
            :options="formKategoriOptions"
            placeholder="Pilih kategori..."
            size="md"
          />
        </div>

        <!-- Deskripsi Shift -->
        <div>
          <BaseInput
            v-model="formData.desc"
            label="Keterangan / Catatan Penugasan"
            placeholder="Area penugasan atau peruntukan shift kerja..."
          />
        </div>

        <!-- Jam Kerja Operasional -->
        <div class="p-3 bg-neutral-50 dark:bg-[var(--theme-surface-muted)]/60 rounded-xl border border-neutral-200/80 dark:border-[var(--theme-border)] space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-neutral-900 dark:text-[var(--theme-text-primary)]">
              Jam Masuk - Jam Pulang
            </span>
            <BaseBadge variant="neutral" size="sm">
              {{ formData.hours }} Jam Efektif
            </BaseBadge>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <BaseTimePicker
              v-model="formData.startTime"
              label="Jam Masuk"
              @change="handleTimeChange"
              :presets="['07:00', '08:00', '08:30', '09:00', '15:00', '23:00']"
            />
            <BaseTimePicker
              v-model="formData.endTime"
              label="Jam Pulang"
              @change="handleTimeChange"
              :presets="['15:00', '17:00', '17:30', '18:00', '23:00', '07:00']"
            />
          </div>
        </div>

        <!-- Istirahat & Toleransi Terlambat -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <BaseInput
              v-model.number="formData.breakTime"
              type="number"
              label="Durasi Istirahat"
              placeholder="60"
              hint="Dalam satuan menit"
            >
              <template #suffix>
                <span class="text-neutral-400 text-[11px]">mnt</span>
              </template>
            </BaseInput>
          </div>
          <div>
            <BaseInput
              v-model.number="formData.lateTolerance"
              type="number"
              label="Toleransi Terlambat"
              placeholder="15"
              hint="Batas dispensasi hadir"
            >
              <template #suffix>
                <span class="text-neutral-400 text-[11px]">mnt</span>
              </template>
            </BaseInput>
          </div>
        </div>

        <!-- Warna Badge & Indikator Roster -->
        <div>
          <label class="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Warna Badge & Indikator Roster
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="v in availableVariants"
              :key="v.value"
              type="button"
              @click="formData.badgeVariant = v.value"
              class="flex items-center justify-between p-2 rounded-lg border text-left transition-all cursor-pointer"
              :class="[
                formData.badgeVariant === v.value
                  ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5 ring-1 ring-[var(--theme-primary)]'
                  : 'border-neutral-200 dark:border-[var(--theme-border)] hover:bg-neutral-50 dark:hover:bg-[var(--theme-surface-hover)]'
              ]"
            >
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full shrink-0" :class="v.colorClass" />
                <span class="text-[11px] font-medium text-neutral-800 dark:text-neutral-200">
                  {{ v.label }}
                </span>
              </div>
              <Check v-if="formData.badgeVariant === v.value" class="w-3.5 h-3.5 text-[var(--theme-primary)]" />
            </button>
          </div>

          <!-- Preview Badge -->
          <div class="mt-2.5 p-2 bg-neutral-100/70 dark:bg-neutral-800/50 rounded-lg flex items-center justify-between">
            <span class="text-[11px] text-neutral-500">Pratinjau tampilan di kalender:</span>
            <BaseBadge :variant="formData.badgeVariant" size="sm" class="font-bold">
              {{ formData.code || 'CODE' }} - {{ formData.name || 'Nama Shift' }}
            </BaseBadge>
          </div>
        </div>

        <!-- Switch Status Shift Aktif -->
        <div class="pt-2 border-t border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between">
          <div>
            <span class="font-semibold text-neutral-900 dark:text-[var(--theme-text-primary)] block">
              Status Shift Aktif
            </span>
            <span class="text-[11px] text-neutral-500">
              Shift aktif dapat dipilih langsung dalam form roster dan rotasi jadwal
            </span>
          </div>
          <BaseSwitch v-model="formData.isActive" />
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <BaseButton variant="outline" size="sm" @click="isFormModalOpen = false">
            Batal
          </BaseButton>
          <BaseButton variant="primary" size="sm" @click="handleSaveShift">
            {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Shift' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- 6. MODAL KONFIRMASI HAPUS SINGLE SHIFT -->
    <ConfirmationModal
      v-model="isDeleteModalOpen"
      type="delete"
      title="Hapus Master Shift?"
      :message="`Apakah Anda yakin ingin menghapus shift '${itemToDelete?.name}' (${itemToDelete?.code})? Tindakan ini tidak dapat dibatalkan.`"
      confirm-text="Hapus Shift"
      cancel-text="Batal"
      @confirm="handleDeleteConfirm"
    />

    <!-- 7. MODAL KONFIRMASI HAPUS MASSAL SHIFT -->
    <ConfirmationModal
      v-model="isBatchDeleteModalOpen"
      type="delete"
      title="Hapus Shift Terpilih?"
      :message="`Apakah Anda yakin ingin menghapus ${selectedIds.length} master shift terpilih sekaligus? Seluruh konfigurasi yang dihapus tidak dapat dipulihkan.`"
      confirm-text="Hapus Terpilih"
      cancel-text="Batal"
      @confirm="handleBatchDeleteConfirm"
    />

    <!-- 8. MODAL IMPOR CSV -->
    <BaseCsvImporter
      v-model="isCsvImporterOpen"
      title="Impor Master Shift dari CSV"
      :target-fields="targetFieldsForImport"
      @imported="handleCsvImported"
    />
  </div>
</template>
