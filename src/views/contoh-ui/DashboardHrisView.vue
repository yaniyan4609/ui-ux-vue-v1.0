<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import BaseStatCard from '../../components/ui/BaseStatCard.vue'
import BaseSkeleton from '../../components/ui/BaseSkeleton.vue'
import BaseCountUp from '../../components/ui/BaseCountUp.vue'
import BaseAvatar from '../../components/ui/BaseAvatar.vue'
import BaseDatePicker from '../../components/ui/BaseDatePicker.vue'
import BaseSearchableSelect from '../../components/ui/BaseSearchableSelect.vue'
import BaseProgress from '../../components/ui/BaseProgress.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseSlideOver from '../../components/ui/BaseSlideOver.vue'
import BaseDescriptionList from '../../components/ui/BaseDescriptionList.vue'
import { useToast } from '../../composables/useToast'
import {
  hrisBranches,
  hrisKpiMetrics,
  hrisShiftSummary,
  hrisLiveAttendance,
  hrisPendingApprovals,
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
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Send,
  Calendar,
  ShieldCheck,
  Activity,
  Waves,
  PieChart,
  BarChart3,
  TrendingUp,
  RefreshCw,
  ShoppingBag,
  Cpu,
  Layers,
  ChevronRight,
  Check,
  X,
} from 'lucide-vue-next'

const toast = useToast()

// ========================================================
// 1. SKELETON & LIVE REFRESH STATE
// ========================================================
const isLoading = ref(true)
const isRefreshing = ref(false)

const simulateLoading = async (duration = 600) => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, duration))
  isLoading.value = false
}

const handleRefresh = async () => {
  isRefreshing.value = true
  await simulateLoading(500)
  isRefreshing.value = false
  toast.success('Metrik presensi dan lembur HRIS berhasil disinkronisasi!', 'Live Sync')
}

// ========================================================
// 2. FILTER CONTROLS
// ========================================================
const selectedBranch = ref('all')
const branchOptions = hrisBranches.map((b) => ({
  value: b.id,
  label: `${b.label} (${b.tz})`,
}))

const dashboardDateRange = ref({
  start: '2026-10-26',
  end: '2026-11-25',
})

const handleDateRangeChange = (val) => {
  if (val && val.start && val.end) {
    toast.info(`Filter rentang tanggal: ${val.start} s/d ${val.end}`, 'Filter Periode')
  }
}

// ========================================================
// 3. DIAGRAM 1: OMBAK (HARMONIC WAVE AREA/LINE CHART)
// ========================================================
const selectedTrendPeriod = ref('7hari') // '7hari' | '14hari' | '30hari'
const currentTrend = computed(() => hrisAttendanceTrendPresets[selectedTrendPeriod.value] || hrisAttendanceTrendPresets['7hari'])

const svgWidth = 500
const svgHeight = 200
const padX = 35
const padYTop = 20
const padYBottom = 30

const isWaveActive = ref(true)
const wavePhase = ref(0)
const waveAmplitude = ref(3.5)
const isHoveringChart = ref(false)
const activeHoverIdx = ref(null)
let waveFrameId = null

