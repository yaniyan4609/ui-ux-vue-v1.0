<script setup>
import { ref, computed } from 'vue'
import BaseDataTable from '../../components/ui/BaseDataTable.vue'
import BaseAvatar from '../../components/ui/BaseAvatar.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseTabs from '../../components/ui/BaseTabs.vue'
import BaseSlideOver from '../../components/ui/BaseSlideOver.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseDescriptionList from '../../components/ui/BaseDescriptionList.vue'
import BaseDocumentList from '../../components/ui/BaseDocumentList.vue'
import BaseGallery from '../../components/ui/BaseGallery.vue'
import BaseSearchableSelect from '../../components/ui/BaseSearchableSelect.vue'
import BaseFormField from '../../components/ui/BaseFormField.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import { useToast } from '../../composables/useToast'
import { hrisEmployeeList } from '../../data/hrisEmployeeData'
import {
  Users,
  Eye,
  UserPlus,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Wallet,
  Shield,
  FileText,
  Image as ImageIcon,
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  Phone,
  Mail,
  CreditCard,
  HeartPulse,
} from 'lucide-vue-next'

const toast = useToast()

// ========================================================
// 1. DATA & KOLOM TABEL DIREKTORI KARYAWAN
// ========================================================
const employees = ref([...hrisEmployeeList])
const searchQuery = ref('')
const selectedDivision = ref('all')
const selectedStatus = ref('all')

const columns = [
  { key: 'karyawan', label: 'Karyawan', sortable: true },
  { key: 'jabatan', label: 'Jabatan & Divisi', sortable: true },
  { key: 'cabang', label: 'Kantor Cabang', sortable: true },
  { key: 'status', label: 'Status Hubungan Kerja', sortable: true },
  { key: 'kehadiran', label: 'Kehadiran Bln Ini', sortable: true },
  { key: 'aksi', label: 'Aksi', align: 'right' },
]

const divisionOptions = [
  { value: 'all', label: 'Semua Divisi' },
  { value: 'Teknologi & IT', label: 'Teknologi & IT' },
  { value: 'Operasional & Rantai Pasok', label: 'Operasional & Logistik' },
  { value: 'Keuangan & HRIS', label: 'Keuangan & HR' },
]

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'Tetap', label: 'PKWTT (Tetap)' },
  { value: 'Kontrak (PKWT)', label: 'PKWT (Kontrak)' },
  { value: 'Probation', label: 'Masa Percobaan' },
]

const filteredEmployees = computed(() => {
  return employees.value.filter((emp) => {
    const q = searchQuery.value.toLowerCase()
    const matchSearch =
      !q ||
      emp.nama.toLowerCase().includes(q) ||
      emp.nip.toLowerCase().includes(q) ||
      emp.jabatan.toLowerCase().includes(q)

    const matchDivision =
      selectedDivision.value === 'all' || emp.divisi === selectedDivision.value

    const matchStatus =
      selectedStatus.value === 'all' || emp.status === selectedStatus.value

    return matchSearch && matchDivision && matchStatus
  })
})

