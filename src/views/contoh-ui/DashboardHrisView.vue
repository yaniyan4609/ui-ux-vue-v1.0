<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import BaseStatCard from '../../components/ui/BaseStatCard.vue'
import BaseAvatar from '../../components/ui/BaseAvatar.vue'
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
  hrisAttendanceTrendPresets,
  hrisDisciplineDistribution,
  hrisOvertimeByDept,
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
  Check,
  X,
  Waves,
  PieChart,
  BarChart3,
  TrendingUp,
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

const isRefreshing = ref(false)

const handleRefresh = async () => {
  isRefreshing.value = true
  await new Promise((resolve) => setTimeout(resolve, 600))
  isRefreshing.value = false
  toast.success('Data presensi dan metrik HRIS berhasil disinkronisasi!', 'Live Sync')
}

// ========================================================
// 2. DIAGRAM OMBAK (INTERACTIVE HARMONIC WAVE AREA CHART)
// ========================================================
const selectedTrendPeriod = ref('7hari') // '7hari' | '14hari' | '30hari'
const currentTrend = computed(() => hrisAttendanceTrendPresets[selectedTrendPeriod.value] || hrisAttendanceTrendPresets['7hari'])

const svgWidth = 800
const svgHeight = 220
const padX = 35
const padYTop = 25
const padYBottom = 35

const isWaveActive = ref(true)
const wavePhase = ref(0)
const waveAmplitude = ref(3.8) // Amplitude gelombang dalam pixel
const isHoveringChart = ref(false)
const activeHoverIdx = ref(null)
let waveFrameId = null

const startWaveLoop = () => {
  if (waveFrameId) cancelAnimationFrame(waveFrameId)
  const step = () => {
    if (isWaveActive.value && !isHoveringChart.value && !isRefreshing.value) {
      wavePhase.value = (wavePhase.value + 0.036) % (Math.PI * 2)
    }
    waveFrameId = requestAnimationFrame(step)
  }
  waveFrameId = requestAnimationFrame(step)
}

const stopWaveLoop = () => {
  if (waveFrameId) {
    cancelAnimationFrame(waveFrameId)
    waveFrameId = null
  }
}

const toggleWave = () => {
  isWaveActive.value = !isWaveActive.value
  toast.info(
    isWaveActive.value ? 'Animasi ombak dinamis diaktifkan' : 'Animasi ombak dijeda',
    'Diagram Ombak'
  )
}

// Y Mapping
const getYPresence = (pct) => {
  const min = currentTrend.value.minPct
  const max = currentTrend.value.maxPct
  const plotH = svgHeight - padYTop - padYBottom
  const normalized = Math.max(0, Math.min(1, (pct - min) / (max - min)))
  return padYTop + (1 - normalized) * plotH
}

const getYOvertime = (hours) => {
  const max = currentTrend.value.maxOvertime
  const plotH = svgHeight - padYTop - padYBottom
  const normalized = Math.max(0, Math.min(1, hours / max))
  return padYTop + (1 - normalized) * plotH
}

const getPointX = (index, total) => {
  const plotW = svgWidth - padX * 2
  return padX + (index / (total - 1)) * plotW
}

// Points with Wave Undulation
const presencePoints = computed(() => {
  const vals = currentTrend.value.presencePct
  const total = vals.length
  return vals.map((val, idx) => {
    const baseY = getYPresence(val)
    const waveOffset = isWaveActive.value && !isRefreshing.value
      ? Math.sin(wavePhase.value + idx * 0.85) * waveAmplitude.value
      : 0
    return {
      x: getPointX(idx, total),
      y: baseY + waveOffset,
      baseY,
      val,
      count: currentTrend.value.presenceCount[idx],
      label: currentTrend.value.labels[idx],
    }
  })
})

const overtimePoints = computed(() => {
  const vals = currentTrend.value.overtimeHours
  const total = vals.length
  return vals.map((val, idx) => {
    const baseY = getYOvertime(val)
    const waveOffset = isWaveActive.value && !isRefreshing.value
      ? Math.cos(wavePhase.value + idx * 0.85 + 0.5) * (waveAmplitude.value * 0.7)
      : 0
    return {
      x: getPointX(idx, total),
      y: baseY + waveOffset,
      baseY,
      val,
      late: currentTrend.value.lateCount[idx],
    }
  })
})

