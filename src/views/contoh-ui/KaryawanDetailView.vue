<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import BaseAvatar from '../../components/ui/BaseAvatar.vue'
import BaseSearchableSelect from '../../components/ui/BaseSearchableSelect.vue'
import BaseDescriptionList from '../../components/ui/BaseDescriptionList.vue'
import BaseDocumentList from '../../components/ui/BaseDocumentList.vue'
import BaseGallery from '../../components/ui/BaseGallery.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseCurrencyInput from '../../components/ui/BaseCurrencyInput.vue'
import { useToast } from '../../composables/useToast'
import { resolveEmployeeFullProfile, getAllEmployeesList } from '../../data/hrisEmployeeData'
import { formatRupiah } from '../../utils/format.js'
import {
  ArrowLeft,
  Users,
  Briefcase,
  User,
  CreditCard,
  GraduationCap,
  Clock,
  Wallet,
  HeartPulse,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Copy,
  Printer,
  Pencil,
  MapPin,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  ShieldCheck,
  BadgeCheck,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// ========================================================
// 1. DATA KARYAWAN & SWITCHER
// ========================================================
const allEmployees = getAllEmployeesList()
const currentEmployeeId = ref(Number(route.params.id) || 1)

// Options untuk BaseSearchableSelect "Search, Ganti Karyawan"
const employeeSelectOptions = computed(() => {
  return allEmployees.map((emp) => ({
    value: emp.id,
    label: `${emp.nama} (${emp.nip})`,
    badge: emp.jabatan,
  }))
})

// Full Profile Data yang di-resolve
const profile = computed(() => {
  return resolveEmployeeFullProfile(currentEmployeeId.value)
})

// Watch route params untuk sinkronisasi jika URL berubah
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      currentEmployeeId.value = Number(newId)
    }
  }
)

// Ganti karyawan via dropdown switcher
const handleSwitchEmployee = (newId) => {
  if (!newId) return
  currentEmployeeId.value = Number(newId)
  router.replace(`/contoh-ui/karyawan/${newId}`)
  toast.info(`Beralih ke profil: ${profile.value.nama}`)
}

// ========================================================
// 2. NAVIGASI MENU & SUB-MENU (SESUAI WIREFRAME)
// ========================================================
const activeMenu = ref('pribadi') // 'pribadi' | 'presensi' | 'payroll' | 'bpjs' | 'dokumen' | 'galeri'
const activeSubMenu = ref('pekerjaan') // 'pekerjaan' | 'biodata' | 'identitas' | 'keluarga' | 'semua'
const isPribadiMenuExpanded = ref(true)

const subMenusDataPribadi = [
  { id: 'pekerjaan', label: 'Informasi Pekerjaan', icon: Briefcase, desc: 'Jabatan, divisi & penempatan' },
  { id: 'biodata', label: 'Biodata & Akun', icon: User, desc: 'Profil akun & demografis' },
  { id: 'identitas', label: 'Identitas & Domisili', icon: CreditCard, desc: 'NIK, WhatsApp & alamat' },
  { id: 'keluarga', label: 'Pendidikan & Keluarga', icon: GraduationCap, desc: 'Edukasi & kontak darurat' },
]

const selectMenu = (menuKey) => {
  activeMenu.value = menuKey
  if (menuKey === 'pribadi') {
    isPribadiMenuExpanded.value = true
  }
}

const selectSubMenu = (subKey) => {
  activeMenu.value = 'pribadi'
  activeSubMenu.value = subKey
  isPribadiMenuExpanded.value = true
}

const togglePribadiAccordion = () => {
  isPribadiMenuExpanded.value = !isPribadiMenuExpanded.value
  if (isPribadiMenuExpanded.value) {
    activeMenu.value = 'pribadi'
  }
}

// ========================================================
// 3. MAPPING ITEM UNTUK BASE DESCRIPTION LIST
// ========================================================

// A. Informasi Pekerjaan
const pekerjaanItems = computed(() => {
  const p = profile.value.pribadi.pekerjaan
  return [
    { label: 'Penempatan Kantor / Cabang', value: p.kantor, span: 1 },
    { label: 'Jabatan / Posisi Kerja', value: p.jabatan, span: 1 },
    { label: 'Divisi Perusahaan', value: p.divisi, span: 1 },
    { label: 'Departemen / Unit Kerja', value: p.departemen, span: 1 },
    { label: 'Level Karir Jabatan', value: p.level, span: 1 },
    { label: 'Status Kepegawaian', value: p.status, badge: p.status, badgeVariant: p.status === 'Tetap' ? 'success' : 'warning', span: 1 },
    { label: 'Tanggal Bergabung (Mulai Kerja)', value: p.tanggalMasuk, span: 1 },
    { label: 'Total Masa Kerja Aktif', value: p.masaKerja, span: 1 },
  ]
})

