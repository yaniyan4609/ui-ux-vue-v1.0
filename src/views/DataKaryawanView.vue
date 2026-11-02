<script setup>
import { ref, computed, watch } from 'vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import ConfirmationModal from '../components/ui/ConfirmationModal.vue'
import BaseSearchableSelect from '../components/ui/BaseSearchableSelect.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseCurrencyInput from '../components/ui/BaseCurrencyInput.vue'
import BaseTextarea from '../components/ui/BaseTextarea.vue'
import BaseSwitch from '../components/ui/BaseSwitch.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BasePagination from '../components/ui/BasePagination.vue'
import BaseDropdownMenu from '../components/ui/BaseDropdownMenu.vue'
import { useToast } from '../composables/useToast'
import { karyawanList } from '../data/karyawanData'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  MapPin,
  Check,
  X,
  TrendingUp,
  Coins,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText,
  Info,
  Building2,
  CreditCard,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-vue-next'

const toast = useToast()

// ========================================================
// 1. DATA STATE & CRUD
// ========================================================
const initialKaryawan = karyawanList
const listKaryawan = ref([...karyawanList])

// ========================================================
// 2. SEARCH, FILTER & SORTING
// ========================================================
const searchQuery = ref('')
const selectedDivisi = ref('all')
const selectedStatus = ref('all')

const sortKey = ref('gaji')
const sortOrder = ref('desc')

const currentPage = ref(1)
const itemsPerPage = ref(10)

// Dropdown Options: Divisi (Searchable)
const divisiOptions = computed(() => {
  const counts = {}
  listKaryawan.value.forEach((k) => {
    counts[k.divisi] = (counts[k.divisi] || 0) + 1
  })

  return [
    { value: 'all', label: 'Semua Divisi', badge: listKaryawan.value.length },
    { value: 'Teknologi & IT', label: 'Teknologi & IT', badge: counts['Teknologi & IT'] || 0 },
    { value: 'Desain & Kreatif', label: 'Desain & Kreatif', badge: counts['Desain & Kreatif'] || 0 },
    { value: 'Keuangan & Pajak', label: 'Keuangan & Pajak', badge: counts['Keuangan & Pajak'] || 0 },
    { value: 'SDM & HR', label: 'SDM & HR', badge: counts['SDM & HR'] || 0 },
    { value: 'Pemasaran & Bisnis', label: 'Pemasaran & Bisnis', badge: counts['Pemasaran & Bisnis'] || 0 },
    { value: 'Operasional', label: 'Operasional', badge: counts['Operasional'] || 0 },
  ]
})

// Dropdown Options: Status Kerja
const statusOptions = computed(() => {
  const counts = {}
  listKaryawan.value.forEach((k) => {
    counts[k.status] = (counts[k.status] || 0) + 1
  })

  return [
    { value: 'all', label: 'Semua Status', badge: listKaryawan.value.length },
    { value: 'Tetap', label: 'Karyawan Tetap', badge: counts['Tetap'] || 0 },
    { value: 'Kontrak', label: 'Kontrak', badge: counts['Kontrak'] || 0 },
    { value: 'Probasi', label: 'Probasi', badge: counts['Probasi'] || 0 },
    { value: 'Freelance', label: 'Freelance', badge: counts['Freelance'] || 0 },
  ]
})

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = key === 'gaji' ? 'desc' : 'asc'
  }
  currentPage.value = 1
}

watch([searchQuery, selectedDivisi, selectedStatus, itemsPerPage], () => {
  currentPage.value = 1
})