// Catmull-Rom Smooth Cubic Bezier Path Generator
const getSmoothPath = (pts) => {
  if (!pts || pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

const presenceAreaPath = computed(() => {
  const pts = presencePoints.value
  if (pts.length === 0) return ''
  const linePath = getSmoothPath(pts)
  const bottomY = svgHeight - padYBottom
  const firstX = pts[0].x
  const lastX = pts[pts.length - 1].x
  return `${linePath} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`
})

const presenceLinePath = computed(() => getSmoothPath(presencePoints.value))
const overtimeLinePath = computed(() => getSmoothPath(overtimePoints.value))

const handleChartMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth
  const pts = presencePoints.value
  if (!pts || pts.length === 0) return

  let closestIdx = 0
  let minDist = Infinity
  pts.forEach((p, i) => {
    const dist = Math.abs(p.x - mouseX)
    if (dist < minDist) {
      minDist = dist
      closestIdx = i
    }
  })
  activeHoverIdx.value = closestIdx
  isHoveringChart.value = true
}

const handleChartMouseLeave = () => {
  isHoveringChart.value = false
  activeHoverIdx.value = null
}

const activeScrubberData = computed(() => {
  if (activeHoverIdx.value === null) {
    const last = presencePoints.value.length - 1
    return {
      idx: last,
      point: presencePoints.value[last] || null,
      overtime: overtimePoints.value[last] || null,
    }
  }
  return {
    idx: activeHoverIdx.value,
    point: presencePoints.value[activeHoverIdx.value] || null,
    overtime: overtimePoints.value[activeHoverIdx.value] || null,
  }
})

// ========================================================
// 3. DIAGRAM DONAT INTERAKTIF (DISCIPLINE DISTRIBUTION)
// ========================================================
const donutRadius = 48
const donutCircumference = 2 * Math.PI * donutRadius // ~301.59
const hoveredDonutSlice = ref(null)

const donutSlices = computed(() => {
  let accumulatedPct = 0
  return hrisDisciplineDistribution.map((item) => {
    const strokeDasharray = `${(item.pct / 100) * donutCircumference} ${donutCircumference}`
    const strokeDashoffset = -((accumulatedPct / 100) * donutCircumference)
    accumulatedPct += item.pct
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    }
  })
})

const activeDonutInfo = computed(() => {
  if (hoveredDonutSlice.value) {
    return {
      title: hoveredDonutSlice.value.name,
      value: `${hoveredDonutSlice.value.pct}%`,
      subtext: `${hoveredDonutSlice.value.count} karyawan`,
      color: hoveredDonutSlice.value.color,
    }
  }
  return {
    title: 'Disiplin Rata-Rata',
    value: '94.6%',
    subtext: '1.215 Hadir Hari Ini',
    color: 'var(--theme-primary)',
  }
})

// ========================================================
// 4. DIAGRAM BATANG INTERAKTIF (OVERTIME BY DEPT)
// ========================================================
const hoveredBarDept = ref(null)

// ========================================================
// 5. APPROVAL LIST INTERAKTIF
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
// 6. DETAIL PRESENSI SLIDE-OVER
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
// 7. MODALS (PAYROLL & BROADCAST)
// ========================================================
const isPayrollModalOpen = ref(false)
const isPayrollProcessing = ref(false)

const handleExecutePayroll = async () => {
  isPayrollProcessing.value = true
  await new Promise((resolve) => setTimeout(resolve, 900))
  isPayrollProcessing.value = false
  isPayrollModalOpen.value = false
  toast.success('Kalkulasi pra-payroll multi-cabang sukses dieksekusi!', 'Payroll Siap')
}

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

const handleExportAttendance = () => {
  toast.info('File Rekap_Presensi_November_2026.xlsx sedang disiapkan...', 'Mengunduh Laporan')
  setTimeout(() => {
    toast.success('Rekap presensi berhasil diunduh dalam format Excel.', 'Unduhan Selesai')
  }, 900)
}

onMounted(() => {
  startWaveLoop()
})