// B. Biodata Pribadi & Akun Pengguna
const biodataItems = computed(() => {
  const b = profile.value.pribadi.biodata
  return [
    { label: 'Nama Lengkap & Gelar', value: b.namaLengkap, span: 2 },
    { label: 'Nama Panggilan Akrab', value: b.namaPanggilan, span: 1 },
    { label: 'ID Akun Pengguna (SSO)', value: b.akunId, mono: true, span: 1 },
    { label: 'Email Kedinasan (Akun HRIS)', value: b.kredensialLogin, span: 1 },
    { label: 'Tempat, Tanggal Lahir', value: b.tempatTanggalLahir, span: 1 },
    { label: 'Jenis Kelamin', value: b.jenisKelamin, span: 1 },
    { label: 'Agama', value: b.agama, span: 1 },
    { label: 'Status Pernikahan', value: b.statusPernikahan, span: 1 },
    { label: 'Kategori Pajak PTKP', value: b.ptkp, span: 1 },
  ]
})

// C. Identitas Resmi & Kontak Domisili
const identitasItems = computed(() => {
  const i = profile.value.pribadi.identitas
  return [
    { label: 'Nomor Induk Kependudukan (NIK KTP)', value: i.nik, mono: true, span: 1 },
    { label: 'Nomor Pokok Wajib Pajak (NPWP)', value: i.npwp, mono: true, span: 1 },
    { label: 'Nomor WhatsApp / Seluler', value: i.telepon, span: 1 },
    { label: 'Alamat Email Pribadi', value: i.emailPribadi, span: 1 },
    { label: 'Alamat Sesuai KTP', value: i.alamatKtp, span: 2 },
    { label: 'Alamat Domisili Sekarang', value: i.alamatDomisili, span: 2 },
    { label: 'Status Kepemilikan Tempat Tinggal', value: i.statusTempatTinggal, span: 1 },
  ]
})

// D. Pendidikan, Keluarga & Kontak Darurat
const keluargaItems = computed(() => {
  const k = profile.value.pribadi.keluarga
  return [
    { label: 'Jenjang & Almamater Pendidikan Terakhir', value: k.pendidikanTerakhir, span: 2 },
    { label: 'Tahun Kelulusan & Predikat', value: k.tahunKelulusan, span: 1 },
    { label: 'Nama Lengkap Ibu Kandung', value: k.namaIbuKandung, span: 1 },
    { label: 'Nama Pasangan / Tanggungan Utama', value: k.namaPasangan, span: 2 },
    { label: 'Nama Kontak Darurat', value: k.kontakDaruratNama, span: 1 },
    { label: 'Hubungan Kontak Darurat', value: k.kontakDaruratHubungan, span: 1 },
    { label: 'Nomor Telepon Kontak Darurat', value: k.kontakDaruratTelp, span: 2 },
  ]
})

// E. Payroll & Kompensasi
const payrollIncomeItems = computed(() => {
  const pay = profile.value.payroll
  return [
    { label: 'Gaji Pokok Bulanan', value: formatRupiah(pay.gajiPokok), mono: true },
    { label: 'Tunjangan Jabatan', value: formatRupiah(pay.tunjanganJabatan), mono: true },
    { label: 'Tunjangan Makan & Transportasi', value: formatRupiah(pay.tunjanganMakanTransport), mono: true },
    { label: 'Estimasi Upah Lembur (L1/L2)', value: formatRupiah(pay.upahLemburEstimasi), mono: true },
  ]
})

const payrollDeductionItems = computed(() => {
  const pay = profile.value.payroll
  return [
    { label: 'Potongan BPJS (JHT, JP & Kesehatan)', value: `- ${formatRupiah(pay.potonganBpjs)}`, mono: true },
    { label: 'Potongan Pajak PPh 21 TER', value: `- ${formatRupiah(pay.potonganPph21)}`, mono: true },
  ]
})

const payrollBankItems = computed(() => {
  const pay = profile.value.payroll
  return [
    { label: 'Bank Payroll Rekanan', value: pay.bank },
    { label: 'Nomor Rekening Payroll', value: pay.rekeningNomor, mono: true },
    { label: 'Nama Pemilik Rekening', value: pay.rekeningNama },
    { label: 'Skema Perhitungan Pajak PPh 21', value: pay.metodePajak },
  ]
})

// F. BPJS & Asuransi
const bpjsTkItems = computed(() => {
  const b = profile.value.bpjs
  return [
    { label: 'Nomor Kartu BPJS Ketenagakerjaan', value: b.bpjsTkNomor, mono: true },
    { label: 'Status Kepesertaan BPJS TK', value: b.bpjsTkStatus, badge: 'Aktif', badgeVariant: 'success' },
    { label: 'Cakupan Program Jamsostek', value: b.bpjsTkProgram, badge: '4 Program (JKK, JKM, JHT, JP)', badgeVariant: 'info' },
  ]
})

const bpjsKesItems = computed(() => {
  const b = profile.value.bpjs
  return [
    { label: 'Nomor Kartu BPJS Kesehatan', value: b.bpjsKesNomor, mono: true },
    { label: 'Status & Kelas Perawatan', value: b.bpjsKesStatus, badge: 'Kelas 1', badgeVariant: 'success' },
    { label: 'Fasilitas Kesehatan Tingkat 1 (Faskes)', value: b.faskes1 },
    { label: 'Jumlah Tanggungan Terdaftar', value: b.tanggunganKeluarga },
  ]
})

