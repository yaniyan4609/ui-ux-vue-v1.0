<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import ConfirmationModal from '../../components/ui/ConfirmationModal.vue'
import BaseSearchableSelect from '../../components/ui/BaseSearchableSelect.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import BaseSwitch from '../../components/ui/BaseSwitch.vue'
import BaseDataTable from '../../components/ui/BaseDataTable.vue'
import BaseDropdownMenu from '../../components/ui/BaseDropdownMenu.vue'
import BaseCheckbox from '../../components/ui/BaseCheckbox.vue'
import BaseCsvImporter from '../../components/ui/BaseCsvImporter.vue'
import { useToast } from '../../composables/useToast'
import { rosterTemplates as initialTemplates, shiftTypes } from '../../data/hrisRosterData'
import {
  CalendarRange,
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Database,
  Users,
  Check,
  X,
  Copy,
  Sparkles,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-vue-next'

const router = useRouter()
const toast = useToast()

// ========================================================
// 1. DATA STATE & CRUD
// ========================================================
const initialPola = initialTemplates
const listPola = ref(JSON.parse(JSON.stringify(initialTemplates)))

// Search & Filter State
const searchQuery = ref('')
const selectedDivisi = ref('all')
const selectedStorage = ref('all')

const sortKey = ref('name')
const sortOrder = ref('asc')

const currentPage = ref(1)
const itemsPerPage = ref(10)

// Multi-select & Batch Actions State
const selectedIds = ref([])
const isBatchDeleteModalOpen = ref(false)

// ========================================================
// 2. MODE EDIT CEPAT & FLOATING CELL POPOVER
// ========================================================
const isQuickEditMode = ref(false)
const activeCellEditor = ref(null) // { rowId, rowName, dayIndex, dayName, currentCode, top, left }
const cellSearchQuery = ref('')
const searchInputRef = ref(null)

const toggleQuickEditMode = () => {
  isQuickEditMode.value = !isQuickEditMode.value
  activeCellEditor.value = null
  if (isQuickEditMode.value) {
    toast.info('Mode Edit Cepat aktif: Klik sel shift mana saja untuk memilih shift baru.', 'Mode Edit Aktif')
  } else {
    toast.success('Mode Edit Cepat selesai. Perubahan pola roster telah tersimpan.', 'Selesai Edit')
  }
}

// Buka Searchable Dropdown Popover saat sel diklik pada Mode Edit
const openCellEditor = (row, dayIndex, event) => {
  if (!isQuickEditMode.value) {
    return
  }

  const rect = event.currentTarget.getBoundingClientRect()
  const currentCode = row.pattern[dayIndex] || 'OFF'

  // Hitung posisi popover (flip ke atas jika mepet batas bawah layar)
  const popoverHeight = 270
  const spaceBelow = window.innerHeight - rect.bottom
  const openUpwards = spaceBelow < popoverHeight && rect.top > popoverHeight

  const top = openUpwards ? rect.top - popoverHeight - 6 : rect.bottom + 6

  // Pastikan posisi horizontal tidak keluar layar
  let left = rect.left + rect.width / 2 - 110 // center popover 220px
  if (left < 10) left = 10
  if (left + 230 > window.innerWidth) left = window.innerWidth - 240

  cellSearchQuery.value = ''
  activeCellEditor.value = {
    rowId: row.id,
    rowName: row.name,
    dayIndex,
    dayName: daysList[dayIndex].label,
    currentCode,
    top,
    left,
  }

  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

// Pilih shift baru untuk sel yang sedang diedit
const selectShiftForCell = (code) => {
  if (!activeCellEditor.value) return
  const { rowId, dayIndex, dayName } = activeCellEditor.value
  const targetPola = listPola.value.find((p) => p.id === rowId)
  if (targetPola && targetPola.pattern) {
    targetPola.pattern[dayIndex] = code
    const meta = getShiftMeta(code)
    toast.success(`Shift ${dayName} pada "${targetPola.name}" diubah ke ${meta.name}.`, 'Shift Diperbarui')
  }
  activeCellEditor.value = null
}

// Filter daftar shift di dalam popover
const filteredShiftTypes = computed(() => {
  if (!cellSearchQuery.value.trim()) return shiftTypes
  const q = cellSearchQuery.value.toLowerCase().trim()
  return shiftTypes.filter(
    (s) =>
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.time && s.time.toLowerCase().includes(q))
  )
})

// Listener global untuk Escape & klik luar popover
const handleGlobalKeydown = (e) => {
  if (e.key === 'Escape' && activeCellEditor.value) {
    activeCellEditor.value = null
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

// ========================================================
// 3. DAY MAPPING & SHIFT META HELPERS
// ========================================================
const daysList = [
  { key: 'senin', label: 'Senin', index: 0 },
  { key: 'selasa', label: 'Selasa', index: 1 },
  { key: 'rabu', label: 'Rabu', index: 2 },
  { key: 'kamis', label: 'Kamis', index: 3 },
  { key: 'jumat', label: 'Jumat', index: 4 },
  { key: 'sabtu', label: 'Sabtu', index: 5 },
  { key: 'minggu', label: 'Minggu', index: 6 },
]

const getShiftMeta = (code) => {
  return (
    shiftTypes.find((s) => s.code === code) || {
      code: code || 'OFF',
      name: code === 'OFF' ? 'Libur (Off)' : (code || '-'),
      badgeVariant: 'neutral',
      hours: 0,
    }
  )
}

// Nama pendek untuk sel compact agar tidak pernah overflow
const getShiftShortName = (code) => {
  switch (code) {
    case 'P':
      return 'Pagi'
    case 'S':
      return 'Siang'
    case 'M':
      return 'Malam'
    case 'OFF':
      return 'Libur'
    case 'REG':
      return 'Reguler'
    case 'FLX':
      return 'Fleksibel'
    case 'C':
      return 'Cuti'
    default:
      return code || 'Off'
  }
}

// Styling pill badge shift per sel
const getShiftPillClasses = (code) => {
  switch (code) {
    case 'P':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
    case 'S':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-950/60'
    case 'M':
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40 hover:bg-purple-100 dark:hover:bg-purple-950/60'
    case 'C':
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-950/60'
    case 'REG':
      return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/40 hover:bg-sky-100 dark:hover:bg-sky-950/60'
    case 'OFF':
    default:
      return 'bg-neutral-100 dark:bg-[var(--theme-surface-muted)] text-neutral-500 dark:text-neutral-400 border-neutral-200/60 dark:border-[var(--theme-border)] hover:bg-neutral-200/60 dark:hover:bg-[var(--theme-surface-raised)]'
  }
}

const getPatternAvatar = (pola) => {
  if (pola.id === 'tpl-5-2') return '5-2'
  if (pola.id === 'tpl-2-2-2-1') return '2-1'
  if (pola.id === 'tpl-3-3-1') return '3-1'
  if (pola.id === 'tpl-4-2') return '4-2'
  if (pola.id === 'tpl-reguler') return 'REG'
  if (pola.id === 'tpl-security-weekend') return 'SEC'
  if (pola.id === 'tpl-cs-care') return 'CS'
  return (pola.name || 'PL').slice(0, 3).toUpperCase()
}

const calculatePatternTotalHours = (pattern) => {
  if (!pattern || !Array.isArray(pattern)) return 0
  return pattern.reduce((sum, code) => {
    const shift = shiftTypes.find((s) => s.code === code)
    return sum + (shift?.hours || 0)
  }, 0)
}

// Dropdown Options
const divisiOptions = computed(() => {
  const counts = {}
  listPola.value.forEach((p) => {
    const div = p.suitableFor?.split(',')[0]?.trim() || 'Lainnya'
    counts[div] = (counts[div] || 0) + 1
  })

  return [
    { value: 'all', label: 'Semua Target Divisi', badge: listPola.value.length },
    { value: 'Teknologi & IT', label: 'Teknologi & IT', badge: counts['Teknologi & IT'] || counts['IT Operations 24/7'] || 0 },
    { value: 'Keamanan', label: 'Keamanan & Fasilitas', badge: counts['Divisi Keamanan & Pos Komando Fasilitas'] || counts['Security Satpam'] || 0 },
    { value: 'Operasional Gudang', label: 'Operasional Gudang', badge: counts['Operasional Gudang & Distribusi Lapangan'] || 0 },
    { value: 'Layanan & CS', label: 'Layanan & Customer Care', badge: counts['Divisi Layanan & Customer Care'] || 0 },
    { value: 'Administrasi', label: 'Administrasi, Keuangan, HR', badge: counts['Administrasi'] || 0 },
  ]
})

const storageOptions = computed(() => {
  const dbCount = listPola.value.filter((p) => p.isDatabase).length
  const tempCount = listPola.value.length - dbCount

  return [
    { value: 'all', label: 'Semua Sumber', badge: listPola.value.length },
    { value: 'db', label: 'Tersimpan di DB', badge: dbCount },
    { value: 'temp', label: 'Temporary Draft', badge: tempCount },
  ]
})

// ========================================================
// 4. TABLE COLUMNS: PROPORSIONAL DAN COMPACT TANPA SCROLL
// ========================================================
const tableColumns = [
  {
    key: 'nama',
    label: 'NAMA POLA',
    sortable: true,
    width: 'w-48 sm:w-56',
    headerClass: '!px-2.5',
    cellClass: 'whitespace-nowrap !px-2.5 max-w-[210px]',
  },
  {
    key: 'senin',
    label: 'Senin',
    align: 'center',
    width: 'w-[84px]',
    headerClass: '!px-1 text-center',
    cellClass: 'whitespace-nowrap !px-1 text-center',
  },
  {
    key: 'selasa',
    label: 'Selasa',
    align: 'center',
    width: 'w-[84px]',
    headerClass: '!px-1 text-center',
    cellClass: 'whitespace-nowrap !px-1 text-center',
  },
  {
    key: 'rabu',
    label: 'Rabu',
    align: 'center',
    width: 'w-[84px]',
    headerClass: '!px-1 text-center',
    cellClass: 'whitespace-nowrap !px-1 text-center',
  },
  {
    key: 'kamis',
    label: 'Kamis',
    align: 'center',
    width: 'w-[84px]',
    headerClass: '!px-1 text-center',
    cellClass: 'whitespace-nowrap !px-1 text-center',
  },
  {
    key: 'jumat',
    label: 'Jumat',
    align: 'center',
    width: 'w-[84px]',
    headerClass: '!px-1 text-center',
    cellClass: 'whitespace-nowrap !px-1 text-center',
  },
  {
    key: 'sabtu',
    label: 'Sabtu',
    align: 'center',
    width: 'w-[84px]',
    headerClass: '!px-1 text-center',
    cellClass: 'whitespace-nowrap !px-1 text-center',
  },
  {
    key: 'minggu',
    label: 'Minggu',
    align: 'center',
    width: 'w-[84px]',
    headerClass: '!px-1 text-center',
    cellClass: 'whitespace-nowrap !px-1 text-center',
  },
]

// ========================================================
// 5. COMPUTED METRICS & FILTERED DATA
// ========================================================
const databaseCount = computed(() => listPola.value.filter((p) => p.isDatabase).length)
const totalAssignedEmployees = computed(() =>
  listPola.value.reduce((acc, curr) => acc + (curr.activeEmployees || 0), 0)
)
const rotasi24JamCount = computed(() =>
  listPola.value.filter((p) => (p.pattern || []).includes('M') || (p.pattern || []).includes('S')).length
)

const processedList = computed(() => {
  let list = [...listPola.value]

  // Filter Divisi
  if (selectedDivisi.value && selectedDivisi.value !== 'all') {
    list = list.filter((p) =>
      p.suitableFor && p.suitableFor.toLowerCase().includes(selectedDivisi.value.toLowerCase())
    )
  }

  // Filter Penyimpanan
  if (selectedStorage.value === 'db') {
    list = list.filter((p) => p.isDatabase)
  } else if (selectedStorage.value === 'temp') {
    list = list.filter((p) => !p.isDatabase)
  }

  // Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.desc && p.desc.toLowerCase().includes(q)) ||
        (p.suitableFor && p.suitableFor.toLowerCase().includes(q))
    )
  }

  // Sorting
  list.sort((a, b) => {
    let aVal = a[sortKey.value]
    let bVal = b[sortKey.value]

    if (sortKey.value === 'nama') {
      aVal = a.name
      bVal = b.name
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

// ========================================================
// 6. ACTION ITEMS UNTUK ROW DROPDOWN
// ========================================================
const getRowActionItems = (pola) => [
  {
    label: 'Terapkan ke Roster',
    icon: Sparkles,
    action: () => handleApplyToRoster(pola),
  },
  {
    label: 'Duplikasi Pola',
    icon: Copy,
    action: () => handleDuplicatePola(pola),
  },
  {
    label: 'Ubah Data Pola',
    icon: Pencil,
    action: () => openEditModal(pola),
  },
  {
    label: 'Hapus dari Sistem',
    icon: Trash2,
    danger: true,
    action: () => openDeleteConfirm(pola),
  },
]

const handleApplyToRoster = (pola) => {
  toast.info(`Membuka generator jadwal roster dengan pola "${pola.name}"...`)
  router.push('/contoh-ui/roster')
}

const handleDuplicatePola = (pola) => {
  const newPola = {
    ...JSON.parse(JSON.stringify(pola)),
    id: `tpl-${Date.now()}`,
    name: `${pola.name} (Salinan)`,
    isDatabase: false,
  }
  listPola.value.unshift(newPola)
  toast.success(`Pola "${newPola.name}" berhasil diduplikasi.`, 'Pola Diduplikasi')
}

// Batch Actions
const handleBatchDeleteConfirm = () => {
  const count = selectedIds.value.length
  listPola.value = listPola.value.filter((p) => !selectedIds.value.includes(p.id))
  selectedIds.value = []
  isBatchDeleteModalOpen.value = false
  toast.error(`${count} pola terpilih telah dihapus dari sistem.`, 'Hapus Massal')
}

const handleBatchSetDatabase = (isDb) => {
  const count = selectedIds.value.length
  listPola.value.forEach((p) => {
    if (selectedIds.value.includes(p.id)) {
      p.isDatabase = isDb
    }
  })
  selectedIds.value = []
  toast.success(
    `${count} pola terpilih berhasil ${isDb ? 'disimpan permanen ke Database' : 'dialihkan ke Temporary Draft'}.`,
    'Perubahan Massal'
  )
}

// ========================================================
// 7. MODAL FORM: TAMBAH & EDIT POLA (UKURAN BALANCED PROPORSI)
// ========================================================
const isFormModalOpen = ref(false)
const isEditMode = ref(false)
const currentEditingId = ref(null)

const formName = ref('')
const formDivisi = ref('Teknologi & IT')
const formDesc = ref('')
const formSaveToDb = ref(true)
const formActiveDayDropdown = ref(null)
const formPattern = ref(['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF'])
const formErrors = ref({})

const divisiFormOptions = [
  { value: 'Teknologi & IT', label: 'Teknologi & IT' },
  { value: 'Keamanan & Fasilitas', label: 'Keamanan & Fasilitas' },
  { value: 'Operasional Gudang', label: 'Operasional Gudang' },
  { value: 'Layanan & CS', label: 'Layanan & CS' },
  { value: 'Administrasi, Keuangan, HR', label: 'Administrasi, Keuangan, HR' },
  { value: 'Manajemen & Legal', label: 'Manajemen & Legal' },
]

const openAddModal = () => {
  isEditMode.value = false
  currentEditingId.value = null
  formErrors.value = {}
  formName.value = ''
  formDivisi.value = 'Teknologi & IT'
  formDesc.value = ''
  formSaveToDb.value = true
  formPattern.value = ['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF']
  isFormModalOpen.value = true
}

const openEditModal = (pola) => {
  isEditMode.value = true
  currentEditingId.value = pola.id
  formErrors.value = {}
  formName.value = pola.name
  formDivisi.value = pola.suitableFor?.split(',')[0]?.trim() || 'Teknologi & IT'
  formDesc.value = pola.desc || ''
  formSaveToDb.value = !!pola.isDatabase

  const pat = [...(pola.pattern || [])]
  while (pat.length < 7) pat.push('OFF')
  formPattern.value = pat.slice(0, 7)

  isFormModalOpen.value = true
}

// Preset Cepat 7 Hari
const applyQuickPreset = (preset) => {
  if (preset === '5-2') {
    formPattern.value = ['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF']
    toast.info('Pola diatur ke 5 Hari Pagi, 2 Hari Off.')
  } else if (preset === '2-2-2-1') {
    formPattern.value = ['P', 'P', 'S', 'S', 'M', 'M', 'OFF']
    toast.info('Pola diatur ke 2 Pagi, 2 Siang, 2 Malam, 1 Off.')
  } else if (preset === '3-3-1') {
    formPattern.value = ['S', 'S', 'S', 'M', 'M', 'M', 'OFF']
    toast.info('Pola diatur ke 3 Siang, 3 Malam, 1 Off.')
  } else if (preset === 'all-pagi') {
    formPattern.value = ['P', 'P', 'P', 'P', 'P', 'P', 'P']
    toast.info('Seluruh hari diatur ke Shift Pagi.')
  }
}

const handleSetDayShift = (dayIdx, code) => {
  formPattern.value[dayIdx] = code
  formActiveDayDropdown.value = null
}

const validateForm = () => {
  const errors = {}
  if (!formName.value.trim()) {
    errors.name = 'Nama pola wajib diisi'
  }
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSavePola = () => {
  if (!validateForm()) {
    toast.error('Periksa nama pola yang belum terisi.', 'Validasi Gagal')
    return
  }

  const payload = {
    id: isEditMode.value ? currentEditingId.value : `tpl-${Date.now()}`,
    name: formName.value.trim(),
    suitableFor: formDivisi.value,
    desc: formDesc.value.trim() || 'Pola rotasi kerja mingguan terstandarisasi.',
    pattern: [...formPattern.value],
    isDatabase: formSaveToDb.value,
    activeEmployees: isEditMode.value
      ? listPola.value.find((p) => p.id === currentEditingId.value)?.activeEmployees || 0
      : 0,
  }

  if (isEditMode.value) {
    const idx = listPola.value.findIndex((p) => p.id === payload.id)
    if (idx !== -1) {
      listPola.value[idx] = payload
    }
    toast.success(`Pola "${payload.name}" berhasil diperbarui!`, 'Pola Diperbarui')
  } else {
    listPola.value.unshift(payload)
    toast.success(`Pola "${payload.name}" berhasil ditambahkan!`, 'Pola Ditambahkan')
  }

  isFormModalOpen.value = false
}

// ========================================================
// 8. CONFIRMATION MODAL DELETE
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
  listPola.value = listPola.value.filter((p) => p.id !== deleted.id)
  isDeleteModalOpen.value = false
  itemToDelete.value = null
  toast.error(`Pola "${deleted.name}" telah dihapus dari sistem.`, 'Pola Dihapus')
}

// Reset Default
const handleResetDefault = () => {
  listPola.value = JSON.parse(JSON.stringify(initialPola))
  searchQuery.value = ''
  selectedDivisi.value = 'all'
  selectedStorage.value = 'all'
  selectedIds.value = []
  sortKey.value = 'name'
  sortOrder.value = 'asc'
  toast.info('Data pola telah dikembalikan ke pengaturan awal.')
}

// ========================================================
// 9. CSV IMPORTER & EXPORTER
// ========================================================
const isCsvImporterOpen = ref(false)
const targetFieldsForImport = [
  { key: 'name', label: 'Nama Pola Roster', required: true },
  { key: 'suitableFor', label: 'Target Divisi', required: false },
  { key: 'senin', label: 'Shift Senin (P/S/M/OFF)', required: false },
  { key: 'selasa', label: 'Shift Selasa (P/S/M/OFF)', required: false },
  { key: 'rabu', label: 'Shift Rabu (P/S/M/OFF)', required: false },
  { key: 'kamis', label: 'Shift Kamis (P/S/M/OFF)', required: false },
  { key: 'jumat', label: 'Shift Jumat (P/S/M/OFF)', required: false },
  { key: 'sabtu', label: 'Shift Sabtu (P/S/M/OFF)', required: false },
  { key: 'minggu', label: 'Shift Minggu (P/S/M/OFF)', required: false },
]

const handleCsvImported = (importedRows) => {
  if (!importedRows || importedRows.length === 0) return

  let count = 0
  importedRows.forEach((row, idx) => {
    if (!row.name) return
    listPola.value.unshift({
      id: `tpl-${Date.now() + idx}`,
      name: row.name,
      suitableFor: row.suitableFor || 'Semua Divisi',
      desc: 'Diimpor dari berkas CSV',
      pattern: [
        row.senin || 'P',
        row.selasa || 'P',
        row.rabu || 'P',
        row.kamis || 'P',
        row.jumat || 'P',
        row.sabtu || 'OFF',
        row.minggu || 'OFF',
      ],
      isDatabase: true,
      activeEmployees: 0,
    })
    count++
  })

  toast.success(`Berhasil mengimpor ${count} pola baru dari CSV!`, 'Impor Berhasil')
}

const exportToCSV = (itemsToExport = null, filename = null) => {
  const items = itemsToExport || processedList.value
  if (items.length === 0) {
    toast.warning('Tidak ada data pola untuk diekspor.')
    return
  }

  const exportFilename = filename || `data-master-pola-${new Date().toISOString().slice(0, 10)}.csv`
  const headers = ['Nama Pola', 'Target Divisi', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu', 'Status Penyimpanan']

  const rows = items.map((p) => {
    const pat = p.pattern || []
    return [
      `"${p.name}"`,
      `"${p.suitableFor || ''}"`,
      pat[0] || 'OFF',
      pat[1] || 'OFF',
      pat[2] || 'OFF',
      pat[3] || 'OFF',
      pat[4] || 'OFF',
      pat[5] || 'OFF',
      pat[6] || 'OFF',
      p.isDatabase ? 'Database' : 'Temporary',
    ]
  })

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

  toast.success(`Berhasil mengunduh ${items.length} master pola ke file CSV!`, 'Ekspor CSV')
}

const exportSelected = () => {
  const items = listPola.value.filter((p) => selectedIds.value.includes(p.id))
  exportToCSV(items, `data-pola-terpilih-${items.length}.csv`)
}
</script>

<template>
  <!-- Main View Container: Layout Kanonikal Data View -->
  <div class="h-full flex flex-col min-h-0 overflow-hidden gap-2.5 w-full max-w-7xl mx-auto select-none relative">
    
    <!-- 1. Top Compact Header: Title & Action Buttons -->
    <div class="flex items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-[var(--theme-border)] shrink-0">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shrink-0 shadow-2xs">
          <CalendarRange class="w-4 h-4" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-[var(--theme-text-primary)] leading-none truncate">
              Data Pola
            </h1>
            <BaseBadge variant="success" size="sm">
              {{ listPola.length }} Pola
            </BaseBadge>
          </div>
          <p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
            Pustaka rotasi jadwal kerja mingguan (Senin s/d Minggu) untuk mempercepat dan menstandarisasi jadwal shift tim.
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Tombol Aksi: MODE EDIT (Sesuai Permintaan) -->
        <BaseButton
          :variant="isQuickEditMode ? 'primary' : 'outline'"
          size="sm"
          @click="toggleQuickEditMode"
          :title="isQuickEditMode ? 'Klik untuk selesai mengedit shift' : 'Aktifkan mode edit untuk mengubah shift langsung pada tabel'"
          class="transition-all"
        >
          <component
            :is="isQuickEditMode ? Check : Pencil"
            class="w-3.5 h-3.5"
            :class="isQuickEditMode ? 'text-white' : 'text-neutral-500'"
          />
          <span>{{ isQuickEditMode ? 'Selesai Edit' : 'Mode Edit' }}</span>
          <span
            v-if="isQuickEditMode"
            class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"
          />
        </BaseButton>

        <BaseButton
          variant="outline"
          size="sm"
          @click="isCsvImporterOpen = true"
          title="Impor data pola dari berkas CSV"
        >
          <Upload class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span class="hidden sm:inline">Impor CSV</span>
        </BaseButton>

        <BaseButton
          variant="outline"
          size="sm"
          @click="exportToCSV()"
          title="Ekspor seluruh data pola ke file CSV"
        >
          <Download class="w-3.5 h-3.5 text-neutral-500" />
          <span class="hidden sm:inline">Ekspor CSV</span>
        </BaseButton>

        <BaseButton
          variant="outline"
          size="sm"
          @click="handleResetDefault"
          title="Kembalikan data pola ke pengaturan default"
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

    <!-- Banner Notifikasi Saat Mode Edit Aktif -->
    <div
      v-if="isQuickEditMode"
      class="px-3 py-1.5 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 text-xs flex items-center justify-between text-[var(--theme-primary)] shrink-0 animate-in fade-in duration-150"
    >
      <div class="flex items-center gap-2">
        <SlidersHorizontal class="w-4 h-4 animate-spin text-[var(--theme-primary)]" style="animation-duration: 4s;" />
        <span class="font-medium">
          <strong>Mode Edit Aktif:</strong> Klik tombol shift mana saja pada hari Senin s/d Minggu untuk membuka pilihan shift langsung.
        </span>
      </div>
      <button
        type="button"
        @click="toggleQuickEditMode"
        class="text-xs font-bold underline hover:opacity-80 cursor-pointer ml-2"
      >
        Tutup Mode Edit
      </button>
    </div>

    <!-- 2. Filter Bar: Search + Target Divisi + Status Penyimpanan -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama pola, target divisi, atau keterangan..."
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

      <!-- Filter Target Divisi: BaseSearchableSelect -->
      <div class="w-full sm:w-56 shrink-0">
        <BaseSearchableSelect
          v-model="selectedDivisi"
          :options="divisiOptions"
          placeholder="Semua Target Divisi"
          align="right"
          clearable
        />
      </div>

      <!-- Filter Status Penyimpanan: BaseSearchableSelect -->
      <div class="w-full sm:w-48 shrink-0">
        <BaseSearchableSelect
          v-model="selectedStorage"
          :options="storageOptions"
          placeholder="Semua Sumber"
          align="right"
          clearable
        />
      </div>
    </div>

    <!-- 3. Quick Stats Summary Strip (4 Kapsul Horizontal) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
      <!-- Total Pola -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-[var(--theme-surface-muted)] text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
          <CalendarRange class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-neutral-400 tracking-wider whitespace-nowrap">Total:</span>
          <span class="font-bold text-neutral-900 dark:text-white truncate">{{ listPola.length }} Pola</span>
        </div>
      </div>

      <!-- Tersimpan di Database -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Database class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-emerald-400/80 tracking-wider whitespace-nowrap">Database:</span>
          <span class="font-bold text-emerald-600 dark:text-emerald-400 truncate">{{ databaseCount }} Pola</span>
        </div>
      </div>

      <!-- Pola Rotasi 24 Jam -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
          <Sparkles class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-sky-400/80 tracking-wider whitespace-nowrap">Rotasi 24J:</span>
          <span class="font-bold text-sky-600 dark:text-sky-400 truncate">{{ rotasi24JamCount }} Pola</span>
        </div>
      </div>

      <!-- Pegawai Terkait -->
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

    <!-- 4. BASE DATA TABLE: COMPACT & PROPORSIONAL (TANPA SCROLL GESER-GESER) -->
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
      selected-label="Pola Terpilih"
      empty-title="Data Pola Tidak Ditemukan"
      empty-description="Tidak ada pola kerja yang cocok dengan kriteria filter atau pencarian Anda."
      empty-action-text="Reset Filter Pencarian"
      @empty-action="handleResetDefault"
    >
      <!-- Custom Header Kolom: NAMA POLA & TOTAL JAM -->
      <template #header-nama>
        <div class="flex items-center justify-between w-full pr-1">
          <span class="uppercase text-[10px] tracking-wider font-bold text-neutral-500">
            Nama Pola ({{ listPola.length }})
          </span>
          <span class="text-[10px] text-neutral-400 font-mono font-medium">Total Jam</span>
        </div>
      </template>

      <!-- Kolom: NAMA POLA (Compact Avatar + Nama Pola + Total Jam) -->
      <template #cell-nama="{ row }">
        <div class="flex items-center justify-between gap-1.5 py-1 pr-1 max-w-[210px]">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[var(--theme-surface-muted)] border border-neutral-200/80 dark:border-[var(--theme-border-strong)] text-neutral-800 dark:text-neutral-200 font-bold text-[10px] flex items-center justify-center shrink-0">
              {{ getPatternAvatar(row) }}
            </div>
            <div class="min-w-0">
              <span class="font-bold text-neutral-900 dark:text-white block leading-tight truncate text-xs">
                {{ row.name }}
              </span>
              <span class="text-[9.5px] text-neutral-400 block truncate mt-0.5">
                {{ row.suitableFor }}
              </span>
            </div>
          </div>

          <!-- Total Hours Badge -->
          <div class="text-right shrink-0">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 dark:bg-[var(--theme-surface-muted)] text-neutral-700 dark:text-neutral-300">
              {{ calculatePatternTotalHours(row.pattern) }}j
            </span>
          </div>
        </div>
      </template>

      <!-- Kolom: SENIN (Compact Pill Sesuai Format Screenshot) -->
      <template #cell-senin="{ row }">
        <div
          class="w-full py-1 px-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between gap-1 shadow-2xs whitespace-nowrap"
          :class="[
            getShiftPillClasses(row.pattern[0]),
            isQuickEditMode ? 'cursor-pointer hover:ring-2 hover:ring-[var(--theme-primary)] hover:border-[var(--theme-primary)] hover:scale-[1.02]' : 'cursor-default'
          ]"
          @click="openCellEditor(row, 0, $event)"
          :title="isQuickEditMode ? 'Klik untuk mengganti shift Senin' : `Senin: ${getShiftMeta(row.pattern[0]).name}`"
        >
          <div class="flex items-center gap-1 min-w-0">
            <span class="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black font-mono shrink-0 bg-white/70 dark:bg-black/30 shadow-2xs">
              {{ row.pattern[0] || 'OFF' }}
            </span>
            <span class="text-[10px] font-semibold truncate max-w-[58px]">
              {{ getShiftShortName(row.pattern[0]) }}
            </span>
          </div>
          <ChevronDown v-if="isQuickEditMode" class="w-2.5 h-2.5 opacity-60 shrink-0" />
        </div>
      </template>

      <!-- Kolom: SELASA -->
      <template #cell-selasa="{ row }">
        <div
          class="w-full py-1 px-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between gap-1 shadow-2xs whitespace-nowrap"
          :class="[
            getShiftPillClasses(row.pattern[1]),
            isQuickEditMode ? 'cursor-pointer hover:ring-2 hover:ring-[var(--theme-primary)] hover:border-[var(--theme-primary)] hover:scale-[1.02]' : 'cursor-default'
          ]"
          @click="openCellEditor(row, 1, $event)"
          :title="isQuickEditMode ? 'Klik untuk mengganti shift Selasa' : `Selasa: ${getShiftMeta(row.pattern[1]).name}`"
        >
          <div class="flex items-center gap-1 min-w-0">
            <span class="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black font-mono shrink-0 bg-white/70 dark:bg-black/30 shadow-2xs">
              {{ row.pattern[1] || 'OFF' }}
            </span>
            <span class="text-[10px] font-semibold truncate max-w-[58px]">
              {{ getShiftShortName(row.pattern[1]) }}
            </span>
          </div>
          <ChevronDown v-if="isQuickEditMode" class="w-2.5 h-2.5 opacity-60 shrink-0" />
        </div>
      </template>

      <!-- Kolom: RABU -->
      <template #cell-rabu="{ row }">
        <div
          class="w-full py-1 px-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between gap-1 shadow-2xs whitespace-nowrap"
          :class="[
            getShiftPillClasses(row.pattern[2]),
            isQuickEditMode ? 'cursor-pointer hover:ring-2 hover:ring-[var(--theme-primary)] hover:border-[var(--theme-primary)] hover:scale-[1.02]' : 'cursor-default'
          ]"
          @click="openCellEditor(row, 2, $event)"
          :title="isQuickEditMode ? 'Klik untuk mengganti shift Rabu' : `Rabu: ${getShiftMeta(row.pattern[2]).name}`"
        >
          <div class="flex items-center gap-1 min-w-0">
            <span class="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black font-mono shrink-0 bg-white/70 dark:bg-black/30 shadow-2xs">
              {{ row.pattern[2] || 'OFF' }}
            </span>
            <span class="text-[10px] font-semibold truncate max-w-[58px]">
              {{ getShiftShortName(row.pattern[2]) }}
            </span>
          </div>
          <ChevronDown v-if="isQuickEditMode" class="w-2.5 h-2.5 opacity-60 shrink-0" />
        </div>
      </template>

      <!-- Kolom: KAMIS -->
      <template #cell-kamis="{ row }">
        <div
          class="w-full py-1 px-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between gap-1 shadow-2xs whitespace-nowrap"
          :class="[
            getShiftPillClasses(row.pattern[3]),
            isQuickEditMode ? 'cursor-pointer hover:ring-2 hover:ring-[var(--theme-primary)] hover:border-[var(--theme-primary)] hover:scale-[1.02]' : 'cursor-default'
          ]"
          @click="openCellEditor(row, 3, $event)"
          :title="isQuickEditMode ? 'Klik untuk mengganti shift Kamis' : `Kamis: ${getShiftMeta(row.pattern[3]).name}`"
        >
          <div class="flex items-center gap-1 min-w-0">
            <span class="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black font-mono shrink-0 bg-white/70 dark:bg-black/30 shadow-2xs">
              {{ row.pattern[3] || 'OFF' }}
            </span>
            <span class="text-[10px] font-semibold truncate max-w-[58px]">
              {{ getShiftShortName(row.pattern[3]) }}
            </span>
          </div>
          <ChevronDown v-if="isQuickEditMode" class="w-2.5 h-2.5 opacity-60 shrink-0" />
        </div>
      </template>

      <!-- Kolom: JUMAT -->
      <template #cell-jumat="{ row }">
        <div
          class="w-full py-1 px-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between gap-1 shadow-2xs whitespace-nowrap"
          :class="[
            getShiftPillClasses(row.pattern[4]),
            isQuickEditMode ? 'cursor-pointer hover:ring-2 hover:ring-[var(--theme-primary)] hover:border-[var(--theme-primary)] hover:scale-[1.02]' : 'cursor-default'
          ]"
          @click="openCellEditor(row, 4, $event)"
          :title="isQuickEditMode ? 'Klik untuk mengganti shift Jumat' : `Jumat: ${getShiftMeta(row.pattern[4]).name}`"
        >
          <div class="flex items-center gap-1 min-w-0">
            <span class="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black font-mono shrink-0 bg-white/70 dark:bg-black/30 shadow-2xs">
              {{ row.pattern[4] || 'OFF' }}
            </span>
            <span class="text-[10px] font-semibold truncate max-w-[58px]">
              {{ getShiftShortName(row.pattern[4]) }}
            </span>
          </div>
          <ChevronDown v-if="isQuickEditMode" class="w-2.5 h-2.5 opacity-60 shrink-0" />
        </div>
      </template>

      <!-- Kolom: SABTU -->
      <template #cell-sabtu="{ row }">
        <div
          class="w-full py-1 px-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between gap-1 shadow-2xs whitespace-nowrap"
          :class="[
            getShiftPillClasses(row.pattern[5]),
            isQuickEditMode ? 'cursor-pointer hover:ring-2 hover:ring-[var(--theme-primary)] hover:border-[var(--theme-primary)] hover:scale-[1.02]' : 'cursor-default'
          ]"
          @click="openCellEditor(row, 5, $event)"
          :title="isQuickEditMode ? 'Klik untuk mengganti shift Sabtu' : `Sabtu: ${getShiftMeta(row.pattern[5]).name}`"
        >
          <div class="flex items-center gap-1 min-w-0">
            <span class="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black font-mono shrink-0 bg-white/70 dark:bg-black/30 shadow-2xs">
              {{ row.pattern[5] || 'OFF' }}
            </span>
            <span class="text-[10px] font-semibold truncate max-w-[58px]">
              {{ getShiftShortName(row.pattern[5]) }}
            </span>
          </div>
          <ChevronDown v-if="isQuickEditMode" class="w-2.5 h-2.5 opacity-60 shrink-0" />
        </div>
      </template>

      <!-- Kolom: MINGGU -->
      <template #cell-minggu="{ row }">
        <div
          class="w-full py-1 px-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between gap-1 shadow-2xs whitespace-nowrap"
          :class="[
            getShiftPillClasses(row.pattern[6]),
            isQuickEditMode ? 'cursor-pointer hover:ring-2 hover:ring-[var(--theme-primary)] hover:border-[var(--theme-primary)] hover:scale-[1.02]' : 'cursor-default'
          ]"
          @click="openCellEditor(row, 6, $event)"
          :title="isQuickEditMode ? 'Klik untuk mengganti shift Minggu' : `Minggu: ${getShiftMeta(row.pattern[6]).name}`"
        >
          <div class="flex items-center gap-1 min-w-0">
            <span class="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black font-mono shrink-0 bg-white/70 dark:bg-black/30 shadow-2xs">
              {{ row.pattern[6] || 'OFF' }}
            </span>
            <span class="text-[10px] font-semibold truncate max-w-[58px]">
              {{ getShiftShortName(row.pattern[6]) }}
            </span>
          </div>
          <ChevronDown v-if="isQuickEditMode" class="w-2.5 h-2.5 opacity-60 shrink-0" />
        </div>
      </template>

      <!-- Kolom: AKSI (Pencil Edit + BaseDropdownMenu ...) -->
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-1">
          <button
            type="button"
            @click="openEditModal(row)"
            class="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-[var(--theme-surface-muted)] transition cursor-pointer"
            title="Edit Pola"
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
        <BaseButton variant="outline" size="sm" @click="handleBatchSetDatabase(true)">
          <Database class="w-3.5 h-3.5 text-emerald-500" />
          <span>Simpan ke DB ({{ selectedCount }})</span>
        </BaseButton>
        <BaseButton variant="outline" size="sm" @click="handleBatchSetDatabase(false)">
          <RotateCcw class="w-3.5 h-3.5 text-neutral-500" />
          <span>Jadikan Temp ({{ selectedCount }})</span>
        </BaseButton>
        <BaseButton variant="danger" size="sm" @click="isBatchDeleteModalOpen = true">
          <Trash2 class="w-3.5 h-3.5" />
          <span>Hapus ({{ selectedCount }})</span>
        </BaseButton>
      </template>

      <!-- Kartu Mobile Slot -->
      <template #mobile-card="{ row, isSelected, toggleSelect: onToggleSelect }">
        <div
          class="p-3.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-xs space-y-3"
          :class="isSelected ? 'ring-2 ring-[var(--theme-primary)]' : ''"
        >
          <!-- Top Row -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <BaseCheckbox
                :model-value="isSelected"
                size="sm"
                class="mt-0.5"
                @change="onToggleSelect"
              />
              <div class="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-[var(--theme-surface-muted)] font-bold text-xs flex items-center justify-center shrink-0">
                {{ getPatternAvatar(row) }}
              </div>
              <div>
                <h3 class="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                  {{ row.name }}
                </h3>
                <span class="text-[10.5px] text-neutral-400 block mt-0.5">
                  {{ row.suitableFor }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 dark:bg-[var(--theme-surface-muted)] text-neutral-700 dark:text-neutral-300">
                {{ calculatePatternTotalHours(row.pattern) }}j
              </span>
              <BaseBadge
                :variant="row.isDatabase ? 'success' : 'warning'"
                size="sm"
              >
                {{ row.isDatabase ? 'DB' : 'Temp' }}
              </BaseBadge>
            </div>
          </div>

          <!-- Mid Row: 7 Hari Mini Grid -->
          <div class="p-2 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface-raised)] border border-neutral-100 dark:border-[var(--theme-border)]">
            <div class="grid grid-cols-7 gap-1 text-center">
              <div v-for="d in daysList" :key="d.key" class="flex flex-col items-center">
                <span class="text-[8.5px] text-neutral-400 font-semibold">{{ d.label.slice(0, 3) }}</span>
                <span
                  class="text-[9px] font-bold font-mono px-1 rounded mt-0.5"
                  :class="[
                    row.pattern[d.index] === 'P' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                    row.pattern[d.index] === 'S' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' :
                    row.pattern[d.index] === 'M' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400' :
                    'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                  ]"
                >
                  {{ row.pattern[d.index] || 'OFF' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons Mobile -->
          <div class="flex items-center justify-between pt-1">
            <BaseButton
              variant="outline"
              size="xs"
              @click="handleApplyToRoster(row)"
            >
              <Sparkles class="w-3 h-3 text-sky-500 mr-1" />
              <span>Terapkan</span>
            </BaseButton>

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

    <!-- FLOATING SEARCHABLE SHIFT SELECTOR POPOVER (MODE EDIT CEPAT) -->
    <Teleport to="body">
      <div
        v-if="activeCellEditor"
        class="fixed inset-0 z-[100]"
        @click="activeCellEditor = null"
      >
        <div
          class="fixed z-[101] w-56 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-xl p-2.5 text-xs animate-in fade-in zoom-in-95 duration-100"
          :style="{ top: `${activeCellEditor.top}px`, left: `${activeCellEditor.left}px` }"
          @click.stop
        >
          <!-- Header Popover -->
          <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-neutral-100 dark:border-[var(--theme-border)]">
            <div class="truncate">
              <span class="font-bold text-neutral-900 dark:text-white block text-xs">Pilih Shift</span>
              <span class="text-[10px] text-neutral-400 block truncate">{{ activeCellEditor.dayName }} • {{ activeCellEditor.rowName }}</span>
            </div>
            <button
              type="button"
              @click="activeCellEditor = null"
              class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded cursor-pointer"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative mb-2">
            <Search class="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref="searchInputRef"
              v-model="cellSearchQuery"
              type="text"
              placeholder="Cari shift..."
              class="w-full pl-8 pr-6 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[var(--theme-surface-muted)] border border-neutral-200 dark:border-[var(--theme-border)] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
            />
            <button
              v-if="cellSearchQuery"
              type="button"
              @click="cellSearchQuery = ''"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
            >
              <X class="w-3 h-3" />
            </button>
          </div>

          <!-- List of Shifts -->
          <div class="space-y-1 max-h-48 overflow-y-auto pr-0.5">
            <button
              v-for="s in filteredShiftTypes"
              :key="s.code"
              type="button"
              @click="selectShiftForCell(s.code)"
              class="w-full px-2 py-1.5 rounded-lg text-left text-xs transition flex items-center justify-between gap-1.5 hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-muted)] cursor-pointer"
              :class="activeCellEditor.currentCode === s.code ? 'bg-neutral-100 dark:bg-[var(--theme-surface-muted)] font-bold' : ''"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold shrink-0"
                  :class="getShiftPillClasses(s.code)"
                >
                  {{ s.code }}
                </span>
                <div class="min-w-0">
                  <span class="block leading-tight text-xs font-semibold truncate">{{ s.name }}</span>
                  <span class="block text-[9.5px] text-neutral-400 font-mono">{{ s.time }}</span>
                </div>
              </div>
              <Check v-if="activeCellEditor.currentCode === s.code" class="w-3.5 h-3.5 text-[var(--theme-primary)] shrink-0" />
            </button>

            <div v-if="filteredShiftTypes.length === 0" class="py-3 text-center text-neutral-400 text-[11px]">
              Shift tidak ditemukan
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 5. MODAL FORM: TAMBAH / UBAH POLA ROSTER (UKURAN BALANCED PROPORSI) -->
    <BaseModal
      v-model="isFormModalOpen"
      :title="isEditMode ? 'Ubah Data Pola' : 'Tambah Pola Baru'"
      :subtitle="isEditMode ? 'Sesuaikan susunan shift 7 hari dan peruntukan divisi' : 'Rancang pola rotasi shift mingguan (Senin s/d Minggu) untuk jadwal roster'"
      size="balanced"
    >
      <div class="space-y-4 text-xs">
        <!-- Nama Pola & Target Divisi -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BaseInput
              v-model="formName"
              label="Nama Pola"
              placeholder="Mis. Pola Standar 5-2 (Office Hours)"
              required
              :error="formErrors.name"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Target Divisi / Departemen
            </label>
            <BaseSearchableSelect
              v-model="formDivisi"
              :options="divisiFormOptions"
              placeholder="Pilih divisi..."
              size="md"
            />
          </div>
        </div>

        <!-- Deskripsi Pola -->
        <div>
          <BaseInput
            v-model="formDesc"
            label="Keterangan / Catatan Pola"
            placeholder="Mis. 5 hari kerja shift pagi berturut-turut, 2 hari libur akhir pekan"
          />
        </div>

        <!-- SUSUNAN SHIFT 7 HARI (SENIN - MINGGU) -->
        <div class="p-3 bg-neutral-50 dark:bg-[var(--theme-surface-muted)]/60 rounded-xl border border-neutral-200/80 dark:border-[var(--theme-border)] space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="font-semibold text-neutral-900 dark:text-[var(--theme-text-primary)] block">
                Susunan Shift 7 Hari (Senin - Minggu)
              </span>
              <span class="text-[11px] text-neutral-500">
                Klik tombol hari untuk memilih variasi shift
              </span>
            </div>

            <!-- Preset Cepat -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] text-neutral-400">Preset Cepat:</span>
              <button
                type="button"
                @click="applyQuickPreset('5-2')"
                class="px-2 py-0.5 text-[10px] font-medium rounded border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Pola 5-2
              </button>
              <button
                type="button"
                @click="applyQuickPreset('2-2-2-1')"
                class="px-2 py-0.5 text-[10px] font-medium rounded border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Pola 2-2-2-1
              </button>
              <button
                type="button"
                @click="applyQuickPreset('3-3-1')"
                class="px-2 py-0.5 text-[10px] font-medium rounded border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Pola 3-3-1
              </button>
              <button
                type="button"
                @click="applyQuickPreset('all-pagi')"
                class="px-2 py-0.5 text-[10px] font-medium rounded border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Semua Pagi
              </button>
            </div>
          </div>

          <!-- 7 Kolom Hari: Senin s/d Minggu -->
          <div class="grid grid-cols-7 gap-1.5">
            <div
              v-for="d in daysList"
              :key="d.key"
              class="flex flex-col items-center bg-white dark:bg-[var(--theme-surface)] p-2 rounded-xl border border-neutral-200/90 dark:border-[var(--theme-border)] text-center relative"
            >
              <span class="text-[10.5px] font-bold text-neutral-700 dark:text-neutral-300">
                {{ d.label }}
              </span>
              <span class="text-[9px] text-neutral-400 mt-0.5">Hari {{ d.index + 1 }}</span>

              <!-- Shift Selector Pill -->
              <div class="mt-2 w-full">
                <button
                  type="button"
                  @click="formActiveDayDropdown = formActiveDayDropdown === d.index ? null : d.index"
                  class="w-full py-1 px-1 rounded-lg border text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                  :class="[
                    formPattern[d.index] === 'P' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40' :
                    formPattern[d.index] === 'S' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40' :
                    formPattern[d.index] === 'M' ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/40' :
                    'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                  ]"
                >
                  <span class="truncate">{{ getShiftMeta(formPattern[d.index]).name }}</span>
                  <ChevronDown class="w-3 h-3 shrink-0 ml-0.5 text-neutral-400" />
                </button>

                <!-- Popover Pilihan Shift -->
                <div
                  v-if="formActiveDayDropdown === d.index"
                  class="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-[var(--theme-surface)] rounded-lg shadow-lg border border-neutral-200 dark:border-[var(--theme-border)] p-1 text-left space-y-0.5"
                >
                  <button
                    v-for="s in shiftTypes"
                    :key="s.code"
                    type="button"
                    @click="handleSetDayShift(d.index, s.code)"
                    class="w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-hover)] cursor-pointer"
                    :class="{ 'font-bold bg-neutral-50 dark:bg-neutral-800': formPattern[d.index] === s.code }"
                  >
                    <div class="flex items-center gap-1.5 truncate">
                      <BaseBadge :variant="s.badgeVariant" size="sm" class="px-1 py-0 text-[9px] font-mono">
                        {{ s.code }}
                      </BaseBadge>
                      <span class="truncate">{{ s.name }}</span>
                    </div>
                    <Check v-if="formPattern[d.index] === s.code" class="w-3 h-3 text-[var(--theme-primary)] shrink-0" />
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
              Pola yang tersimpan di database dapat langsung diakses oleh seluruh supervisor
            </span>
          </div>
          <BaseSwitch v-model="formSaveToDb" />
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <BaseButton variant="outline" size="sm" @click="isFormModalOpen = false">
            Batal
          </BaseButton>
          <BaseButton variant="primary" size="sm" @click="handleSavePola">
            {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Pola' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- 6. MODAL KONFIRMASI HAPUS SINGLE POLA -->
    <ConfirmationModal
      v-model="isDeleteModalOpen"
      type="delete"
      title="Hapus Pola Roster?"
      :message="`Apakah Anda yakin ingin menghapus pola '${itemToDelete?.name}'? Tindakan ini tidak dapat dibatalkan.`"
      confirm-text="Hapus Pola"
      cancel-text="Batal"
      @confirm="handleDeleteConfirm"
    />

    <!-- 7. MODAL KONFIRMASI HAPUS MASSAL POLA -->
    <ConfirmationModal
      v-model="isBatchDeleteModalOpen"
      type="delete"
      title="Hapus Pola Terpilih?"
      :message="`Apakah Anda yakin ingin menghapus ${selectedIds.length} pola terpilih sekaligus? Seluruh data yang dihapus tidak dapat dipulihkan.`"
      confirm-text="Hapus Terpilih"
      cancel-text="Batal"
      @confirm="handleBatchDeleteConfirm"
    />

    <!-- 8. MODAL IMPOR CSV -->
    <BaseCsvImporter
      v-model="isCsvImporterOpen"
      title="Impor Pola Roster dari CSV"
      :target-fields="targetFieldsForImport"
      @imported="handleCsvImported"
    />
  </div>
</template>