// Filtered & Sorted List
const processedList = computed(() => {
  let list = [...listKaryawan.value]

  // Filter Divisi
  if (selectedDivisi.value && selectedDivisi.value !== 'all') {
    list = list.filter((k) => k.divisi === selectedDivisi.value)
  }

  // Filter Status
  if (selectedStatus.value && selectedStatus.value !== 'all') {
    list = list.filter((k) => k.status === selectedStatus.value)
  }

  // Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (k) =>
        k.nama.toLowerCase().includes(q) ||
        k.nip.toLowerCase().includes(q) ||
        k.jabatan.toLowerCase().includes(q) ||
        k.email.toLowerCase().includes(q) ||
        k.lokasi.toLowerCase().includes(q) ||
        k.divisi.toLowerCase().includes(q)
    )
  }

  // Sorting
  list.sort((a, b) => {
    let aVal = a[sortKey.value]
    let bVal = b[sortKey.value]

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

const totalPages = computed(() => {
  if (itemsPerPage.value === 'all') return 1
  return Math.max(1, Math.ceil(processedList.value.length / Number(itemsPerPage.value)))
})

const paginatedList = computed(() => {
  if (itemsPerPage.value === 'all') return processedList.value
  const start = (currentPage.value - 1) * Number(itemsPerPage.value)
  return processedList.value.slice(start, start + Number(itemsPerPage.value))
})

// Stats Calculations
const totalPayroll = computed(() => {
  return listKaryawan.value.reduce((acc, k) => acc + (k.gaji || 0) + (k.tunjangan || 0), 0)
})

const totalTetap = computed(() => {
  return listKaryawan.value.filter((k) => k.status === 'Tetap').length
})

const totalKontrak = computed(() => {
  return listKaryawan.value.filter((k) => k.status === 'Kontrak' || k.status === 'Probasi').length
})

// Format Currency IDR
const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val || 0)
}

// Status Badge Variant for BaseBadge
const getStatusBadgeVariant = (status) => {
  const map = {
    Tetap: 'success',
    Kontrak: 'warning',
    Probasi: 'info',
    Freelance: 'purple',
  }
  return map[status] || 'neutral'
}

// ========================================================
// 3. MODAL CRUD (TAMBAH & EDIT PEGAWAI)
// ========================================================
const isFormModalOpen = ref(false)
const isEditMode = ref(false)
const formData = ref({
  id: null,
  nip: '',
  nama: '',
  email: '',
  telepon: '',
  divisi: 'Teknologi & IT',
  jabatan: '',
  gaji: '',
  tunjangan: '',
  status: 'Tetap',
  lokasi: 'Jakarta Selatan',
  tanggalMasuk: '01 Jan 2024',
  bpjsAktif: true,
  rekening: '',
  catatan: '',
})
const formErrors = ref({})

const openAddModal = () => {
  isEditMode.value = false
  const nextNum = String(listKaryawan.value.length + 1).padStart(3, '0')
  formData.value = {
    id: null,
    nip: `EMP-2024-${nextNum}`,
    nama: '',
    email: '',
    telepon: '',
    divisi: 'Teknologi & IT',
    jabatan: '',
    gaji: '',
    tunjangan: '',
    status: 'Tetap',
    lokasi: 'Jakarta Selatan',
    tanggalMasuk: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    bpjsAktif: true,
    rekening: 'BCA - ',
    catatan: '',
  }
  formErrors.value = {}
  isFormModalOpen.value = true
}

const openEditModal = (item) => {
  isEditMode.value = true
  formData.value = { ...item }
  formErrors.value = {}
  isFormModalOpen.value = true
}

const validateForm = () => {
  const errs = {}
  if (!formData.value.nama?.trim()) errs.nama = 'Nama lengkap wajib diisi'
  if (!formData.value.nip?.trim()) errs.nip = 'NIP wajib diisi'
  if (!formData.value.email?.trim()) errs.email = 'Email kantor wajib diisi'
  if (!formData.value.jabatan?.trim()) errs.jabatan = 'Jabatan wajib diisi'
  if (!formData.value.gaji || Number(formData.value.gaji) <= 0) {
    errs.gaji = 'Gaji pokok wajib berupa nominal valid'
  }
  formErrors.value = errs
  return Object.keys(errs).length === 0
}

const handleSaveForm = async () => {
  if (!validateForm()) {
    toast.error('Harap lengkapi formulir dengan data yang valid', 'Validasi Gagal')
    return
  }

  const payload = {
    ...formData.value,
    gaji: Number(formData.value.gaji),
    tunjangan: Number(formData.value.tunjangan) || 0,
    avatar: formData.value.nama
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
  }

  isFormModalOpen.value = false

  if (isEditMode.value) {
    await toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          const idx = listKaryawan.value.findIndex((k) => k.id === payload.id)
          if (idx !== -1) listKaryawan.value[idx] = payload
          resolve(payload)
        }, 800)
      }),
      {
        loading: 'Menyimpan perubahan data...',
        success: `Data pegawai ${payload.nama} berhasil diperbarui!`,
        error: 'Gagal memperbarui data pegawai',
      }
    )
  } else {
    await toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          payload.id = Date.now()
          listKaryawan.value.unshift(payload)
          resolve(payload)
        }, 800)
      }),
      {
        loading: 'Mendaftarkan pegawai baru...',
        success: `Pegawai ${payload.nama} berhasil ditambahkan!`,
        error: 'Gagal menambahkan pegawai',
      }
    )
  }
}