// ========================================================
// 4. ACTION HANDLERS
// ========================================================
const handleCopyNip = () => {
  navigator.clipboard.writeText(profile.value.nip)
  toast.success(`NIP ${profile.value.nip} berhasil disalin ke clipboard!`, 'Salin NIP')
}

const handlePrintProfile = () => {
  toast.info(`Mempersiapkan dokumen cetak biodata ${profile.value.nama}...`, 'Cetak Profil')
  window.print()
}

// Modal Edit Cepat
const isQuickEditOpen = ref(false)
const editFormData = ref({
  nama: '',
  telepon: '',
  email: '',
  jabatan: '',
})

const openQuickEdit = () => {
  editFormData.value = {
    nama: profile.value.nama,
    telepon: profile.value.pribadi.identitas.telepon,
    email: profile.value.pribadi.biodata.kredensialLogin,
    jabatan: profile.value.pribadi.pekerjaan.jabatan,
  }
  isQuickEditOpen.value = true
}

const handleSaveQuickEdit = () => {
  profile.value.nama = editFormData.value.nama
  profile.value.pribadi.biodata.namaLengkap = editFormData.value.nama
  profile.value.pribadi.pekerjaan.jabatan = editFormData.value.jabatan
  profile.value.pribadi.identitas.telepon = editFormData.value.telepon
  isQuickEditOpen.value = false
  toast.success('Perubahan data karyawan berhasil disimpan.', 'Data Diperbarui')
}

// Dokumen & Galeri Handlers
const handleDocumentPreview = (doc) => {
  toast.info(`Membuka berkas dokumen: ${doc.title} (${doc.fileName})`, 'Pratinjau Dokumen')
}

const handleDocumentDownload = (doc) => {
  toast.success(`Berkas ${doc.fileName} berhasil diunduh.`, 'Unduh Berkas')
}

const handleDocumentUpload = (doc) => {
  toast.info(`Form unggah berkas pengganti untuk "${doc.title}" dibuka.`, 'Unggah Dokumen')
}

const handleGalleryDownload = (item) => {
  toast.success(`Foto ${item.title} berhasil diunduh.`, 'Unduh Foto')
}
</script>

