<script setup>
import { ref, computed } from 'vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import BaseStatCard from '../../components/ui/BaseStatCard.vue'
import BaseAvatar from '../../components/ui/BaseAvatar.vue'
import BaseDatePicker from '../../components/ui/BaseDatePicker.vue'
import BaseSearchableSelect from '../../components/ui/BaseSearchableSelect.vue'
import BaseProgress from '../../components/ui/BaseProgress.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseSlideOver from '../../components/ui/BaseSlideOver.vue'
import BaseAlert from '../../components/ui/BaseAlert.vue'
import BaseDescriptionList from '../../components/ui/BaseDescriptionList.vue'
import { useToast } from '../../composables/useToast'
import {
  hrisBranches,
  hrisKpiMetrics,
  hrisShiftSummary,
  hrisLiveAttendance,
  hrisPendingApprovals,
  hrisDepartmentBreakdown,
  hrisContractBreakdown,
  hrisComplianceAlerts,
  hrisUpcomingHolidays,
} from '../../data/hrisDashboardData'
import {
  Users,
  UserCheck,
  Coffee,
  Wallet,
  Building2,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Send,
  Calendar,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Check,
  X,
  ExternalLink,
  Info,
} from 'lucide-vue-next'

const toast = useToast()

// ========================================================
// 1. FILTER & STATE KONTROL
// ========================================================
const selectedBranch = ref('all')
const branchOptions = hrisBranches.map((b) => ({
  value: b.id,
  label: `${b.label} (${b.tz})`,
}))

const selectedPeriod = ref({
  start: '2026-10-26',
  end: '2026-11-25',
})

const isRefreshing = ref(false)

const handleRefresh = async () => {
  isRefreshing.value = true
  await new Promise((resolve) => setTimeout(resolve, 600))
  isRefreshing.value = false
  toast.success('Data presensi dan metrik HRIS berhasil diperbarui!', 'Live Sync')
}

// ========================================================
// 2. APPROVAL LIST INTERAKTIF
// ========================================================
const approvals = ref([...hrisPendingApprovals])

const handleApprove = (item) => {
  approvals.value = approvals.value.filter((a) => a.id !== item.id)
  toast.success(`Pengajuan ${item.type} untuk ${item.applicant} berhasil disetujui!`, 'Approval Berhasil')
}

const handleReject = (item) => {
  approvals.value = approvals.value.filter((a) => a.id !== item.id)
  toast.warning(`Pengajuan ${item.type} untuk ${item.applicant} telah ditolak.`, 'Approval Ditolak')
}

// ========================================================
// 3. DETAIL PRESENSI SLIDE-OVER
// ========================================================
const isSlideOverOpen = ref(false)
const selectedAttendance = ref(null)

const openAttendanceDetail = (att) => {
  selectedAttendance.value = att
  isSlideOverOpen.value = true
}

const attendanceDetailItems = computed(() => {
  if (!selectedAttendance.value) return []
  const a = selectedAttendance.value
  return [
    { label: 'Nama Lengkap', value: a.name },
    { label: 'Jabatan & Divisi', value: `${a.role} (${a.dept})` },
    { label: 'Kantor / Cabang', value: a.branch },
    { label: 'Waktu Presensi', value: a.time },
    { label: 'Shift Kerja', value: a.shift },
    { label: 'Validasi Biometrik', value: a.device },
    { label: 'Lokasi Geofence', value: a.locationAccuracy },
    { label: 'Status Kehadiran', value: a.statusLabel },
  ]
})

// ========================================================
// 4. MODAL PROSES PAYROLL
// ========================================================
const isPayrollModalOpen = ref(false)
const isPayrollProcessing = ref(false)

const handleExecutePayroll = async () => {
  isPayrollProcessing.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  isPayrollProcessing.value = false
  isPayrollModalOpen.value = false
  toast.success('Kalkulasi pra-payroll berhasil dieksekusi untuk seluruh cabang!', 'Payroll Siap')
}

// ========================================================
// 5. MODAL BROADCAST
// ========================================================
const isBroadcastModalOpen = ref(false)
const broadcastMessage = ref('')

const handleSendBroadcast = () => {
  if (!broadcastMessage.value.trim()) {
    toast.warning('Tuliskan pesan pengumuman terlebih dahulu.')
    return
  }
  isBroadcastModalOpen.value = false
  broadcastMessage.value = ''
  toast.success('Pengumuman berhasil disiarkan ke aplikasi mobile seluruh karyawan aktif!', 'Broadcast Terkirim')
}

