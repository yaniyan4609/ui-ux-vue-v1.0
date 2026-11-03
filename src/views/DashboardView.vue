<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseSkeleton from '../components/ui/BaseSkeleton.vue'
import BaseCountUp from '../components/ui/BaseCountUp.vue'
import BaseDatePicker from '../components/ui/BaseDatePicker.vue'
import { useToast } from '../composables/useToast'
import {
  kpiSummary,
  trenDataPresets,
  layananData,
  statusDistribusi,
  ringkasanKeuangan,
  utilisasiMesin,
  inventarisWarning,
  logistikDanKaryawan,
  aktivitasOperasional,
  orderTerbaruList,
} from '../data/dashboardData'
import {
  ShoppingBag,
  Wallet,
  RefreshCw,
  Users,
  Cpu,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Clock,
  Truck,
  Package,
  CheckCircle2,
  ChevronDown,
  Check,
  X,
  Printer,
  Eye,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  Sparkles,
  Info,
  Waves,
} from 'lucide-vue-next'

const router = useRouter()
const toast = useToast()

// ========================================================
// 1. SKELETON LOADING & REFRESH SYSTEM
// ========================================================
const isLoading = ref(true)
const isRefreshing = ref(false)

const simulateLoading = async (duration = 750) => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, duration))
  isLoading.value = false
}

const handleRefresh = async () => {
  isRefreshing.value = true
  await simulateLoading(700)
  isRefreshing.value = false
  toast.success('Metrik dan stream operasional berhasil diperbarui!', 'Dashboard Live')
}

// ========================================================
// 2. STATE & FILTER KONTROL INTERAKTIF
// ========================================================
const selectedTrenPeriod = ref('7hari') // '7hari' | '14hari' | 'bulan'
const selectedLayananPeriod = ref('hari-ini') // 'hari-ini' | 'minggu-ini'
const activeChartHoverIdx = ref(6) // Default to latest point (27 Jan)
const hoveredDonutSlice = ref(null)

// Date Range Filter
const dashboardDateRange = ref({
  start: '2025-01-21',
  end: '2025-01-27',
})

const handleDateRangeChange = (val) => {
  if (val && val.start && val.end) {
    toast.info(`Rentang tanggal difilter: ${val.start} s/d ${val.end}`, 'Filter Tanggal Dashboard')
  }
}

// Current Trend Data
const currentTren = computed(() => {
  return trenDataPresets[selectedTrenPeriod.value] || trenDataPresets['7hari']
})

// Reset hover index when period changes
watch(selectedTrenPeriod, () => {
  activeChartHoverIdx.value = currentTren.value.dates.length - 1
})

// Quick Detail Modal State for Order Row
const selectedOrder = ref(null)
const isOrderModalOpen = ref(false)

const openOrderDetail = (order) => {
  selectedOrder.value = order
  isOrderModalOpen.value = true
}

const handlePrintNota = (order) => {
  toast.info(`Mencetak nota ${order.noOrder} untuk ${order.pelanggan}...`, 'Cetak Nota')
}

// ========================================================
// 3. SVG CHART HELPERS & WAVE ANIMATION (Bergelombang Naik-Turun)
// ========================================================
const svgWidth = 600
const svgHeight = 220
const padX = 40
const padYTop = 25
const padYBottom = 35

// Wave state & animation loop
const isWaveActive = ref(true)
const wavePhase = ref(0)
const waveAmplitude = ref(4.2) // Amplitude gelombang (pixel)
const isHoveringChart = ref(false)
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
    isWaveActive.value ? 'Animasi gelombang diaktifkan' : 'Animasi gelombang dijeda',
    'Diagram Wave'
  )
}

// Map Omzet Values to Y Coordinate
const getOmzetY = (val) => {
  const max = currentTren.value.maxOmzet
  const plotH = svgHeight - padYTop - padYBottom
  return padYTop + (1 - val / max) * plotH
}

// Map Order Values to Y Coordinate
const getOrderY = (val) => {
  const max = currentTren.value.maxOrder
  const plotH = svgHeight - padYTop - padYBottom
  return padYTop + (1 - val / max) * plotH
}

// X Coordinate for Point i
const getPointX = (index, total) => {
  const plotW = svgWidth - padX * 2
  return padX + (index / (total - 1)) * plotW
}

// Points for Omzet Area/Line with Real Harmonic Wave Undulation
const omzetPoints = computed(() => {
  const vals = currentTren.value.omzet
  const total = vals.length
  return vals.map((val, idx) => {
    const baseY = getOmzetY(val)
    const waveOffset = isWaveActive.value && !isLoading.value
      ? Math.sin(wavePhase.value + idx * 0.85) * waveAmplitude.value
      : 0
    return {
      x: getPointX(idx, total),
      y: baseY + waveOffset,
      baseY,
      val,
    }
  })
})

// Points for Order Line with Counterpoint Harmonic Wave Undulation
const orderPoints = computed(() => {
  const vals = currentTren.value.order
  const total = vals.length
  return vals.map((val, idx) => {
    const baseY = getOrderY(val)
    const waveOffset = isWaveActive.value && !isLoading.value
      ? Math.cos(wavePhase.value + idx * 0.85 + 0.4) * (waveAmplitude.value * 0.75)
      : 0
    return {
      x: getPointX(idx, total),
      y: baseY + waveOffset,
      baseY,
      val,
    }
  })
})

// Generate Smooth Cubic Bezier SVG Path
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

// Omzet Area Path (closed polygon for gradient fill)
const omzetAreaPath = computed(() => {
  const pts = omzetPoints.value
  if (pts.length === 0) return ''
  const linePath = getSmoothPath(pts)
  const bottomY = svgHeight - padYBottom
  const firstX = pts[0].x
  const lastX = pts[pts.length - 1].x
  return `${linePath} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`
})

// Omzet Line Stroke Path
const omzetLinePath = computed(() => getSmoothPath(omzetPoints.value))

// Order Line Stroke Path
const orderLinePath = computed(() => getSmoothPath(orderPoints.value))

// ========================================================
// 4. DONUT CHART SVG COMPUTATIONS
// ========================================================
const donutRadius = 50
const donutCircumference = 2 * Math.PI * donutRadius // ~314.159