onUnmounted(() => {
  stopWaveLoop()
})
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6 select-none w-full pb-12">

    <!-- ======================================================== -->
    <!-- 1. TOP HEADER & FILTER CABANG                            -->
    <!-- ======================================================== -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-[var(--theme-border)]">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 shadow-2xs">
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
          Visualisasi interaktif kehadiran biometrik, gelombang tren lembur, dan otomasi alur persetujuan SDM
        </p>
      </div>

      <!-- Action Buttons & Branch Selector -->
      <div class="flex flex-wrap items-center gap-2.5">
        <div class="w-56 sm:w-64">
          <BaseSearchableSelect
            v-model="selectedBranch"
            :options="branchOptions"
            placeholder="Pilih Cabang"
            size="sm"
          />
        </div>

        <BaseButton
          variant="secondary"
          size="sm"
          :loading="isRefreshing"
          @click="handleRefresh"
          title="Sinkronisasi Data Real-Time"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="isRefreshing ? 'animate-spin' : ''" />
        </BaseButton>

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

    <!-- Banner Kepatuhan / Cut-off -->
    <BaseAlert
      variant="info"
      title="Periode Cut-Off Payroll Berjalan: 26 Okt - 25 Nov 2026"
      description="Verifikasi absensi dan persetujuan lembur/cuti ditutup dalam 5 hari lagi. Seluruh data presensi otomatis terhubung ke perhitungan slip gaji."
      action-text="Unduh Rekap Presensi"
      @action="handleExportAttendance"
    />

    <!-- ======================================================== -->
    <!-- 2. KARTU METRIK EKSEKUTIF HRIS (BaseStatCard)             -->
    <!-- ======================================================== -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
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
    <!-- 3. DIAGRAM OMBAK BESAR: TREN PRESENSI & JAM LEMBUR       -->
    <!-- ======================================================== -->
    <section class="rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] p-4 sm:p-6 shadow-xs relative overflow-hidden">
      <!-- Background Ambient Glow -->
      <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[var(--theme-primary)]/5 blur-3xl pointer-events-none" />

      <!-- Chart Header with Period Pills & Wave Toggle -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-[var(--theme-border)]">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)]" />
            <h2 class="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              Tren Kehadiran & Fluktuasi Jam Lembur
            </h2>
            <BaseBadge variant="primary" size="xs">Harmonic Wave</BaseBadge>
          </div>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Area berombak menunjukkan % kehadiran harian; kurva amber menunjukkan jam lembur terakumulasi
          </p>
        </div>

        <!-- Controls: Periode & Toggle Ombak -->
        <div class="flex items-center gap-2">
          <!-- Wave Animation Toggle -->
          <button
            type="button"
            @click="toggleWave"
            class="p-1.5 rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            :class="isWaveActive ? 'bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] border-[var(--theme-primary)]/30' : 'bg-neutral-50 dark:bg-[var(--theme-surface)] text-neutral-500'"
            :title="isWaveActive ? 'Jeda Animasi Ombak' : 'Aktifkan Animasi Ombak'"
          >
            <Waves class="w-4 h-4" :class="isWaveActive ? 'animate-pulse' : ''" />
            <span class="text-[11px] hidden sm:inline">{{ isWaveActive ? 'Ombak Aktif' : 'Ombak Jeda' }}</span>
          </button>

          <!-- Period Buttons -->
          <div class="inline-flex p-1 rounded-xl bg-neutral-100 dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] text-xs">
            <button
              v-for="p in [{ id: '7hari', label: '7 Hari' }, { id: '14hari', label: '14 Hari' }, { id: '30hari', label: '30 Hari' }]"
              :key="p.id"
              type="button"
              @click="selectedTrendPeriod = p.id"
              class="px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
              :class="selectedTrendPeriod === p.id ? 'bg-white dark:bg-[var(--theme-surface-muted)] text-[var(--theme-primary)] shadow-2xs font-semibold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'"
            >
              {{ p.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Live Hover Scrubber Info Ticker -->
      <div class="mt-3.5 mb-1 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-100 dark:border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <Calendar class="w-3.5 h-3.5 text-neutral-400" />
          <span class="text-neutral-500">Tanggal Terpilih:</span>
          <span class="font-bold text-neutral-900 dark:text-white">
            {{ activeScrubberData.point ? activeScrubberData.point.label : '-' }}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)]" />
            <span class="text-neutral-500">Tingkat Hadir:</span>
            <span class="font-bold text-[var(--theme-primary)]">
              {{ activeScrubberData.point ? activeScrubberData.point.val : '-' }}%
            </span>
            <span class="text-[11px] text-neutral-400">
              ({{ activeScrubberData.point ? activeScrubberData.point.count : '-' }} staf)
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span class="text-neutral-500">Total Lembur:</span>
            <span class="font-bold text-amber-600 dark:text-amber-400">
              {{ activeScrubberData.overtime ? activeScrubberData.overtime.val : '-' }} Jam
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span class="text-neutral-500">Terlambat:</span>
            <span class="font-bold text-rose-600 dark:text-rose-400">
              {{ activeScrubberData.overtime ? activeScrubberData.overtime.late : '-' }} orang
            </span>
          </div>
        </div>
      </div>

      <!-- Pure SVG Interactive Harmonic Wave Chart -->
      <div
        class="relative w-full h-[220px] cursor-crosshair select-none"
        @mousemove="handleChartMouseMove"
        @mouseleave="handleChartMouseLeave"
      >
        <svg
          class="w-full h-full overflow-visible"
          :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
          preserveAspectRatio="none"
        >
          <defs>
            <!-- Area Gradient Fill -->
            <linearGradient id="presenceWaveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--theme-primary)" stop-opacity="0.32" />
              <stop offset="65%" stop-color="var(--theme-primary)" stop-opacity="0.08" />
              <stop offset="100%" stop-color="var(--theme-primary)" stop-opacity="0.00" />
            </linearGradient>

            <!-- Line Glow Filter -->
            <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Grid Lines (Horizontal) -->
          <g class="stroke-neutral-200 dark:stroke-[var(--theme-border)]" stroke-dasharray="3 3" stroke-width="0.75">
            <line :x1="padX" :y1="getYPresence(100)" :x2="svgWidth - padX" :y2="getYPresence(100)" />
            <line :x1="padX" :y1="getYPresence(95)" :x2="svgWidth - padX" :y2="getYPresence(95)" />
            <line :x1="padX" :y1="getYPresence(90)" :x2="svgWidth - padX" :y2="getYPresence(90)" />
            <line :x1="padX" :y1="svgHeight - padYBottom" :x2="svgWidth - padX" :y2="svgHeight - padYBottom" />
          </g>

          <!-- Y-Axis Labels -->
          <g class="fill-neutral-400 text-[10px] font-mono">
            <text :x="padX - 8" :y="getYPresence(100) + 3" text-anchor="end">100%</text>
            <text :x="padX - 8" :y="getYPresence(95) + 3" text-anchor="end">95%</text>
            <text :x="padX - 8" :y="getYPresence(90) + 3" text-anchor="end">90%</text>
          </g>

          <!-- Wave Area Gradient Path -->
          <path
            :d="presenceAreaPath"
            fill="url(#presenceWaveGrad)"
            class="transition-all duration-150"
          />

          <!-- Overtime Line (Amber) -->
          <path
            :d="overtimeLinePath"
            fill="none"
            stroke="#f59e0b"
            stroke-width="2"
            stroke-dasharray="4 3"
            class="transition-all duration-150"
          />

          <!-- Presence Wave Line (Primary Theme) -->
          <path
            :d="presenceLinePath"
            fill="none"
            stroke="var(--theme-primary)"
            stroke-width="2.5"
            stroke-linecap="round"
            filter="url(#waveGlow)"
            class="transition-all duration-150"
          />

          <!-- X-Axis Labels -->
          <g class="fill-neutral-400 text-[10px] font-mono">
            <text
              v-for="p in presencePoints"
              :key="p.label"
              :x="p.x"
              :y="svgHeight - 12"
              text-anchor="middle"
            >
              {{ p.label }}
            </text>
          </g>

          <!-- Interactive Hover Scrubber -->
          <g v-if="activeScrubberData.point">
            <!-- Vertical Guideline -->
            <line
              :x1="activeScrubberData.point.x"
              :y1="padYTop"
              :x2="activeScrubberData.point.x"
              :y2="svgHeight - padYBottom"
              stroke="var(--theme-primary)"
              stroke-width="1.5"
              stroke-dasharray="3 3"
              class="opacity-75"
            />

            <!-- Halo Wave Ripple on Presence Point -->
            <circle
              :cx="activeScrubberData.point.x"
              :cy="activeScrubberData.point.y"
              r="7"
              fill="var(--theme-primary)"
              class="opacity-30 animate-ping"
            />
            <circle
              :cx="activeScrubberData.point.x"
              :cy="activeScrubberData.point.y"
              r="4.5"
              fill="var(--theme-primary)"
              stroke="#ffffff"
              stroke-width="2"
              class="shadow-md"
            />

            <!-- Point on Overtime Line -->
            <circle
              v-if="activeScrubberData.overtime"
              :cx="activeScrubberData.overtime.x"
              :cy="activeScrubberData.overtime.y"
              r="3.5"
              fill="#f59e0b"
              stroke="#ffffff"
              stroke-width="1.5"
            />
          </g>
        </svg>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 4. DIAGRAM DONAT & DIAGRAM BATANG KOMPARATIF             -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

      <!-- Kolom Kiri (5 Kolom): DIAGRAM DONAT INTERAKTIF -->
      <div class="lg:col-span-5 rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[var(--theme-border)]">
            <div class="flex items-center gap-2">
              <PieChart class="w-4 h-4 text-[var(--theme-primary)]" />
              <h2 class="text-sm font-bold text-neutral-900 dark:text-white">
                Distribusi Disiplin & Presensi
              </h2>
            </div>
            <span class="text-xs text-neutral-500">Hari Ini</span>
          </div>

          <!-- Interactive Donut Chart Container -->
          <div class="flex flex-col sm:flex-row items-center gap-4 py-4">
            <!-- Donut SVG with Center Readout -->
            <div class="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg class="w-full h-full -rotate-90 transform-gpu overflow-visible" viewBox="-65 -65 130 130">
                <!-- Background Base Track -->
                <circle
                  cx="0"
                  cy="0"
                  :r="donutRadius"
                  fill="none"
                  stroke="currentColor"
                  class="text-neutral-100 dark:text-[var(--theme-surface-muted)]"
                  stroke-width="13"
                />

                <!-- Donut Segments with Interactive Stroke Magnification -->
                <circle
                  v-for="slice in donutSlices"
                  :key="slice.id"
                  cx="0"
                  cy="0"
                  :r="donutRadius"
                  fill="none"
                  :stroke="slice.color"
                  :stroke-width="hoveredDonutSlice && hoveredDonutSlice.id === slice.id ? 17 : 13"
                  :stroke-dasharray="slice.strokeDasharray"
                  :stroke-dashoffset="slice.strokeDashoffset"
                  stroke-linecap="round"
                  class="cursor-pointer transition-all duration-300 ease-out origin-center"
                  :class="hoveredDonutSlice && hoveredDonutSlice.id === slice.id ? 'opacity-100 scale-105 filter drop-shadow-md' : (hoveredDonutSlice ? 'opacity-40' : 'opacity-100')"
                  @mouseenter="hoveredDonutSlice = slice"
                  @mouseleave="hoveredDonutSlice = null"
                />
              </svg>

              <!-- Dynamic Center Readout -->
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                <span
                  class="text-base sm:text-lg font-bold tracking-tight transition-all duration-200"
                  :style="{ color: activeDonutInfo.color }"
                >
                  {{ activeDonutInfo.value }}
                </span>
                <span class="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 leading-tight block truncate max-w-[85px]">
                  {{ activeDonutInfo.title }}
                </span>
              </div>
            </div>

            <!-- Donut Legend List with Hover Highlighting -->
            <div class="space-y-1.5 flex-1 w-full text-xs">
              <div
                v-for="slice in donutSlices"
                :key="slice.id"
                @mouseenter="hoveredDonutSlice = slice"
                @mouseleave="hoveredDonutSlice = null"
                class="px-2 py-1.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition"
                :class="hoveredDonutSlice && hoveredDonutSlice.id === slice.id ? 'bg-neutral-100 dark:bg-[var(--theme-surface-muted)] font-semibold' : 'hover:bg-neutral-50 dark:hover:bg-[var(--theme-surface)]'"
              >
                <div class="flex items-center gap-2 truncate">
                  <span
                    class="w-2.5 h-2.5 rounded-full shrink-0 transition-transform"
                    :class="hoveredDonutSlice && hoveredDonutSlice.id === slice.id ? 'scale-125 ring-2 ring-white dark:ring-neutral-800' : ''"
                    :style="{ backgroundColor: slice.color }"
                  />
                  <span class="text-neutral-700 dark:text-neutral-300 truncate">{{ slice.name }}</span>
                </div>
                <div class="text-right shrink-0">
                  <span class="font-bold text-neutral-900 dark:text-white">{{ slice.count }}</span>
                  <span class="text-[10px] text-neutral-400 ml-1">({{ slice.pct }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-2.5 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-100 dark:border-[var(--theme-border)] text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Toleransi telat kantor: 15 menit</span>
          <span class="text-emerald-600 dark:text-emerald-400 font-semibold">94.6% Disiplin</span>
        </div>
      </div>

      <!-- Kolom Kanan (7 Kolom): DIAGRAM BATANG KOMPARASI LEMBUR -->
      <div class="lg:col-span-7 rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[var(--theme-border)]">
            <div class="flex items-center gap-2">
              <BarChart3 class="w-4 h-4 text-[var(--theme-primary)]" />
              <h2 class="text-sm font-bold text-neutral-900 dark:text-white">
                Komparasi Jam Lembur vs Kuota per Departemen
              </h2>
            </div>
            <BaseBadge variant="neutral" size="xs">Bulan Berjalan</BaseBadge>
          </div>

          <!-- Vertical / Horizontal Comparative Bars with Glow -->
          <div class="space-y-3.5 py-4">
            <div
              v-for="dept in hrisOvertimeByDept"
              :key="dept.code"
              @mouseenter="hoveredBarDept = dept"
              @mouseleave="hoveredBarDept = null"
              class="p-2.5 rounded-xl border border-transparent transition cursor-pointer"
              :class="hoveredBarDept && hoveredBarDept.code === dept.code ? 'bg-neutral-50 dark:bg-[var(--theme-surface)] border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs' : ''"
            >
              <div class="flex items-center justify-between text-xs mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 dark:bg-[var(--theme-surface-muted)] text-neutral-600 dark:text-neutral-400">
                    {{ dept.code }}
                  </span>
                  <span class="font-semibold text-neutral-800 dark:text-neutral-200">
                    {{ dept.dept }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-neutral-900 dark:text-white">{{ dept.hours }} Jam</span>
                  <span class="text-[11px] text-neutral-400">/ max {{ dept.maxQuota }} Jam</span>
                </div>
              </div>

              <!-- Bar Track & Fill with Smooth Width Motion -->
              <div class="w-full h-3 rounded-full bg-neutral-100 dark:bg-[var(--theme-surface-muted)] overflow-hidden relative">
                <div
                  class="h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  :style="{
                    width: `${Math.min(100, (dept.hours / dept.maxQuota) * 100)}%`,
                    backgroundColor: dept.color,
                  }"
                  :class="hoveredBarDept && hoveredBarDept.code === dept.code ? 'brightness-110 shadow-sm' : ''"
                />
              </div>

              <!-- Interactive Hover Subtext -->
              <div
                v-if="hoveredBarDept && hoveredBarDept.code === dept.code"
                class="mt-2 pt-1 border-t border-neutral-200/60 dark:border-[var(--theme-border)]/60 flex items-center justify-between text-[11px] text-neutral-500 animate-fadeIn"
              >
                <span>Akumulasi upah lembur: <strong class="text-neutral-800 dark:text-neutral-200">{{ dept.cost }}</strong></span>
                <span class="text-[var(--theme-primary)] font-semibold">{{ Math.round((dept.hours / dept.maxQuota) * 100) }}% Kuota Terpakai</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-2.5 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-100 dark:border-[var(--theme-border)] text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Kepatuhan PP 35/2021: Lembur maks 4 jam/hari atau 18 jam/minggu</span>
          <span class="text-neutral-700 dark:text-neutral-300 font-semibold">Total 654 Jam</span>
        </div>
      </div>

    </div>

    <!-- ======================================================== -->
    <!-- 5. REAL-TIME ATTENDANCE FEED & SHIFT PROGRESS            -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

      <!-- Kolom Kiri (7 Kolom): Stream Presensi Real-Time -->
      <div class="lg:col-span-7 flex flex-col rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] overflow-hidden shadow-xs">
        <div class="p-4 sm:p-5 border-b border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] flex items-center justify-center shrink-0 shadow-2xs">
              <Activity class="w-4 h-4" />
            </div>
            <div>
              <h2 class="text-sm font-bold text-neutral-900 dark:text-white">
                Stream Presensi Biometrik & GPS
              </h2>
              <p class="text-[11px] text-neutral-500 dark:text-neutral-400">
                Log absensi masuk/pulang terverifikasi liveness detection & radius kantor
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

        <div class="divide-y divide-neutral-100 dark:divide-[var(--theme-border)] flex-1 overflow-y-auto max-h-[380px]">
          <div
            v-for="att in hrisLiveAttendance"
            :key="att.id"
            @click="openAttendanceDetail(att)"
            class="p-3.5 sm:px-4 sm:py-3 hover:bg-neutral-50/80 dark:hover:bg-[var(--theme-surface-muted)] transition flex items-center justify-between gap-3 cursor-pointer group"
          >
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

        <div class="px-4 py-2.5 bg-neutral-50 dark:bg-[var(--theme-surface)] border-t border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between text-[11px] text-neutral-500">
          <span>Menampilkan 6 presensi terbaru</span>
          <span class="text-[var(--theme-primary)] font-medium">Klik baris untuk verifikasi biometrik</span>
        </div>
      </div>

      <!-- Kolom Kanan (5 Kolom): Rangkuman Shift Kerja Hari Ini -->
      <div class="lg:col-span-5 flex flex-col rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] p-4 sm:p-5 shadow-xs">
        <div class="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[var(--theme-border)]">
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-[var(--theme-primary)]" />
            <h2 class="text-sm font-bold text-neutral-900 dark:text-white">
              Status Shift Kerja Hari Ini
            </h2>
          </div>
          <span class="text-xs text-neutral-500 dark:text-neutral-400">
            Total 1.284 Personil
          </span>
        </div>

        <!-- List Shift -->
        <div class="space-y-3.5 my-auto py-3">
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

            <BaseProgress
              v-if="shift.id !== 'off'"
              :value="Math.round((shift.present / shift.total) * 100)"
              :variant="shift.id === 'pagi' ? 'primary' : (shift.id === 'siang' ? 'warning' : 'info')"
              size="sm"
            />
          </div>
        </div>

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
    <!-- 6. PENDING APPROVALS BAR (ALUR PERSETUJUAN CEPAT)         -->
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

          <div class="text-xs bg-white dark:bg-[var(--theme-surface-muted)] p-2.5 rounded-lg border border-neutral-100 dark:border-[var(--theme-border)] space-y-0.5">
            <div class="font-medium text-neutral-800 dark:text-neutral-200">
              Durasi: {{ item.duration }}
            </div>
            <div class="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
              "{{ item.reason }}"
            </div>
          </div>

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

      <div v-else class="text-center py-8">
        <CheckCircle2 class="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
        <p class="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Semua permohonan telah selesai diproses!</p>
        <p class="text-[11px] text-neutral-500">Tidak ada pengajuan cuti atau lembur yang tertunda saat ini.</p>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 7. STATUS KONTRAK & PENGINGAT KEPATUHAN SDM              -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

      <!-- Kolom Kiri: Status Ikatan Kerja -->
      <div class="lg:col-span-6 rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] p-4 shadow-xs">
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

      <!-- Kolom Kanan: Peringatan Kepatuhan -->
      <div class="lg:col-span-6 rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] p-4 shadow-xs space-y-2.5">
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

        <BaseDescriptionList
          :items="attendanceDetailItems"
          layout="divided"
        />

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
