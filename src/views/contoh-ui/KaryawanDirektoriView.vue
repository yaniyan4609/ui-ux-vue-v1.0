<script setup>
import { ref, computed, watch } from 'vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import ConfirmationModal from '../../components/ui/ConfirmationModal.vue'
import BaseSearchableSelect from '../../components/ui/BaseSearchableSelect.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseCurrencyInput from '../../components/ui/BaseCurrencyInput.vue'
import BaseTextarea from '../../components/ui/BaseTextarea.vue'
import BaseSwitch from '../../components/ui/BaseSwitch.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import BaseDropdownMenu from '../../components/ui/BaseDropdownMenu.vue'
import BaseSlideOver from '../../components/ui/BaseSlideOver.vue'
import BaseCsvImporter from '../../components/ui/BaseCsvImporter.vue'
import BaseFileUploader from '../../components/ui/BaseFileUploader.vue'
import BaseCheckbox from '../../components/ui/BaseCheckbox.vue'
import BaseMultiSelect from '../../components/ui/BaseMultiSelect.vue'
import BaseDataTable from '../../components/ui/BaseDataTable.vue'
import BaseFormField from '../../components/ui/BaseFormField.vue'
import BaseAvatar from '../../components/ui/BaseAvatar.vue'
import BaseDescriptionList from '../../components/ui/BaseDescriptionList.vue'
import BaseDocumentList from '../../components/ui/BaseDocumentList.vue'
import BaseGallery from '../../components/ui/BaseGallery.vue'
import { useToast } from '../../composables/useToast'
import { karyawanList } from '../../data/karyawanData'
import { hrisEmployeeList } from '../../data/hrisEmployeeData'
import { formatRupiah } from '../../utils/format.js'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  MapPin,
  Check,
  X,
  Coins,
  CheckCircle2,
  Clock,
  Wallet,
  Shield,
  FileText,
  Image as ImageIcon,
  Building2,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  HeartPulse,
  Upload,
  Download,
  Eye,
  Briefcase,
} from 'lucide-vue-next'

const toast = useToast()

// ========================================================
// 1. DATA MASTER & STATE PEGAWAI (24 KARYAWAN)
// ========================================================
const initialKaryawan = karyawanList
const listKaryawan = ref([...karyawanList])

// ========================================================
// 2. FILTER, PENCARIAN & SORTING
// ========================================================
const searchQuery = ref('')
const selectedDivisi = ref('all')
const selectedStatus = ref('all')

const sortKey = ref('gaji')
const sortOrder = ref('desc')

const currentPage = ref(1)
const itemsPerPage = ref(10)

// Multi-select & Batch Actions State
const selectedIds = ref([])
const isBatchDeleteModalOpen = ref(false)

// Dropdown Options: form tambah/edit karyawan
const formDivisiOptions = [
  { value: 'Teknologi & IT', label: 'Teknologi & IT' },
  { value: 'Desain & Kreatif', label: 'Desain & Kreatif' },
  { value: 'Keuangan & Pajak', label: 'Keuangan & Pajak' },
  { value: 'SDM & HR', label: 'SDM & HR' },
  { value: 'Pemasaran & Bisnis', label: 'Pemasaran & Bisnis' },
  { value: 'Operasional', label: 'Operasional' },
]

const formStatusOptions = [
  { value: 'Tetap', label: 'Tetap' },
  { value: 'Kontrak', label: 'Kontrak' },
  { value: 'Probasi', label: 'Probasi' },
  { value: 'Freelance', label: 'Freelance' },
]

// Opsi Multi-Select Fasilitas & Benefit Pegawai
const formFasilitasOptions = [
  { value: 'BPJS Kesehatan', label: 'BPJS Kesehatan', badge: 'Wajib' },
  { value: 'BPJS Ketenagakerjaan', label: 'BPJS Ketenagakerjaan', badge: 'Wajib' },
  { value: 'Asuransi Swasta', label: 'Asuransi Kesehatan Swasta' },
  { value: 'Laptop Kerja', label: 'Fasilitas Laptop / MacBook' },
  { value: 'Tunjangan Transport', label: 'Tunjangan Transport & Makan' },
  { value: 'Work From Anywhere', label: 'Fleksibilitas WFA / Hybrid' },
]

// Konfigurasi Kolom BaseDataTable (Sesuai Layout DataKaryawanView & Screenshot)
const tableColumns = [
  { key: 'nama', label: 'Pegawai', sortable: true, cellClass: 'whitespace-nowrap' },
  { key: 'divisi', label: 'Jabatan & Divisi', sortable: true, cellClass: 'whitespace-nowrap' },
  { key: 'gaji', label: 'Gaji Pokok', sortable: true, cellClass: 'whitespace-nowrap' },
  { key: 'status', label: 'Status', sortable: true, cellClass: 'whitespace-nowrap' },
  { key: 'lokasi', label: 'Lokasi', sortable: false, cellClass: 'whitespace-nowrap text-neutral-600 dark:text-neutral-400' },
  { key: 'bpjsAktif', label: 'Asuransi', sortable: false, align: 'center', cellClass: 'whitespace-nowrap' },
]

// Dropdown Options: Divisi dengan Badge Counter
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

// Dropdown Options: Status Kerja dengan Badge Counter
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
        (k.email && k.email.toLowerCase().includes(q)) ||
        (k.lokasi && k.lokasi.toLowerCase().includes(q)) ||
        (k.divisi && k.divisi.toLowerCase().includes(q))
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

const paginatedList = computed(() => {
  if (itemsPerPage.value === 'all') return processedList.value
  const start = (currentPage.value - 1) * Number(itemsPerPage.value)
  return processedList.value.slice(start, start + Number(itemsPerPage.value))
})

// Stats Summary Calculations (Total Rp 414.600.000, 16 Tetap, 7 Kontrak)
const totalPayroll = computed(() => {
  return listKaryawan.value.reduce((acc, k) => acc + (k.gaji || 0) + (k.tunjangan || 0), 0)
})

const totalTetap = computed(() => {
  return listKaryawan.value.filter((k) => k.status === 'Tetap').length
})

const totalKontrak = computed(() => {
  return listKaryawan.value.filter((k) => k.status === 'Kontrak' || k.status === 'Probasi').length
})

const getStatusBadgeVariant = (status) => {
  const map = {
    Tetap: 'success',
    Kontrak: 'warning',
    Probasi: 'info',
    Freelance: 'purple',
  }
  return map[status] || 'neutral'
}