const donutSlices = computed(() => {
  let accumulatedPct = 0
  return statusDistribusi.map((item) => {
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

onMounted(() => {
  simulateLoading(750)
  startWaveLoop()
})

onUnmounted(() => {
  stopWaveLoop()
})
</script>

<template>
  <div class="space-y-4 sm:space-y-5 w-full max-w-7xl mx-auto select-none pb-8">
    
    <!-- ======================================================== -->
    <!-- TOP HEADER: TITLE, BADGES, REFRESH & SKELETON DEMO       -->
    <!-- ======================================================== -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-[#27272a] anim-fade-up">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--theme-primary)] text-[var(--theme-primary-text)] flex items-center justify-center shrink-0 shadow-2xs">
          <Activity class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
              Dashboard Operasional & Order
            </h1>
            <BaseBadge variant="success" size="sm" dot pulse>Live Sync</BaseBadge>
          </div>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Ringkasan omzet, animasi gelombang metrik, utilisasi mesin, dan stream order hari ini.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-center flex-wrap">
        <!-- Button Tes Skeleton Loading -->
        <BaseButton
          variant="outline"
          size="sm"
          @click="simulateLoading(800)"
          :disabled="isLoading"
          title="Lihat Efek Shimmer Skeleton Loading"
        >
          <Sparkles class="w-3.5 h-3.5 text-amber-500" />
          <span class="hidden sm:inline">Tes Skeleton</span>
        </BaseButton>

        <!-- Button Segarkan Data -->
        <BaseButton
          variant="outline"
          size="sm"
          @click="handleRefresh"
          :disabled="isRefreshing || isLoading"
          title="Sinkronisasi Data Terbaru"
        >
          <RefreshCw class="w-3.5 h-3.5 text-neutral-500" :class="isRefreshing ? 'animate-spin' : ''" />
          <span class="hidden sm:inline">{{ isRefreshing ? 'Menyinkronkan...' : 'Segarkan Data' }}</span>
        </BaseButton>

        <BaseButton
          variant="primary"
          size="sm"
          @click="router.push('/data/karyawan')"
        >
          <Users class="w-3.5 h-3.5" />
          <span>Data Karyawan</span>
        </BaseButton>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- BARIS 1: 6 TOP STAT KPI CARDS (DENGAN SKELETON & COUNTUP)-->
    <!-- ======================================================== -->
    <!-- Mode Skeleton Loading -->
    <div
      v-if="isLoading"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 anim-fade-up"
    >
      <div
        v-for="i in 6"
        :key="'kpi-skel-' + i"
        class="p-3.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs space-y-3"
      >
        <div class="flex items-center justify-between">
          <BaseSkeleton width="60%" height="11px" />
          <BaseSkeleton variant="rectangular" width="28px" height="28px" class="rounded-lg" />
        </div>
        <div class="space-y-1.5 pt-1">
          <BaseSkeleton width="75%" height="22px" />
          <BaseSkeleton width="50%" height="11px" />
        </div>
      </div>
    </div>

    <!-- Mode Loaded (Real Cards with Smooth BaseCountUp) -->
    <div
      v-else
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 anim-fade-up anim-delay-1"
    >
      <!-- KPI 1: Total Order Hari Ini -->
      <div class="p-3.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition flex flex-col justify-between space-y-2 group">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">Total Order Hari Ini</span>
          <div class="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShoppingBag class="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-mono leading-none">
            <BaseCountUp :to="kpiSummary.totalOrder.value" suffix=" " />
            <span class="text-xs font-normal text-neutral-500 font-sans">order</span>
          </div>
          <div class="flex items-center gap-1 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
            <ArrowUp class="w-3 h-3 stroke-[3]" />
            <span>{{ kpiSummary.totalOrder.growth }}</span>
            <span class="text-neutral-400 dark:text-neutral-500 font-normal">dari kemarin</span>
          </div>
        </div>
      </div>

      <!-- KPI 2: Omzet Hari Ini -->
      <div class="p-3.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition flex flex-col justify-between space-y-2 group">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">Omzet Hari Ini</span>
          <div class="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Wallet class="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div class="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-mono leading-none">
            <BaseCountUp :to="kpiSummary.omzet.value" prefix="Rp " />
          </div>
          <div class="flex items-center gap-1 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
            <ArrowUp class="w-3 h-3 stroke-[3]" />
            <span>{{ kpiSummary.omzet.growth }}</span>
            <span class="text-neutral-400 dark:text-neutral-500 font-normal">dari kemarin</span>
          </div>
        </div>
      </div>

      <!-- KPI 3: Order Diproses -->
      <div class="p-3.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition flex flex-col justify-between space-y-2 group">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">Order Diproses</span>
          <div class="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <RefreshCw class="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-mono leading-none">
            <BaseCountUp :to="kpiSummary.orderDiproses.value" suffix=" " />
            <span class="text-xs font-normal text-neutral-500 font-sans">order</span>
          </div>
          <p class="text-[10.5px] text-neutral-400 dark:text-neutral-500 mt-1.5 truncate">
            Sedang di antrean cuci/setrika
          </p>
        </div>
      </div>

      <!-- KPI 4: Pelanggan Aktif -->
      <div class="p-3.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition flex flex-col justify-between space-y-2 group">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">Pelanggan Aktif</span>
          <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users class="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-mono leading-none">
            <BaseCountUp :to="1248" suffix=" " />
            <span class="text-xs font-normal text-neutral-500 font-sans">org</span>
          </div>
          <div class="flex items-center gap-1 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
            <ArrowUp class="w-3 h-3 stroke-[3]" />
            <span>{{ kpiSummary.pelangganAktif.growth }}</span>
            <span class="text-neutral-400 dark:text-neutral-500 font-normal">7 hr terakhir</span>
          </div>
        </div>
      </div>

      <!-- KPI 5: Mesin Aktif -->
      <div class="p-3.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition flex flex-col justify-between space-y-2 group">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">Mesin Aktif</span>
          <div class="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Cpu class="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-mono leading-none">
            <BaseCountUp :to="kpiSummary.mesinAktif.aktif" /> / {{ kpiSummary.mesinAktif.total }}
            <span class="text-xs font-normal text-neutral-500 font-sans">unit</span>
          </div>
          <p class="text-[10.5px] text-sky-600 dark:text-sky-400 font-medium mt-1.5">
            {{ kpiSummary.mesinAktif.subtitle }}
          </p>
        </div>
      </div>

      <!-- KPI 6: Stok Menipis -->
      <div class="p-3.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs hover:border-rose-300 dark:hover:border-rose-900/50 transition flex flex-col justify-between space-y-2 group">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">Stok Menipis</span>
          <div class="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <AlertTriangle class="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 font-mono leading-none">
            <BaseCountUp :to="kpiSummary.stokMenipis.count" suffix=" " />
            <span class="text-xs font-normal text-neutral-500 font-sans">item</span>
          </div>
          <div class="flex items-center gap-1 text-[10.5px] text-rose-600 dark:text-rose-400 font-medium mt-1.5 truncate">
            <AlertTriangle class="w-2.5 h-2.5 shrink-0" />
            <span class="truncate">{{ kpiSummary.stokMenipis.warning }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- ======================================================== -->
    <!-- BARIS 2: TIGA DIAGRAM LENGKAP & INTERAKTIF              -->
    <!-- 1. Tren Omzet & Order (Dual Line Curve Bergelombang)    -->
    <!-- 2. Volume Order per Layanan (Horizontal Bar)            -->
    <!-- 3. Distribusi Status Order (Donut Chart)                -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 anim-fade-up anim-delay-2">
      
      <!-- ====================================================== -->
      <!-- DIAGRAM 1: Tren Omzet & Order                          -->
      <!-- ====================================================== -->
      <div class="lg:col-span-5 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex flex-col justify-between space-y-3">
        <!-- Skeleton Chart 1 -->
        <template v-if="isLoading">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <BaseSkeleton variant="circular" width="16px" height="16px" />
              <BaseSkeleton width="130px" height="15px" />
            </div>
            <BaseSkeleton width="90px" height="24px" class="rounded-lg" />
          </div>
          <div class="flex items-center gap-4">
            <BaseSkeleton width="70px" height="12px" />
            <BaseSkeleton width="80px" height="12px" />
          </div>
          <div class="h-44 w-full rounded-xl skeleton-shimmer flex items-center justify-center">
            <div class="w-10 h-10 rounded-full border-2 border-neutral-300 dark:border-neutral-600 border-t-transparent animate-spin opacity-30" />
          </div>
        </template>

        <!-- Real Chart 1 dengan Gelombang Interaktif -->
        <template v-else>
          <!-- Chart Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div class="flex items-center gap-2">
              <TrendingUp class="w-4 h-4 text-[var(--theme-primary)]" />
              <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                Tren Omzet & Order
              </h2>
            </div>

            <!-- Periode Controls & Wave Toggle -->
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Wave Toggle Button -->
              <button
                type="button"
                @click="toggleWave"
                class="p-1 px-2 h-8.5 rounded-xl border border-neutral-200 dark:border-[#27272a] text-[10.5px] font-medium flex items-center gap-1 transition cursor-pointer"
                :class="isWaveActive ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-800' : 'bg-neutral-100 dark:bg-[#18181b] text-neutral-500'"
                title="Beralih Animasi Gelombang Beriak"
              >
                <Waves class="w-3 h-3" :class="isWaveActive ? 'animate-pulse' : ''" />
                <span class="hidden sm:inline">{{ isWaveActive ? 'Gelombang On' : 'Gelombang Off' }}</span>
              </button>

              <!-- BaseDatePicker Range Mode -->
              <div class="w-48 sm:w-56 shrink-0">
                <BaseDatePicker
                  v-model="dashboardDateRange"
                  range
                  size="sm"
                  placeholder="Rentang tanggal..."
                  @change="handleDateRangeChange"
                />
              </div>
            </div>
          </div>

          <!-- Legend Bar -->
          <div class="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)] inline-block" />
                <span>Omzet (Rp)</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full border-2 border-sky-400 bg-white dark:bg-[#141417] inline-block" />
                <span>Jumlah Order</span>
              </div>
            </div>
            <span v-if="isWaveActive" class="text-[10px] text-sky-500 font-mono tracking-tight hidden sm:inline">
              ~ wave undulating ~
            </span>
          </div>

          <!-- Interactive SVG Chart Area dengan Undulating Wave -->
          <div
            class="relative w-full h-44 select-none"
            @mouseenter="isHoveringChart = true"
            @mouseleave="isHoveringChart = false"
          >
            <svg
              class="w-full h-full overflow-visible"
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="omzetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--theme-primary)" stop-opacity="0.30" />
                  <stop offset="100%" stop-color="var(--theme-primary)" stop-opacity="0.00" />
                </linearGradient>
              </defs>

              <!-- Horizontal Grid lines -->
              <line :x1="padX" :y1="getOmzetY(10000000)" :x2="svgWidth - padX" :y2="getOmzetY(10000000)" stroke="currentColor" class="text-neutral-200/70 dark:text-[#25252a]" stroke-dasharray="3 3" />
              <line :x1="padX" :y1="getOmzetY(6000000)" :x2="svgWidth - padX" :y2="getOmzetY(6000000)" stroke="currentColor" class="text-neutral-200/70 dark:text-[#25252a]" stroke-dasharray="3 3" />
              <line :x1="padX" :y1="getOmzetY(2000000)" :x2="svgWidth - padX" :y2="getOmzetY(2000000)" stroke="currentColor" class="text-neutral-200/70 dark:text-[#25252a]" stroke-dasharray="3 3" />
              <line :x1="padX" :y1="svgHeight - padYBottom" :x2="svgWidth - padX" :y2="svgHeight - padYBottom" stroke="currentColor" class="text-neutral-300 dark:text-[#2d2d34]" />

              <!-- Y-Axis Ticks (Omzet) -->
              <text :x="padX - 8" :y="getOmzetY(10000000) + 3" text-anchor="end" class="text-[9.5px] fill-neutral-400 dark:fill-neutral-500 font-mono">10Jt</text>
              <text :x="padX - 8" :y="getOmzetY(6000000) + 3" text-anchor="end" class="text-[9.5px] fill-neutral-400 dark:fill-neutral-500 font-mono">6Jt</text>
              <text :x="padX - 8" :y="getOmzetY(2000000) + 3" text-anchor="end" class="text-[9.5px] fill-neutral-400 dark:fill-neutral-500 font-mono">2Jt</text>

              <!-- Y-Axis Ticks Right (Order) -->
              <text :x="svgWidth - padX + 8" :y="getOrderY(200) + 3" text-anchor="start" class="text-[9.5px] fill-neutral-400 dark:fill-neutral-500 font-mono">200</text>
              <text :x="svgWidth - padX + 8" :y="getOrderY(120) + 3" text-anchor="start" class="text-[9.5px] fill-neutral-400 dark:fill-neutral-500 font-mono">120</text>
              <text :x="svgWidth - padX + 8" :y="getOrderY(40) + 3" text-anchor="start" class="text-[9.5px] fill-neutral-400 dark:fill-neutral-500 font-mono">40</text>

              <!-- Area Path (Omzet) with Wave Undulation -->
              <path :d="omzetAreaPath" fill="url(#omzetGradient)" />

              <!-- Omzet Line (Primary Theme Stroke) with Wave Undulation -->
              <path
                :d="omzetLinePath"
                fill="none"
                stroke="var(--theme-primary)"
                stroke-width="2.5"
                stroke-linecap="round"
              />

              <!-- Order Line (Sky Blue Stroke) with Harmonic Wave -->
              <path
                :d="orderLinePath"
                fill="none"
                stroke="#0284c7"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-dasharray="4 2"
              />

              <!-- Interactive Vertical Hover Guideline -->
              <line
                v-if="omzetPoints[activeChartHoverIdx]"
                :x1="omzetPoints[activeChartHoverIdx].x"
                :y1="padYTop"
                :x2="omzetPoints[activeChartHoverIdx].x"
                :y2="svgHeight - padYBottom"
                stroke="var(--theme-primary)"
                stroke-width="1.5"
                stroke-dasharray="3 3"
                class="opacity-60"
              />

              <!-- Points on Omzet Line -->
              <circle
                v-for="(pt, idx) in omzetPoints"
                :key="'omz-' + idx"
                :cx="pt.x"
                :cy="pt.y"
                :r="activeChartHoverIdx === idx ? 5.5 : 3"
                fill="var(--theme-primary)"
                class="transition-all cursor-pointer"
                stroke="white"
                stroke-width="1.5"
                @mouseenter="activeChartHoverIdx = idx"
              />

              <!-- Points on Order Line -->
              <circle
                v-for="(pt, idx) in orderPoints"
                :key="'ord-' + idx"
                :cx="pt.x"
                :cy="pt.y"
                :r="activeChartHoverIdx === idx ? 4.5 : 2.5"
                fill="#0284c7"
                class="transition-all cursor-pointer"
                stroke="white"
                stroke-width="1"
                @mouseenter="activeChartHoverIdx = idx"
              />

              <!-- X-Axis Labels (Dates) -->
              <text
                v-for="(d, idx) in currentTren.dates"
                :key="'date-' + idx"
                :x="getPointX(idx, currentTren.dates.length)"
                :y="svgHeight - 12"
                text-anchor="middle"
                class="text-[10px] fill-neutral-500 dark:fill-neutral-400 font-medium"
              >
                {{ d }}
              </text>
            </svg>

            <!-- Interactive Hover Tooltip Box -->
            <div
              v-if="omzetPoints[activeChartHoverIdx]"
              class="absolute top-1 pointer-events-none transition-all duration-150 p-2.5 rounded-xl bg-white/95 dark:bg-[#1a1a1e]/95 backdrop-blur-xs border border-neutral-200 dark:border-[#27272a] shadow-lg text-xs"
              :style="{
                left: `${Math.min(75, Math.max(15, (activeChartHoverIdx / (currentTren.dates.length - 1)) * 100))}%`,
                transform: 'translateX(-50%)',
              }"
            >
              <div class="font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-[#27272a] pb-1 mb-1">
                {{ currentTren.dates[activeChartHoverIdx] }}
              </div>
              <div class="flex items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-300">
                <span class="w-2 h-2 rounded-full bg-[var(--theme-primary)] shrink-0" />
                <span>Omzet:</span>
                <span class="font-bold text-neutral-900 dark:text-white font-mono">
                  Rp {{ (currentTren.omzet[activeChartHoverIdx]).toLocaleString('id-ID') }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-300 mt-0.5">
                <span class="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                <span>Order:</span>
                <span class="font-bold text-neutral-900 dark:text-white font-mono">
                  {{ currentTren.order[activeChartHoverIdx] }} order
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ====================================================== -->
      <!-- DIAGRAM 2: Volume Order per Layanan (Horizontal Bar)   -->
      <!-- ====================================================== -->
      <div class="lg:col-span-4 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex flex-col justify-between space-y-3">
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
          <div class="pt-1 border-t border-neutral-100 dark:border-[#27272a]">
            <BaseSkeleton width="100%" height="10px" />
          </div>
        </template>

        <!-- Real Chart 2 -->
        <template v-else>
          <!-- Header -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <BarChart3 class="w-4 h-4 text-blue-500" />
              <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                Volume Order per Layanan
              </h2>
            </div>
            <span class="text-[10.5px] font-semibold text-neutral-400 bg-neutral-100 dark:bg-[#202025] px-2 py-0.5 rounded-md">
              Hari Ini
            </span>
          </div>

          <!-- Horizontal Bar List dengan Animated Expansion & CountUp -->
          <div class="space-y-2.5 pt-1">
            <div
              v-for="layanan in layananData"
              :key="layanan.id"
              class="space-y-1 group"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition">
                  {{ layanan.label }}
                </span>
                <span class="font-bold font-mono text-neutral-900 dark:text-white">
                  <BaseCountUp :to="layanan.count" suffix=" " />
                  <span class="text-[10px] font-normal text-neutral-400 font-sans">order</span>
                </span>
              </div>

              <!-- Animated Progress Bar (Ekspansi Halus) -->
              <div class="h-2 rounded-full bg-neutral-100 dark:bg-[#202025] overflow-hidden flex">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  :style="{
                    width: `${layanan.pct}%`,
                    backgroundColor: layanan.id === 'cuci-kiloan' ? 'var(--theme-primary)' : layanan.color,
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Axis helper label -->
          <div class="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1 border-t border-neutral-100 dark:border-[#27272a]">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80 order</span>
          </div>
        </template>
      </div>

      <!-- ====================================================== -->
      <!-- DIAGRAM 3: Distribusi Status Order (Donut Chart)       -->
      <!-- ====================================================== -->
      <div class="lg:col-span-3 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex flex-col justify-between space-y-3">
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
            <div class="w-28 h-28 rounded-full border-[12px] border-neutral-200 dark:border-[#242428] skeleton-shimmer flex items-center justify-center">
              <BaseSkeleton width="40px" height="14px" />
            </div>
          </div>
          <div class="space-y-2 pt-1 border-t border-neutral-100 dark:border-[#27272a]">
            <div v-for="i in 4" :key="'donut-skel-' + i" class="flex items-center justify-between">
              <BaseSkeleton width="70px" height="12px" />
              <BaseSkeleton width="45px" height="12px" />
            </div>
          </div>
        </template>

        <!-- Real Chart 3 -->
        <template v-else>
          <!-- Header -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <PieChart class="w-4 h-4 text-emerald-500" />
              <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                Distribusi Status
              </h2>
            </div>
            <BaseBadge variant="neutral" size="sm">142 Total</BaseBadge>
          </div>

          <!-- Circular Donut Chart dengan Hover & Smooth Stroke Animation -->
          <div class="flex items-center justify-center relative py-1">
            <svg class="w-32 h-32 -rotate-90 transform" viewBox="0 0 120 120">
              <!-- Background Ring -->
              <circle
                cx="60"
                cy="60"
                :r="donutRadius"
                fill="transparent"
                stroke="currentColor"
                class="text-neutral-100 dark:text-[#202025]"
                stroke-width="14"
              />

              <!-- Slices with stroke-dasharray and animated transitions -->
              <circle
                v-for="slice in donutSlices"
                :key="slice.id"
                cx="60"
                cy="60"
                :r="donutRadius"
                fill="transparent"
                :stroke="slice.color"
                :stroke-width="hoveredDonutSlice === slice.id ? 17 : 14"
                :stroke-dasharray="slice.strokeDasharray"
                :stroke-dashoffset="slice.strokeDashoffset"
                stroke-linecap="round"
                class="transition-all duration-500 cursor-pointer"
                @mouseenter="hoveredDonutSlice = slice.id"
                @mouseleave="hoveredDonutSlice = null"
              />
            </svg>

            <!-- Center Text in Donut dengan CountUp -->
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span class="text-xl font-bold font-mono text-neutral-900 dark:text-white leading-none">
                <BaseCountUp :to="142" />
              </span>
              <span class="text-[10px] text-neutral-400 tracking-wider uppercase font-semibold mt-0.5">
                Order
              </span>
            </div>
          </div>

          <!-- Legend with values & CountUp -->
          <div class="space-y-1.5 pt-1 border-t border-neutral-100 dark:border-[#27272a] text-xs">
            <div
              v-for="st in statusDistribusi"
              :key="st.id"
              class="flex items-center justify-between cursor-pointer transition p-1 rounded-lg"
              :class="hoveredDonutSlice === st.id ? 'bg-neutral-100 dark:bg-[#202025]' : ''"
              @mouseenter="hoveredDonutSlice = st.id"
              @mouseleave="hoveredDonutSlice = null"
            >
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: st.color }" />
                <span class="text-neutral-700 dark:text-neutral-300 font-medium">{{ st.label }}</span>
              </div>
              <div class="font-mono text-neutral-900 dark:text-white font-semibold text-[11.5px]">
                <BaseCountUp :to="st.count" /> <span class="text-neutral-400 font-normal">({{ st.pct }}%)</span>
              </div>
            </div>
          </div>
        </template>
      </div>

    </div>

    <!-- ======================================================== -->
    <!-- BARIS 3: 4 KARTU RINGKASAN OPERASIONAL & KEUANGAN        -->
    <!-- 1. Ringkasan Keuangan                                    -->
    <!-- 2. Utilisasi Mesin (Gauge Radial)                        -->
    <!-- 3. Stok & Inventaris (Peringatan)                        -->
    <!-- 4. Pickup & Delivery + Absensi Karyawan                  -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 anim-fade-up anim-delay-3">
      
      <!-- ====================================================== -->
      <!-- KARTU 1: Ringkasan Keuangan                            -->
      <!-- ====================================================== -->
      <div class="p-4 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex flex-col justify-between space-y-3">
        <template v-if="isLoading">
          <div class="flex items-center gap-2">
            <BaseSkeleton variant="circular" width="16px" height="16px" />
            <BaseSkeleton width="130px" height="15px" />
          </div>
          <div class="space-y-3 pt-1">
            <div v-for="i in 3" :key="'keu-skel-' + i" class="flex items-center justify-between">
              <BaseSkeleton width="80px" height="12px" />
              <BaseSkeleton width="90px" height="14px" />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <DollarSign class="w-4 h-4 text-emerald-500" />
              <h3 class="text-xs font-bold text-neutral-900 dark:text-white">
                Ringkasan Keuangan <span class="font-normal text-neutral-400">(Hari Ini)</span>
              </h3>
            </div>
          </div>

          <div class="space-y-2 divide-y divide-neutral-100 dark:divide-[#242428] text-xs">
            <div class="flex items-center justify-between pt-1">
              <span class="flex items-center gap-1.5 text-neutral-500">
                <ArrowUp class="w-3.5 h-3.5 text-emerald-500" /> Pemasukan
              </span>
              <span class="font-bold font-mono text-neutral-900 dark:text-white">
                <BaseCountUp :to="ringkasanKeuangan.pemasukan" prefix="Rp " />
              </span>
            </div>

            <div class="flex items-center justify-between pt-2">
              <span class="flex items-center gap-1.5 text-neutral-500">
                <ArrowDown class="w-3.5 h-3.5 text-rose-500" /> Pengeluaran
              </span>
              <span class="font-bold font-mono text-neutral-900 dark:text-white">
                <BaseCountUp :to="ringkasanKeuangan.pengeluaran" prefix="Rp " />
              </span>
            </div>

            <div class="flex items-center justify-between pt-2">
              <span class="font-bold text-neutral-800 dark:text-neutral-200">
                Laba Kotor
              </span>
              <div class="text-right">
                <span class="font-bold font-mono text-sm text-[var(--theme-primary)] block">
                  <BaseCountUp :to="ringkasanKeuangan.labaKotor" prefix="Rp " />
                </span>
                <span class="text-[10px] text-emerald-600 font-semibold">
                  {{ ringkasanKeuangan.labaGrowthPct }} Margin
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ====================================================== -->
      <!-- KARTU 2: Utilisasi Mesin (Gauge Radial)                -->
      <!-- ====================================================== -->
      <div class="p-4 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex flex-col justify-between space-y-3">
        <template v-if="isLoading">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <BaseSkeleton variant="circular" width="16px" height="16px" />
              <BaseSkeleton width="90px" height="15px" />
            </div>
            <BaseSkeleton width="50px" height="18px" class="rounded-md" />
          </div>
          <div class="flex items-center gap-4 py-1">
            <div class="w-16 h-16 rounded-full border-[6px] border-neutral-200 dark:border-[#242428] skeleton-shimmer" />
            <div class="flex-1 space-y-2">
              <BaseSkeleton width="100%" height="11px" />
              <BaseSkeleton width="85%" height="11px" />
              <BaseSkeleton width="70%" height="11px" />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Cpu class="w-4 h-4 text-cyan-500" />
              <h3 class="text-xs font-bold text-neutral-900 dark:text-white">
                Utilisasi Mesin
              </h3>
            </div>
            <BaseBadge variant="info" size="sm">10 Unit</BaseBadge>
          </div>

          <div class="flex items-center gap-4">
            <!-- Radial Gauge Mini dengan Animated Stroke -->
            <div class="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" class="text-neutral-100 dark:text-[#202025]" stroke-width="6" />
                <circle
                  cx="30"
                  cy="30"
                  r="24"
                  fill="none"
                  stroke="var(--theme-primary)"
                  stroke-width="6"
                  stroke-dasharray="150.8"
                  :stroke-dashoffset="150.8 * (1 - utilisasiMesin.utilisasiPct / 100)"
                  stroke-linecap="round"
                  class="transition-all duration-1000 ease-out"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span class="text-xs font-bold font-mono text-neutral-900 dark:text-white leading-none">
                  <BaseCountUp :to="utilisasiMesin.utilisasiPct" suffix="%" />
                </span>
                <span class="text-[8px] text-neutral-400 font-semibold">Util</span>
              </div>
            </div>

            <!-- Key Metrics List dengan CountUp -->
            <div class="flex-1 space-y-1 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-neutral-500 text-[11px] flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Mesin Aktif:
                </span>
                <span class="font-bold text-neutral-900 dark:text-white font-mono">
                  <BaseCountUp :to="utilisasiMesin.aktifUnit" /> unit
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-neutral-500 text-[11px]">Total Siklus:</span>
                <span class="font-bold text-neutral-900 dark:text-white font-mono">
                  <BaseCountUp :to="utilisasiMesin.totalSiklus" suffix="x" />
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-neutral-500 text-[11px]">Total Diproses:</span>
                <span class="font-bold text-neutral-900 dark:text-white font-mono">
                  <BaseCountUp :to="utilisasiMesin.totalKg" :decimals="1" suffix=" kg" />
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ====================================================== -->
      <!-- KARTU 3: Stok & Inventaris (Peringatan)                 -->
      <!-- ====================================================== -->
      <div class="p-4 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex flex-col justify-between space-y-3">
        <template v-if="isLoading">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <BaseSkeleton variant="circular" width="16px" height="16px" />
              <BaseSkeleton width="110px" height="15px" />
            </div>
            <BaseSkeleton width="40px" height="14px" />
          </div>
          <div class="space-y-2 pt-1">
            <div v-for="i in 4" :key="'inv-skel-' + i" class="flex items-center justify-between py-1">
              <div class="space-y-1">
                <BaseSkeleton width="90px" height="12px" />
                <BaseSkeleton width="50px" height="10px" />
              </div>
              <BaseSkeleton width="48px" height="18px" class="rounded-md" />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Package class="w-4 h-4 text-rose-500" />
              <h3 class="text-xs font-bold text-neutral-900 dark:text-white">
                Stok & Inventaris
              </h3>
            </div>
            <button
              type="button"
              @click="toast.info('Membuka modul inventaris lengkap...')"
              class="text-[10.5px] font-semibold text-[var(--theme-primary)] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Semua</span>
              <ArrowRight class="w-2.5 h-2.5" />
            </button>
          </div>

          <div class="space-y-1.5 text-xs">
            <div
              v-for="item in inventarisWarning"
              :key="item.id"
              class="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-[#242428] last:border-b-0"
            >
              <div class="min-w-0 pr-2">
                <span class="font-medium text-neutral-800 dark:text-neutral-200 truncate block text-[11.5px]">
                  {{ item.nama }}
                </span>
                <span class="text-[10px] text-neutral-400 font-mono">
                  Sisa: {{ item.sisa }}
                </span>
              </div>
              <BaseBadge :variant="item.badgeVariant" size="sm">
                {{ item.status }}
              </BaseBadge>
            </div>
          </div>
        </template>
      </div>

      <!-- ====================================================== -->
      <!-- KARTU 4: Pickup & Delivery + Absensi Karyawan          -->
      <!-- ====================================================== -->
      <div class="p-4 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex flex-col justify-between space-y-3">
        <template v-if="isLoading">
          <div class="flex items-center gap-2">
            <BaseSkeleton variant="circular" width="16px" height="16px" />
            <BaseSkeleton width="120px" height="15px" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="p-2.5 rounded-xl skeleton-shimmer h-14" />
            <div class="p-2.5 rounded-xl skeleton-shimmer h-14" />
          </div>
          <div class="pt-1 border-t border-neutral-100 dark:border-[#27272a] space-y-1.5">
            <BaseSkeleton width="80%" height="11px" />
            <BaseSkeleton height="6px" class="rounded-full" />
          </div>
        </template>

        <template v-else>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Truck class="w-4 h-4 text-sky-500" />
              <h3 class="text-xs font-bold text-neutral-900 dark:text-white">
                Logistik & Tim Hari Ini
              </h3>
            </div>
          </div>

          <!-- 2 Column Pickup & Delivery dengan CountUp -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-2 rounded-xl bg-neutral-50 dark:bg-[#18181c] border border-neutral-100 dark:border-[#242428]">
              <span class="text-[10px] text-neutral-400 block font-semibold uppercase">Pickup</span>
              <span class="font-bold font-mono text-neutral-900 dark:text-white block mt-0.5 text-sm">
                <BaseCountUp :to="logistikDanKaryawan.pickup.count" suffix=" " />
                <span class="text-[10px] font-normal text-neutral-500">order</span>
              </span>
              <span class="text-[10px] text-emerald-600 font-semibold">{{ logistikDanKaryawan.pickup.growth }}</span>
            </div>

            <div class="p-2 rounded-xl bg-neutral-50 dark:bg-[#18181c] border border-neutral-100 dark:border-[#242428]">
              <span class="text-[10px] text-neutral-400 block font-semibold uppercase">Delivery</span>
              <span class="font-bold font-mono text-neutral-900 dark:text-white block mt-0.5 text-sm">
                <BaseCountUp :to="logistikDanKaryawan.delivery.count" suffix=" " />
                <span class="text-[10px] font-normal text-neutral-500">order</span>
              </span>
              <span class="text-[10px] text-emerald-600 font-semibold">{{ logistikDanKaryawan.delivery.growth }}</span>
            </div>
          </div>

          <!-- Absensi Karyawan Bar dengan Animation -->
          <div class="pt-1.5 border-t border-neutral-100 dark:border-[#27272a] space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="text-neutral-500 text-[11px]">Absensi Karyawan:</span>
              <span class="font-bold font-mono text-neutral-900 dark:text-white text-[11px]">
                <BaseCountUp :to="logistikDanKaryawan.absensi.hadir" /> / {{ logistikDanKaryawan.absensi.total }} hadir
              </span>
            </div>
            <div class="h-1.5 rounded-full bg-neutral-100 dark:bg-[#222228] overflow-hidden">
              <div
                class="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                :style="{ width: `${logistikDanKaryawan.absensi.pct}%` }"
              />
            </div>
          </div>
        </template>
      </div>

    </div>

    <!-- ======================================================== -->
    <!-- BARIS 4: TIMELINE AKTIVITAS OPERASIONAL & TABEL ORDER    -->
    <!-- 1. Timeline Aktivitas Real-Time (Left Col ~35%)           -->
    <!-- 2. Tabel Order Terbaru (Right Col ~65%)                  -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 anim-fade-up anim-delay-4">
      
      <!-- ====================================================== -->
      <!-- TIMELINE AKTIVITAS OPERASIONAL (5 Col Desktop)         -->
      <!-- ====================================================== -->
      <div class="lg:col-span-5 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex flex-col justify-between space-y-3">
        <template v-if="isLoading">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <BaseSkeleton variant="circular" width="16px" height="16px" />
              <BaseSkeleton width="130px" height="15px" />
            </div>
            <BaseSkeleton width="60px" height="14px" />
          </div>
          <div class="space-y-4 pt-2">
            <div v-for="i in 5" :key="'time-skel-' + i" class="flex items-start gap-3">
              <BaseSkeleton variant="circular" width="28px" height="28px" />
              <div class="flex-1 space-y-1.5">
                <div class="flex justify-between">
                  <BaseSkeleton width="110px" height="13px" />
                  <BaseSkeleton width="35px" height="11px" />
                </div>
                <BaseSkeleton width="85%" height="11px" />
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4 text-[var(--theme-primary)]" />
              <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                Aktivitas Terbaru <span class="font-normal text-neutral-400">(Operasional)</span>
              </h2>
            </div>
            <button
              type="button"
              @click="toast.info('Menampilkan log seluruh aktivitas sistem...')"
              class="text-xs font-semibold text-[var(--theme-primary)] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight class="w-3 h-3" />
            </button>
          </div>

          <!-- Vertical Timeline List -->
          <div class="relative space-y-3.5 pl-2 pt-1 before:absolute before:left-5.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200 dark:before:bg-[#25252a]">
            <div
              v-for="act in aktivitasOperasional"
              :key="act.id"
              class="relative flex items-start gap-3 group"
            >
              <!-- Timeline Icon Bubble -->
              <div
                class="w-7 h-7 rounded-full bg-white dark:bg-[#1e1e24] border-2 border-neutral-300 dark:border-[#383842] flex items-center justify-center shrink-0 z-10 group-hover:scale-110 transition-transform shadow-xs"
                :class="
                  act.color === 'emerald' ? 'text-emerald-600 border-emerald-400' :
                  act.color === 'blue' ? 'text-blue-600 border-blue-400' :
                  act.color === 'sky' ? 'text-sky-600 border-sky-400' :
                  act.color === 'purple' ? 'text-purple-600 border-purple-400' :
                  'text-amber-600 border-amber-400'
                "
              >
                <ShoppingBag v-if="act.icon === 'cart'" class="w-3.5 h-3.5" />
                <Wallet v-else-if="act.icon === 'wallet'" class="w-3.5 h-3.5" />
                <Truck v-else-if="act.icon === 'truck'" class="w-3.5 h-3.5" />
                <Cpu v-else-if="act.icon === 'machine'" class="w-3.5 h-3.5" />
                <Package v-else class="w-3.5 h-3.5" />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <span class="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {{ act.judul }}
                  </span>
                  <span class="text-[10px] text-neutral-400 font-mono shrink-0">
                    {{ act.waktu }}
                  </span>
                </div>
                <p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug truncate">
                  {{ act.deskripsi }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ====================================================== -->
      <!-- TABEL ORDER TERBARU (7 Col Desktop)                    -->
      <!-- ====================================================== -->
      <div class="lg:col-span-7 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#141417] border border-neutral-200 dark:border-[#27272a] shadow-2xs flex flex-col justify-between space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ShoppingBag class="w-4 h-4 text-blue-500" />
            <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Order Terbaru
            </h2>
          </div>
          <button
            type="button"
            @click="router.push('/data/karyawan')"
            class="text-xs font-semibold text-[var(--theme-primary)] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Buka Data Lengkap</span>
            <ArrowRight class="w-3 h-3" />
          </button>
        </div>

        <!-- Table Container -->
        <div class="overflow-x-auto rounded-xl border border-neutral-200/80 dark:border-[#27272a]">
          <table class="w-full text-left text-xs">
            <thead class="bg-neutral-50/90 dark:bg-[#18181c] text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-[#27272a] text-[10.5px]">
              <tr>
                <th class="py-2 px-3">No. Order</th>
                <th class="py-2 px-3">Pelanggan</th>
                <th class="py-2 px-3">Layanan</th>
                <th class="py-2 px-2.5 text-center">Berat</th>
                <th class="py-2 px-3 text-right">Total</th>
                <th class="py-2 px-2.5 text-center">Status</th>
                <th class="py-2 px-2.5 text-center">Aksi</th>
              </tr>
            </thead>

            <!-- Skeleton Table Body -->
            <tbody v-if="isLoading" class="divide-y divide-neutral-100 dark:divide-[#242428]">
              <tr v-for="i in 5" :key="'tbl-skel-' + i">
                <td class="py-3 px-3"><BaseSkeleton width="85px" height="14px" /></td>
                <td class="py-3 px-3"><BaseSkeleton width="95px" height="14px" /></td>
                <td class="py-3 px-3"><BaseSkeleton width="80px" height="14px" /></td>
                <td class="py-3 px-2.5 text-center"><BaseSkeleton width="40px" height="14px" class="mx-auto" /></td>
                <td class="py-3 px-3 text-right"><BaseSkeleton width="65px" height="14px" class="ml-auto" /></td>
                <td class="py-3 px-2.5 text-center"><BaseSkeleton width="55px" height="18px" class="rounded-md mx-auto" /></td>
                <td class="py-3 px-2.5 text-center"><BaseSkeleton variant="circular" width="18px" height="18px" class="mx-auto" /></td>
              </tr>
            </tbody>

            <!-- Real Loaded Table Body -->
            <tbody v-else class="divide-y divide-neutral-100 dark:divide-[#242428] text-neutral-700 dark:text-neutral-300 text-[11px]">
              <tr
                v-for="order in orderTerbaruList"
                :key="order.noOrder"
                @click="openOrderDetail(order)"
                class="hover:bg-neutral-50/60 dark:hover:bg-[#1a1a20] transition cursor-pointer group"
              >
                <td class="py-2.5 px-3 font-mono font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                  {{ order.noOrder }}
                </td>
                <td class="py-2.5 px-3 font-medium whitespace-nowrap">
                  {{ order.pelanggan }}
                </td>
                <td class="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                  {{ order.layanan }}
                </td>
                <td class="py-2.5 px-2.5 text-center font-mono text-neutral-500 whitespace-nowrap">
                  {{ order.berat }}
                </td>
                <td class="py-2.5 px-3 text-right font-bold font-mono text-neutral-900 dark:text-white whitespace-nowrap">
                  <BaseCountUp :to="order.total" prefix="Rp " />
                </td>
                <td class="py-2.5 px-2.5 text-center whitespace-nowrap">
                  <BaseBadge :variant="order.statusVariant" size="sm">
                    {{ order.status }}
                  </BaseBadge>
                </td>
                <td class="py-2.5 px-2.5 text-center whitespace-nowrap" @click.stop>
                  <button
                    type="button"
                    @click="openOrderDetail(order)"
                    class="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#202025] transition cursor-pointer"
                    title="Lihat Detail Order"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ======================================================== -->
    <!-- MODAL QUICK DETAIL ORDER (INTERACTIVE POPUP)             -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="isOrderModalOpen"
      :title="selectedOrder ? `Detail Order: ${selectedOrder.noOrder}` : 'Detail Order'"
      size="md"
    >
      <div v-if="selectedOrder" class="space-y-4">
        <div class="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#18181c] border border-neutral-100 dark:border-[#27272a] space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-400 uppercase font-semibold">Pelanggan</span>
            <span class="text-sm font-bold text-neutral-900 dark:text-white">{{ selectedOrder.pelanggan }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-400 uppercase font-semibold">Layanan</span>
            <span class="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{{ selectedOrder.layanan }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-400 uppercase font-semibold">Kuantitas / Berat</span>
            <span class="text-xs font-mono font-bold text-neutral-900 dark:text-white">{{ selectedOrder.berat }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-400 uppercase font-semibold">Status Pengerjaan</span>
            <BaseBadge :variant="selectedOrder.statusVariant">{{ selectedOrder.status }}</BaseBadge>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-[#27272a]">
            <span class="text-xs font-bold text-neutral-900 dark:text-white">Total Tagihan</span>
            <span class="text-base font-bold font-mono text-[var(--theme-primary)]">
              Rp {{ selectedOrder.total.toLocaleString('id-ID') }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <BaseButton variant="outline" size="sm" @click="handlePrintNota(selectedOrder)">
            <Printer class="w-3.5 h-3.5" />
            <span>Cetak Nota</span>
          </BaseButton>

          <BaseButton variant="primary" size="sm" @click="isOrderModalOpen = false; toast.success('Status order berhasil diperbarui!')">
            <Check class="w-3.5 h-3.5" />
            <span>Selesai & Tutup</span>
          </BaseButton>
        </div>
      </div>
    </BaseModal>

  </div>
</template>