// ========================================================
// 4. DELETE MODAL CONFIRMATION
// ========================================================
const isDeleteModalOpen = ref(false)
const itemToDelete = ref(null)

const openDeleteConfirm = (item) => {
  itemToDelete.value = item
  isDeleteModalOpen.value = true
}

const handleDeleteConfirm = () => {
  if (!itemToDelete.value) return
  const deleted = itemToDelete.value
  listKaryawan.value = listKaryawan.value.filter((k) => k.id !== deleted.id)
  isDeleteModalOpen.value = false
  itemToDelete.value = null
  toast.error(`Pegawai ${deleted.nama} (${deleted.nip}) telah dihapus dari sistem.`, 'Data Dihapus')
}

// Reset Default
const handleResetDefault = () => {
  listKaryawan.value = [...initialKaryawan]
  searchQuery.value = ''
  selectedDivisi.value = 'all'
  selectedStatus.value = 'all'
  sortKey.value = 'gaji'
  sortOrder.value = 'desc'
  currentPage.value = 1
  itemsPerPage.value = 10
  toast.success('Data pegawai dikembalikan ke data awal sistem', 'Data Direset')
}

// Dropdown Action Items for Table Rows
const getRowActionItems = (item) => [
  {
    label: 'Lihat Profil Pegawai',
    icon: Info,
    action: () =>
      toast.info(
        `${item.nama} (${item.jabatan}) - Gaji: ${formatRupiah(item.gaji)}`,
        'Profil Pegawai'
      ),
  },
  {
    label: 'Edit Data',
    icon: Pencil,
    action: () => openEditModal(item),
  },
  {
    label: 'Cetak Slip Gaji',
    icon: FileText,
    action: () =>
      toast.success(
        `Slip gaji periode aktif untuk ${item.nama} siap diunduh.`,
        'Slip Gaji'
      ),
  },
  {
    label: 'Duplikasi Pegawai',
    icon: Plus,
    action: () => {
      const copy = { ...item, id: Date.now(), nama: `${item.nama} (Salinan)` }
      listKaryawan.value.unshift(copy)
      toast.success(`Berhasil menduplikasi data ${item.nama}`, 'Duplikasi')
    },
  },
  { divider: true },
  {
    label: 'Hapus Pegawai',
    icon: Trash2,
    danger: true,
    action: () => openDeleteConfirm(item),
  },
]
</script>