const selectedIds = ref([])
const sortKey = ref('')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const sortedEmployees = computed(() => {
  if (!sortKey.value) return filteredEmployees.value
  return [...filteredEmployees.value].sort((a, b) => {
    let valA = a[sortKey.value] ?? ''
    let valB = b[sortKey.value] ?? ''
    if (typeof valA === 'string') valA = valA.toLowerCase()
    if (typeof valB === 'string') valB = valB.toLowerCase()
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const paginatedEmployees = computed(() => {
  if (itemsPerPage.value === 'all') return sortedEmployees.value
  const limit = Number(itemsPerPage.value)
  const start = (currentPage.value - 1) * limit
  return sortedEmployees.value.slice(start, start + limit)
})

// ========================================================
// 2. SLIDE-OVER DETAIL PROFIL LENGKAP KARYAWAN
// ========================================================
const isProfileOpen = ref(false)
const selectedEmp = ref(employees.value[0])
const activeTab = ref('pribadi')

const profileTabs = [
  { value: 'pribadi', label: 'Data Pribadi', icon: Users },
  { value: 'presensi', label: 'Presensi & Jam Kerja', icon: Clock },
  { value: 'payroll', label: 'Payroll & Gaji', icon: Wallet },
  { value: 'bpjs', label: 'BPJS & Asuransi', icon: HeartPulse },
  { value: 'dokumen', label: 'Dokumen Digital', icon: FileText },
  { value: 'galeri', label: 'Galeri Foto & Surat', icon: ImageIcon },
]

const openProfile = (emp) => {
  selectedEmp.value = emp
  isProfileOpen.value = true
}

// Format Data Pribadi untuk BaseDescriptionList
const personalInfoItems = computed(() => {
  if (!selectedEmp.value) return []
  const p = selectedEmp.value.pribadi
  return [
    { label: 'Nomor Induk Kependudukan (NIK)', value: p.nik },
    { label: 'Nomor Pokok Wajib Pajak (NPWP)', value: p.npwp },
    { label: 'Tempat, Tanggal Lahir', value: `${p.tempatLahir}, ${p.tanggalLahir}` },
    { label: 'Jenis Kelamin', value: p.jenisKelamin },
    { label: 'Agama', value: p.agama },
    { label: 'Status Pernikahan & PTKP', value: `${p.statusPernikahan} · PTKP ${p.ptkp}` },
    { label: 'Email Kedinasan', value: p.emailKantor },
    { label: 'Email Pribadi', value: p.emailPribadi },
    { label: 'Nomor Telepon / WhatsApp', value: p.telepon },
    { label: 'Pendidikan Terakhir', value: p.pendidikanTerakhir },
    { label: 'Alamat KTP', value: p.alamatKtp },
    { label: 'Alamat Domisili Sekarang', value: p.alamatDomisili },
    { label: 'Kontak Darurat', value: `${p.kontakDaruratNama} (${p.kontakDaruratHubungan}) - ${p.kontakDaruratTelp}` },
  ]
})

// Format Data Payroll untuk BaseDescriptionList
const payrollInfoItems = computed(() => {
  if (!selectedEmp.value) return []
  const pay = selectedEmp.value.payroll
  return [
    { label: 'Gaji Pokok Bulanan', value: `Rp ${pay.gajiPokok.toLocaleString('id-ID')}` },
    { label: 'Tunjangan Jabatan', value: `Rp ${pay.tunjanganJabatan.toLocaleString('id-ID')}` },
    { label: 'Tunjangan Makan & Transport', value: `Rp ${pay.tunjanganMakanTransport.toLocaleString('id-ID')}` },
    { label: 'Estimasi Upah Lembur L1/L2', value: `Rp ${pay.upahLemburEstimasi.toLocaleString('id-ID')}` },
    { label: 'Potongan BPJS (TK + Kes)', value: `- Rp ${pay.potonganBpjs.toLocaleString('id-ID')}` },
    { label: 'Potongan PPh 21 TER', value: `- Rp ${pay.potonganPph21.toLocaleString('id-ID')}` },
    { label: 'Estimasi Gaji Bersih (Netto)', value: `Rp ${pay.netSalaryEstimasi.toLocaleString('id-ID')}` },
    { label: 'Nomor Rekening Bank', value: `${pay.bank} - ${pay.rekeningNomor}` },
    { label: 'Nama Pemilik Rekening', value: pay.rekeningNama },
    { label: 'Skema Perhitungan Pajak', value: pay.metodePajak },
  ]
})

// Format Data BPJS untuk BaseDescriptionList
const bpjsInfoItems = computed(() => {
  if (!selectedEmp.value) return []
  const b = selectedEmp.value.bpjs
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

// Document handlers
const handleDocumentPreview = (doc) => {
  toast.info(`Membuka pratinjau dokumen: ${doc.title}`, 'Pratinjau Dokumen')
}

const handleDocumentDownload = (doc) => {
  toast.success(`Berkas ${doc.fileName} berhasil diunduh.`, 'Unduh Selesai')
}

const handleDocumentUpload = (doc) => {
  toast.info(`Form unggah dokumen ${doc.title} dibuka.`, 'Unggah Berkas')
}

// Gallery handlers
const handleGalleryDownload = (item) => {
  toast.success(`Foto ${item.title} berhasil disimpan.`, 'Unduh Foto')
}

// Export master data
const handleExportMaster = () => {
  toast.info('File Data_Master_Karyawan_Digaji.xlsx sedang diproses...', 'Ekspor Master Data')
  setTimeout(() => {
    toast.success('Master data karyawan berhasil diunduh dalam format Excel.', 'Ekspor Selesai')
  }, 800)
}
</script>

<template>
  <!-- Formula Data View: h-full flex flex-col min-h-0 overflow-hidden gap-2.5 w-full max-w-7xl mx-auto select-none relative -->
  <div class="h-full flex flex-col min-h-0 overflow-hidden gap-2.5 w-full max-w-7xl mx-auto select-none relative pb-2">

    <!-- ======================================================== -->
    <!-- 1. HEADER HALAMAN DIREKTORI KARYAWAN                     -->
    <!-- ======================================================== -->
    <div class="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-[var(--theme-border)]">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 shadow-2xs">
            Core HRIS
          </span>
          <h1 class="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            Direktori & Profil Karyawan
          </h1>
          <BaseBadge variant="neutral" size="xs">{{ filteredEmployees.length }} Pegawai</BaseBadge>
        </div>
        <p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          Master data pegawai terpadu: biodata pribadi, log presensi biometrik, payroll, BPJS, arsip dokumen, dan galeri foto
        </p>
      </div>

      <!-- Quick Action: Ekspor & Tambah Karyawan -->
      <div class="flex items-center gap-2 shrink-0">
        <BaseButton
          variant="secondary"
          size="sm"
          @click="handleExportMaster"
        >
          <Download class="w-3.5 h-3.5 mr-1" />
          <span>Ekspor Data</span>
        </BaseButton>

        <BaseButton
          variant="primary"
          size="sm"
          @click="toast.info('Formulir wizard onboarding karyawan baru dibuka.')"
        >
          <UserPlus class="w-3.5 h-3.5 mr-1" />
          <span>Tambah Karyawan</span>
        </BaseButton>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. FILTER & SEARCH TOOLBAR STRIP (SHRINK-0)              -->
    <!-- ======================================================== -->
    <div class="shrink-0 flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs">
      <!-- Search Input -->
      <div class="w-full sm:w-72">
        <BaseInput
          v-model="searchQuery"
          placeholder="Cari nama, NIP, atau jabatan..."
          size="sm"
          clearable
        />
      </div>

      <!-- Dropdown Filters -->
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <div class="w-44">
          <BaseSearchableSelect
            v-model="selectedDivision"
            :options="divisionOptions"
            placeholder="Filter Divisi"
            size="sm"
          />
        </div>

        <div class="w-40">
          <BaseSearchableSelect
            v-model="selectedStatus"
            :options="statusOptions"
            placeholder="Filter Status"
            size="sm"
          />
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 3. TABEL UTAMA DIREKTORI (FLEX-1 MIN-H-0 OVERFLOW-HIDDEN)-->
    <!-- ======================================================== -->
    <div class="flex-1 min-h-0 overflow-hidden rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs">
      <BaseDataTable
        :columns="columns"
        :rows="paginatedEmployees"
        :total-items="filteredEmployees.length"
        selectable
        v-model:selected-ids="selectedIds"
        v-model:sort-key="sortKey"
        v-model:sort-order="sortOrder"
        v-model:current-page="currentPage"
        v-model:items-per-page="itemsPerPage"
        :per-page-options="[10, 20, 50, 'all']"
        empty-title="Pegawai Tidak Ditemukan"
        empty-description="Tidak ada data pegawai yang cocok dengan filter atau kata kunci pencarian Anda."
      >
        <!-- Kolom Karyawan: Avatar + Nama + NIP -->
        <template #cell-karyawan="{ row }">
          <div class="flex items-center gap-2.5 py-1">
            <BaseAvatar
              :name="row.nama"
              size="md"
              :status="row.status === 'Tetap' ? 'online' : 'busy'"
            />
            <div class="min-w-0">
              <span class="text-xs font-bold text-neutral-900 dark:text-white block truncate hover:text-[var(--theme-primary)] transition cursor-pointer" @click="openProfile(row)">
                {{ row.nama }}
              </span>
              <span class="text-[10px] font-mono text-neutral-400 block truncate">
                {{ row.nip }} · {{ row.pribadi.jenisKelamin === 'Laki-Laki' ? 'L' : 'P' }}
              </span>
            </div>
          </div>
        </template>

        <!-- Kolom Jabatan & Divisi -->
        <template #cell-jabatan="{ row }">
          <div>
            <span class="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block truncate">
              {{ row.jabatan }}
            </span>
            <span class="text-[10px] text-neutral-400 block truncate">
              {{ row.divisi }} &rsaquo; {{ row.departemen }}
            </span>
          </div>
        </template>

        <!-- Kolom Cabang -->
        <template #cell-cabang="{ row }">
          <div class="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
            <MapPin class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span class="truncate">{{ row.cabang }}</span>
          </div>
        </template>

        <!-- Kolom Status Hubungan Kerja -->
        <template #cell-status="{ row }">
          <BaseBadge :variant="row.statusBadge" size="xs">
            {{ row.status }}
          </BaseBadge>
        </template>

        <!-- Kolom Kehadiran Bulan Ini -->
        <template #cell-kehadiran="{ row }">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500" />
            <span class="font-bold font-mono text-xs text-neutral-900 dark:text-white">
              {{ row.presensi.kehadiranBulanIni }}
            </span>
            <span class="text-[10px] text-neutral-400">({{ row.presensi.tepatWaktu }} Hari Tepat)</span>
          </div>
        </template>

        <!-- Kolom Aksi -->
        <template #cell-aksi="{ row }">
          <div class="flex items-center justify-end gap-1.5">
            <BaseButton
              variant="secondary"
              size="xs"
              @click="openProfile(row)"
              title="Buka Profil Lengkap"
            >
              <Eye class="w-3.5 h-3.5 mr-1" />
              <span>Profil</span>
            </BaseButton>
          </div>
        </template>
      </BaseDataTable>
    </div>

    <!-- ======================================================== -->
    <!-- 4. SLIDE-OVER PROFIL KARYAWAN TERPADU                    -->
    <!-- Menampung 6 Tab: Pribadi, Presensi, Payroll, BPJS,       -->
    <!-- Dokumen, Galeri Foto Absen/Surat/Kerja                   -->
    <!-- ======================================================== -->
    <BaseSlideOver
      v-model="isProfileOpen"
      title="Profil Lengkap Karyawan"
      size="lg"
    >
      <div v-if="selectedEmp" class="space-y-4 text-xs">

        <!-- Header Profil Karyawan -->
        <div class="p-4 rounded-2xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 text-center sm:text-left">
          <div class="flex flex-col sm:flex-row items-center gap-3.5">
            <BaseAvatar
              :name="selectedEmp.nama"
              size="xl"
              :status="selectedEmp.status === 'Tetap' ? 'online' : 'busy'"
              class="ring-4 ring-white dark:ring-neutral-800 shadow-md"
            />
            <div>
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 class="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                  {{ selectedEmp.nama }}
                </h3>
                <BaseBadge :variant="selectedEmp.statusBadge" size="xs">
                  {{ selectedEmp.status }}
                </BaseBadge>
              </div>

              <p class="text-xs font-semibold text-[var(--theme-primary)] mt-0.5">
                {{ selectedEmp.jabatan }}
              </p>

              <div class="text-[11px] text-neutral-500 flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5">
                <span class="flex items-center gap-1">
                  <Building2 class="w-3 h-3 text-neutral-400" />
                  {{ selectedEmp.divisi }}
                </span>
                <span>·</span>
                <span class="flex items-center gap-1">
                  <MapPin class="w-3 h-3 text-neutral-400" />
                  {{ selectedEmp.cabang }}
                </span>
                <span>·</span>
                <span class="flex items-center gap-1">
                  <Calendar class="w-3 h-3 text-neutral-400" />
                  Masa Kerja: {{ selectedEmp.masaKerja }}
                </span>
              </div>
            </div>
          </div>

          <BaseButton
            variant="secondary"
            size="xs"
            @click="toast.info(`Mengunduh berkas biodata resmi untuk: ${selectedEmp.nama}`)"
            class="shrink-0"
          >
            <Download class="w-3.5 h-3.5 mr-1" />
            <span>Unduh Biodata PDF</span>
          </BaseButton>
        </div>

        <!-- 6 Navigasi Tab Karyawan Menggunakan BaseTabs -->
        <BaseTabs
          v-model="activeTab"
          :items="profileTabs"
          variant="pills"
        >
          <!-- ================================================== -->
          <!-- TAB 1: DATA PRIBADI                                -->
          <!-- ================================================== -->
          <template #panel-pribadi>
            <div class="space-y-3 pt-2">
              <BaseDescriptionList
                :items="personalInfoItems"
                layout="divided"
              />
            </div>
          </template>

          <!-- ================================================== -->
          <!-- TAB 2: PRESENSI & DISIPLIN JAM KERJA               -->
          <!-- ================================================== -->
          <template #panel-presensi>
            <div class="space-y-4 pt-2">
              <!-- Ringkasan Kehadiran Bulan Ini -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div class="p-3 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] text-center">
                  <span class="text-[10px] text-neutral-400 block uppercase font-bold">Kehadiran</span>
                  <span class="text-base font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {{ selectedEmp.presensi.kehadiranBulanIni }}
                  </span>
                  <span class="text-[10px] text-neutral-500">{{ selectedEmp.presensi.totalJamKerja }}</span>
                </div>

                <div class="p-3 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] text-center">
                  <span class="text-[10px] text-neutral-400 block uppercase font-bold">Tepat Waktu</span>
                  <span class="text-base font-bold text-neutral-900 dark:text-white block mt-0.5">
                    {{ selectedEmp.presensi.tepatWaktu }} Hari
                  </span>
                  <span class="text-[10px] text-emerald-500">Sesuai Jadwal</span>
                </div>

                <div class="p-3 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] text-center">
                  <span class="text-[10px] text-neutral-400 block uppercase font-bold">Terlambat</span>
                  <span class="text-base font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                    {{ selectedEmp.presensi.terlambat }} Hari
                  </span>
                  <span class="text-[10px] text-neutral-500">Toleransi 15m</span>
                </div>

                <div class="p-3 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] text-center">
                  <span class="text-[10px] text-neutral-400 block uppercase font-bold">Cuti / Sakit</span>
                  <span class="text-base font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
                    {{ selectedEmp.presensi.cuti }} Cuti · {{ selectedEmp.presensi.sakit }} Sakit
                  </span>
                  <span class="text-[10px] text-neutral-500">Disetujui HRD</span>
                </div>
              </div>

              <!-- Log Presensi Terbaru -->
              <div class="rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] overflow-hidden">
                <div class="px-3.5 py-2 bg-neutral-50 dark:bg-[var(--theme-surface)] border-b border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between font-bold text-neutral-800 dark:text-neutral-200 text-[11px]">
                  <span>Riwayat Presensi Masuk & Pulang Terkini</span>
                  <span class="text-neutral-400 font-normal">Shift: {{ selectedEmp.presensi.jadwalShift }}</span>
                </div>

                <div class="divide-y divide-neutral-100 dark:divide-[var(--theme-border)]">
                  <div
                    v-for="(log, i) in selectedEmp.presensi.riwayatTerbaru"
                    :key="i"
                    class="p-2.5 flex items-center justify-between gap-2 hover:bg-neutral-50/60 dark:hover:bg-[var(--theme-surface-muted)] transition"
                  >
                    <div>
                      <span class="font-bold text-neutral-900 dark:text-white block">{{ log.tgl }}</span>
                      <span class="text-[10px] text-neutral-400">{{ log.lokasi }}</span>
                    </div>

                    <div class="text-right">
                      <div class="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                        {{ log.masuk }} - {{ log.pulang }}
                      </div>
                      <BaseBadge
                        :variant="log.status.includes('Tepat') ? 'success' : (log.status.includes('Terlambat') ? 'warning' : 'info')"
                        size="xs"
                        class="mt-0.5"
                      >
                        {{ log.status }}
                      </BaseBadge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ================================================== -->
          <!-- TAB 3: PAYROLL & KOMPENSASI                        -->
          <!-- ================================================== -->
          <template #panel-payroll>
            <div class="space-y-3 pt-2">
              <BaseDescriptionList
                :items="payrollInfoItems"
                layout="divided"
              />
            </div>
          </template>

          <!-- ================================================== -->
          <!-- TAB 4: BPJS & ASURANSI KETENAGAKERJAAN             -->
          <!-- ================================================== -->
          <template #panel-bpjs>
            <div class="space-y-3 pt-2">
              <BaseDescriptionList
                :items="bpjsInfoItems"
                layout="divided"
              />
            </div>
          </template>

          <!-- ================================================== -->
          <!-- TAB 5: DOKUMEN DIGITAL (KTP, BPJS, KK, IJAZAH)     -->
          <!-- Menggunakan BaseDocumentList                       -->
          <!-- ================================================== -->
          <template #panel-dokumen>
            <div class="pt-2">
              <BaseDocumentList
                :documents="selectedEmp.dokumen"
                @preview="handleDocumentPreview"
                @download="handleDocumentDownload"
                @upload="handleDocumentUpload"
              />
            </div>
          </template>

          <!-- ================================================== -->
          <!-- TAB 6: GALERI FOTO ABSEN, SURAT IZIN & KERJA       -->
          <!-- Menggunakan BaseGallery                            -->
          <!-- ================================================== -->
          <template #panel-galeri>
            <div class="pt-2">
              <BaseGallery
                :items="selectedEmp.galeri"
                @download="handleGalleryDownload"
              />
            </div>
          </template>
        </BaseTabs>

      </div>
    </BaseSlideOver>

  </div>
</template>

