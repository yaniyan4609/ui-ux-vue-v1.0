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
import BaseStatCard from '../../components/ui/BaseStatCard.vue'
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
  CheckCircle2,
  Hourglass,
  Users,
  Sun,
  Sunset,
  Moon,
  Building2,
  Sparkles,
  Coffee,
  Check,
} from 'lucide-vue-next'

const toast = useToast()

// ========================================================
// 1. DATA STATE & CRUD
// ========================================================
const shifts = ref(JSON.parse(JSON.stringify(initialShiftTypes)))

// Search & Filter State
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedVariant = ref('all')

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'active', label: 'Status Aktif' },
  { value: 'inactive', label: 'Status Nonaktif' },
]

const variantOptions = [
  { value: 'all', label: 'Semua Warna Badge' },
  { value: 'success', label: 'Hijau (Emerald)' },
  { value: 'warning', label: 'Kuning (Amber)' },
  { value: 'purple', label: 'Ungu (Purple)' },
  { value: 'info', label: 'Biru (Sky)' },
  { value: 'neutral', label: 'Netral (Zinc/Gray)' },
  { value: 'danger', label: 'Merah (Rose)' },
]

// Available Badge Variants for Color Picker in Form
const availableVariants = [
  { value: 'success', label: 'Hijau Emerald', colorClass: 'bg-emerald-500' },
  { value: 'warning', label: 'Kuning Amber', colorClass: 'bg-amber-500' },
  { value: 'purple', label: 'Ungu Purple', colorClass: 'bg-purple-500' },
  { value: 'info', label: 'Biru Sky', colorClass: 'bg-sky-500' },
  { value: 'neutral', label: 'Abu Netral', colorClass: 'bg-neutral-500' },
  { value: 'danger', label: 'Merah Rose', colorClass: 'bg-rose-500' },
]

// ========================================================
// 2. COMPUTED METRICS & FILTERED DATA
// ========================================================
const totalShifts = computed(() => shifts.value.length)
const activeShifts = computed(() => shifts.value.filter((s) => s.isActive).length)
const totalAssignedEmployees = computed(() =>
  shifts.value.reduce((acc, curr) => acc + (curr.employeeCount || 0), 0)
)
const averageWorkHours = computed(() => {
  const activeWorking = shifts.value.filter((s) => s.isActive && s.hours > 0)
  if (!activeWorking.length) return 0
  const sum = activeWorking.reduce((acc, curr) => acc + (curr.hours || 0), 0)
  return (sum / activeWorking.length).toFixed(1)
})

const filteredShifts = computed(() => {
  return shifts.value.filter((item) => {
    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchCode = item.code?.toLowerCase().includes(q)
      const matchName = item.name?.toLowerCase().includes(q)
      const matchDesc = item.desc?.toLowerCase().includes(q)
      if (!matchCode && !matchName && !matchDesc) return false
    }

    // Status filter
    if (selectedStatus.value === 'active' && !item.isActive) return false
    if (selectedStatus.value === 'inactive' && item.isActive) return false

    // Variant filter
    if (selectedVariant.value !== 'all' && item.badgeVariant !== selectedVariant.value) return false

    return true
  })
})

// ========================================================
// 3. TABLE COLUMNS CONFIGURATION
// ========================================================
const tableColumns = [
  { key: 'code', label: 'Kode', width: '100px', align: 'center', sortable: true },
  { key: 'name', label: 'Nama Shift & Deskripsi', sortable: true },
  { key: 'time', label: 'Jam Kerja Operasional', width: '220px', sortable: true },
  { key: 'breakTime', label: 'Istirahat & Toleransi', width: '200px' },
  { key: 'employeeCount', label: 'Pegawai', width: '130px', align: 'center', sortable: true },
  { key: 'isActive', label: 'Status Aktif', width: '130px', align: 'center' },
  { key: 'actions', label: 'Aksi', width: '110px', align: 'center' },
]

// ========================================================
// 4. TOGGLE STATUS AKTIF DIRECTLY FROM TABLE
// ========================================================
const handleToggleActive = (shift) => {
  shift.isActive = !shift.isActive
  if (shift.isActive) {
    toast.success(`Shift "${shift.name}" berhasil diaktifkan.`, 'Status Shift')
  } else {
    toast.warning(`Shift "${shift.name}" dinonaktifkan dari jadwal.`, 'Status Shift')
  }
}

// ========================================================
// 5. MODAL TAMBAH & EDIT SHIFT
// ========================================================
const isFormModalOpen = ref(false)
const isEditMode = ref(false)