<template>
  <!-- Main View Container: h-full flex flex-col min-h-0 overflow-hidden agar Layer 2 tidak scroll -->
  <div class="h-full flex flex-col min-h-0 overflow-hidden gap-2.5 w-full max-w-7xl mx-auto select-none">
    
    <!-- Top Compact Header: Title & Action Buttons -->
    <div class="flex items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-[#27272a] shrink-0">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shrink-0 shadow-2xs">
          <Users class="w-4 h-4" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-[#f4f4f5] leading-none truncate">
              Data Karyawan & Payroll
            </h1>
            <BaseBadge variant="success" size="sm">
              {{ listKaryawan.length }} Pegawai
            </BaseBadge>
          </div>
          <p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
            Pengelolaan data sumber daya manusia, jabatan, struktur divisi, serta kompensasi payroll.
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <BaseButton variant="outline" size="sm" @click="handleResetDefault" title="Kembalikan data default">
          <RotateCcw class="w-3.5 h-3.5 text-neutral-500" />
          <span class="hidden sm:inline">Reset</span>
        </BaseButton>

        <BaseButton variant="primary" size="sm" @click="openAddModal">
          <Plus class="w-3.5 h-3.5" />
          <span>Tambah</span>
        </BaseButton>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- BARIS 1 (SESUAI WIREFRAME): [SEARCH] [FILTER 1] [FILTER 2] -->
    <!-- ======================================================== -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama pegawai, NIP, jabatan, atau divisi..."
          class="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-[#333338] transition shadow-2xs"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- FILTER 1: Dropdown Searchable Divisi -->
      <div class="w-full sm:w-56 shrink-0">
        <BaseSearchableSelect
          v-model="selectedDivisi"
          :options="divisiOptions"
          placeholder="Semua Divisi"
          search-placeholder="Cari divisi..."
          :leading-icon="Building2"
          clear-value="all"
          clearable
        />
      </div>

      <!-- FILTER 2: Dropdown Status Kerja -->
      <div class="w-full sm:w-52 shrink-0">
        <BaseSearchableSelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="Semua Status"
          :searchable="false"
          :leading-icon="Briefcase"
          align="right"
          clear-value="all"
        />
      </div>
    </div>

    <!-- Garis Pembatas -->
    <div class="border-b border-neutral-200 dark:border-[#27272a] shrink-0" />

    <!-- ======================================================== -->
    <!-- BARIS 2 (SESUAI WIREFRAME): 4 COMPACT ICON STAT PILLS   -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
      <!-- Pill 1: Total Karyawan -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-[#202024] text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
          <Users class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-neutral-400 tracking-wider whitespace-nowrap">Total:</span>
          <span class="font-bold text-neutral-900 dark:text-white truncate">{{ listKaryawan.length }} Pegawai</span>
        </div>
      </div>

      <!-- Pill 2: Total Payroll -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Coins class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-emerald-400/80 tracking-wider whitespace-nowrap">Payroll:</span>
          <span class="font-bold text-emerald-600 dark:text-emerald-400 truncate">{{ formatRupiah(totalPayroll) }}</span>
        </div>
      </div>

      <!-- Pill 3: Karyawan Tetap -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
          <CheckCircle2 class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-sky-400/80 tracking-wider whitespace-nowrap">Tetap:</span>
          <span class="font-bold text-sky-600 dark:text-sky-400 truncate">{{ totalTetap }} Orang</span>
        </div>
      </div>

      <!-- Pill 4: Kontrak & Probasi -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Clock class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-amber-400/80 tracking-wider whitespace-nowrap">Kontrak:</span>
          <span class="font-bold text-amber-600 dark:text-amber-400 truncate">{{ totalKontrak }} Orang</span>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- DESKTOP TABLE VIEW: FIX HEIGHT / SCROLL DI DALAM        -->
    <!-- ======================================================== -->
    <div class="hidden md:flex flex-1 min-h-0 flex-col rounded-2xl border border-neutral-200 dark:border-[#27272a] bg-white dark:bg-[#141417] shadow-2xs overflow-hidden">
      <!-- Area Scroll Mandiri -->
      <div class="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <!-- STICKY THEAD -->
          <thead class="sticky top-0 z-20 bg-neutral-100/95 dark:bg-[#18181b]/95 backdrop-blur-md border-b border-neutral-200 dark:border-[#27272a] shadow-2xs">
            <tr class="text-neutral-600 dark:text-neutral-400 font-semibold select-none text-[11px] uppercase tracking-wider">
              <th class="py-2.5 px-3.5 text-center w-12">No</th>

              <!-- Nama & NIP -->
              <th class="py-2.5 px-3 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition" @click="handleSort('nama')">
                <div class="flex items-center gap-1.5">
                  <span>Pegawai</span>
                  <ArrowUp v-if="sortKey === 'nama' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                  <ArrowDown v-else-if="sortKey === 'nama' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 opacity-40" />
                </div>
              </th>

              <!-- Jabatan & Divisi -->
              <th class="py-2.5 px-3 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition" @click="handleSort('divisi')">
                <div class="flex items-center gap-1.5">
                  <span>Jabatan & Divisi</span>
                  <ArrowUp v-if="sortKey === 'divisi' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                  <ArrowDown v-else-if="sortKey === 'divisi' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 opacity-40" />
                </div>
              </th>

              <!-- Gaji Pokok -->
              <th class="py-2.5 px-3 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition" @click="handleSort('gaji')">
                <div class="flex items-center gap-1.5">
                  <span>Gaji Pokok</span>
                  <ArrowUp v-if="sortKey === 'gaji' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                  <ArrowDown v-else-if="sortKey === 'gaji' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 opacity-40" />
                </div>
              </th>

              <!-- Status Kerja -->
              <th class="py-2.5 px-3 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition" @click="handleSort('status')">
                <div class="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUp v-if="sortKey === 'status' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                  <ArrowDown v-else-if="sortKey === 'status' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 opacity-40" />
                </div>
              </th>

              <!-- Lokasi Kantor -->
              <th class="py-2.5 px-3">Lokasi</th>

              <!-- BPJS -->
              <th class="py-2.5 px-3 text-center">Asuransi</th>

              <th class="py-2.5 px-4 text-right w-24">Aksi</th>
            </tr>
          </thead>

          <!-- TABLE BODY -->
          <tbody class="divide-y divide-neutral-200/70 dark:divide-[#242428]">
            <tr
              v-for="(item, idx) in paginatedList"
              :key="item.id"
              class="hover:bg-neutral-50/80 dark:hover:bg-[#18181c] transition-colors"
            >
              <!-- No -->
              <td class="py-2.5 px-3.5 text-center font-bold text-neutral-400 text-xs">
                {{ (itemsPerPage === 'all' ? 0 : (currentPage - 1) * Number(itemsPerPage)) + idx + 1 }}
              </td>

              <!-- Pegawai (Avatar + Nama + NIP) -->
              <td class="py-2.5 px-3 whitespace-nowrap">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-[#222228] border border-neutral-200/80 dark:border-[#2e2e36] text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center shrink-0">
                    {{ item.avatar }}
                  </div>
                  <div class="min-w-0">
                    <span class="font-semibold text-neutral-900 dark:text-white block leading-tight truncate">
                      {{ item.nama }}
                    </span>
                    <span class="text-[10.5px] font-mono text-neutral-400 block mt-0.5">
                      {{ item.nip }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Jabatan & Divisi -->
              <td class="py-2.5 px-3 whitespace-nowrap">
                <span class="font-medium text-neutral-800 dark:text-neutral-200 block leading-tight">
                  {{ item.jabatan }}
                </span>
                <span class="text-[10.5px] text-neutral-400 block mt-0.5">
                  {{ item.divisi }}
                </span>
              </td>

              <!-- Gaji Pokok & Tunjangan -->
              <td class="py-2.5 px-3 whitespace-nowrap">
                <span class="font-bold text-neutral-900 dark:text-white font-mono block leading-tight">
                  {{ formatRupiah(item.gaji) }}
                </span>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">
                  +{{ formatRupiah(item.tunjangan) }} tunj.
                </span>
              </td>

              <!-- Status Kerja BaseBadge -->
              <td class="py-2.5 px-3 whitespace-nowrap">
                <BaseBadge
                  :variant="getStatusBadgeVariant(item.status)"
                  :dot="item.status === 'Tetap' || item.status === 'Kontrak'"
                  :pulse="item.status === 'Tetap'"
                >
                  {{ item.status }}
                </BaseBadge>
              </td>

              <!-- Lokasi -->
              <td class="py-2.5 px-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                <div class="flex items-center gap-1.5">
                  <MapPin class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{{ item.lokasi }}</span>
                </div>
              </td>

              <!-- BPJS Aktif BaseBadge -->
              <td class="py-2.5 px-3 text-center whitespace-nowrap">
                <BaseBadge :variant="item.bpjsAktif ? 'success' : 'neutral'" size="sm">
                  {{ item.bpjsAktif ? 'BPJS Aktif' : 'Non-BPJS' }}
                </BaseBadge>
              </td>

              <!-- Aksi -->
              <td class="py-2.5 px-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    @click="openEditModal(item)"
                    class="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-[#222226] transition cursor-pointer"
                    title="Edit Pegawai"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <BaseDropdownMenu :items="getRowActionItems(item)" align="right" />
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="processedList.length === 0">
              <td colspan="8" class="py-12 text-center text-neutral-400">
                <div class="flex flex-col items-center justify-center space-y-2">
                  <Users class="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                  <p class="font-medium">Tidak ada data pegawai yang sesuai</p>
                  <BaseButton variant="outline" size="sm" @click="searchQuery = ''; selectedDivisi = 'all'; selectedStatus = 'all'">
                    Bersihkan Filter
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer: BasePagination -->
      <div class="py-2.5 px-4 border-t border-neutral-200 dark:border-[#27272a] bg-neutral-50/70 dark:bg-[#121214] shrink-0">
        <BasePagination
          v-model:current-page="currentPage"
          :total-items="processedList.length"
          v-model:items-per-page="itemsPerPage"
          :per-page-options="[10, 20, 30, 'all']"
        />
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MOBILE CARD LIST COMPACT (< md)                          -->
    <!-- ======================================================== -->
    <div class="md:hidden flex-1 min-h-0 flex flex-col overflow-hidden">
      <div class="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
        <div
          v-for="(item, idx) in paginatedList"
          :key="item.id"
          class="p-3.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-xs space-y-3"
        >
          <!-- Top Row: Avatar, Nama, Status -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-[#202024] font-bold text-xs flex items-center justify-center shrink-0">
                {{ item.avatar }}
              </div>
              <div>
                <h3 class="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                  {{ item.nama }}
                </h3>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[10.5px] font-mono text-neutral-400">{{ item.nip }}</span>
                  <span class="text-neutral-300">&bull;</span>
                  <span class="text-[10.5px] text-neutral-500">{{ item.divisi }}</span>
                </div>
              </div>
            </div>

            <BaseBadge
              :variant="getStatusBadgeVariant(item.status)"
              size="sm"
              :dot="item.status === 'Tetap'"
              :pulse="item.status === 'Tetap'"
            >
              {{ item.status }}
            </BaseBadge>
          </div>

          <!-- Detail Gaji & Lokasi -->
          <div class="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#18181c] text-xs flex items-center justify-between border border-neutral-100 dark:border-[#222226]">
            <div>
              <span class="text-[9.5px] uppercase font-bold text-neutral-400 block">Gaji Pokok</span>
              <span class="font-bold text-neutral-900 dark:text-white font-mono">{{ formatRupiah(item.gaji) }}</span>
            </div>
            <div class="text-right">
              <span class="text-[9.5px] uppercase font-bold text-neutral-400 block">Penempatan</span>
              <span class="text-neutral-700 dark:text-neutral-300">{{ item.lokasi }}</span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-100 dark:border-[#202024]">
            <button
              type="button"
              @click="openEditModal(item)"
              class="w-full py-1.5 px-3 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-[#2a2a30] bg-white hover:bg-neutral-50 dark:bg-[#1a1a1e] dark:hover:bg-[#222228] text-neutral-700 dark:text-neutral-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Pencil class="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              @click="openDeleteConfirm(item)"
              class="w-full py-1.5 px-3 rounded-xl text-xs font-semibold border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/60 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>

        <!-- Empty State Mobile -->
        <div v-if="processedList.length === 0" class="p-8 text-center rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] space-y-3">
          <Users class="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto" />
          <p class="text-xs text-neutral-400">Tidak ada data pegawai yang sesuai.</p>
        </div>
      </div>

      <!-- Mobile Pagination -->
      <div v-if="totalPages > 1 && itemsPerPage !== 'all'" class="pt-2 shrink-0">
        <BasePagination
          v-model:current-page="currentPage"
          :total-items="processedList.length"
          v-model:items-per-page="itemsPerPage"
          :per-page-options="[10, 20, 30, 'all']"
          compact
        />
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL FORM CRUD: TAMBAH & EDIT PEGAWAI                   -->
    <!-- Terintegrasi BaseInput, BaseTextarea, BaseSwitch, dll.   -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="isFormModalOpen"
      :title="isEditMode ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'"
      :subtitle="isEditMode ? 'Perbarui informasi gaji dan jabatan pegawai' : 'Masukkan informasi lengkap pegawai ke sistem payroll'"
      size="lg"
    >
      <form @submit.prevent="handleSaveForm" class="space-y-4 py-1">
        <!-- Baris 1: Nama & NIP -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <BaseInput
            v-model="formData.nama"
            label="Nama Lengkap Pegawai"
            required
            placeholder="Contoh: Rizky Pratama"
            :error="formErrors.nama"
            clearable
          />

          <BaseInput
            v-model="formData.nip"
            label="Nomor Induk Pegawai (NIP)"
            required
            placeholder="EMP-2024-025"
            :error="formErrors.nip"
          />
        </div>

        <!-- Baris 2: Email & Nomor WhatsApp -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <BaseInput
            v-model="formData.email"
            type="email"
            label="Email Kantor"
            required
            placeholder="nama@digaji.id"
            :error="formErrors.email"
            :leading-icon="Mail"
          />

          <BaseInput
            v-model="formData.telepon"
            type="tel"
            label="Nomor WhatsApp"
            placeholder="0812-3456-7890"
            :leading-icon="Phone"
          />
        </div>

        <!-- Baris 3: Jabatan, Divisi & Status Kerja -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <BaseInput
            v-model="formData.jabatan"
            label="Jabatan / Posisi"
            required
            placeholder="Lead Frontend Engineer"
            :error="formErrors.jabatan"
          />

          <div>
            <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Divisi / Departemen
            </label>
            <select
              v-model="formData.divisi"
              class="w-full h-9.5 px-3 py-2 rounded-xl text-xs border border-neutral-300 dark:border-[#27272a] bg-neutral-50 dark:bg-[#18181b] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-400 cursor-pointer"
            >
              <option value="Teknologi & IT">Teknologi & IT</option>
              <option value="Desain & Kreatif">Desain & Kreatif</option>
              <option value="Keuangan & Pajak">Keuangan & Pajak</option>
              <option value="SDM & HR">SDM & HR</option>
              <option value="Pemasaran & Bisnis">Pemasaran & Bisnis</option>
              <option value="Operasional">Operasional</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Status Kerja
            </label>
            <select
              v-model="formData.status"
              class="w-full h-9.5 px-3 py-2 rounded-xl text-xs border border-neutral-300 dark:border-[#27272a] bg-neutral-50 dark:bg-[#18181b] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-400 cursor-pointer"
            >
              <option value="Tetap">Tetap</option>
              <option value="Kontrak">Kontrak</option>
              <option value="Probasi">Probasi</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>
        </div>

        <!-- Baris 4: Kompensasi Payroll (Gaji & Tunjangan) dengan Auto Rupiah -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <BaseCurrencyInput
            v-model="formData.gaji"
            label="Gaji Pokok"
            required
            suffix="/ bln"
            placeholder="15.000.000"
            :error="formErrors.gaji"
            terbilang
          />

          <BaseCurrencyInput
            v-model="formData.tunjangan"
            label="Tunjangan Kinerja"
            suffix="/ bln"
            placeholder="2.500.000"
          />

          <BaseInput
            v-model="formData.lokasi"
            label="Lokasi Penempatan"
            placeholder="Jakarta Selatan"
            :leading-icon="MapPin"
          />
        </div>

        <!-- Baris 5: Rekening Payroll -->
        <BaseInput
          v-model="formData.rekening"
          label="Nomor Rekening Payroll"
          placeholder="BCA - 8820194812"
          :leading-icon="CreditCard"
        />

        <!-- Baris 6: Catatan Karyawan (BaseTextarea) -->
        <BaseTextarea
          v-model="formData.catatan"
          label="Catatan & Ringkasan Performa"
          placeholder="Tuliskan keahlian teknis atau catatan HR..."
          :rows="2"
          :maxlength="250"
        />

        <!-- Baris 7: Switch BPJS Asuransi (BaseSwitch) -->
        <div class="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#18181c] border border-neutral-200/80 dark:border-[#26262a]">
          <BaseSwitch
            v-model="formData.bpjsAktif"
            label="Kepesertaan BPJS Ketenagakerjaan & Kesehatan"
            description="Aktifkan pemotongan premi asuransi resmi dan jaminan pensiun."
          />
        </div>
      </form>

      <template #footer="{ close }">
        <BaseButton variant="outline" size="sm" @click="close">
          Batal
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="handleSaveForm">
          <Check class="w-3.5 h-3.5" />
          <span>{{ isEditMode ? 'Simpan Perubahan' : 'Daftarkan Pegawai' }}</span>
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Confirmation Modal Delete -->
    <ConfirmationModal
      v-model="isDeleteModalOpen"
      type="delete"
      badge-text="Confirmation — Hapus Pegawai"
      :title="`Hapus Data ${itemToDelete?.nama || 'Pegawai'}?`"
      :message="`Data pegawai ${itemToDelete?.nama || ''} (${itemToDelete?.nip || ''} - ${itemToDelete?.jabatan || ''}) akan dihapus secara permanen dari basis data payroll.`"
      confirm-text="Ya, Hapus"
      cancel-text="Batal"
      @confirm="handleDeleteConfirm"
      @cancel="itemToDelete = null"
    />
  </div>
</template>