<template>
  <!-- Main View Container: Layout Master-Detail Kanonikal -->
  <div class="h-full flex flex-col min-h-0 overflow-hidden gap-2.5 w-full max-w-7xl mx-auto select-none relative">
    
    <!-- 1. TOP BAR: TOMBOL KEMBALI, BREADCRUMB & AKSI HALAMAN (shrink-0) -->
    <div class="flex items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-[var(--theme-border)] shrink-0">
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Tombol Kembali ke Direktori Karyawan -->
        <BaseButton
          variant="outline"
          size="sm"
          @click="router.push('/contoh-ui/karyawan')"
          class="shrink-0"
          title="Kembali ke Direktori Karyawan"
        >
          <ArrowLeft class="w-4 h-4 mr-1" />
          <span class="hidden sm:inline">Direktori</span>
        </BaseButton>

        <div class="h-5 w-px bg-neutral-200 dark:bg-[var(--theme-border)] shrink-0 hidden sm:block" />

        <!-- Breadcrumb / Header Title -->
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-xs text-neutral-400 hidden sm:inline">Karyawan /</span>
            <h1 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-[var(--theme-text-primary)] leading-none truncate">
              {{ profile.nama }}
            </h1>
            <BaseBadge
              :variant="profile.status === 'Tetap' ? 'success' : 'warning'"
              size="sm"
            >
              {{ profile.status }}
            </BaseBadge>
          </div>
          <p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
            {{ profile.jabatan }} · {{ profile.nip }} · {{ profile.lokasi }}
          </p>
        </div>
      </div>

      <!-- Action Buttons di Kanan -->
      <div class="flex items-center gap-2 shrink-0">
        <BaseButton
          variant="outline"
          size="sm"
          @click="handleCopyNip"
          title="Salin Nomor Induk Pegawai"
        >
          <Copy class="w-3.5 h-3.5 text-neutral-500" />
          <span class="hidden md:inline">Salin NIP</span>
        </BaseButton>

        <BaseButton
          variant="outline"
          size="sm"
          @click="handlePrintProfile"
          title="Cetak biodata lengkap profil karyawan"
        >
          <Printer class="w-3.5 h-3.5 text-neutral-500" />
          <span class="hidden md:inline">Cetak Profil</span>
        </BaseButton>

        <BaseButton
          variant="primary"
          size="sm"
          @click="openQuickEdit"
        >
          <Pencil class="w-3.5 h-3.5" />
          <span>Edit Karyawan</span>
        </BaseButton>
      </div>
    </div>

    <!-- 2. MAIN WORKSPACE: MASTER-DETAIL DUA KOLOM -->
    <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-3 overflow-hidden">
      
      <!-- ======================================================== -->
      <!-- SISI KIRI: PROFIL SINGKAT, GANTI KARYAWAN & MENU NAVIGASI -->
      <!-- ======================================================== -->
      <div class="w-full md:w-80 shrink-0 flex flex-col rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] shadow-2xs overflow-hidden max-h-56 md:max-h-full">
        
        <!-- Header Profil Karyawan (Sesuai Kotak Atas di Wireframe) -->
        <div class="p-4 border-b border-neutral-200/80 dark:border-[var(--theme-border)] bg-neutral-50/70 dark:bg-[var(--theme-layer-2)] shrink-0 flex flex-col items-center text-center">
          <!-- Foto / Avatar Bulat Besar -->
          <div class="relative mb-2.5">
            <BaseAvatar
              :initials="profile.avatar"
              :name="profile.nama"
              size="xl"
              class="w-16 h-16 rounded-2xl text-base shadow-sm ring-2 ring-white dark:ring-[var(--theme-surface)]"
            />
            <span
              class="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-[var(--theme-surface)] bg-emerald-500"
              title="Status: Aktif Bekerja"
            />
          </div>

          <!-- Nama, NIP, Jabatan & Kantor (Sesuai Wireframe) -->
          <h2 class="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
            {{ profile.nama }}
          </h2>
          <span class="text-xs text-neutral-500 font-mono mt-0.5">
            {{ profile.nip }}
          </span>
          <div class="flex items-center gap-1.5 mt-1.5 flex-wrap justify-center">
            <span class="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              {{ profile.jabatan }}
            </span>
          </div>
          <div class="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
            <Building2 class="w-3.5 h-3.5 text-neutral-400" />
            <span class="truncate">{{ profile.lokasi }}</span>
          </div>
        </div>

        <!-- Tombol / Dropdown: Search & Ganti Karyawan (Sesuai Wireframe) -->
        <div class="p-2.5 border-b border-neutral-200/80 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] shrink-0">
          <label class="block text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
            Cari / Ganti Karyawan:
          </label>
          <BaseSearchableSelect
            :model-value="currentEmployeeId"
            :options="employeeSelectOptions"
            placeholder="Pilih nama karyawan lain..."
            search-placeholder="Ketik nama atau NIP..."
            @update:model-value="handleSwitchEmployee"
            size="sm"
          />
        </div>

        <!-- Menu & Sub-Menu Navigasi Vertikal (Scrollable) -->
        <div class="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 custom-scroll">
          
          <!-- MENU 1: DATA PRIBADI (DENGAN 4 SUB MENU) -->
          <div class="space-y-0.5">
            <button
              type="button"
              @click="togglePribadiAccordion"
              class="w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition flex items-center justify-between cursor-pointer group"
              :class="
                activeMenu === 'pribadi'
                  ? 'bg-neutral-100 dark:bg-[var(--theme-surface-raised)] text-neutral-900 dark:text-white'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[var(--theme-surface-muted)]'
              "
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <Users class="w-4 h-4 text-[var(--theme-primary)] shrink-0" />
                <span class="truncate">Data Pribadi</span>
              </div>
              <ChevronDown
                class="w-3.5 h-3.5 text-neutral-400 transition-transform duration-200"
                :class="isPribadiMenuExpanded ? 'rotate-180' : ''"
              />
            </button>

            <!-- 4 SUB MENU DATA PRIBADI (SESUAI REQUEST USER) -->
            <div
              v-show="isPribadiMenuExpanded"
              class="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-neutral-200 dark:border-[var(--theme-border)] ml-3.5 mt-0.5"
            >
              <button
                v-for="sub in subMenusDataPribadi"
                :key="sub.id"
                type="button"
                @click="selectSubMenu(sub.id)"
                class="w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition flex items-center justify-between gap-1.5 cursor-pointer"
                :class="
                  activeMenu === 'pribadi' && activeSubMenu === sub.id
                    ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-raised)] hover:text-neutral-900 dark:hover:text-white'
                "
              >
                <div class="flex items-center gap-2 min-w-0">
                  <component :is="sub.icon" class="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span class="truncate text-[11.5px]">{{ sub.label }}</span>
                </div>
                <ChevronRight
                  v-if="activeMenu === 'pribadi' && activeSubMenu === sub.id"
                  class="w-3 h-3 shrink-0"
                />
              </button>
            </div>
          </div>

          <!-- MENU 2: PRESENSI & JAM KERJA -->
          <button
            type="button"
            @click="selectMenu('presensi')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition flex items-center justify-between cursor-pointer group"
            :class="
              activeMenu === 'presensi'
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-xs'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-raised)]'
            "
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <Clock
                class="w-4 h-4 shrink-0"
                :class="activeMenu === 'presensi' ? 'text-[var(--theme-primary-text)]' : 'text-emerald-500'"
              />
              <span class="truncate">Presensi & Jam Kerja</span>
            </div>
            <ChevronRight
              class="w-3.5 h-3.5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5"
              :class="activeMenu === 'presensi' ? 'opacity-100' : ''"
            />
          </button>

          <!-- MENU 3: PAYROLL & GAJI -->
          <button
            type="button"
            @click="selectMenu('payroll')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition flex items-center justify-between cursor-pointer group"
            :class="
              activeMenu === 'payroll'
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-xs'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-raised)]'
            "
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <Wallet
                class="w-4 h-4 shrink-0"
                :class="activeMenu === 'payroll' ? 'text-[var(--theme-primary-text)]' : 'text-amber-500'"
              />
              <span class="truncate">Payroll & Gaji</span>
            </div>
            <ChevronRight
              class="w-3.5 h-3.5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5"
              :class="activeMenu === 'payroll' ? 'opacity-100' : ''"
            />
          </button>

          <!-- MENU 4: BPJS & ASURANSI -->
          <button
            type="button"
            @click="selectMenu('bpjs')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition flex items-center justify-between cursor-pointer group"
            :class="
              activeMenu === 'bpjs'
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-xs'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-raised)]'
            "
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <HeartPulse
                class="w-4 h-4 shrink-0"
                :class="activeMenu === 'bpjs' ? 'text-[var(--theme-primary-text)]' : 'text-rose-500'"
              />
              <span class="truncate">BPJS & Asuransi</span>
            </div>
            <ChevronRight
              class="w-3.5 h-3.5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5"
              :class="activeMenu === 'bpjs' ? 'opacity-100' : ''"
            />
          </button>

          <!-- MENU 5: DOKUMEN DIGITAL -->
          <button
            type="button"
            @click="selectMenu('dokumen')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition flex items-center justify-between cursor-pointer group"
            :class="
              activeMenu === 'dokumen'
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-xs'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-raised)]'
            "
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <FileText
                class="w-4 h-4 shrink-0"
                :class="activeMenu === 'dokumen' ? 'text-[var(--theme-primary-text)]' : 'text-sky-500'"
              />
              <span class="truncate">Dokumen Digital</span>
            </div>
            <ChevronRight
              class="w-3.5 h-3.5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5"
              :class="activeMenu === 'dokumen' ? 'opacity-100' : ''"
            />
          </button>

          <!-- MENU 6: GALERI FOTO & SURAT -->
          <button
            type="button"
            @click="selectMenu('galeri')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition flex items-center justify-between cursor-pointer group"
            :class="
              activeMenu === 'galeri'
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-xs'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[var(--theme-surface-raised)]'
            "
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <ImageIcon
                class="w-4 h-4 shrink-0"
                :class="activeMenu === 'galeri' ? 'text-[var(--theme-primary-text)]' : 'text-purple-500'"
              />
              <span class="truncate">Galeri Foto & Surat</span>
            </div>
            <ChevronRight
              class="w-3.5 h-3.5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5"
              :class="activeMenu === 'galeri' ? 'opacity-100' : ''"
            />
          </button>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- SISI KANAN: ISI KONTEN DARI MENU / SUB MENU              -->
      <!-- ======================================================== -->
      <div class="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] shadow-2xs space-y-5 custom-scroll">
        
        <!-- ==================================================== -->
        <!-- KONTEN A: DATA PRIBADI (DENGAN 4 SUB-SEKSI)          -->
        <!-- ==================================================== -->
        <div v-if="activeMenu === 'pribadi'" class="space-y-5">
          <!-- Top Sub-Tabs Selector di Area Konten -->
          <div class="flex items-center justify-between gap-2 pb-3 border-b border-neutral-200/80 dark:border-[var(--theme-border)] flex-wrap">
            <div>
              <h2 class="text-base font-bold text-neutral-900 dark:text-white">
                Data Pribadi & Profil Karyawan
              </h2>
              <p class="text-xs text-neutral-500 mt-0.5">
                Rincian informasi ketenagakerjaan, biodata resmi, domisili, dan data keluarga.
              </p>
            </div>

            <!-- Tab Pills Cepat -->
            <div class="flex items-center gap-1.5 bg-neutral-100 dark:bg-[var(--theme-surface-raised)] p-1 rounded-xl text-xs overflow-x-auto max-w-full">
              <button
                type="button"
                @click="activeSubMenu = 'semua'"
                class="px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap"
                :class="activeSubMenu === 'semua' ? 'bg-white dark:bg-[var(--theme-surface)] shadow-2xs font-bold text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-800'"
              >
                Semua Seksi
              </button>
              <button
                v-for="sub in subMenusDataPribadi"
                :key="sub.id"
                type="button"
                @click="activeSubMenu = sub.id"
                class="px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1"
                :class="activeSubMenu === sub.id ? 'bg-white dark:bg-[var(--theme-surface)] shadow-2xs font-bold text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-800'"
              >
                <component :is="sub.icon" class="w-3 h-3" />
                <span>{{ sub.label }}</span>
              </button>
            </div>
          </div>

          <!-- SEKSI 1: INFORMASI PEKERJAAN, JABATAN & PENEMPATAN -->
          <div
            v-if="activeSubMenu === 'pekerjaan' || activeSubMenu === 'semua'"
            class="space-y-3 p-4 rounded-2xl bg-neutral-50/70 dark:bg-[var(--theme-surface-raised)]/40 border border-neutral-200/70 dark:border-[var(--theme-border)]"
          >
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center shrink-0">
                <Briefcase class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Informasi Pekerjaan, Jabatan & Penempatan
                </h3>
                <span class="text-[11px] text-neutral-400">Penempatan kantor, jabatan/posisi, divisi, status kepegawaian & masa kerja</span>
              </div>
            </div>
            <BaseDescriptionList :items="pekerjaanItems" :columns="2" />
          </div>

          <!-- SEKSI 2: BIODATA PRIBADI & AKUN PENGGUNA -->
          <div
            v-if="activeSubMenu === 'biodata' || activeSubMenu === 'semua'"
            class="space-y-3 p-4 rounded-2xl bg-neutral-50/70 dark:bg-[var(--theme-surface-raised)]/40 border border-neutral-200/70 dark:border-[var(--theme-border)]"
          >
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <User class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Biodata Pribadi & Akun Pengguna
                </h3>
                <span class="text-[11px] text-neutral-400">Nama lengkap, kredensial login akun, dan profil demografis</span>
              </div>
            </div>
            <BaseDescriptionList :items="biodataItems" :columns="2" />
          </div>

          <!-- SEKSI 3: IDENTITAS RESMI & KONTAK DOMISILI -->
          <div
            v-if="activeSubMenu === 'identitas' || activeSubMenu === 'semua'"
            class="space-y-3 p-4 rounded-2xl bg-neutral-50/70 dark:bg-[var(--theme-surface-raised)]/40 border border-neutral-200/70 dark:border-[var(--theme-border)]"
          >
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <CreditCard class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Identitas Resmi & Kontak Domisili
                </h3>
                <span class="text-[11px] text-neutral-400">Nomor kependudukan (KTP), nomor seluler WhatsApp, dan alamat tempat tinggal</span>
              </div>
            </div>
            <BaseDescriptionList :items="identitasItems" :columns="2" />
          </div>

          <!-- SEKSI 4: PENDIDIKAN, KELUARGA & KONTAK DARURAT -->
          <div
            v-if="activeSubMenu === 'keluarga' || activeSubMenu === 'semua'"
            class="space-y-3 p-4 rounded-2xl bg-neutral-50/70 dark:bg-[var(--theme-surface-raised)]/40 border border-neutral-200/70 dark:border-[var(--theme-border)]"
          >
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <GraduationCap class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Pendidikan, Keluarga & Kontak Darurat
                </h3>
                <span class="text-[11px] text-neutral-400">Riwayat pendidikan terakhir, data ibu kandung, dan kontak darurat</span>
              </div>
            </div>
            <BaseDescriptionList :items="keluargaItems" :columns="2" />
          </div>
        </div>

        <!-- ==================================================== -->
        <!-- KONTEN B: PRESENSI & JAM KERJA                       -->
        <!-- ==================================================== -->
        <div v-else-if="activeMenu === 'presensi'" class="space-y-4">
          <div>
            <h2 class="text-base font-bold text-neutral-900 dark:text-white">
              Presensi & Jam Kerja (30 Hari Terakhir)
            </h2>
            <p class="text-xs text-neutral-500 mt-0.5">
              Ringkasan kepatuhan jam kerja, shift aktif, dan log kehadiran GPS biometrik 5 hari terkini.
            </p>
          </div>

          <!-- Kartu Ringkasan 30 Hari (Sesuai Permintaan) -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div class="p-3 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs">
              <span class="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block">Tingkat Hadir</span>
              <span class="text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                {{ profile.presensi.kehadiranBulanIni }}
              </span>
              <span class="text-[10px] text-neutral-400">Target minimal 95%</span>
            </div>

            <div class="p-3 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs">
              <span class="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block">Tepat Waktu</span>
              <span class="text-lg font-black text-neutral-800 dark:text-neutral-200 block mt-1">
                {{ profile.presensi.tepatWaktu }} Hari
              </span>
              <span class="text-[10px] text-emerald-500">Tanpa keterlambatan</span>
            </div>

            <div class="p-3 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs">
              <span class="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block">Terlambat</span>
              <span class="text-lg font-black text-amber-600 dark:text-amber-400 block mt-1">
                {{ profile.presensi.terlambat }} Kali
              </span>
              <span class="text-[10px] text-neutral-400">Total 18 menit</span>
            </div>

            <div class="p-3 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs">
              <span class="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block">Cuti & Sakit</span>
              <span class="text-lg font-black text-sky-600 dark:text-sky-400 block mt-1">
                {{ profile.presensi.cuti + profile.presensi.sakit }} Hari
              </span>
              <span class="text-[10px] text-neutral-400">Resmi disetujui</span>
            </div>

            <div class="p-3 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs col-span-2 sm:col-span-1">
              <span class="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block">Total Jam Kerja</span>
              <span class="text-lg font-black text-purple-600 dark:text-purple-400 block mt-1">
                {{ profile.presensi.totalJamKerja }}
              </span>
              <span class="text-[10px] text-neutral-400">Sesuai kuota bulanan</span>
            </div>
          </div>

          <!-- Shift Aktif & Ketentuan Presensi -->
          <div class="p-4 rounded-2xl bg-neutral-50 dark:bg-[var(--theme-surface-raised)] border border-neutral-200/80 dark:border-[var(--theme-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center shrink-0">
                <Clock class="w-5 h-5" />
              </div>
              <div>
                <span class="font-bold text-neutral-900 dark:text-white block text-sm">
                  {{ profile.presensi.jadwalShift }}
                </span>
                <span class="text-neutral-500 text-xs">
                  Toleransi Keterlambatan: <strong>{{ profile.presensi.toleransiTelat }}</strong> · Radius GPS: <strong>{{ profile.presensi.lokasiGeofence }}</strong>
                </span>
              </div>
            </div>
            <BaseBadge variant="success" size="md">
              Shift Aktif Berjalan
            </BaseBadge>
          </div>

          <!-- Tabel Log Presensi 5 Hari Terkini -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Log Kehadiran 5 Hari Terkini (GPS Biometrik)
            </h3>
            <div class="rounded-xl border border-neutral-200/80 dark:border-[var(--theme-border)] overflow-hidden">
              <table class="w-full text-left text-xs">
                <thead class="bg-neutral-50 dark:bg-[var(--theme-surface-raised)] text-[11px] font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-200/80 dark:border-[var(--theme-border)]">
                  <tr>
                    <th class="py-2.5 px-3">Tanggal</th>
                    <th class="py-2.5 px-3">Jam Masuk</th>
                    <th class="py-2.5 px-3">Jam Pulang</th>
                    <th class="py-2.5 px-3">Status</th>
                    <th class="py-2.5 px-3">Lokasi / Akurasi GPS</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-200/60 dark:divide-[var(--theme-border)]">
                  <tr v-for="log in profile.presensi.riwayatTerbaru" :key="log.tgl" class="hover:bg-neutral-50/50 dark:hover:bg-[var(--theme-surface-raised)]/50">
                    <td class="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">{{ log.tgl }}</td>
                    <td class="py-2.5 px-3 font-mono font-medium text-emerald-600 dark:text-emerald-400">{{ log.masuk }}</td>
                    <td class="py-2.5 px-3 font-mono font-medium text-neutral-700 dark:text-neutral-300">{{ log.pulang }}</td>
                    <td class="py-2.5 px-3">
                      <BaseBadge
                        :variant="log.status.includes('Tepat') ? 'success' : log.status.includes('Terlambat') ? 'warning' : 'info'"
                        size="sm"
                      >
                        {{ log.status }}
                      </BaseBadge>
                    </td>
                    <td class="py-2.5 px-3 text-neutral-500 flex items-center gap-1">
                      <MapPin class="w-3.5 h-3.5 text-neutral-400" />
                      <span>{{ log.lokasi }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ==================================================== -->
        <!-- KONTEN C: PAYROLL & GAJI                             -->
        <!-- ==================================================== -->
        <div v-else-if="activeMenu === 'payroll'" class="space-y-4">
          <div>
            <h2 class="text-base font-bold text-neutral-900 dark:text-white">
              Payroll, Kompensasi & Rekening Gaji
            </h2>
            <p class="text-xs text-neutral-500 mt-0.5">
              Rincian penghasilan kotor, tunjangan, potongan BPJS & PPh 21, serta estimasi penerimaan gaji bersih (netto).
            </p>
          </div>

          <!-- Highlight Banner Estimasi Gaji Netto -->
          <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[var(--theme-primary)]/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span class="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                Estimasi Gaji Bersih Diterima (Take Home Pay)
              </span>
              <span class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono block mt-1">
                {{ formatRupiah(profile.payroll.netSalaryEstimasi) }}
              </span>
              <span class="text-[11px] text-neutral-400 mt-0.5 block">
                Perhitungan otomatis berbasis PPh 21 TER Kategori A (Gross-Up Perusahaan)
              </span>
            </div>
            <div class="text-right shrink-0">
              <BaseBadge variant="success" size="md">
                Status Rekening Aktif
              </BaseBadge>
            </div>
          </div>

          <!-- Rincian Penghasilan & Tunjangan -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Komponen Penghasilan & Tunjangan
            </h3>
            <BaseDescriptionList :items="payrollIncomeItems" :columns="2" />
          </div>

          <!-- Rincian Potongan Wajib -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Potongan Iuran & Pajak Karyawan
            </h3>
            <BaseDescriptionList :items="payrollDeductionItems" :columns="2" />
          </div>

          <!-- Data Rekening Bank Payroll -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Informasi Rekening Bank Payroll
            </h3>
            <BaseDescriptionList :items="payrollBankItems" :columns="2" />
          </div>
        </div>

        <!-- ==================================================== -->
        <!-- KONTEN D: BPJS & ASURANSI                            -->
        <!-- ==================================================== -->
        <div v-else-if="activeMenu === 'bpjs'" class="space-y-4">
          <div>
            <h2 class="text-base font-bold text-neutral-900 dark:text-white">
              Kepesertaan BPJS & Jaminan Sosial
            </h2>
            <p class="text-xs text-neutral-500 mt-0.5">
              Data nomor kartu jaminan sosial tenaga kerja, jaminan kesehatan, dan fasilitas kesehatan terdaftar.
            </p>
          </div>

          <!-- Kartu BPJS Ketenagakerjaan -->
          <div class="p-4 rounded-2xl bg-neutral-50/70 dark:bg-[var(--theme-surface-raised)]/40 border border-neutral-200/80 dark:border-[var(--theme-border)] space-y-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  TK
                </div>
                <div>
                  <h3 class="text-sm font-bold text-neutral-900 dark:text-white">
                    BPJS Ketenagakerjaan (Jamsostek)
                  </h3>
                  <span class="text-[11px] text-neutral-400">Perlindungan jaminan kecelakaan kerja, kematian, hari tua & pensiun</span>
                </div>
              </div>
              <BaseBadge variant="success" size="sm">
                Terproteksi Aktif
              </BaseBadge>
            </div>
            <BaseDescriptionList :items="bpjsTkItems" :columns="1" />
          </div>

          <!-- Kartu BPJS Kesehatan -->
          <div class="p-4 rounded-2xl bg-neutral-50/70 dark:bg-[var(--theme-surface-raised)]/40 border border-neutral-200/80 dark:border-[var(--theme-border)] space-y-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                  KES
                </div>
                <div>
                  <h3 class="text-sm font-bold text-neutral-900 dark:text-white">
                    BPJS Kesehatan
                  </h3>
                  <span class="text-[11px] text-neutral-400">Jaminan pemeliharaan kesehatan kelas 1 bagi karyawan dan keluarga</span>
                </div>
              </div>
              <BaseBadge variant="success" size="sm">
                Terdaftar Kelas 1
              </BaseBadge>
            </div>
            <BaseDescriptionList :items="bpjsKesItems" :columns="1" />
          </div>
        </div>

        <!-- ==================================================== -->
        <!-- KONTEN E: DOKUMEN DIGITAL (BASE DOCUMENT LIST)       -->
        <!-- ==================================================== -->
        <div v-else-if="activeMenu === 'dokumen'" class="space-y-4">
          <div class="flex items-center justify-between gap-2">
            <div>
              <h2 class="text-base font-bold text-neutral-900 dark:text-white">
                Arsip Dokumen Digital Karyawan
              </h2>
              <p class="text-xs text-neutral-500 mt-0.5">
                KTP, NPWP, Kartu Keluarga, Ijazah S1, dan SK Perjanjian Kerja (PKWTT/PKWT) terverifikasi.
              </p>
            </div>
            <BaseButton
              variant="outline"
              size="sm"
              @click="toast.info('Pilih berkas dari perangkat Anda untuk diunggah.', 'Unggah Berkas Baru')"
            >
              <FileText class="w-3.5 h-3.5 mr-1 text-[var(--theme-primary)]" />
              <span>Unggah Dokumen</span>
            </BaseButton>
          </div>

          <!-- Komponen BaseDocumentList -->
          <BaseDocumentList
            :documents="profile.dokumen"
            @preview="handleDocumentPreview"
            @download="handleDocumentDownload"
            @upload="handleDocumentUpload"
          />
        </div>

        <!-- ==================================================== -->
        <!-- KONTEN F: GALERI FOTO & SURAT (BASE GALLERY)         -->
        <!-- ==================================================== -->
        <div v-else-if="activeMenu === 'galeri'" class="space-y-4">
          <div>
            <h2 class="text-base font-bold text-neutral-900 dark:text-white">
              Galeri Foto Presensi, Surat & Dokumentasi Kerja
            </h2>
            <p class="text-xs text-neutral-500 mt-0.5">
              Foto selfie absensi biometrik GPS, surat keterangan dokter (SKD), dan foto seragam/kerja.
            </p>
          </div>

          <!-- Komponen BaseGallery -->
          <BaseGallery
            :items="profile.galeri"
            @download="handleGalleryDownload"
          />
        </div>
      </div>
    </div>

    <!-- MODAL EDIT CEPAT DATA KARYAWAN -->
    <BaseModal
      v-model="isQuickEditOpen"
      title="Ubah Data Pokok Karyawan"
      subtitle="Perbarui nama, jabatan, email, dan nomor telepon karyawan"
      size="md"
    >
      <div class="space-y-3 text-xs">
        <div>
          <BaseInput
            v-model="editFormData.nama"
            label="Nama Lengkap & Gelar"
            placeholder="Masukkan nama lengkap..."
            required
          />
        </div>
        <div>
          <BaseInput
            v-model="editFormData.jabatan"
            label="Jabatan / Posisi Kerja"
            placeholder="Masukkan jabatan..."
            required
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <BaseInput
              v-model="editFormData.email"
              label="Email Kedinasan"
              placeholder="nama@digaji.id"
              required
            />
          </div>
          <div>
            <BaseInput
              v-model="editFormData.telepon"
              label="Nomor WhatsApp / Telp"
              placeholder="0812-xxxx-xxxx"
              required
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <BaseButton variant="outline" size="sm" @click="isQuickEditOpen = false">
            Batal
          </BaseButton>
          <BaseButton variant="primary" size="sm" @click="handleSaveQuickEdit">
            Simpan Perubahan
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