const formInitialState = {
  id: null,
  code: '',
  name: '',
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

// Hitung durasi jam kerja otomatis saat startTime atau endTime berubah
const calculateHours = (start, end) => {
  if (!start || !end || start === '00:00' && end === '00:00') return 0
  const [sH, sM] = start.split(':').map(Number)
  const [eH, eM] = end.split(':').map(Number)
  let diffMin = (eH * 60 + eM) - (sH * 60 + sM)
  if (diffMin <= 0) diffMin += 24 * 60 // Melintasi tengah malam (mis. 23:00 - 07:00)
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
    const idx = shifts.value.findIndex((s) => s.id === payload.id || s.code === payload.code)
    if (idx !== -1) {
      shifts.value[idx] = payload
    }
    toast.success(`Konfigurasi shift "${payload.name}" berhasil diperbarui!`, 'Shift Diperbarui')
  } else {
    // Cek duplikasi kode
    const exists = shifts.value.some((s) => s.code === payload.code)
    if (exists) {
      formErrors.value.code = `Kode shift "${payload.code}" sudah digunakan. Gunakan kode unik lain.`
      toast.error(`Kode shift ${payload.code} sudah ada.`, 'Kode Duplikat')
      return
    }
    shifts.value.unshift(payload)
    toast.success(`Shift "${payload.name}" (${payload.code}) berhasil ditambahkan ke sistem!`, 'Shift Ditambahkan')
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
  shifts.value = shifts.value.filter((s) => s.id !== deleted.id && s.code !== deleted.code)
  isDeleteModalOpen.value = false
  itemToDelete.value = null
  toast.error(`Shift "${deleted.name}" (${deleted.code}) telah dihapus dari sistem.`, 'Shift Dihapus')
}

// ========================================================
// 7. RESET & EKSPOR CSV
// ========================================================
const handleResetDefault = () => {
  shifts.value = JSON.parse(JSON.stringify(initialShiftTypes))
  searchQuery.value = ''
  selectedStatus.value = 'all'
  selectedVariant.value = 'all'
  toast.info('Seluruh master shift telah dikembalikan ke pengaturan bawaan sistem.')
}

const exportToCSV = () => {
  const items = filteredShifts.value
  if (!items.length) {
    toast.warning('Tidak ada data shift untuk diekspor.')
    return
  }

  const headers = ['Kode Shift', 'Nama Shift', 'Jam Operasional', 'Durasi (Jam)', 'Istirahat (Mnt)', 'Toleransi Terlambat (Mnt)', 'Pegawai Terdaftar', 'Status Aktif', 'Deskripsi']
  const rows = items.map((s) => [
    `"${s.code}"`,
    `"${s.name}"`,
    `"${s.time}"`,
    s.hours,
    s.breakTime || 0,
    s.lateTolerance || 0,
    s.employeeCount || 0,
    s.isActive ? 'Aktif' : 'Nonaktif',
    `"${(s.desc || '').replace(/"/g, '""')}"`,
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `master_shift_digaji_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success(`Berhasil mengunduh ${items.length} master shift ke format CSV!`, 'Ekspor CSV')
}
</script>

<template>
  <!-- Main View Container: Sesuai Aturan Data View -->
  <div class="h-full flex flex-col min-h-0 overflow-hidden gap-2.5 w-full max-w-7xl mx-auto select-none relative">
    
    <!-- 1. HEADER HALAMAN MASTER SHIFT -->
    <div class="flex items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-[var(--theme-border)] shrink-0">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shrink-0 shadow-2xs">
          <Clock class="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-[var(--theme-text-primary)] leading-none truncate">
              Master Shift Kerja
            </h1>
            <BaseBadge variant="success" size="sm">
              {{ totalShifts }} Shift
            </BaseBadge>
          </div>
          <p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
            Konfigurasi jam masuk-pulang kerja, istirahat, toleransi keterlambatan, dan kode visual badge untuk jadwal roster.
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <BaseButton
          variant="outline"
          size="sm"
          @click="exportToCSV"
          title="Unduh seluruh konfigurasi shift ke file CSV"
        >
          <Download class="w-3.5 h-3.5 text-neutral-500" />
          <span class="hidden sm:inline">Ekspor CSV</span>
        </BaseButton>

        <BaseButton
          variant="outline"
          size="sm"
          @click="handleResetDefault"
          title="Kembalikan data shift ke pengaturan awal"
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
          <span>Tambah Shift</span>
        </BaseButton>
      </div>
    </div>

    <!-- 2. QUICK STATS SUMMARY CARDS -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
      <BaseStatCard
        title="Total Master Shift"
        :value="totalShifts"
        unit="Shift"
        description="Termasuk shift kerja reguler & libur"
      >
        <template #icon>
          <Clock class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </template>
      </BaseStatCard>

      <BaseStatCard
        title="Shift Aktif Operasional"
        :value="activeShifts"
        unit="Aktif"
        description="Siap dipilih saat generate roster"
      >
        <template #icon>
          <CheckCircle2 class="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </template>
      </BaseStatCard>

      <BaseStatCard
        title="Rata-rata Jam Kerja"
        :value="averageWorkHours"
        unit="Jam/Hari"
        description="Standar durasi shift kerja produktif"
      >
        <template #icon>
          <Hourglass class="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </template>
      </BaseStatCard>

      <BaseStatCard
        title="Total Pegawai Terdaftar"
        :value="totalAssignedEmployees"
        unit="Pegawai"
        description="Penempatan di master shift aktif"
      >
        <template #icon>
          <Users class="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </template>
      </BaseStatCard>
    </div>

    <!-- 3. TOOLBAR: PENCARIAN & FILTER -->
    <div class="flex flex-wrap items-center justify-between gap-2.5 p-2.5 bg-neutral-50/80 dark:bg-[var(--theme-surface-muted)]/50 rounded-xl border border-neutral-200/80 dark:border-[var(--theme-border)] shrink-0">
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
        <!-- Search Input -->
        <div class="w-full sm:w-64">
          <BaseInput
            v-model="searchQuery"
            placeholder="Cari kode atau nama shift..."
            size="sm"
            clearable
          >
            <template #prefix>
              <Search class="w-3.5 h-3.5 text-neutral-400" />
            </template>
          </BaseInput>
        </div>

        <!-- Filter Status -->
        <div class="w-40">
          <BaseSearchableSelect
            v-model="selectedStatus"
            :options="statusOptions"
            placeholder="Semua Status"
            size="sm"
          />
        </div>

        <!-- Filter Varian Warna Badge -->
        <div class="w-48">
          <BaseSearchableSelect
            v-model="selectedVariant"
            :options="variantOptions"
            placeholder="Semua Warna"
            size="sm"
          />
        </div>

        <!-- Reset Button -->
        <button
          v-if="searchQuery || selectedStatus !== 'all' || selectedVariant !== 'all'"
          @click="searchQuery = ''; selectedStatus = 'all'; selectedVariant = 'all'"
          class="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center gap-1 px-2 py-1 transition-colors"
        >
          <RotateCcw class="w-3 h-3" />
          Bersihkan
        </button>
      </div>

      <div class="text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0">
        Menampilkan <span class="font-semibold text-neutral-800 dark:text-neutral-200">{{ filteredShifts.length }}</span> dari {{ shifts.length }} shift
      </div>
    </div>

    <!-- 4. TABEL MASTER SHIFT (BASE DATA TABLE) -->
    <div class="flex-1 min-h-0 bg-white dark:bg-[var(--theme-surface)] rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] overflow-hidden shadow-2xs">
      <BaseDataTable
        :columns="tableColumns"
        :rows="filteredShifts"
        row-key="id"
        :paginated="true"
        :items-per-page="10"
        :per-page-options="[10, 20, 50]"
        :show-index="false"
      >
        <!-- Cell: Kode Shift (Visual Badge Warna) -->
        <template #cell-code="{ row }">
          <div class="flex items-center justify-center">
            <BaseBadge
              :variant="row.badgeVariant || 'neutral'"
              size="sm"
              class="font-mono font-bold tracking-wider px-2.5 py-0.5"
            >
              {{ row.code }}
            </BaseBadge>
          </div>
        </template>

        <!-- Cell: Nama Shift & Deskripsi -->
        <template #cell-name="{ row }">
          <div class="min-w-0 py-0.5">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-neutral-900 dark:text-[var(--theme-text-primary)] text-xs truncate">
                {{ row.name }}
              </span>
              <span
                v-if="row.code === 'P' || row.code === 'S' || row.code === 'M'"
                class="text-[9px] px-1.5 py-0.2 rounded font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              >
                Rotasi 24 Jam
              </span>
            </div>
            <p class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              {{ row.desc || 'Tidak ada keterangan tambahan.' }}
            </p>
          </div>
        </template>

        <!-- Cell: Jam Kerja Operasional -->
        <template #cell-time="{ row }">
          <div class="flex items-center gap-2">
            <div class="flex flex-col">
              <span class="font-mono font-medium text-xs text-neutral-800 dark:text-neutral-200">
                {{ row.time }}
              </span>
              <span class="text-[10px] text-neutral-400 mt-0.5">
                {{ row.hours > 0 ? `${row.hours} Jam Kerja Efektif` : 'Bebas Jam Kerja' }}
              </span>
            </div>
          </div>
        </template>

        <!-- Cell: Istirahat & Toleransi -->
        <template #cell-breakTime="{ row }">
          <div class="flex flex-col text-[11px] text-neutral-600 dark:text-neutral-300">
            <div class="flex items-center gap-1.5">
              <Coffee class="w-3 h-3 text-amber-500" />
              <span>Istirahat: <strong class="text-neutral-800 dark:text-neutral-200">{{ row.breakTime || 0 }} mnt</strong></span>
            </div>
            <div class="flex items-center gap-1.5 mt-0.5 text-neutral-400 text-[10px]">
              <Clock class="w-3 h-3 text-neutral-400" />
              <span>Toleransi: <strong class="text-neutral-600 dark:text-neutral-300">{{ row.lateTolerance || 0 }} mnt</strong></span>
            </div>
          </div>
        </template>

        <!-- Cell: Pegawai Terdaftar -->
        <template #cell-employeeCount="{ row }">
          <div class="flex items-center justify-center">
            <BaseBadge variant="neutral" size="sm">
              <Users class="w-3 h-3 mr-1 text-neutral-500" />
              {{ row.employeeCount || 0 }} Orang
            </BaseBadge>
          </div>
        </template>

        <!-- Cell: Status Aktif (BaseSwitch interaktif) -->
        <template #cell-isActive="{ row }">
          <div class="flex items-center justify-center">
            <BaseSwitch
              :model-value="row.isActive"
              @update:model-value="handleToggleActive(row)"
              size="sm"
            />
          </div>
        </template>

        <!-- Cell: Aksi (Edit & Hapus) -->
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-center gap-1">
            <button
              type="button"
              @click="openEditModal(row)"
              class="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 dark:hover:bg-[var(--theme-surface-hover)] dark:hover:text-neutral-100 transition-colors"
              title="Ubah Konfigurasi Shift"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              @click="openDeleteConfirm(row)"
              class="p-1 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
              title="Hapus Shift"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>

        <!-- Empty State Slot -->
        <template #empty>
          <div class="py-12 flex flex-col items-center justify-center text-center">
            <Clock class="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-2" />
            <p class="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Tidak ada shift yang cocok</p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
              Coba ubah kata kunci pencarian atau bersihkan filter status dan varian warna badge.
            </p>
            <BaseButton
              variant="outline"
              size="sm"
              class="mt-3"
              @click="searchQuery = ''; selectedStatus = 'all'; selectedVariant = 'all'"
            >
              Bersihkan Filter
            </BaseButton>
          </div>
        </template>
      </BaseDataTable>
    </div>

    <!-- 5. MODAL FORM: TAMBAH / UBAH SHIFT -->
    <BaseModal
      v-model="isFormModalOpen"
      :title="isEditMode ? 'Ubah Konfigurasi Shift' : 'Tambah Shift Baru'"
      :subtitle="isEditMode ? 'Perbarui jam kerja, durasi istirahat, dan warna penanda shift' : 'Daftarkan shift baru untuk diterapkan pada jadwal roster karyawan'"
      size="md"
    >
      <div class="space-y-4 text-xs">
        <!-- Kode Shift & Nama Shift -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-1">
            <BaseInput
              v-model="formData.code"
              label="Kode Shift"
              placeholder="Mis. P, REG"
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

        <!-- Deskripsi Shift -->
        <div>
          <BaseInput
            v-model="formData.desc"
            label="Deskripsi / Catatan Shift"
            placeholder="Keterangan alokasi tugas atau area penugasan..."
          />
        </div>

        <!-- Jam Mulai & Jam Selesai -->
        <div class="p-3 bg-neutral-50 dark:bg-[var(--theme-surface-muted)]/60 rounded-xl border border-neutral-200/80 dark:border-[var(--theme-border)] space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-neutral-900 dark:text-[var(--theme-text-primary)]">
              Jam Kerja Operasional
            </span>
            <BaseBadge variant="neutral" size="sm">
              {{ formData.hours }} Jam Kerja
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
              hint="Batas toleransi dispensasi"
            >
              <template #suffix>
                <span class="text-neutral-400 text-[11px]">mnt</span>
              </template>
            </BaseInput>
          </div>
        </div>

        <!-- Pilihan Varian Warna Badge Shift -->
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
              class="flex items-center justify-between p-2 rounded-lg border text-left transition-all"
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

        <!-- Switch Status Aktif -->
        <div class="pt-2 border-t border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between">
          <div>
            <span class="font-semibold text-neutral-900 dark:text-[var(--theme-text-primary)] block">
              Status Shift Aktif
            </span>
            <span class="text-[11px] text-neutral-500">
              Shift aktif dapat dipilih langsung oleh tim HR dan dalam generate roster
            </span>
          </div>
          <BaseSwitch v-model="formData.isActive" />
        </div>
      </div>

      <!-- Footer Modal -->
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

    <!-- 6. CONFIRMATION MODAL: HAPUS SHIFT -->
    <ConfirmationModal
      v-model="isDeleteModalOpen"
      type="delete"
      title="Hapus Master Shift?"
      :message="`Apakah Anda yakin ingin menghapus shift '${itemToDelete?.name}' (${itemToDelete?.code})? Tindakan ini tidak dapat dibatalkan.`"
      confirm-text="Hapus Shift"
      cancel-text="Batal"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>