const startWaveLoop = () => {
  if (waveFrameId) cancelAnimationFrame(waveFrameId)
  const step = () => {
    if (isWaveActive.value && !isHoveringChart.value && !isLoading.value) {
      wavePhase.value = (wavePhase.value + 0.038) % (Math.PI * 2)
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
    isWaveActive.value ? 'Animasi ombak diaktifkan' : 'Animasi ombak dijeda',
    'Diagram Ombak'
  )
}

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

const presencePoints = computed(() => {
  const vals = currentTrend.value.presencePct
  const total = vals.length
  return vals.map((val, idx) => {
    const baseY = getYPresence(val)
    const waveOffset = isWaveActive.value && !isLoading.value
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
    const waveOffset = isWaveActive.value && !isLoading.value
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
// 4. DIAGRAM 2: BATANG (DISTRIBUSI LEMBUR PER DEPT)
// ========================================================
const hoveredBarDept = ref(null)

// ========================================================
// 5. DIAGRAM 3: DONAT (DISTRIBUSI DISIPLIN & PRESENSI)
// ========================================================
const donutRadius = 45
const donutCircumference = 2 * Math.PI * donutRadius // ~282.74
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
      subtext: `${hoveredDonutSlice.value.count} staf`,
      color: hoveredDonutSlice.value.color,
    }
  }
  return {
    title: 'Kehadiran Tepat',
    value: '94.6%',
    subtext: '1.215 / 1.284',
    color: 'var(--theme-primary)',
  }
})

// ========================================================
// 6. APPROVAL LIST INTERAKTIF
// ========================================================
const approvals = ref([...hrisPendingApprovals])

const handleApprove = (item) => {
  approvals.value = approvals.value.filter((a) => a.id !== item.id)
  toast.success(`Pengajuan ${item.type} untuk ${item.applicant} disetujui!`, 'Approval Berhasil')
}

const handleReject = (item) => {
  approvals.value = approvals.value.filter((a) => a.id !== item.id)
  toast.warning(`Pengajuan ${item.type} untuk ${item.applicant} ditolak.`, 'Approval Ditolak')
}

// ========================================================
// 7. DETAIL PRESENSI SLIDE-OVER
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
// 8. MODALS (PAYROLL & BROADCAST)
// ========================================================
const isPayrollModalOpen = ref(false)
const isPayrollProcessing = ref(false)

const handleExecutePayroll = async () => {
  isPayrollProcessing.value = true
  await new Promise((resolve) => setTimeout(resolve, 800))
  isPayrollProcessing.value = false
  isPayrollModalOpen.value = false
  toast.success('Kalkulasi pra-payroll berhasil dieksekusi!', 'Payroll Siap')
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
  toast.success('Pengumuman berhasil disiarkan ke aplikasi mobile karyawan!', 'Broadcast Terkirim')
}

const handleExportAttendance = () => {
  toast.info('File Rekap_Presensi_November_2026.xlsx sedang disiapkan...', 'Mengunduh Laporan')
  setTimeout(() => {
    toast.success('Rekap presensi berhasil diunduh dalam format Excel.', 'Unduhan Selesai')
  }, 800)
}

onMounted(() => {
  simulateLoading(650)
  startWaveLoop()
})

onUnmounted(() => {
  stopWaveLoop()
})
</script>

<template>
  <div class="space-y-3.5 sm:space-y-4 w-full max-w-7xl mx-auto select-none pb-8">

    <!-- ======================================================== -->
    <!-- TOP HEADER TOOLBAR: TITLE, BRANCH, PERIODE, ACTIONS      -->
    <!-- ======================================================== -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-[var(--theme-border)] anim-fade-up">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--theme-primary)] text-[var(--theme-primary-text)] flex items-center justify-center shrink-0 shadow-2xs">
          <Activity class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
              Dashboard Eksekutif HRIS
            </h1>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Sync 4 Cabang" />
            <BaseBadge variant="primary" size="xs">Multi-Cabang</BaseBadge>
          </div>
          <p class="text-[11px] text-neutral-500 dark:text-neutral-400">
            Monitoring presensi biometrik, fluktuasi lembur, dan cut-off payroll terpusat
          </p>
        </div>
      </div>

      <!-- Right Controls: Branch, DatePicker, Sync, & Payroll Button -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="w-44 sm:w-52">
          <BaseSearchableSelect
            v-model="selectedBranch"
            :options="branchOptions"
            placeholder="Pilih Cabang"
            size="sm"
          />
        </div>

        <div class="w-38 sm:w-44 hidden md:block">
          <BaseDatePicker
            v-model="dashboardDateRange"
            range
            size="sm"
            placeholder="Rentang tanggal..."
            @change="handleDateRangeChange"
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
          <Wallet class="w-3.5 h-3.5 mr-1" />
          <span>Proses Payroll</span>
        </BaseButton>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- BARIS 1: 6 TOP STAT KPI CARDS (COMPACT FORMULA)          -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 anim-fade-up">
      <!-- KPI 1: Total Payroll -->
      <BaseStatCard
        title="Estimasi Payroll Netto"
        :value="5.42"
        prefix="Rp "
        unit="M"
        :icon="Wallet"
        tone="emerald"
        :trend="hrisKpiMetrics.estimasiPayroll.trend"
        trend-direction="up"
        trend-label="Cut-off H-5"
        :loading="isLoading"
      />

      <!-- KPI 2: Total Karyawan -->
      <BaseStatCard
        title="Total Karyawan Aktif"
        :value="hrisKpiMetrics.totalKaryawan.value"
        unit="staf"
        :icon="Users"
        tone="indigo"
        :trend="hrisKpiMetrics.totalKaryawan.trend"
        trend-direction="up"
        trend-label="+14 bln ini"
        :loading="isLoading"
      />

      <!-- KPI 3: Kehadiran Hari Ini -->
      <BaseStatCard
        title="Kehadiran Hari Ini"
        :value="hrisKpiMetrics.kehadiranHariIni.value"
        unit="%"
        :icon="UserCheck"
        tone="sky"
        :trend="hrisKpiMetrics.kehadiranHariIni.trend"
        trend-direction="up"
        trend-label="1.215 hadir"
        :loading="isLoading"
      />

      <!-- KPI 4: Karyawan Terlambat -->
      <BaseStatCard
        title="Presensi Terlambat"
        :value="75"
        unit="orang"
        :icon="Clock"
        tone="amber"
        subtitle="5.8% dari total hadir"
        :loading="isLoading"
      />

      <!-- KPI 5: Cuti & Izin Aktif -->
      <BaseStatCard
        title="Cuti, Sakit & Izin"
        :value="hrisKpiMetrics.cutiDanIzin.value"
        unit="staf"
        :icon="Coffee"
        tone="cyan"
        :trend="hrisKpiMetrics.cutiDanIzin.trend"
        trend-direction="down"
        trend-label="28 cuti · 18 sakit"
        :loading="isLoading"
      />

      <!-- KPI 6: Pending Approvals -->
      <BaseStatCard
        title="Menunggu Persetujuan"
        :value="approvals.length"
        unit="tiket"
        :icon="ShieldCheck"
        tone="rose"
        subtitle="Antrean HRD & Supervisor"
        :loading="isLoading"
      />
    </div>

    <!-- ======================================================== -->
    <!-- BARIS 2: 3 DIAGRAM COMPACT (OMBAK + BATANG + DONAT)      -->
    <!-- 12 KOLOM: Col 5 (Ombak), Col 4 (Batang), Col 3 (Donat)   -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 anim-fade-up anim-delay-2">

      <!-- ====================================================== -->
      <!-- DIAGRAM 1: OMBAK (TREN PRESENSI & FLUKTUASI LEMBUR)    -->
      <!-- ====================================================== -->
      <div class="lg:col-span-5 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex flex-col justify-between space-y-3">
        <!-- Skeleton Chart 1 -->
        <template v-if="isLoading">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <BaseSkeleton variant="circular" width="16px" height="16px" />
              <BaseSkeleton width="130px" height="15px" />
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <BaseSkeleton width="32px" height="32px" class="rounded-xl" />
              <BaseSkeleton width="120px" height="32px" class="rounded-xl" />
            </div>
          </div>
          <div class="flex items-center gap-4">
            <BaseSkeleton width="80px" height="12px" />
            <BaseSkeleton width="80px" height="12px" />
          </div>
          <div class="h-44 w-full rounded-xl skeleton-shimmer flex items-center justify-center">
            <div class="w-8 h-8 rounded-full border-2 border-neutral-300 dark:border-neutral-600 border-t-transparent animate-spin opacity-30" />
          </div>
        </template>

        <!-- Real Chart 1 dengan Harmonic Wave -->
        <template v-else>
          <!-- Header -->
          <div class="flex items-center justify-between gap-2 min-w-0">
            <div class="flex items-center gap-1.5 min-w-0">
              <TrendingUp class="w-4 h-4 text-[var(--theme-primary)] shrink-0" />
              <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate" title="Tren Kehadiran & Lembur">
                Tren Kehadiran & Lembur
              </h2>
            </div>

            <!-- Periode Controls & Wave Toggle Button -->
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                @click="toggleWave"
                class="w-8 h-8 rounded-xl border flex items-center justify-center transition cursor-pointer shrink-0"
                :class="isWaveActive ? 'bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] border-[var(--theme-primary)]/30' : 'bg-neutral-100 dark:bg-[var(--theme-surface-raised)] text-neutral-400 border-neutral-200 dark:border-[var(--theme-border)]'"
                :title="isWaveActive ? 'Jeda Animasi Gelombang' : 'Aktifkan Animasi Gelombang'"
              >
                <Waves class="w-4 h-4" :class="isWaveActive ? 'animate-pulse' : ''" />
              </button>

              <div class="inline-flex p-0.5 rounded-xl bg-neutral-100 dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] text-[11px]">
                <button
                  v-for="p in [{ id: '7hari', label: '7H' }, { id: '14hari', label: '14H' }, { id: '30hari', label: '30H' }]"
                  :key="p.id"
                  type="button"
                  @click="selectedTrendPeriod = p.id"
                  class="px-2 py-0.5 rounded-lg font-medium transition cursor-pointer"
                  :class="selectedTrendPeriod === p.id ? 'bg-white dark:bg-[var(--theme-surface-muted)] text-[var(--theme-primary)] shadow-2xs font-semibold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'"
                >
                  {{ p.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Legend Bar with Live Scrubber Info -->
          <div class="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)]" />
                <span class="font-medium text-neutral-700 dark:text-neutral-300">
                  {{ activeScrubberData.point ? activeScrubberData.point.val : '-' }}% Hadir
                </span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span class="font-medium text-neutral-700 dark:text-neutral-300">
                  {{ activeScrubberData.overtime ? activeScrubberData.overtime.val : '-' }}j Lembur
                </span>
              </div>
            </div>

            <div class="text-[10.5px] font-mono text-neutral-400">
              {{ activeScrubberData.point ? activeScrubberData.point.label : '' }}
            </div>
          </div>

          <!-- SVG Harmonic Wave Canvas -->
          <div
            class="relative w-full h-44 cursor-crosshair select-none"
            @mousemove="handleChartMouseMove"
            @mouseleave="handleChartMouseLeave"
          >
            <svg
              class="w-full h-full overflow-visible"
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="hrisPresenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--theme-primary)" stop-opacity="0.30" />
                  <stop offset="70%" stop-color="var(--theme-primary)" stop-opacity="0.06" />
                  <stop offset="100%" stop-color="var(--theme-primary)" stop-opacity="0.00" />
                </linearGradient>
              </defs>

              <!-- Horizontal Grid Lines -->
              <g class="stroke-neutral-200 dark:stroke-[var(--theme-border)]" stroke-dasharray="3 3" stroke-width="0.75">
                <line :x1="padX" :y1="getYPresence(100)" :x2="svgWidth - padX" :y2="getYPresence(100)" />
                <line :x1="padX" :y1="getYPresence(95)" :x2="svgWidth - padX" :y2="getYPresence(95)" />
                <line :x1="padX" :y1="getYPresence(90)" :x2="svgWidth - padX" :y2="getYPresence(90)" />
                <line :x1="padX" :y1="svgHeight - padYBottom" :x2="svgWidth - padX" :y2="svgHeight - padYBottom" />
              </g>

              <!-- Wave Area Path -->
              <path :d="presenceAreaPath" fill="url(#hrisPresenceGrad)" class="transition-all duration-150" />

              <!-- Overtime Line (Amber) -->
              <path
                :d="overtimeLinePath"
                fill="none"
                stroke="#f59e0b"
                stroke-width="1.75"
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
                class="transition-all duration-150"
              />

              <!-- X-Axis Labels -->
              <g class="fill-neutral-400 text-[10px] font-mono">
                <text
                  v-for="p in presencePoints"
                  :key="p.label"
                  :x="p.x"
                  :y="svgHeight - 10"
                  text-anchor="middle"
                >
                  {{ p.label }}
                </text>
              </g>

              <!-- Interactive Hover Scrubber -->
              <g v-if="activeScrubberData.point">
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
                <circle
                  :cx="activeScrubberData.point.x"
                  :cy="activeScrubberData.point.y"
                  r="6"
                  fill="var(--theme-primary)"
                  class="opacity-30 animate-ping"
                />
                <circle
                  :cx="activeScrubberData.point.x"
                  :cy="activeScrubberData.point.y"
                  r="4"
                  fill="var(--theme-primary)"
                  stroke="#ffffff"
                  stroke-width="2"
                />
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
        </template>
      </div>

      <!-- ====================================================== -->
      <!-- DIAGRAM 2: BATANG (DISTRIBUSI LEMBUR PER DEVISI)       -->
      <!-- ====================================================== -->
      <div class="lg:col-span-4 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex flex-col justify-between space-y-3">
        <!-- Skeleton Chart 2 -->
        <template v-if="isLoading">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <BaseSkeleton variant="circular" width="16px" height="16px" />
              <BaseSkeleton width="135px" height="15px" />
            </div>
            <BaseSkeleton width="50px" height="18px" class="rounded-md" />
          </div>
          <div class="space-y-3 pt-1">
            <div v-for="i in 5" :key="'bar-skel-' + i" class="space-y-1">
              <div class="flex items-center justify-between">
                <BaseSkeleton width="75px" height="12px" />
                <BaseSkeleton width="45px" height="12px" />
              </div>
              <BaseSkeleton height="8px" class="rounded-full" />
            </div>
          </div>
          <div class="pt-1 border-t border-neutral-100 dark:border-[var(--theme-border)]">
            <BaseSkeleton width="100%" height="10px" />
          </div>
        </template>

        <!-- Real Chart 2 -->
        <template v-else>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <BarChart3 class="w-4 h-4 text-blue-500" />
              <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                Beban Lembur per Divisi
              </h2>
            </div>
            <span class="text-[10.5px] font-semibold text-neutral-400 bg-neutral-100 dark:bg-[var(--theme-surface-muted)] px-2 py-0.5 rounded-md">
              Bulan Berjalan
            </span>
          </div>

          <!-- Horizontal Bar List dengan Animated Expansion & CountUp -->
          <div class="space-y-2.5 pt-1">
            <div
              v-for="dept in hrisOvertimeByDept"
              :key="dept.code"
              class="space-y-1 group cursor-pointer"
              @mouseenter="hoveredBarDept = dept"
              @mouseleave="hoveredBarDept = null"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition">
                  {{ dept.dept }}
                </span>
                <span class="font-bold font-mono text-neutral-900 dark:text-white">
                  <BaseCountUp :to="dept.hours" suffix=" " />
                  <span class="text-[10px] font-normal text-neutral-400 font-sans">jam</span>
                </span>
              </div>

              <!-- Animated Progress Bar -->
              <div class="h-2 rounded-full bg-neutral-100 dark:bg-[var(--theme-surface-muted)] overflow-hidden flex">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  :style="{
                    width: `${Math.min(100, (dept.hours / dept.maxQuota) * 100)}%`,
                    backgroundColor: dept.code === 'OPS' ? 'var(--theme-primary)' : dept.color,
                  }"
                  :class="hoveredBarDept && hoveredBarDept.code === dept.code ? 'brightness-110' : ''"
                />
              </div>
            </div>
          </div>

          <!-- Axis Helper Label -->
          <div class="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1 border-t border-neutral-100 dark:border-[var(--theme-border)]">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>350 jam kuota</span>
          </div>
        </template>
      </div>

      <!-- ====================================================== -->
      <!-- DIAGRAM 3: DONAT (DISTRIBUSI DISIPLIN & PRESENSI)      -->
      <!-- ====================================================== -->
      <div class="lg:col-span-3 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex flex-col justify-between space-y-3">
        <!-- Skeleton Chart 3 -->
        <template v-if="isLoading">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <BaseSkeleton variant="circular" width="16px" height="16px" />
              <BaseSkeleton width="100px" height="15px" />
            </div>
            <BaseSkeleton width="55px" height="18px" class="rounded-md" />
          </div>
          <div class="flex items-center justify-center py-2">
            <div class="w-28 h-28 rounded-full border-[12px] border-neutral-200 dark:border-[var(--theme-border)] skeleton-shimmer flex items-center justify-center">
              <BaseSkeleton width="40px" height="14px" />
            </div>
          </div>
          <div class="space-y-2 pt-1 border-t border-neutral-100 dark:border-[var(--theme-border)]">
            <div v-for="i in 4" :key="'donut-skel-' + i" class="flex items-center justify-between">
              <BaseSkeleton width="70px" height="12px" />
              <BaseSkeleton width="45px" height="12px" />
            </div>
          </div>
        </template>

        <!-- Real Chart 3 -->
        <template v-else>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <PieChart class="w-4 h-4 text-emerald-500" />
              <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                Disiplin & Status Kehadiran
              </h2>
            </div>
            <BaseBadge variant="neutral" size="sm">Hari Ini</BaseBadge>
          </div>

          <!-- Circular Donut Chart dengan Hover & Dynamic Center Text -->
          <div class="flex items-center justify-center relative py-1">
            <svg class="w-32 h-32 -rotate-90 transform" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                :r="donutRadius"
                fill="none"
                stroke="currentColor"
                class="text-neutral-100 dark:text-[var(--theme-surface-muted)]"
                stroke-width="12"
              />

              <circle
                v-for="slice in donutSlices"
                :key="slice.id"
                cx="60"
                cy="60"
                :r="donutRadius"
                fill="none"
                :stroke="slice.color"
                :stroke-width="hoveredDonutSlice && hoveredDonutSlice.id === slice.id ? 16 : 12"
                :stroke-dasharray="slice.strokeDasharray"
                :stroke-dashoffset="slice.strokeDashoffset"
                stroke-linecap="round"
                class="cursor-pointer transition-all duration-300 ease-out origin-center"
                :class="hoveredDonutSlice && hoveredDonutSlice.id === slice.id ? 'opacity-100 scale-105' : (hoveredDonutSlice ? 'opacity-40' : 'opacity-100')"
                @mouseenter="hoveredDonutSlice = slice"
                @mouseleave="hoveredDonutSlice = null"
              />
            </svg>

            <!-- Center Dynamic Text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span
                class="text-base font-bold font-mono tracking-tight transition-all duration-200"
                :style="{ color: activeDonutInfo.color }"
              >
                {{ activeDonutInfo.value }}
              </span>
              <span class="text-[9.5px] text-neutral-400 block truncate max-w-[75px] leading-tight mt-0.5">
                {{ activeDonutInfo.title }}
              </span>
            </div>
          </div>

          <!-- Donut Legend Compact List -->
          <div class="space-y-1.5 pt-1 border-t border-neutral-100 dark:border-[var(--theme-border)] text-xs">
            <div
              v-for="slice in donutSlices"
              :key="slice.id"
              @mouseenter="hoveredDonutSlice = slice"
              @mouseleave="hoveredDonutSlice = null"
              class="flex items-center justify-between text-[11px] cursor-pointer transition py-0.5 px-1 rounded-md"
              :class="hoveredDonutSlice && hoveredDonutSlice.id === slice.id ? 'bg-neutral-100 dark:bg-[var(--theme-surface-muted)] font-semibold' : ''"
            >
              <div class="flex items-center gap-1.5 truncate">
                <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: slice.color }" />
                <span class="text-neutral-600 dark:text-neutral-400 truncate">{{ slice.name }}</span>
              </div>
              <span class="font-bold font-mono text-neutral-900 dark:text-white">
                {{ slice.count }} <span class="text-[10px] font-normal text-neutral-400 font-sans">({{ slice.pct }}%)</span>
              </span>
            </div>
          </div>
        </template>
      </div>

    </div>

    <!-- ======================================================== -->
    <!-- BARIS 3: 4 KARTU MODUL OPERASIONAL HRIS (COMPACT 4-GRID) -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 anim-fade-up anim-delay-3">

      <!-- Modul 1: Ringkasan Anggaran Payroll -->
      <div class="p-4 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex flex-col justify-between space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Wallet class="w-4 h-4 text-emerald-500" />
            <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Komposisi Biaya Payroll
            </h2>
          </div>
          <BaseBadge variant="emerald" size="xs">Bulan Ini</BaseBadge>
        </div>

        <div class="space-y-2 text-xs divide-y divide-neutral-100 dark:divide-[var(--theme-border)]">
          <div class="flex items-center justify-between pt-1">
            <span class="text-neutral-500">Gaji Pokok & Tetap:</span>
            <span class="font-mono font-semibold text-neutral-800 dark:text-neutral-200">Rp 3,52 M</span>
          </div>
          <div class="flex items-center justify-between pt-1.5">
            <span class="text-neutral-500">Tunjangan & Fasilitas:</span>
            <span class="font-mono font-semibold text-neutral-800 dark:text-neutral-200">Rp 975 Jt</span>
          </div>
          <div class="flex items-center justify-between pt-1.5">
            <span class="text-neutral-500">Upah Lembur L1/L2:</span>
            <span class="font-mono font-semibold text-amber-600 dark:text-amber-400">Rp 420 Jt</span>
          </div>
          <div class="flex items-center justify-between pt-1.5">
            <span class="text-neutral-500">BPJS Ketenagakerjaan:</span>
            <span class="font-mono font-semibold text-neutral-800 dark:text-neutral-200">Rp 325 Jt</span>
          </div>
        </div>

        <div class="pt-1.5 border-t border-neutral-100 dark:border-[var(--theme-border)] flex items-center justify-between text-[11px]">
          <span class="text-neutral-500">Total Netto:</span>
          <span class="font-bold text-[var(--theme-primary)] font-mono text-xs">Rp 5.420.800.000</span>
        </div>
      </div>

      <!-- Modul 2: Integritas Presensi Biometrik & GPS -->
      <div class="p-4 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex flex-col justify-between space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 text-[var(--theme-primary)]" />
            <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Integritas Presensi GPS
            </h2>
          </div>
          <BaseBadge variant="primary" size="xs">98.6% Valid</BaseBadge>
        </div>

        <div class="space-y-2 text-xs">
          <div>
            <div class="flex justify-between text-[11px] mb-1">
              <span class="text-neutral-500">Validasi Radius Cabang (&le;50m):</span>
              <span class="font-semibold text-neutral-800 dark:text-neutral-200">96.2%</span>
            </div>
            <BaseProgress :value="96" variant="primary" size="xs" />
          </div>

          <div>
            <div class="flex justify-between text-[11px] mb-1">
              <span class="text-neutral-500">Face Match & Liveness:</span>
              <span class="font-semibold text-neutral-800 dark:text-neutral-200">98.6%</span>
            </div>
            <BaseProgress :value="98" variant="success" size="xs" />
          </div>

          <div class="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-100 dark:border-[var(--theme-border)]">
            <span class="text-neutral-500">Deteksi Mock GPS:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">0 Pelanggaran</span>
          </div>
        </div>

        <div class="pt-1.5 border-t border-neutral-100 dark:border-[var(--theme-border)] flex items-center justify-between text-[11px]">
          <span class="text-neutral-500">Status Gateway:</span>
          <span class="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online (4 Lokasi)
          </span>
        </div>
      </div>

      <!-- Modul 3: Peringatan Kepatuhan & Masa Kerja -->
      <div class="p-4 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex flex-col justify-between space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-amber-500" />
            <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Evaluasi & Kepatuhan
            </h2>
          </div>
          <BaseBadge variant="warning" size="xs">3 Perlu Tindakan</BaseBadge>
        </div>

        <div class="space-y-2 text-xs">
          <div
            v-for="alert in hrisComplianceAlerts"
            :key="alert.id"
            class="p-2 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface-muted)] border border-neutral-100 dark:border-[var(--theme-border)] flex items-center justify-between gap-2"
          >
            <div class="truncate">
              <span class="font-semibold text-neutral-800 dark:text-neutral-200 block truncate text-[11px]">
                {{ alert.title }}
              </span>
              <span class="text-[10px] text-neutral-400 block truncate">
                {{ alert.desc }}
              </span>
            </div>
            <BaseButton
              variant="neutral"
              size="xs"
              @click="toast.info(`Membuka: ${alert.title}`)"
              class="shrink-0 text-[10px] py-0.5 px-1.5"
            >
              Lihat
            </BaseButton>
          </div>
        </div>

        <div class="pt-1.5 border-t border-neutral-100 dark:border-[var(--theme-border)] flex items-center justify-between text-[11px]">
          <span class="text-neutral-500">Batas Lapor PPh 21:</span>
          <span class="font-bold text-neutral-800 dark:text-neutral-200">20 Nov 2026</span>
        </div>
      </div>

      <!-- Modul 4: Status Shift Kerja Hari Ini -->
      <div class="p-4 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex flex-col justify-between space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-[var(--theme-primary)]" />
            <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Status Shift Hari Ini
            </h2>
          </div>
          <BaseBadge variant="neutral" size="xs">1.284 Staf</BaseBadge>
        </div>

        <div class="space-y-2 text-xs">
          <div
            v-for="shift in hrisShiftSummary"
            :key="shift.id"
            class="space-y-1"
          >
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-neutral-600 dark:text-neutral-400">{{ shift.name }}</span>
              <span class="font-semibold text-neutral-800 dark:text-neutral-200">
                {{ shift.id !== 'off' ? `${shift.present}/${shift.total}` : `${shift.total} Off` }}
              </span>
            </div>
            <BaseProgress
              v-if="shift.id !== 'off'"
              :value="Math.round((shift.present / shift.total) * 100)"
              :variant="shift.id === 'pagi' ? 'primary' : (shift.id === 'siang' ? 'warning' : 'info')"
              size="xs"
            />
          </div>
        </div>

        <div class="pt-1.5 border-t border-neutral-100 dark:border-[var(--theme-border)] flex items-center justify-between text-[11px]">
          <span class="text-neutral-500">Pergantian Shift:</span>
          <button
            type="button"
            @click="isBroadcastModalOpen = true"
            class="text-[var(--theme-primary)] font-semibold hover:underline cursor-pointer flex items-center gap-1"
          >
            Broadcast <Send class="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>

    <!-- ======================================================== -->
    <!-- BARIS 4: 12 KOLOM AKSI & LOG PRESENSI REAL-TIME          -->
    <!-- Col 5: Pending Approvals | Col 7: Live Attendance Feed   -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 anim-fade-up anim-delay-4">

      <!-- ====================================================== -->
      <!-- PENDING APPROVALS BAR (Col 5)                          -->
      <!-- ====================================================== -->
      <div class="lg:col-span-5 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex flex-col justify-between space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-[var(--theme-border)]">
          <div class="flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 text-amber-500" />
            <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Persetujuan Tertunda
            </h2>
          </div>
          <BaseBadge variant="warning" size="xs">{{ approvals.length }} Menunggu</BaseBadge>
        </div>

        <div v-if="approvals.length > 0" class="space-y-2.5 flex-1 overflow-y-auto max-h-[320px]">
          <div
            v-for="item in approvals"
            :key="item.id"
            class="p-2.5 rounded-xl border border-neutral-100 dark:border-[var(--theme-border)] bg-neutral-50/60 dark:bg-[var(--theme-surface-muted)] flex items-center justify-between gap-2.5 transition hover:border-neutral-300 dark:hover:border-[var(--theme-border-strong)]"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <BaseAvatar :name="item.applicant" size="sm" />
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {{ item.applicant }}
                  </span>
                  <BaseBadge :variant="item.typeBadge" size="xs">
                    {{ item.type }}
                  </BaseBadge>
                </div>
                <div class="text-[10px] text-neutral-400 truncate mt-0.5">
                  {{ item.dept }} · {{ item.duration }}
                </div>
              </div>
            </div>

            <!-- Tombol Setujui / Tolak -->
            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                @click="handleReject(item)"
                class="w-7 h-7 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition cursor-pointer"
                title="Tolak Pengajuan"
              >
                <X class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click="handleApprove(item)"
                class="w-7 h-7 rounded-lg bg-[var(--theme-primary)] text-[var(--theme-primary-text)] hover:opacity-90 flex items-center justify-center transition cursor-pointer shadow-2xs"
                title="Setujui Pengajuan"
              >
                <Check class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <CheckCircle2 class="w-8 h-8 text-emerald-500 mx-auto mb-1 opacity-80" />
          <p class="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Semua pengajuan telah diproses!</p>
          <p class="text-[10px] text-neutral-400">Tidak ada permohonan tertunda.</p>
        </div>

        <div class="pt-2 border-t border-neutral-100 dark:border-[var(--theme-border)] flex items-center justify-between text-[11px] text-neutral-400">
          <span>Otomasi alur bertingkat: L1 &rarr; L2 &rarr; HRD</span>
          <span class="text-[var(--theme-primary)] font-medium">Buka Alur Approval &rarr;</span>
        </div>
      </div>

      <!-- ====================================================== -->
      <!-- REAL-TIME ATTENDANCE FEED (Col 7)                      -->
      <!-- ====================================================== -->
      <div class="lg:col-span-7 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex flex-col justify-between space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-[var(--theme-border)]">
          <div class="flex items-center gap-2">
            <Users class="w-4 h-4 text-[var(--theme-primary)]" />
            <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Stream Presensi Karyawan Real-Time
            </h2>
          </div>
          <BaseButton
            variant="ghost"
            size="xs"
            @click="handleExportAttendance"
          >
            <Download class="w-3.5 h-3.5 mr-1" />
            <span>Ekspor Excel</span>
          </BaseButton>
        </div>

        <!-- Attendance List -->
        <div class="divide-y divide-neutral-100 dark:divide-[var(--theme-border)] flex-1 overflow-y-auto max-h-[320px]">
          <div
            v-for="att in hrisLiveAttendance"
            :key="att.id"
            @click="openAttendanceDetail(att)"
            class="py-2.5 px-1 hover:bg-neutral-50 dark:hover:bg-[var(--theme-surface-muted)] transition flex items-center justify-between gap-3 cursor-pointer group rounded-lg"
          >
            <div class="flex items-center gap-2.5 min-w-0">
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
                <div class="text-[10px] text-neutral-400 truncate mt-0.5">
                  {{ att.role }} · <span class="text-neutral-600 dark:text-neutral-300 font-medium">{{ att.branch }}</span>
                </div>
              </div>
            </div>

            <div class="text-right shrink-0">
              <div class="text-xs font-bold font-mono text-neutral-900 dark:text-white flex items-center justify-end gap-1">
                <Clock class="w-3 h-3 text-neutral-400" />
                <span>{{ att.time }}</span>
              </div>
              <div class="text-[10px] text-neutral-400 mt-0.5">
                {{ att.locationAccuracy }}
              </div>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-neutral-100 dark:border-[var(--theme-border)] flex items-center justify-between text-[11px] text-neutral-400">
          <span>Menampilkan 6 entri absensi terbaru</span>
          <span class="text-[var(--theme-primary)] font-medium">Klik untuk detail koordinat GPS & biometrik</span>
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
        <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px]">
          Kalkulasi ini menghitung akumulasi jam hadir, lembur L1/L2, serta potongan BPJS & PPh 21 untuk 1.284 karyawan di 4 kantor cabang.
        </div>

        <div class="p-3.5 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] space-y-2">
          <div class="flex justify-between">
            <span class="text-neutral-500">Periode Payroll:</span>
            <span class="font-bold text-neutral-900 dark:text-white">26 Okt 2026 s/d 25 Nov 2026</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">Cabang Tercakup:</span>
            <span class="font-bold text-neutral-900 dark:text-white">Semua Cabang (JKT, SBY, DPS, MDN)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">Total Estimasi Netto:</span>
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
            Mulai Hitung Payroll
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
          Pesan broadcast akan dikirim via push notification aplikasi Digaji Mobile ke seluruh karyawan aktif.
        </p>

        <div>
          <label class="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Isi Pengumuman
          </label>
          <textarea
            v-model="broadcastMessage"
            rows="3"
            placeholder="Contoh: Pengingat penyesuaian jadwal shift malam untuk cabang Surabaya..."
            class="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition text-xs"
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
            Verifikasi Koordinat & Biometrik
          </span>
          <div class="h-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 text-[11px] gap-2 border border-dashed border-neutral-300 dark:border-neutral-700">
            <ShieldCheck class="w-4 h-4 text-emerald-500" />
            <span>Liveness Detection & Geofence Terverifikasi</span>
          </div>
        </div>
      </div>
    </BaseSlideOver>

  </div>
</template>