// Ekspor Rekap Presensi
const handleExportAttendance = () => {
  toast.info('File Rekap_Presensi_November_2026.xlsx sedang disiapkan...', 'Mengunduh Laporan')
  setTimeout(() => {
    toast.success('Rekap presensi berhasil diunduh dalam format Excel.', 'Unduhan Selesai')
  }, 1000)
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6 select-none w-full pb-10">

    <!-- ======================================================== -->
    <!-- 1. HEADER HALAMAN & KONTROL FILTER CABANG / PERIODE      -->
    <!-- ======================================================== -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-[var(--theme-border)]">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] border border-[var(--theme-primary)]/20">
            SaaS HRIS & Payroll
          </span>
          <span class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Multi-Cabang
          </span>
        </div>
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
          Dashboard Eksekutif HRIS
        </h1>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Pemantauan terpusat operasional SDM, presensi biometrik, jadwal shift, dan cut-off payroll
        </p>
      </div>

      <!-- Action Buttons & Branch Selector -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Filter Cabang -->
        <div class="w-56 sm:w-64">
          <BaseSearchableSelect
            v-model="selectedBranch"
            :options="branchOptions"
            placeholder="Pilih Cabang"
            size="sm"
          />
        </div>

        <!-- Tombol Sync Refresh -->
        <BaseButton
          variant="secondary"
          size="sm"
          :loading="isRefreshing"
          @click="handleRefresh"
          title="Sinkronisasi Data Presensi Real-Time"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="isRefreshing ? 'animate-spin' : ''" />
        </BaseButton>

        <!-- Quick Action: Proses Payroll -->
        <BaseButton
          variant="primary"
          size="sm"
          @click="isPayrollModalOpen = true"
        >
          <Wallet class="w-3.5 h-3.5 mr-1.5" />
          <span>Proses Payroll</span>
        </BaseButton>
      </div>
    </header>

    <!-- Banner Kepatuhan / Notifikasi Penting -->
    <BaseAlert
      variant="info"
      title="Periode Cut-Off Payroll Berjalan: 26 Okt - 25 Nov 2026"
      description="Verifikasi absensi dan persetujuan lembur/cuti ditutup dalam 5 hari lagi. Pastikan seluruh cabang telah menyelesaikan verifikasi data kehadiran."
      action-text="Unduh Rekap Presensi"
      @action="handleExportAttendance"
    />

    <!-- ======================================================== -->
    <!-- 2. KARTU METRIK EKSEKUTIF HRIS (BaseStatCard)             -->
    <!-- ======================================================== -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      <!-- KPI 1: Total Karyawan -->
      <BaseStatCard
        title="Total Karyawan Aktif"
        :value="hrisKpiMetrics.totalKaryawan.value"
        unit="orang"
        :trend="hrisKpiMetrics.totalKaryawan.trend"
        :trend-direction="hrisKpiMetrics.totalKaryawan.trendDirection"
        :badge-text="hrisKpiMetrics.totalKaryawan.badgeText"
        :subtext="hrisKpiMetrics.totalKaryawan.subtext"
        :icon="Users"
        variant="primary"
      />

      <!-- KPI 2: Kehadiran Hari Ini -->
      <BaseStatCard
        title="Kehadiran Hari Ini"
        :value="hrisKpiMetrics.kehadiranHariIni.value"
        unit="%"
        :trend="hrisKpiMetrics.kehadiranHariIni.trend"
        :trend-direction="hrisKpiMetrics.kehadiranHariIni.trendDirection"
        :badge-text="hrisKpiMetrics.kehadiranHariIni.badgeText"
        :subtext="hrisKpiMetrics.kehadiranHariIni.subtext"
        :icon="UserCheck"
        variant="emerald"
      />

      <!-- KPI 3: Cuti & Izin Aktif -->
      <BaseStatCard
        title="Cuti, Sakit & Izin"
        :value="hrisKpiMetrics.cutiDanIzin.value"
        unit="staf"
        :trend="hrisKpiMetrics.cutiDanIzin.trend"
        :trend-direction="hrisKpiMetrics.cutiDanIzin.trendDirection"
        :badge-text="hrisKpiMetrics.cutiDanIzin.badgeText"
        :subtext="hrisKpiMetrics.cutiDanIzin.subtext"
        :icon="Coffee"
        variant="amber"
      />

      <!-- KPI 4: Estimasi Payroll Berjalan -->
      <BaseStatCard
        title="Estimasi Payroll Berjalan"
        :value="5.42"
        prefix="Rp "
        unit="M"
        :trend="hrisKpiMetrics.estimasiPayroll.trend"
        :trend-direction="hrisKpiMetrics.estimasiPayroll.trendDirection"
        :badge-text="hrisKpiMetrics.estimasiPayroll.badgeText"
        :subtext="hrisKpiMetrics.estimasiPayroll.subtext"
        :icon="Wallet"
        variant="violet"
      />
    </section>

    <!-- ======================================================== -->
    <!-- 3. BAGIAN TENGAH: REAL-TIME ATTENDANCE FEED & SHIFT GRID -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

      <!-- Kolom Kiri (7 Kolom): Stream Presensi Real-Time -->
      <div class="lg:col-span-7 flex flex-col rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] overflow-hidden shadow-xs">
        <!-- Card Header -->
        <div class="p-4 sm:p-5 border-b border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] flex items-center justify-center shrink-0">
              <Activity class="w-4 h-4" />
            </div>
            <div>
              <h2 class="text-sm font-bold text-neutral-900 dark:text-white">
                Stream Presensi Real-Time
              </h2>
              <p class="text-[11px] text-neutral-500 dark:text-neutral-400">
                Log absensi masuk/pulang terverifikasi GPS & biometrik
              </p>
            </div>
          </div>

          <BaseButton
            variant="ghost"
            size="xs"
            @click="handleExportAttendance"
          >
            <Download class="w-3.5 h-3.5 mr-1" />
            <span>Ekspor</span>
          </BaseButton>
        </div>

        <!-- Attendance List Items -->
        <div class="divide-y divide-neutral-100 dark:divide-[var(--theme-border)] flex-1 overflow-y-auto max-h-[380px]">
          <div
            v-for="att in hrisLiveAttendance"
            :key="att.id"
            @click="openAttendanceDetail(att)"
            class="p-3.5 sm:px-4 sm:py-3 hover:bg-neutral-50/80 dark:hover:bg-[var(--theme-surface-muted)] transition flex items-center justify-between gap-3 cursor-pointer group"
          >
            <!-- Avatar & Profil Singkat -->
            <div class="flex items-center gap-3 min-w-0">
              <BaseAvatar
                :name="att.name"
                size="md"
                :status="att.status === 'ontime' ? 'online' : 'busy'"
              />
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-[var(--theme-primary)] transition">
                    {{ att.name }}
                  </span>
                  <BaseBadge
                    :variant="att.status === 'ontime' ? 'success' : 'warning'"
                    size="xs"
                  >
                    {{ att.statusLabel }}
                  </BaseBadge>
                </div>
                <div class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1.5 mt-0.5">
                  <span>{{ att.role }}</span>
                  <span>·</span>
                  <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ att.branch }}</span>
                </div>
              </div>
            </div>

            <!-- Jam Presensi & Indikator Validasi -->
            <div class="text-right shrink-0">
              <div class="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-end gap-1">
                <Clock class="w-3 h-3 text-neutral-400" />
                <span>{{ att.time }}</span>
              </div>
              <div class="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                {{ att.locationAccuracy }}
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="px-4 py-2.5 bg-neutral-50 dark:bg-[var(--theme-surface)] border-t border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between text-[11px] text-neutral-500">
          <span>Menampilkan 6 presensi terbaru</span>
          <span class="text-[var(--theme-primary)] font-medium">Klik baris untuk detail verifikasi</span>
        </div>
      </div>

      <!-- Kolom Kanan (5 Kolom): Rangkuman Shift Kerja Hari Ini -->
      <div class="lg:col-span-5 flex flex-col rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] p-4 sm:p-5 shadow-xs">
        <div class="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[var(--theme-border)]">
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-[var(--theme-primary)]" />
            <h2 class="text-sm font-bold text-neutral-900 dark:text-white">
              Status Shift Hari Ini
            </h2>
          </div>
          <span class="text-xs text-neutral-500 dark:text-neutral-400">
            Total 1.284 Personil
          </span>
        </div>

        <!-- List Shift -->
        <div class="space-y-4 my-auto py-3">
          <div
            v-for="shift in hrisShiftSummary"
            :key="shift.id"
            class="space-y-1.5 p-3 rounded-xl bg-neutral-50/60 dark:bg-[var(--theme-surface)] border border-neutral-100 dark:border-[var(--theme-border)]"
          >
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="font-bold text-neutral-800 dark:text-neutral-200">{{ shift.name }}</span>
                <span class="text-[11px] text-neutral-400">({{ shift.time }})</span>
              </div>
              <div class="font-semibold text-neutral-900 dark:text-white">
                <span v-if="shift.id !== 'off'">{{ shift.present }} / {{ shift.total }} Hadir</span>
                <span v-else>{{ shift.total }} Karyawan</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <BaseProgress
              v-if="shift.id !== 'off'"
              :value="Math.round((shift.present / shift.total) * 100)"
              :variant="shift.id === 'pagi' ? 'primary' : (shift.id === 'siang' ? 'warning' : 'info')"
              size="sm"
            />
          </div>
        </div>

        <!-- Quick Action Footer: Broadcast -->
        <div class="pt-3 border-t border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between">
          <span class="text-xs text-neutral-500 dark:text-neutral-400">Ada kendala pergantian shift?</span>
          <BaseButton
            variant="secondary"
            size="xs"
            @click="isBroadcastModalOpen = true"
          >
            <Send class="w-3 h-3 mr-1" />
            <span>Kirim Broadcast</span>
          </BaseButton>
        </div>
      </div>

    </div>

    <!-- ======================================================== -->
    <!-- 4. PENDING APPROVALS BAR (ALUR PERSETUJUAN CEPAT)         -->
    <!-- ======================================================== -->
    <section class="rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] p-4 sm:p-5 shadow-xs">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200 dark:border-[var(--theme-border)]">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
            {{ approvals.length }}
          </div>
          <div>
            <h2 class="text-sm font-bold text-neutral-900 dark:text-white">
              Persetujuan Menunggu Tindakan (Pending Approvals)
            </h2>
            <p class="text-[11px] text-neutral-500 dark:text-neutral-400">
              Permohonan cuti tahunan, jam lembur, dan klaim medis yang membutuhkan tindakan HRD / L2
            </p>
          </div>
        </div>
      </div>

      <!-- Approvals List -->
      <div v-if="approvals.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3.5">
        <div
          v-for="item in approvals"
          :key="item.id"
          class="p-3.5 rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] bg-neutral-50/40 dark:bg-[var(--theme-surface)] flex flex-col justify-between gap-3 hover:border-neutral-300 dark:hover:border-[var(--theme-border-strong)] transition"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <BaseAvatar :name="item.applicant" size="sm" />
              <div>
                <span class="text-xs font-bold text-neutral-900 dark:text-white block leading-tight">
                  {{ item.applicant }}
                </span>
                <span class="text-[10px] text-neutral-500 dark:text-neutral-400">
                  {{ item.dept }} · {{ item.approverLevel }}
                </span>
              </div>
            </div>
            <BaseBadge :variant="item.typeBadge" size="xs">
              {{ item.type }}
            </BaseBadge>
          </div>

          <!-- Keterangan & Alasan -->
          <div class="text-xs bg-white dark:bg-[var(--theme-surface-muted)] p-2.5 rounded-lg border border-neutral-100 dark:border-[var(--theme-border)] space-y-0.5">
            <div class="font-medium text-neutral-800 dark:text-neutral-200">
              Durasi: {{ item.duration }}
            </div>
            <div class="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
              "{{ item.reason }}"
            </div>
          </div>

          <!-- Tombol Tindakan Langsung -->
          <div class="flex items-center justify-end gap-2 pt-1 border-t border-neutral-200/60 dark:border-[var(--theme-border)]/60">
            <BaseButton
              variant="neutral"
              size="xs"
              @click="handleReject(item)"
            >
              <X class="w-3.5 h-3.5 mr-1 text-rose-500" />
              <span>Tolak</span>
            </BaseButton>

            <BaseButton
              variant="primary"
              size="xs"
              @click="handleApprove(item)"
            >
              <Check class="w-3.5 h-3.5 mr-1" />
              <span>Setujui</span>
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- State Kosong Jika Semua Telah Disetujui -->
      <div v-else class="text-center py-8">
        <CheckCircle2 class="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
        <p class="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Semua permohonan telah selesai diproses!</p>
        <p class="text-[11px] text-neutral-500">Tidak ada pengajuan cuti atau lembur yang tertunda saat ini.</p>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 5. DEMOGRAFI, DEPARTEMEN & PENGINGAT KEPATUHAN SDM       -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

      <!-- Kolom Kiri (6 Kolom): Distribusi Departemen (SVG Murni) -->
      <div class="lg:col-span-6 rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[var(--theme-border)]">
            <div class="flex items-center gap-2">
              <Layers class="w-4 h-4 text-[var(--theme-primary)]" />
              <h2 class="text-sm font-bold text-neutral-900 dark:text-white">
                Komposisi Divisi & Departemen
              </h2>
            </div>
            <span class="text-xs text-neutral-500">5 Unit Kerja</span>
          </div>

          <!-- Chart Bar Horizontal Murni SVG & CSS -->
          <div class="space-y-3.5 py-4">
            <div
              v-for="dept in hrisDepartmentBreakdown"
              :key="dept.name"
              class="space-y-1.5"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ dept.name }}</span>
                <span class="font-semibold text-neutral-900 dark:text-white">{{ dept.count }} orang ({{ dept.percent }}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-neutral-100 dark:bg-[var(--theme-surface-muted)] overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{ width: `${dept.percent}%`, backgroundColor: dept.color }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between text-[11px] text-neutral-500">
          <span>Struktur organisasi lengkap dapat dilihat di modul Organisasi</span>
          <span class="text-[var(--theme-primary)] font-semibold flex items-center gap-1 cursor-pointer hover:underline">
            Bagan Org <ChevronRight class="w-3 h-3" />
          </span>
        </div>
      </div>

      <!-- Kolom Kanan (6 Kolom): Status Kontrak & Pengingat Kepatuhan -->
      <div class="lg:col-span-6 space-y-4">
        <!-- Status Ikatan Kerja -->
        <div class="rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] p-4 shadow-xs">
          <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
            Status Ikatan Hubungan Kerja
          </h2>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div
              v-for="contract in hrisContractBreakdown"
              :key="contract.label"
              class="p-2.5 rounded-xl bg-neutral-50/80 dark:bg-[var(--theme-surface)] border border-neutral-100 dark:border-[var(--theme-border)] text-center"
            >
              <span class="text-[10px] text-neutral-500 block truncate">{{ contract.label }}</span>
              <span class="text-base font-bold text-neutral-900 dark:text-white block mt-0.5">{{ contract.count }}</span>
              <span class="text-[10px] text-neutral-400 font-medium">{{ contract.percent }}%</span>
            </div>
          </div>
        </div>

        <!-- Alert Kepatuhan & Jatuh Tempo -->
        <div class="rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] p-4 shadow-xs space-y-2.5">
          <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <AlertTriangle class="w-3.5 h-3.5 text-amber-500" />
            <span>Pengingat Masa Kerja & Legalitas</span>
          </h2>

          <div class="space-y-2">
            <div
              v-for="alert in hrisComplianceAlerts"
              :key="alert.id"
              class="p-2.5 rounded-xl border border-neutral-100 dark:border-[var(--theme-border)] bg-neutral-50/60 dark:bg-[var(--theme-surface)] flex items-center justify-between gap-3"
            >
              <div class="min-w-0">
                <span class="text-xs font-semibold text-neutral-900 dark:text-white block truncate">
                  {{ alert.title }}
                </span>
                <span class="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate">
                  {{ alert.desc }}
                </span>
              </div>
              <BaseButton
                variant="neutral"
                size="xs"
                @click="toast.info(`Membuka rincian: ${alert.title}`)"
                class="shrink-0"
              >
                {{ alert.actionText }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ======================================================== -->
    <!-- MODAL: PRA-PAYROLL KALKULASI                             -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="isPayrollModalOpen"
      title="Konfirmasi Pra-Kalkulasi Payroll"
      size="md"
    >
      <div class="space-y-4 text-xs text-neutral-600 dark:text-neutral-300">
        <BaseAlert
          variant="warning"
          title="Verifikasi Akhir Sebelum Cut-Off"
          description="Kalkulasi ini akan menghitung akumulasi jam hadir, keterlambatan, lembur L1/L2, serta potongan BPJS & PPh 21 untuk 1.284 karyawan."
        />

        <div class="p-3.5 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] space-y-2">
          <div class="flex justify-between">
            <span class="text-neutral-500">Periode Payroll:</span>
            <span class="font-bold text-neutral-900 dark:text-white">26 Okt 2026 s/d 25 Nov 2026</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">Cabang Tercakup:</span>
            <span class="font-bold text-neutral-900 dark:text-white">Semua Cabang (Jakarta, Surabaya, Bali, Medan)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">Total Estimasi Net Payroll:</span>
            <span class="font-bold text-[var(--theme-primary)] text-sm">Rp 5.420.800.000</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton
            variant="neutral"
            size="sm"
            @click="isPayrollModalOpen = false"
            :disabled="isPayrollProcessing"
          >
            Batal
          </BaseButton>
          <BaseButton
            variant="primary"
            size="sm"
            :loading="isPayrollProcessing"
            @click="handleExecutePayroll"
          >
            Mulai Hitung Pra-Payroll
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- ======================================================== -->
    <!-- MODAL: BROADCAST PENGUMUMAN                              -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="isBroadcastModalOpen"
      title="Siarkan Pengumuman ke Karyawan"
      size="md"
    >
      <div class="space-y-3.5 text-xs">
        <p class="text-neutral-600 dark:text-neutral-400">
          Pesan ini akan dikirimkan via push notification aplikasi Digaji Mobile dan terpasang di papan pengumuman karyawan.
        </p>

        <div>
          <label class="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Isi Pesan Pengumuman
          </label>
          <textarea
            v-model="broadcastMessage"
            rows="4"
            placeholder="Contoh: Pengingat penyesuaian jadwal shift malam untuk cabang Surabaya sehubungan dengan perbaikan trafo listrik..."
            class="w-full p-3 rounded-xl border border-neutral-300 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition text-xs"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton
            variant="neutral"
            size="sm"
            @click="isBroadcastModalOpen = false"
          >
            Batal
          </BaseButton>
          <BaseButton
            variant="primary"
            size="sm"
            @click="handleSendBroadcast"
          >
            <Send class="w-3.5 h-3.5 mr-1" />
            <span>Kirim Sekarang</span>
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- ======================================================== -->
    <!-- SLIDE-OVER: DETAIL VERIFIKASI PRESENSI                    -->
    <!-- ======================================================== -->
    <BaseSlideOver
      v-model="isSlideOverOpen"
      title="Detail Verifikasi Presensi"
      size="md"
    >
      <div v-if="selectedAttendance" class="space-y-4 text-xs">
        <!-- Header Profil Karyawan -->
        <div class="p-3.5 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] flex items-center gap-3">
          <BaseAvatar
            :name="selectedAttendance.name"
            size="lg"
            :status="selectedAttendance.status === 'ontime' ? 'online' : 'busy'"
          />
          <div>
            <h3 class="text-sm font-bold text-neutral-900 dark:text-white">
              {{ selectedAttendance.name }}
            </h3>
            <p class="text-neutral-500">{{ selectedAttendance.role }}</p>
            <div class="mt-1">
              <BaseBadge
                :variant="selectedAttendance.status === 'ontime' ? 'success' : 'warning'"
                size="xs"
              >
                {{ selectedAttendance.statusLabel }}
              </BaseBadge>
            </div>
          </div>
        </div>

        <!-- Rincian Data Presensi -->
        <BaseDescriptionList
          :items="attendanceDetailItems"
          layout="divided"
        />

        <!-- Simulasi Foto Selfie & Geofence Valid -->
        <div class="p-3.5 rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] bg-neutral-50/50 dark:bg-[var(--theme-surface)] space-y-2">
          <span class="font-bold text-neutral-800 dark:text-neutral-200 block">
            Verifikasi Lokasi & Biometrik Wajah
          </span>
          <div class="h-28 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 text-[11px] gap-2 border border-dashed border-neutral-300 dark:border-neutral-700">
            <ShieldCheck class="w-4 h-4 text-emerald-500" />
            <span>Koordinat GPS & Liveness Detection Terverifikasi</span>
          </div>
        </div>
      </div>
    </BaseSlideOver>

  </div>
</template>