// Reset Filter
const handleResetDefault = () => {
  searchQuery.value = ''
  selectedDivisi.value = 'all'
  selectedStatus.value = 'all'
  sortKey.value = 'gaji'
  sortOrder.value = 'desc'
  currentPage.value = 1
  selectedIds.value = []
  listKaryawan.value = [...initialKaryawan]
  toast.info('Data dan filter telah dikembalikan ke pengaturan awal.', 'Reset Berhasil')
}

// ========================================================
// 3. EXPORT CSV & BATCH ACTIONS
// ========================================================
const exportToCSV = (items = listKaryawan.value, filename = 'data-pegawai-digaji.csv') => {
  if (!items || items.length === 0) {
    toast.error('Tidak ada data untuk diekspor')
    return
  }

  const headers = ['NIP', 'Nama Pegawai', 'Email', 'No Telepon', 'Divisi', 'Jabatan', 'Gaji Pokok', 'Tunjangan', 'Status', 'Lokasi', 'Tanggal Masuk', 'BPJS']
  const rows = items.map((k) => [
    `"${k.nip || ''}"`,
    `"${k.nama || ''}"`,
    `"${k.email || ''}"`,
    `"${k.telepon || ''}"`,
    `"${k.divisi || ''}"`,
    `"${k.jabatan || ''}"`,
    k.gaji || 0,
    k.tunjangan || 0,
    `"${k.status || ''}"`,
    `"${k.lokasi || ''}"`,
    `"${k.tanggalMasuk || ''}"`,
    k.bpjsAktif ? 'Aktif' : 'Tidak',
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success(`Berhasil mengunduh ${items.length} data pegawai ke file CSV!`, 'Ekspor CSV')
}

const exportSelected = () => {
  const items = listKaryawan.value.filter((k) => selectedIds.value.includes(k.id))
  exportToCSV(items, `data-pegawai-terpilih-${items.length}.csv`)
}

const handleBatchDeleteConfirm = () => {
  const count = selectedIds.value.length
  listKaryawan.value = listKaryawan.value.filter((k) => !selectedIds.value.includes(k.id))
  selectedIds.value = []
  isBatchDeleteModalOpen.value = false
  toast.error(`${count} pegawai terpilih telah dihapus dari sistem.`, 'Hapus Massal')
}

// ========================================================
// 4. RESOLVER PROFIL KARYAWAN LENGKAP (6 TAB HRIS)
// ========================================================
const resolveEmployeeFullProfile = (emp) => {
  if (!emp) return null

  // Cek apakah ada record lengkap di hrisEmployeeList
  const matched = hrisEmployeeList.find((h) => h.nip === emp.nip || h.id === emp.id)
  if (matched) {
    return {
      ...matched,
      gaji: emp.gaji || matched.payroll?.gajiPokok || 15000000,
      tunjangan: emp.tunjangan || matched.payroll?.tunjanganJabatan || 2500000,
      divisi: emp.divisi || matched.divisi,
      jabatan: emp.jabatan || matched.jabatan,
      status: emp.status || matched.status,
      lokasi: emp.lokasi || matched.cabang || 'Jakarta Selatan',
      bpjsAktif: emp.bpjsAktif ?? true,
    }
  }

  // Generasi profile fallback yang realistis dan lengkap untuk seluruh 24 pegawai
  const cleanName = emp.nama.replace(/,.*$/, '')
  const names = cleanName.split(' ')
  const initials = emp.avatar || names.map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  const gajiPokok = emp.gaji || 15000000
  const tunjangan = emp.tunjangan || 2500000
  const bankName = emp.rekening ? emp.rekening.split(' - ')[0] : 'BCA'
  const rekNo = emp.rekening ? emp.rekening.split(' - ')[1] : `542019${String(emp.id).padStart(4, '0')}`

  return {
    id: emp.id,
    nip: emp.nip,
    nama: emp.nama,
    panggilan: names[0],
    avatar: initials,
    jabatan: emp.jabatan,
    divisi: emp.divisi,
    departemen: emp.divisi,
    cabang: emp.lokasi || 'Kantor Pusat Jakarta',
    lokasi: emp.lokasi || 'Jakarta Selatan',
    status: emp.status,
    statusBadge: emp.status === 'Tetap' ? 'success' : emp.status === 'Kontrak' ? 'warning' : 'info',
    level: 'L2 - Staff Profesional',
    tanggalMasuk: emp.tanggalMasuk || '01 Jan 2023',
    masaKerja: '2 Tahun 4 Bulan',
    gaji: gajiPokok,
    tunjangan: tunjangan,
    bpjsAktif: emp.bpjsAktif ?? true,

    pribadi: {
      nik: `317102${String(emp.id).padStart(2, '0')}059000${emp.id}`,
      npwp: `81.${String(emp.id).padStart(3, '0')}.567.8-012.000`,
      tempatLahir: emp.lokasi || 'Jakarta',
      tanggalLahir: '18 Mei 1993 (31 Tahun)',
      jenisKelamin: ['AP', 'RK', 'JT', 'SR', 'DK', 'NP'].includes(initials) ? 'Perempuan' : 'Laki-Laki',
      agama: 'Islam',
      statusPernikahan: 'Kawin (K/1)',
      ptkp: 'K/1 (Penghasilan Tidak Kena Pajak)',
      emailKantor: emp.email || `${cleanName.toLowerCase().replace(/\s+/g, '.')}@digaji.id`,
      emailPribadi: `${cleanName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      telepon: emp.telepon || '0812-3456-7890',
      alamatKtp: `Jl. Melati No. ${emp.id * 5}, ${emp.lokasi || 'Jakarta'}`,
      alamatDomisili: `Jl. Melati No. ${emp.id * 5}, ${emp.lokasi || 'Jakarta'} (Sesuai KTP)`,
      kontakDaruratNama: 'Keluarga Kandung',
      kontakDaruratHubungan: 'Pasangan / Orang Tua',
      kontakDaruratTelp: '0812-9988-7711',
      pendidikanTerakhir: 'S1 Teknik / Ekonomi - Universitas Terkemuka',
    },

    presensi: {
      kehadiranBulanIni: '96.5%',
      tepatWaktu: 21,
      terlambat: 1,
      cuti: 0,
      sakit: 0,
      alpha: 0,
      totalJamKerja: '172 Jam',
      jadwalShift: 'Reguler Pagi (08:00 - 17:00 WIB)',
      toleransiTelat: '15 Menit',
      riwayatTerbaru: [
        { tgl: '10 Nov 2026', masuk: '07:55 WIB', pulang: '17:05 WIB', status: 'Tepat Waktu', lokasi: `${emp.lokasi || 'Jakarta'} (Radius 12m)` },
        { tgl: '09 Nov 2026', masuk: '08:01 WIB', pulang: '17:10 WIB', status: 'Tepat Waktu', lokasi: `${emp.lokasi || 'Jakarta'} (Radius 10m)` },
        { tgl: '08 Nov 2026', masuk: '08:18 WIB', pulang: '17:25 WIB', status: 'Terlambat 18m', lokasi: `${emp.lokasi || 'Jakarta'} (Radius 18m)` },
        { tgl: '07 Nov 2026', masuk: '07:50 WIB', pulang: '17:00 WIB', status: 'Tepat Waktu', lokasi: `${emp.lokasi || 'Jakarta'} (Radius 15m)` },
        { tgl: '06 Nov 2026', masuk: '07:58 WIB', pulang: '17:02 WIB', status: 'Tepat Waktu', lokasi: `${emp.lokasi || 'Jakarta'} (Radius 11m)` },
      ],
    },

    payroll: {
      gajiPokok: gajiPokok,
      tunjanganJabatan: tunjangan,
      tunjanganMakanTransport: 1500000,
      upahLemburEstimasi: 500000,
      potonganBpjs: Math.round(gajiPokok * 0.04),
      potonganPph21: Math.round(gajiPokok * 0.05),
      netSalaryEstimasi: gajiPokok + tunjangan + 1500000 - Math.round(gajiPokok * 0.09),
      bank: bankName,
      rekeningNomor: rekNo,
      rekeningNama: emp.nama,
      metodePajak: 'TER Kategori A (Gross-Up Perusahaan)',
    },

    bpjs: {
      bpjsTkNomor: `01928374${String(emp.id).padStart(3, '0')}`,
      bpjsTkStatus: emp.bpjsAktif ? 'Aktif (Perusahaan)' : 'Tidak Aktif',
      bpjsTkProgram: 'JKK, JKM, JHT, JP',
      bpjsKesNomor: `0001928374${String(emp.id).padStart(3, '0')}`,
      bpjsKesStatus: emp.bpjsAktif ? 'Aktif (Kelas 1)' : 'Tidak Aktif',
      faskes1: `Klinik Pratama Sehat ${emp.lokasi || 'Jakarta'}`,
      tanggunganKeluarga: '2 Jiwa (Keluarga Terdaftar)',
    },

    dokumen: [
      { id: `doc-${emp.id}-1`, title: 'Kartu Tanda Penduduk (KTP)', category: 'Identitas', fileNumber: `317102${String(emp.id).padStart(2, '0')}059000${emp.id}`, fileName: `ktp_${cleanName.toLowerCase().replace(/\s+/g, '_')}.pdf`, fileSize: '1.2 MB', updatedAt: emp.tanggalMasuk || '10 Jan 2021', status: 'verified' },
      { id: `doc-${emp.id}-2`, title: 'Nomor Pokok Wajib Pajak (NPWP)', category: 'Pajak', fileNumber: `81.${String(emp.id).padStart(3, '0')}.567.8-012.000`, fileName: `npwp_${cleanName.toLowerCase().replace(/\s+/g, '_')}.pdf`, fileSize: '850 KB', updatedAt: emp.tanggalMasuk || '10 Jan 2021', status: 'verified' },
      { id: `doc-${emp.id}-3`, title: 'Kartu Keluarga (KK)', category: 'Identitas', fileNumber: `317102990119000${emp.id}`, fileName: `kk_${cleanName.toLowerCase().replace(/\s+/g, '_')}.pdf`, fileSize: '1.8 MB', updatedAt: '15 Mar 2022', status: 'verified' },
      { id: `doc-${emp.id}-4`, title: 'Ijazah Pendidikan Terakhir', category: 'Pendidikan', fileNumber: `IJZ-2016-${emp.id * 100}`, fileName: `ijazah_${cleanName.toLowerCase().replace(/\s+/g, '_')}.pdf`, fileSize: '3.1 MB', updatedAt: emp.tanggalMasuk || '10 Jan 2021', status: 'verified' },
      { id: `doc-${emp.id}-5`, title: 'Surat Perjanjian Kerja (Kontrak / Tetap)', category: 'Legalitas', fileNumber: `SK-HRIS/2023/${emp.id}`, fileName: `sk_kerja_${cleanName.toLowerCase().replace(/\s+/g, '_')}.pdf`, fileSize: '2.0 MB', updatedAt: emp.tanggalMasuk || '10 Jan 2021', status: 'verified' },
      { id: `doc-${emp.id}-6`, title: 'Buku Tabungan Rekening Payroll', category: 'Keuangan', fileNumber: `Rek: ${rekNo}`, fileName: `buku_tabungan_${bankName.toLowerCase()}.pdf`, fileSize: '950 KB', updatedAt: emp.tanggalMasuk || '10 Jan 2021', status: 'verified' },
    ],

    galeri: [
      { id: `gal-${emp.id}-1`, title: 'Presensi Masuk (Selfie Liveness)', category: 'absen', categoryLabel: 'Foto Presensi', timestamp: '10 Nov 2026, 07:54 WIB', location: `${emp.lokasi || 'Kantor Pusat'} (Radius 12m)`, imageUrl: '' },
      { id: `gal-${emp.id}-2`, title: 'Presensi Pulang (Selfie Liveness)', category: 'absen', categoryLabel: 'Foto Presensi', timestamp: '09 Nov 2026, 17:15 WIB', location: `${emp.lokasi || 'Kantor Pusat'} (Radius 14m)`, imageUrl: '' },
      { id: `gal-${emp.id}-3`, title: 'Dokumen Surat Keterangan / Izin', category: 'surat', categoryLabel: 'Surat Izin / Cuti', timestamp: '05 Nov 2026', location: 'Disetujui HRD', imageUrl: '' },
      { id: `gal-${emp.id}-4`, title: 'Dokumentasi Aktivitas Kerja Tim', category: 'kerja', categoryLabel: 'Dokumentasi Kerja', timestamp: '01 Nov 2026', location: `Ruang Kerja ${emp.divisi}`, imageUrl: '' },
    ],
  }
}

// ========================================================
// 5. SLIDE-OVER DETAIL PROFIL KARYAWAN TERPADU (6 TAB)
// ========================================================
const isProfileOpen = ref(false)
const selectedProfile = ref(null)
const activeProfileTab = ref('pribadi')

const profileTabs = [
  { value: 'pribadi', label: 'Data Pribadi', icon: Users },
  { value: 'presensi', label: 'Presensi & Shift', icon: Clock },
  { value: 'payroll', label: 'Payroll & Gaji', icon: Wallet },
  { value: 'bpjs', label: 'BPJS & Asuransi', icon: HeartPulse },
  { value: 'dokumen', label: 'Dokumen Digital', icon: FileText },
  { value: 'galeri', label: 'Galeri Foto & Surat', icon: ImageIcon },
]

const openProfile = (emp) => {
  selectedProfile.value = resolveEmployeeFullProfile(emp)
  activeProfileTab.value = 'pribadi'
  isProfileOpen.value = true
}

// Format Data Pribadi untuk BaseDescriptionList
const personalInfoItems = computed(() => {
  if (!selectedProfile.value) return []
  const p = selectedProfile.value.pribadi
  return [
    { label: 'Nomor Induk Kependudukan (NIK)', value: p.nik },
    { label: 'Nomor Pokok Wajib Pajak (NPWP)', value: p.npwp },
    { label: 'Tempat, Tanggal Lahir', value: `${p.tempatLahir}, ${p.tanggalLahir}` },
    { label: 'Jenis Kelamin', value: p.jenisKelamin },
    { label: 'Agama', value: p.agama },
    { label: 'Status Pernikahan & PTKP', value: `${p.statusPernikahan} · ${p.ptkp}` },
    { label: 'Email Kedinasan', value: p.emailKantor },
    { label: 'Email Pribadi', value: p.emailPribadi },
    { label: 'Nomor WhatsApp / Telp', value: p.telepon },
    { label: 'Pendidikan Terakhir', value: p.pendidikanTerakhir },
    { label: 'Alamat KTP', value: p.alamatKtp },
    { label: 'Alamat Domisili Sekarang', value: p.alamatDomisili },
    { label: 'Kontak Darurat', value: `${p.kontakDaruratNama} (${p.kontakDaruratHubungan}) - ${p.kontakDaruratTelp}` },
  ]
})

// Format Data Payroll untuk BaseDescriptionList
const payrollInfoItems = computed(() => {
  if (!selectedProfile.value) return []
  const pay = selectedProfile.value.payroll
  return [
    { label: 'Gaji Pokok Bulanan', value: formatRupiah(pay.gajiPokok) },
    { label: 'Tunjangan Jabatan', value: formatRupiah(pay.tunjanganJabatan) },
    { label: 'Tunjangan Makan & Transport', value: formatRupiah(pay.tunjanganMakanTransport) },
    { label: 'Estimasi Upah Lembur', value: formatRupiah(pay.upahLemburEstimasi) },
    { label: 'Potongan BPJS (TK + Kes)', value: `- ${formatRupiah(pay.potonganBpjs)}` },
    { label: 'Potongan PPh 21 TER', value: `- ${formatRupiah(pay.potonganPph21)}` },
    { label: 'Estimasi Gaji Bersih (Netto)', value: formatRupiah(pay.netSalaryEstimasi) },
    { label: 'Rekening Payroll', value: `${pay.bank} - ${pay.rekeningNomor}` },
    { label: 'Nama Pemilik Rekening', value: pay.rekeningNama },
    { label: 'Skema Perhitungan Pajak', value: pay.metodePajak },
  ]
})

// Format Data BPJS untuk BaseDescriptionList
const bpjsInfoItems = computed(() => {
  if (!selectedProfile.value) return []
  const b = selectedProfile.value.bpjs
  return [
    { label: 'No. Kartu BPJS Ketenagakerjaan', value: b.bpjsTkNomor },
    { label: 'Status Kepesertaan BPJS TK', value: b.bpjsTkStatus },
    { label: 'Program Perlindungan BPJS TK', value: b.bpjsTkProgram },
    { label: 'No. Kartu BPJS Kesehatan', value: b.bpjsKesNomor },
    { label: 'Status BPJS Kesehatan', value: b.bpjsKesStatus },
    { label: 'Fasilitas Kesehatan Tingkat 1 (Faskes)', value: b.faskes1 },
    { label: 'Jumlah Tanggungan Terdaftar', value: b.tanggunganKeluarga },
  ]
})

// Dokumen & Galeri Handlers
const handleDocumentPreview = (doc) => {
  toast.info(`Membuka berkas dokumen: ${doc.title}`, 'Pratinjau Dokumen')
}

const handleDocumentDownload = (doc) => {
  toast.success(`Berkas ${doc.fileName} berhasil diunduh.`, 'Unduh Selesai')
}

const handleDocumentUpload = (doc) => {
  toast.info(`Form unggah dokumen ${doc.title} dibuka.`, 'Unggah Berkas')
}

const handleGalleryDownload = (item) => {
  toast.success(`Foto ${item.title} berhasil diunduh.`, 'Unduh Foto')
}

// ========================================================
// 6. MODAL FORM TAMBAH & EDIT PEGAWAI
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
  tanggalMasuk: '2024-01-01',
  bpjsAktif: true,
  fasilitas: ['BPJS Kesehatan', 'BPJS Ketenagakerjaan', 'Laptop Kerja'],
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
    tanggalMasuk: '2024-01-01',
    bpjsAktif: true,
    fasilitas: ['BPJS Kesehatan', 'BPJS Ketenagakerjaan', 'Laptop Kerja'],
    rekening: 'BCA - ',
    catatan: '',
  }
  formErrors.value = {}
  isFormModalOpen.value = true
}

const openEditModal = (item) => {
  isEditMode.value = true
  formData.value = {
    ...item,
    fasilitas: Array.isArray(item.fasilitas)
      ? [...item.fasilitas]
      : ['BPJS Kesehatan', 'BPJS Ketenagakerjaan', 'Laptop Kerja'],
  }
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
        }, 500)
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
        }, 500)
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
// 7. CONFIRMATION MODALS (DELETE SINGLE & BATCH)
// ========================================================
const isDeleteModalOpen = ref(false)
const itemToDelete = ref(null)

const openDeleteConfirm = (item) => {
  itemToDelete.value = item
  isDeleteModalOpen.value = true
}

const handleDeleteConfirm = () => {
  if (!itemToDelete.value) return
  const name = itemToDelete.value.nama
  listKaryawan.value = listKaryawan.value.filter((k) => k.id !== itemToDelete.value.id)
  selectedIds.value = selectedIds.value.filter((id) => id !== itemToDelete.value.id)
  isDeleteModalOpen.value = false
  toast.error(`Pegawai ${name} telah dihapus dari sistem.`, 'Pegawai Dihapus')
  itemToDelete.value = null
}

// ========================================================
// 8. CSV IMPORTER
// ========================================================
const isCsvImporterOpen = ref(false)
const targetFieldsForImport = [
  { key: 'nip', label: 'NIP Pegawai', required: true },
  { key: 'nama', label: 'Nama Lengkap', required: true },
  { key: 'email', label: 'Email Kantor', required: true },
  { key: 'divisi', label: 'Divisi / Departemen', required: true },
  { key: 'jabatan', label: 'Jabatan / Posisi', required: true },
  { key: 'gaji', label: 'Gaji Pokok (Angka)', required: true },
  { key: 'status', label: 'Status Kerja', required: false },
]

const handleCsvImported = (importedRows) => {
  if (!importedRows || importedRows.length === 0) return

  let count = 0
  importedRows.forEach((row, i) => {
    listKaryawan.value.unshift({
      id: Date.now() + i,
      nip: row.nip || `EMP-2024-${String(listKaryawan.value.length + 1).padStart(3, '0')}`,
      nama: row.nama || 'Pegawai Baru',
      email: row.email || 'pegawai@digaji.id',
      telepon: '0812-3456-7890',
      divisi: row.divisi || 'Teknologi & IT',
      jabatan: row.jabatan || 'Staff Operasional',
      gaji: Number(row.gaji) || 10000000,
      tunjangan: 1500000,
      status: row.status || 'Tetap',
      tanggalMasuk: '2026-01-01',
      lokasi: 'Jakarta Pusat',
      bpjsAktif: true,
      avatar: (row.nama || 'PB')
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    })
    count++
  })

  toast.success(`Berhasil mengimpor ${count} data pegawai baru dari CSV!`, 'Impor CSV Berhasil')
}

// Action items for BaseDropdownMenu
const getRowActionItems = (item) => [
  {
    label: 'Lihat Profil Lengkap',
    icon: Eye,
    action: () => openProfile(item),
  },
  {
    label: 'Ubah Data Pegawai',
    icon: Pencil,
    action: () => openEditModal(item),
  },
  {
    label: 'Unduh Berkas Pegawai',
    icon: Download,
    action: () => toast.info(`Mengunduh berkas arsip pegawai: ${item.nama}`, 'Unduh Berkas'),
  },
  {
    label: 'Hapus dari Sistem',
    icon: Trash2,
    danger: true,
    action: () => openDeleteConfirm(item),
  },
]
</script>

<template>
  <!-- Main View Container: Data View Formula Sesuai DataKaryawanView -->
  <div class="h-full flex flex-col min-h-0 overflow-hidden gap-2.5 w-full max-w-7xl mx-auto select-none relative pb-2">
    
    <!-- ======================================================== -->
    <!-- 1. HEADER HALAMAN: TITLE, COUNT BADGE & ACTION BUTTONS   -->
    <!-- ======================================================== -->
    <div class="flex items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-[var(--theme-border)] shrink-0">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shrink-0 shadow-2xs">
          <Users class="w-4 h-4" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-[var(--theme-text-primary)] leading-none truncate">
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
        <BaseButton variant="outline" size="sm" @click="isCsvImporterOpen = true" title="Impor data dari berkas CSV">
          <Upload class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span class="hidden sm:inline">Impor CSV</span>
        </BaseButton>

        <BaseButton variant="outline" size="sm" @click="exportToCSV()" title="Ekspor seluruh data ke file CSV">
          <Download class="w-3.5 h-3.5 text-neutral-500" />
          <span class="hidden sm:inline">Ekspor CSV</span>
        </BaseButton>

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
    <!-- 2. FILTER BAR: SEARCH + SEARCHABLE SELECT DIVISI & STATUS -->
    <!-- ======================================================== -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama pegawai, NIP, jabatan, atau divisi..."
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

      <!-- Filter Divisi: BaseSearchableSelect -->
      <div class="w-full sm:w-56 shrink-0">
        <BaseSearchableSelect
          v-model="selectedDivisi"
          :options="divisiOptions"
          placeholder="Filter Divisi..."
          clearable
        />
      </div>

      <!-- Filter Status Kerja: BaseSearchableSelect -->
      <div class="w-full sm:w-48 shrink-0">
        <BaseSearchableSelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="Filter Status..."
          align="right"
          clearable
        />
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 3. QUICK STATS SUMMARY STRIP (4 METRICS)                 -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
      <!-- Total Pegawai -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-[var(--theme-surface-muted)] text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
          <Users class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-neutral-400 tracking-wider whitespace-nowrap">Total:</span>
          <span class="font-bold text-neutral-900 dark:text-white truncate">{{ listKaryawan.length }} Pegawai</span>
        </div>
      </div>

      <!-- Payroll Bulanan -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Coins class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-emerald-400/80 tracking-wider whitespace-nowrap">Payroll:</span>
          <span class="font-bold text-emerald-600 dark:text-emerald-400 truncate">{{ formatRupiah(totalPayroll) }}</span>
        </div>
      </div>

      <!-- Karyawan Tetap -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
          <CheckCircle2 class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-center gap-1.5 min-w-0 truncate text-xs">
          <span class="text-[10px] uppercase font-bold text-sky-400/80 tracking-wider whitespace-nowrap">Tetap:</span>
          <span class="font-bold text-sky-600 dark:text-sky-400 truncate">{{ totalTetap }} Orang</span>
        </div>
      </div>

      <!-- Karyawan Kontrak & Probasi -->
      <div class="h-9 px-2.5 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-2">
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
    <!-- 4. BASE DATA TABLE (DESKTOP + MOBILE + BULK ACTION BAR)  -->
    <!-- ======================================================== -->
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
      selected-label="Pegawai Terpilih"
      empty-title="Data Pegawai Tidak Ditemukan"
      empty-description="Tidak ada karyawan yang cocok dengan kriteria filter atau pencarian Anda."
      empty-action-text="Reset Filter Pencarian"
      @empty-action="handleResetDefault"
    >
      <!-- Kolom Pegawai (Avatar + Nama + NIP) -->
      <template #cell-nama="{ row }">
        <div class="flex items-center gap-2.5 cursor-pointer group" @click="openProfile(row)">
          <div class="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-[var(--theme-surface-muted)] border border-neutral-200/80 dark:border-[var(--theme-border-strong)] text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center shrink-0 group-hover:border-[var(--theme-primary)] transition">
            {{ row.avatar }}
          </div>
          <div class="min-w-0">
            <span class="font-semibold text-neutral-900 dark:text-white block leading-tight truncate group-hover:text-[var(--theme-primary)] transition">
              {{ row.nama }}
            </span>
            <span class="text-[10.5px] font-mono text-neutral-400 block mt-0.5">
              {{ row.nip }}
            </span>
          </div>
        </div>
      </template>

      <!-- Kolom Jabatan & Divisi -->
      <template #cell-divisi="{ row }">
        <span class="font-medium text-neutral-800 dark:text-neutral-200 block leading-tight">
          {{ row.jabatan }}
        </span>
        <span class="text-[10.5px] text-neutral-400 block mt-0.5">
          {{ row.divisi }}
        </span>
      </template>

      <!-- Kolom Gaji Pokok & Tunjangan -->
      <template #cell-gaji="{ row }">
        <span class="font-bold text-neutral-900 dark:text-white font-mono block leading-tight">
          {{ formatRupiah(row.gaji) }}
        </span>
        <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">
          +{{ formatRupiah(row.tunjangan) }} tunj.
        </span>
      </template>

      <!-- Kolom Status Kerja BaseBadge -->
      <template #cell-status="{ row }">
        <BaseBadge
          :variant="getStatusBadgeVariant(row.status)"
          :dot="row.status === 'Tetap' || row.status === 'Kontrak'"
          :pulse="row.status === 'Tetap'"
        >
          {{ row.status }}
        </BaseBadge>
      </template>

      <!-- Kolom Lokasi -->
      <template #cell-lokasi="{ row }">
        <div class="flex items-center gap-1.5">
          <MapPin class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span>{{ row.lokasi }}</span>
        </div>
      </template>

      <!-- Kolom BPJS Aktif BaseBadge -->
      <template #cell-bpjsAktif="{ row }">
        <BaseBadge :variant="row.bpjsAktif ? 'success' : 'neutral'" size="sm">
          {{ row.bpjsAktif ? 'BPJS Aktif' : 'Non-BPJS' }}
        </BaseBadge>
      </template>

      <!-- Kolom Aksi -->
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-1">
          <button
            type="button"
            @click="openProfile(row)"
            class="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-[var(--theme-surface-muted)] transition cursor-pointer"
            title="Lihat Profil Lengkap"
          >
            <Pencil class="w-3.5 h-3.5" />
          </button>
          <BaseDropdownMenu :items="getRowActionItems(row)" align="right" />
        </div>
      </template>

      <!-- Kartu Mobile -->
      <template #mobile-card="{ row, isSelected, toggleSelect: onToggleSelect }">
        <div
          class="p-3.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-xs space-y-3"
          :class="isSelected ? 'ring-2 ring-[var(--theme-primary)]' : ''"
        >
          <!-- Top Row: Checkbox, Avatar, Nama, Status -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <BaseCheckbox
                :model-value="isSelected"
                size="sm"
                class="mt-0.5"
                @change="onToggleSelect"
              />
              <div class="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-[var(--theme-surface-muted)] font-bold text-xs flex items-center justify-center shrink-0">
                {{ row.avatar }}
              </div>
              <div>
                <h3 class="text-sm font-bold text-neutral-900 dark:text-white leading-tight cursor-pointer" @click="openProfile(row)">
                  {{ row.nama }}
                </h3>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[10.5px] font-mono text-neutral-400">{{ row.nip }}</span>
                  <span class="text-[10px] text-neutral-300">&bull;</span>
                  <span class="text-[11px] text-neutral-500">{{ row.lokasi }}</span>
                </div>
              </div>
            </div>
            <BaseBadge :variant="getStatusBadgeVariant(row.status)" size="sm">
              {{ row.status }}
            </BaseBadge>
          </div>

          <!-- Mid Row: Jabatan & Gaji -->
          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 dark:border-[var(--theme-border)] text-xs">
            <div>
              <span class="text-[10px] uppercase font-bold text-neutral-400 block">Jabatan</span>
              <span class="font-medium text-neutral-800 dark:text-neutral-200 block truncate">{{ row.jabatan }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-neutral-400 block">Take Home Pay</span>
              <span class="font-bold font-mono text-neutral-900 dark:text-white block">{{ formatRupiah(row.gaji) }}</span>
            </div>
          </div>

          <!-- Bottom Row: Quick Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-[var(--theme-border)]">
            <BaseBadge :variant="row.bpjsAktif ? 'success' : 'neutral'" size="sm">
              {{ row.bpjsAktif ? 'BPJS Aktif' : 'Non-BPJS' }}
            </BaseBadge>
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="openProfile(row)"
                class="p-1 rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-[var(--theme-surface-muted)] transition cursor-pointer"
                title="Profil"
              >
                <Eye class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click="openEditModal(row)"
                class="p-1 rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-[var(--theme-surface-muted)] transition cursor-pointer"
                title="Edit"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click="openDeleteConfirm(row)"
                class="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                title="Hapus"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Tombol Aksi Massal pada Floating Bulk Action Bar -->
      <template #bulk-actions="{ selectedIds: ids }">
        <BaseButton variant="outline" size="sm" @click="exportSelected">
          <Download class="w-3.5 h-3.5" />
          <span>Ekspor CSV</span>
        </BaseButton>

        <BaseButton variant="danger" size="sm" @click="isBatchDeleteModalOpen = true">
          <Trash2 class="w-3.5 h-3.5" />
          <span>Hapus ({{ ids.length }})</span>
        </BaseButton>
      </template>
    </BaseDataTable>

    <!-- ======================================================== -->
    <!-- 5. SLIDE-OVER DETAIL PROFIL KARYAWAN TERPADU (6 TAB)     -->
    <!-- Menampung 6 Tab: Pribadi, Presensi, Payroll, BPJS,       -->
    <!-- Dokumen Digital, Galeri Foto Absen/Surat/Kerja           -->
    <!-- ======================================================== -->
    <BaseSlideOver
      v-model="isProfileOpen"
      :title="selectedProfile?.nama || 'Profil Lengkap Karyawan'"
      :subtitle="selectedProfile ? `${selectedProfile.nip} • ${selectedProfile.jabatan}` : ''"
      size="xl"
    >
      <template #badge>
        <BaseBadge
          v-if="selectedProfile"
          :variant="getStatusBadgeVariant(selectedProfile.status)"
          size="sm"
        >
          {{ selectedProfile.status }}
        </BaseBadge>
      </template>

      <div v-if="selectedProfile" class="space-y-4 text-xs">
        <!-- Header Banner Profil Karyawan -->
        <div class="p-4 rounded-2xl bg-neutral-50 dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 text-center sm:text-left">
          <div class="flex flex-col sm:flex-row items-center gap-3.5">
            <BaseAvatar
              :name="selectedProfile.nama"
              size="xl"
              :status="selectedProfile.status === 'Tetap' ? 'online' : 'busy'"
              class="ring-4 ring-white dark:ring-neutral-800 shadow-md"
            />
            <div>
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 class="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                  {{ selectedProfile.nama }}
                </h3>
                <BaseBadge :variant="getStatusBadgeVariant(selectedProfile.status)" size="xs">
                  {{ selectedProfile.status }}
                </BaseBadge>
              </div>

              <p class="text-xs font-semibold text-[var(--theme-primary)] mt-0.5">
                {{ selectedProfile.jabatan }}
              </p>

              <div class="text-[11px] text-neutral-500 flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5">
                <span class="flex items-center gap-1">
                  <Building2 class="w-3 h-3 text-neutral-400" />
                  {{ selectedProfile.divisi }}
                </span>
                <span>&bull;</span>
                <span class="flex items-center gap-1">
                  <MapPin class="w-3 h-3 text-neutral-400" />
                  {{ selectedProfile.lokasi }}
                </span>
                <span>&bull;</span>
                <span class="flex items-center gap-1">
                  <Calendar class="w-3 h-3 text-neutral-400" />
                  Masa Kerja: {{ selectedProfile.masaKerja }}
                </span>
              </div>
            </div>
          </div>

          <BaseButton
            variant="outline"
            size="xs"
            @click="toast.info(`Mengunduh berkas biodata resmi untuk: ${selectedProfile.nama}`)"
          >
            <Download class="w-3 h-3 mr-1" />
            <span>Unduh Biodata</span>
          </BaseButton>
        </div>

        <!-- Tab Navigation Bar (6 Tab HRIS) -->
        <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-[var(--theme-surface-muted)] border border-neutral-200/80 dark:border-[var(--theme-border)]">
          <button
            v-for="t in profileTabs"
            :key="t.value"
            type="button"
            @click="activeProfileTab = t.value"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
            :class="[
              activeProfileTab === t.value
                ? 'bg-white dark:bg-[var(--theme-surface-raised)] text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            ]"
          >
            <component :is="t.icon" class="w-3.5 h-3.5" />
            <span>{{ t.label }}</span>
          </button>
        </div>

        <!-- ============================================== -->
        <!-- TAB 1: DATA PRIBADI                            -->
        <!-- ============================================== -->
        <div v-if="activeProfileTab === 'pribadi'" class="space-y-3">
          <div class="p-4 rounded-2xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs">
            <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
              <Users class="w-3.5 h-3.5 text-[var(--theme-primary)]" />
              <span>Biodata Identitas & Domisili</span>
            </h4>
            <BaseDescriptionList
              :items="personalInfoItems"
              layout="stacked"
              striped
            />
          </div>
        </div>

        <!-- ============================================== -->
        <!-- TAB 2: PRESENSI & SHIFT KERJA                  -->
        <!-- ============================================== -->
        <div v-if="activeProfileTab === 'presensi'" class="space-y-3">
          <!-- Stat Ringkasan Presensi -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Tingkat Kehadiran</span>
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300 font-mono block mt-0.5">{{ selectedProfile.presensi.kehadiranBulanIni }}</span>
            </div>

            <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">Tepat Waktu</span>
              <span class="text-base font-extrabold text-blue-700 dark:text-blue-300 font-mono block mt-0.5">{{ selectedProfile.presensi.tepatWaktu }} Hari</span>
            </div>

            <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Terlambat</span>
              <span class="text-base font-extrabold text-amber-700 dark:text-amber-300 font-mono block mt-0.5">{{ selectedProfile.presensi.terlambat }} Hari</span>
            </div>

            <div class="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">Total Jam Kerja</span>
              <span class="text-base font-extrabold text-purple-700 dark:text-purple-300 font-mono block mt-0.5">{{ selectedProfile.presensi.totalJamKerja }}</span>
            </div>
          </div>

          <!-- Shift & Aturan Kerja -->
          <div class="p-3.5 rounded-xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-neutral-500">Jadwal Shift:</span>
              <span class="font-semibold text-neutral-900 dark:text-white">{{ selectedProfile.presensi.jadwalShift }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-neutral-500">Toleransi Keterlambatan:</span>
              <span class="font-semibold text-neutral-900 dark:text-white">{{ selectedProfile.presensi.toleransiTelat }}</span>
            </div>
          </div>

          <!-- Log Riwayat 5 Hari Terakhir -->
          <div class="p-3.5 rounded-2xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs space-y-2.5">
            <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-[var(--theme-primary)]" />
              <span>Log Biometrik 5 Hari Terakhir</span>
            </h4>
            <div class="divide-y divide-neutral-100 dark:divide-[var(--theme-border)]">
              <div
                v-for="(log, idx) in selectedProfile.presensi.riwayatTerbaru"
                :key="idx"
                class="py-2 flex items-center justify-between gap-2"
              >
                <div>
                  <span class="font-semibold text-neutral-900 dark:text-white block">{{ log.tgl }}</span>
                  <span class="text-[10.5px] text-neutral-400 block">{{ log.lokasi }}</span>
                </div>
                <div class="text-right">
                  <div class="font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {{ log.masuk }} &bull; {{ log.pulang }}
                  </div>
                  <span
                    class="text-[10px] font-semibold"
                    :class="log.status.includes('Terlambat') ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'"
                  >
                    {{ log.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- TAB 3: PAYROLL & KOMPENSASI                    -->
        <!-- ============================================== -->
        <div v-if="activeProfileTab === 'payroll'" class="space-y-3">
          <div class="p-4 rounded-2xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs">
            <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
              <Wallet class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Struktur Kompensasi & Rekening Bank</span>
            </h4>
            <BaseDescriptionList
              :items="payrollInfoItems"
              layout="stacked"
              striped
            />
          </div>
        </div>

        <!-- ============================================== -->
        <!-- TAB 4: BPJS & ASURANSI                         -->
        <!-- ============================================== -->
        <div v-if="activeProfileTab === 'bpjs'" class="space-y-3">
          <div class="p-4 rounded-2xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs">
            <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
              <HeartPulse class="w-3.5 h-3.5 text-rose-500" />
              <span>Kepesertaan BPJS Ketenagakerjaan & Kesehatan</span>
            </h4>
            <BaseDescriptionList
              :items="bpjsInfoItems"
              layout="stacked"
              striped
            />
          </div>
        </div>

        <!-- ============================================== -->
        <!-- TAB 5: DOKUMEN DIGITAL (BaseDocumentList)       -->
        <!-- ============================================== -->
        <div v-if="activeProfileTab === 'dokumen'" class="space-y-3">
          <div class="p-4 rounded-2xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <FileText class="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                  <span>Arsip Dokumen Kepegawaian Resmi</span>
                </h4>
                <p class="text-[11px] text-neutral-400 mt-0.5">
                  Berkas identitas, legalitas, ijazah, dan dokumen perpajakan terverifikasi.
                </p>
              </div>
              <BaseButton variant="outline" size="xs" @click="toast.info('Buka formulir upload dokumen baru.')">
                <Upload class="w-3 h-3 mr-1" />
                <span>Unggah Dokumen</span>
              </BaseButton>
            </div>

            <!-- BaseDocumentList Component -->
            <BaseDocumentList
              :documents="selectedProfile.dokumen"
              @preview="handleDocumentPreview"
              @download="handleDocumentDownload"
              @upload="handleDocumentUpload"
            />
          </div>
        </div>

        <!-- ============================================== -->
        <!-- TAB 6: GALERI FOTO & SURAT (BaseGallery)       -->
        <!-- ============================================== -->
        <div v-if="activeProfileTab === 'galeri'" class="space-y-3">
          <div class="p-4 rounded-2xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs space-y-3">
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <ImageIcon class="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                <span>Galeri Foto Presensi & Berkas Lampiran</span>
              </h4>
              <p class="text-[11px] text-neutral-400 mt-0.5">
                Foto selfie presensi mobile liveness GPS, foto surat izin dokter, dan dokumentasi kerja lapangan.
              </p>
            </div>

            <!-- BaseGallery Component -->
            <BaseGallery
              :items="selectedProfile.galeri"
              @download="handleGalleryDownload"
            />
          </div>
        </div>

      </div>

      <template #footer="{ close }">
        <div class="flex items-center justify-between w-full">
          <BaseButton variant="outline" size="sm" @click="close">
            Tutup
          </BaseButton>
          <div class="flex items-center gap-2">
            <BaseButton variant="outline" size="sm" @click="openEditModal(selectedProfile)">
              <Pencil class="w-3.5 h-3.5 mr-1" />
              <span>Edit Pegawai</span>
            </BaseButton>
            <BaseButton variant="primary" size="sm" @click="toast.success(`Slip gaji resmi untuk ${selectedProfile?.nama} telah disiapkan.`, 'Slip Gaji')">
              <Download class="w-3.5 h-3.5 mr-1" />
              <span>Unduh Slip Gaji</span>
            </BaseButton>
          </div>
        </div>
      </template>
    </BaseSlideOver>

    <!-- ======================================================== -->
    <!-- 6. MODAL FORM CRUD: TAMBAH & EDIT PEGAWAI                -->
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

          <BaseFormField label="Divisi / Departemen">
            <BaseSearchableSelect
              v-model="formData.divisi"
              :options="formDivisiOptions"
              size="md"
            />
          </BaseFormField>

          <BaseFormField label="Status Kerja">
            <BaseSearchableSelect
              v-model="formData.status"
              :options="formStatusOptions"
              :searchable="false"
              size="md"
              align="right"
            />
          </BaseFormField>
        </div>

        <!-- Baris 4: Gaji Pokok & Tunjangan -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <BaseCurrencyInput
            v-model="formData.gaji"
            label="Gaji Pokok Bulanan (IDR)"
            required
            placeholder="20.000.000"
            :error="formErrors.gaji"
          />

          <BaseCurrencyInput
            v-model="formData.tunjangan"
            label="Tunjangan Tetap / Transport"
            placeholder="3.500.000"
          />
        </div>

        <!-- Baris 5: Lokasi Kerja & Rekening Payroll -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <BaseInput
            v-model="formData.lokasi"
            label="Lokasi Penempatan Kantor"
            placeholder="Jakarta Selatan"
            :leading-icon="MapPin"
          />

          <BaseInput
            v-model="formData.rekening"
            label="Nomor Rekening Payroll"
            placeholder="BCA - 8820194812"
            :leading-icon="CreditCard"
          />
        </div>

        <!-- Fasilitas & Benefit Pegawai (BaseMultiSelect) -->
        <BaseMultiSelect
          v-model="formData.fasilitas"
          label="Fasilitas & Benefit Pegawai"
          :options="formFasilitasOptions"
          placeholder="Pilih fasilitas pegawai..."
        />

        <!-- Catatan Karyawan (BaseTextarea) -->
        <BaseTextarea
          v-model="formData.catatan"
          label="Catatan HR & Rekomendasi"
          placeholder="Tuliskan catatan keahlian teknis atau catatan HR..."
          :rows="2"
          :maxlength="250"
        />

        <!-- Berkas Dokumen & Pasfoto (BaseFileUploader) -->
        <BaseFileUploader
          label="Unggah Pasfoto / Dokumen Pendukung (Opsional)"
          hint="Format berkas: JPG, PNG, atau PDF (maks. 5 MB)"
          accept="image/*,.pdf"
          :multiple="false"
        />

        <!-- Switch BPJS Asuransi (BaseSwitch) -->
        <div class="p-3.5 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface-raised)] border border-neutral-200/80 dark:border-[var(--theme-border)]">
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

    <!-- Confirmation Modal Single Delete -->
    <ConfirmationModal
      v-model="isDeleteModalOpen"
      type="delete"
      title="Hapus Pegawai"
      :message="itemToDelete ? `Apakah Anda yakin ingin menghapus data pegawai ${itemToDelete.nama} (${itemToDelete.nip})? Data yang dihapus tidak dapat dipulihkan.` : ''"
      confirm-text="Hapus Pegawai"
      cancel-text="Batal"
      @confirm="handleDeleteConfirm"
    />

    <!-- Confirmation Modal Batch Delete -->
    <ConfirmationModal
      v-model="isBatchDeleteModalOpen"
      type="delete"
      title="Hapus Pegawai Terpilih"
      :message="`Apakah Anda yakin ingin menghapus ${selectedIds.length} data pegawai yang dipilih sekaligus? Tindakan ini tidak dapat dibatalkan.`"
      :confirm-text="`Hapus ${selectedIds.length} Pegawai`"
      cancel-text="Batal"
      @confirm="handleBatchDeleteConfirm"
    />

    <!-- Wizard Impor CSV (BaseCsvImporter.vue) -->
    <BaseCsvImporter
      v-model="isCsvImporterOpen"
      title="Impor Data Pegawai dari Berkas CSV"
      :target-fields="targetFieldsForImport"
      @imported="handleCsvImported"
    />

  </div>
</template>
