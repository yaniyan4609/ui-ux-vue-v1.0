<script setup>
import { ref, computed } from 'vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import ConfirmationModal from '../../components/ui/ConfirmationModal.vue'
import BaseSearchableSelect from '../../components/ui/BaseSearchableSelect.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import BaseSlideOver from '../../components/ui/BaseSlideOver.vue'
import BaseAvatar from '../../components/ui/BaseAvatar.vue'
import BaseDescriptionList from '../../components/ui/BaseDescriptionList.vue'
import BaseSelectableCard from '../../components/ui/BaseSelectableCard.vue'
import BaseRosterGrid from '../../components/ui/BaseRosterGrid.vue'
import { useToast } from '../../composables/useToast'
import {
  shiftTypes,
  defaultWeekDays,
  rosterEmployees,
  shiftSwapRequests,
  rosterTemplates,
} from '../../data/hrisRosterData'
import {
  CalendarDays,
  Clock,
  ArrowLeftRight,
  Sparkles,
  Copy,
  Download,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Users,
  Check,
  X,
  Building2,
  MapPin,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Plane,
  Eye,
  Calendar,
  Briefcase,
  HelpCircle,
} from 'lucide-vue-next'

const toast = useToast()

// ========================================================
// 1. DATA MASTER & STATE ROSTER JADWAL
// ========================================================
const weekDays = ref([...defaultWeekDays])
const employees = ref([...rosterEmployees])
const swapRequests = ref([...shiftSwapRequests])

// Filter & Pencarian
const searchQuery = ref('')
const selectedDivisi = ref('all')
const selectedCabang = ref('all')

const divisiOptions = [
  { value: 'all', label: 'Semua Divisi' },
  { value: 'Teknologi & IT', label: 'Teknologi & IT' },
  { value: 'Keamanan & Fasilitas', label: 'Keamanan & Fasilitas' },
  { value: 'Layanan & CS', label: 'Layanan & CS' },
  { value: 'Operasional Gudang', label: 'Operasional Gudang' },
  { value: 'Medis & Kesehatan', label: 'Medis & Kesehatan' },
]

const cabangOptions = [
  { value: 'all', label: 'Semua Cabang & Lokasi' },
  { value: 'Kantor Pusat Jakarta', label: 'Kantor Pusat Jakarta' },
  { value: 'Cabang Bandung', label: 'Cabang Bandung' },
  { value: 'Gudang Logistik Cikarang', label: 'Gudang Logistik Cikarang' },
]

// Filtered Employees
const filteredEmployees = computed(() => {
  return employees.value.filter((emp) => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchSearch =
      !q ||
      emp.name.toLowerCase().includes(q) ||
      emp.nip.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q)

    const matchDivisi =
      selectedDivisi.value === 'all' || emp.divisi === selectedDivisi.value

    const matchCabang =
      selectedCabang.value === 'all' || emp.cabang === selectedCabang.value

    return matchSearch && matchDivisi && matchCabang
  })
})

// Metrik Ringkasan Roster
const totalPegawai = computed(() => filteredEmployees.value.length)

const totalScheduledHours = computed(() => {
  let sum = 0
  filteredEmployees.value.forEach((emp) => {
    weekDays.value.forEach((day) => {
      const code = emp.schedules?.[day.date]
      const meta = shiftTypes.find((s) => s.code === code)
      sum += meta?.hours || 0
    })
  })
  return sum
})

const pendingSwapCount = computed(() => {
  return swapRequests.value.filter((s) => s.status === 'pending').length
})

// Handle Pergantian Shift Cell dari BaseRosterGrid
const handleShiftChange = ({ rowId, date, newShiftCode }) => {
  const emp = employees.value.find((e) => e.id === rowId)
  if (emp && emp.schedules) {
    const prevCode = emp.schedules[date] || 'OFF'
    emp.schedules[date] = newShiftCode
    const meta = shiftTypes.find((s) => s.code === newShiftCode)
    toast.success(
      `Shift ${emp.name} pada ${date} diubah menjadi ${meta?.name || newShiftCode} (${prevCode} ➔ ${newShiftCode})`,
      'Jadwal Diperbarui'
    )
  }
}

// Reset Filter
const handleResetFilter = () => {
  searchQuery.value = ''
  selectedDivisi.value = 'all'
  selectedCabang.value = 'all'
  toast.info('Filter pencarian roster telah direset.', 'Filter Direset')
}

// Salin Jadwal ke Minggu Depan
const handleCopySchedule = () => {
  toast.success(
    'Jadwal roster aktif berhasil disalin untuk periode minggu depan (17 – 23 Nov 2026)!',
    'Salin Jadwal Selesai'
  )
}

// Ekspor Jadwal Roster ke CSV
const handleExportRoster = () => {
  const headers = ['NIP', 'Nama Pegawai', 'Jabatan', 'Divisi', 'Cabang', ...weekDays.value.map((d) => `${d.dayName} (${d.dateLabel})`)]
  const rows = filteredEmployees.value.map((emp) => {
    const scheduleCols = weekDays.value.map((d) => emp.schedules?.[d.date] || 'OFF')
    return [
      `"${emp.nip}"`,
      `"${emp.name}"`,
      `"${emp.role}"`,
      `"${emp.divisi}"`,
      `"${emp.cabang}"`,
      ...scheduleCols,
    ]
  })

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `roster_shift_mingguan_${weekDays.value[0].date}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success('Roster jadwal shift berhasil diekspor ke format CSV!', 'Ekspor Berhasil')
}

// ========================================================
// 2. MODAL AUTO-ROSTER: POLA SHIFT OTOMATIS
// ========================================================
const isAutoRosterModalOpen = ref(false)
const selectedTemplateId = ref('tpl-2-2-2-1')
const autoRosterTargetDivisi = ref('all')

const handleApplyAutoRoster = () => {
  const tpl = rosterTemplates.find((t) => t.id === selectedTemplateId.value)
  if (!tpl) return

  let count = 0
  employees.value.forEach((emp, index) => {
    if (autoRosterTargetDivisi.value === 'all' || emp.divisi === autoRosterTargetDivisi.value) {
      // Rotasi pola bergeser antar pegawai agar shift terdistribusi merata
      const offset = index % tpl.pattern.length
      weekDays.value.forEach((day, dayIdx) => {
        const patternIndex = (dayIdx + offset) % tpl.pattern.length
        emp.schedules[day.date] = tpl.pattern[patternIndex]
      })
      count++
    }
  })

  isAutoRosterModalOpen.value = false
  toast.success(
    `Berhasil menerapkan "${tpl.name}" untuk ${count} pegawai! Shift telah terdistribusi otomatis.`,
    'Auto-Roster Berhasil'
  )
}

// ========================================================
// 3. MODAL TUKAR SHIFT (SHIFT SWAP REQUEST)
// ========================================================
const isSwapModalOpen = ref(false)
const swapActiveTab = ref('list') // 'list' | 'create'

// Form Pengajuan Tukar Shift Baru
const swapForm = ref({
  requesterId: 2,
  targetEmployeeId: 1,
  date: '2026-11-12',
  reason: '',
})

const handleApproveSwap = (swap) => {
  // Tukar jadwal pada data karyawan
  const reqEmp = employees.value.find((e) => e.id === swap.requester.id)
  const targetEmp = employees.value.find((e) => e.id === swap.targetEmployee.id)

  if (reqEmp && targetEmp && reqEmp.schedules && targetEmp.schedules) {
    const shiftA = reqEmp.schedules[swap.targetDate] || 'OFF'
    const shiftB = targetEmp.schedules[swap.targetDate] || 'OFF'
    reqEmp.schedules[swap.targetDate] = shiftB
    targetEmp.schedules[swap.targetDate] = shiftA
  }

  swap.status = 'approved'
  toast.success(
    `Permohonan tukar shift antara ${swap.requester.name} dan ${swap.targetEmployee.name} pada ${swap.targetDate} disetujui!`,
    'Tukar Shift Disetujui'
  )
}

const handleRejectSwap = (swap) => {
  swap.status = 'rejected'
  toast.info(
    `Permohonan tukar shift ${swap.requester.name} ditolak.`,
    'Tukar Shift Ditolak'
  )
}

const handleSubmitSwap = () => {
  if (!swapForm.value.reason.trim()) {
    toast.error('Alasan tukar shift wajib diisi!', 'Validasi Gagal')
    return
  }

  const reqEmp = employees.value.find((e) => e.id === Number(swapForm.value.requesterId))
  const targetEmp = employees.value.find((e) => e.id === Number(swapForm.value.targetEmployeeId))

  if (!reqEmp || !targetEmp) return

  swapRequests.value.unshift({
    id: `SWAP-00${swapRequests.value.length + 1}`,
    requestDate: '10 Nov 2026',
    targetDate: swapForm.value.date,
    requester: {
      id: reqEmp.id,
      name: reqEmp.name,
      role: reqEmp.role,
      avatar: reqEmp.avatar,
      currentShift: reqEmp.schedules?.[swapForm.value.date] || 'OFF',
    },
    targetEmployee: {
      id: targetEmp.id,
      name: targetEmp.name,
      role: targetEmp.role,
      avatar: targetEmp.avatar,
      currentShift: targetEmp.schedules?.[swapForm.value.date] || 'OFF',
    },
    reason: swapForm.value.reason,
    status: 'pending',
  })

  swapForm.value.reason = ''
  swapActiveTab.value = 'list'
  toast.success(
    `Pengajuan tukar shift untuk ${targetEmp.name} telah dikirim ke HR untuk persetujuan.`,
    'Pengajuan Terkirim'
  )
}

// ========================================================
// 4. SLIDE-OVER DETAIL JADWAL PEGAWAI
// ========================================================
const isDetailOpen = ref(false)
const selectedEmp = ref(null)

const openEmployeeScheduleDetail = (emp) => {
  selectedEmp.value = emp
  isDetailOpen.value = true
}

const employeeScheduleDetails = computed(() => {
  if (!selectedEmp.value) return []
  return weekDays.value.map((day) => {
    const code = selectedEmp.value.schedules?.[day.date] || 'OFF'
    const meta = shiftTypes.find((s) => s.code === code)
    return {
      day: day.dayName,
      date: day.dateLabel,
      isToday: day.isToday,
      code,
      name: meta?.name || 'Libur',
      time: meta?.time || 'Off',
      hours: meta?.hours || 0,
      badgeVariant: meta?.badgeVariant || 'neutral',
    }
  })
})
</script>

<template>
  <!-- Formula Data View: h-full flex flex-col min-h-0 overflow-hidden gap-2.5 w-full max-w-7xl mx-auto select-none relative pb-2 -->
  <div class="h-full flex flex-col min-h-0 overflow-hidden gap-2.5 w-full max-w-7xl mx-auto select-none relative pb-2">

    <!-- ======================================================== -->
    <!-- 1. HEADER HALAMAN ROSTER & SHIFT JADWAL                  -->
    <!-- ======================================================== -->
    <div class="flex items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-[var(--theme-border)] shrink-0">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shrink-0 shadow-2xs">
          <CalendarDays class="w-4 h-4" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-[var(--theme-text-primary)] leading-none truncate">
              Jadwal Shift & Roster Kerja
            </h1>
            <BaseBadge variant="success" size="sm">
              10 – 16 Nov 2026
            </BaseBadge>
          </div>
          <p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
            Matriks manajemen rotasi shift pegawai, distribusi jam kerja, pengajuan tukar shift, dan pemenuhan kuota shift (coverage).
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Tukar Shift -->
        <BaseButton
          variant="outline"
          size="sm"
          @click="isSwapModalOpen = true"
          title="Manajemen Pengajuan Tukar Shift Antar Pegawai"
        >
          <ArrowLeftRight class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span class="hidden sm:inline">Tukar Shift</span>
          <span
            v-if="pendingSwapCount > 0"
            class="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-white leading-none ml-1"
          >
            {{ pendingSwapCount }}
          </span>
        </BaseButton>

        <!-- Auto-Roster (Pola Shift) -->
        <BaseButton
          variant="outline"
          size="sm"
          @click="isAutoRosterModalOpen = true"
          title="Terapkan Pola Rotasi Shift Otomatis (5-2, 2-2-2-1)"
        >
          <Sparkles class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span class="hidden sm:inline">Auto-Roster</span>
        </BaseButton>

        <!-- Salin Jadwal -->
        <BaseButton
          variant="outline"
          size="sm"
          @click="handleCopySchedule"
          title="Salin Roster ke Minggu Depan"
        >
          <Copy class="w-3.5 h-3.5 text-neutral-500" />
          <span class="hidden sm:inline">Salin Jadwal</span>
        </BaseButton>

        <!-- Ekspor Roster -->
        <BaseButton
          variant="primary"
          size="sm"
          @click="handleExportRoster"
          title="Unduh Berkas Roster ke Format CSV"
        >
          <Download class="w-3.5 h-3.5" />
          <span>Ekspor Roster</span>
        </BaseButton>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. FILTER & TOOLBAR PENCARIAN (SHRINK-0)                 -->
    <!-- ======================================================== -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama pegawai, NIP, atau jabatan..."
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

      <!-- Filter Cabang: BaseSearchableSelect -->
      <div class="w-full sm:w-52 shrink-0">
        <BaseSearchableSelect
          v-model="selectedCabang"
          :options="cabangOptions"
          placeholder="Filter Cabang..."
          align="right"
          clearable
        />
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 3. STRIP LEGENDA SHIFT & METRIK COVERAGE (SHRINK-0)      -->
    <!-- ======================================================== -->
    <div class="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs shrink-0 text-xs">
      
      <!-- Legenda Shift -->
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mr-1">Shift:</span>
        
        <!-- Pagi -->
        <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-medium">
          <Sun class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Pagi (07:00-15:00)</span>
        </div>

        <!-- Siang -->
        <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 font-medium">
          <Sunset class="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>Siang (15:00-23:00)</span>
        </div>

        <!-- Malam -->
        <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 text-purple-800 dark:text-purple-300 font-medium">
          <Moon class="w-3 h-3 text-purple-600 dark:text-purple-400" />
          <span>Malam (23:00-07:00)</span>
        </div>

        <!-- Libur -->
        <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-[var(--theme-surface-muted)] border border-neutral-200 dark:border-[var(--theme-border)] text-neutral-600 dark:text-neutral-400 font-medium">
          <Coffee class="w-3 h-3 text-neutral-400" />
          <span>Libur (OFF)</span>
        </div>

        <!-- Cuti -->
        <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40 text-blue-800 dark:text-blue-300 font-medium">
          <Plane class="w-3 h-3 text-blue-500" />
          <span>Cuti (C)</span>
        </div>
      </div>

      <!-- Quick Stats Kanan -->
      <div class="flex items-center gap-3 shrink-0 text-neutral-500">
        <div class="flex items-center gap-1.5 font-medium">
          <Users class="w-3.5 h-3.5 text-neutral-400" />
          <span class="text-neutral-900 dark:text-white font-bold">{{ totalPegawai }}</span> Pegawai
        </div>
        <span>&bull;</span>
        <div class="flex items-center gap-1.5 font-medium">
          <Clock class="w-3.5 h-3.5 text-neutral-400" />
          <span class="text-neutral-900 dark:text-white font-bold font-mono">{{ totalScheduledHours }} Jam</span>
        </div>
        <span>&bull;</span>
        <div class="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>Kuota Terpenuhi</span>
        </div>
      </div>

    </div>

    <!-- ======================================================== -->
    <!-- 4. BASE ROSTER GRID COMPONENT (FLEX-1 MIN-H-0)           -->
    <!-- ======================================================== -->
    <div class="flex-1 min-h-0 overflow-hidden">
      <BaseRosterGrid
        :days="weekDays"
        :rows="filteredEmployees"
        :shift-types="shiftTypes"
        :min-coverage="{ P: 2, S: 2, M: 1 }"
        @cell-change="handleShiftChange"
        @row-click="openEmployeeScheduleDetail"
      />
    </div>

    <!-- ======================================================== -->
    <!-- 5. MODAL TUKAR SHIFT (SHIFT SWAP REQUEST)                -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="isSwapModalOpen"
      title="Manajemen Tukar Shift Karyawan"
      subtitle="Persetujuan dan pengajuan permohonan pergantian jadwal shift antar rekan kerja"
      size="lg"
    >
      <div class="space-y-4 py-1 text-xs">
        <!-- Tab Selector: Daftar Pengajuan vs Buat Baru -->
        <div class="flex items-center gap-2 border-b border-neutral-200 dark:border-[var(--theme-border)] pb-2">
          <button
            type="button"
            @click="swapActiveTab = 'list'"
            class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
            :class="[
              swapActiveTab === 'list'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            ]"
          >
            Daftar Pengajuan ({{ swapRequests.length }})
          </button>
          <button
            type="button"
            @click="swapActiveTab = 'create'"
            class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
            :class="[
              swapActiveTab === 'create'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            ]"
          >
            + Ajukan Tukar Shift Baru
          </button>
        </div>

        <!-- TAB 1: LIST PERMOHONAN TUKAR SHIFT -->
        <div v-if="swapActiveTab === 'list'" class="space-y-2.5">
          <div
            v-for="swap in swapRequests"
            :key="swap.id"
            class="p-3.5 rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-neutral-50/50 dark:bg-[var(--theme-surface-raised)] space-y-2.5"
          >
            <!-- Top: ID & Status -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-neutral-800 dark:text-neutral-200">{{ swap.id }}</span>
                <span class="text-neutral-400">&bull;</span>
                <span class="text-neutral-500">Tanggal Target: <strong class="text-neutral-800 dark:text-neutral-200">{{ swap.targetDate }}</strong></span>
              </div>
              <BaseBadge
                :variant="swap.status === 'approved' ? 'success' : swap.status === 'rejected' ? 'danger' : 'warning'"
                size="sm"
              >
                {{ swap.status === 'approved' ? 'Disetujui' : swap.status === 'rejected' ? 'Ditolak' : 'Menunggu Approval' }}
              </BaseBadge>
            </div>

            <!-- Visual Baris Tukar Pegawai A <--> Pegawai B -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 rounded-xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200/80 dark:border-[var(--theme-border)]">
              <!-- Pemohon -->
              <div class="flex items-center gap-2.5">
                <BaseAvatar :name="swap.requester.name" size="sm" />
                <div class="min-w-0">
                  <span class="font-bold text-neutral-900 dark:text-white block truncate">{{ swap.requester.name }}</span>
                  <span class="text-[10px] text-neutral-400 block truncate">{{ swap.requester.role }}</span>
                </div>
                <BaseBadge variant="warning" size="xs" class="ml-auto font-mono">
                  Shift: {{ swap.requester.currentShift }}
                </BaseBadge>
              </div>

              <!-- Rekan Pengganti -->
              <div class="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-neutral-100 dark:border-[var(--theme-border)] pt-2 sm:pt-0 sm:pl-3">
                <BaseAvatar :name="swap.targetEmployee.name" size="sm" />
                <div class="min-w-0">
                  <span class="font-bold text-neutral-900 dark:text-white block truncate">{{ swap.targetEmployee.name }}</span>
                  <span class="text-[10px] text-neutral-400 block truncate">{{ swap.targetEmployee.role }}</span>
                </div>
                <BaseBadge variant="success" size="xs" class="ml-auto font-mono">
                  Shift: {{ swap.targetEmployee.currentShift }}
                </BaseBadge>
              </div>
            </div>

            <!-- Alasan & Tombol Approval -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <p class="text-[11px] text-neutral-600 dark:text-neutral-400 italic">
                &ldquo;{{ swap.reason }}&rdquo;
              </p>

              <div v-if="swap.status === 'pending'" class="flex items-center gap-1.5 shrink-0">
                <BaseButton variant="outline" size="xs" @click="handleRejectSwap(swap)">
                  Tolak
                </BaseButton>
                <BaseButton variant="primary" size="xs" @click="handleApproveSwap(swap)">
                  <Check class="w-3 h-3 mr-1" />
                  <span>Setujui Tukar</span>
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: FORM AJUKAN TUKAR SHIFT BARU -->
        <div v-if="swapActiveTab === 'create'" class="space-y-3.5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Pegawai Pemohon (Tukar Keluar)</label>
              <select
                v-model="swapForm.requesterId"
                class="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] text-xs text-neutral-900 dark:text-white"
              >
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.name }} ({{ emp.role }})
                </option>
              </select>
            </div>

            <div>
              <label class="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Pegawai Pengganti (Tukar Masuk)</label>
              <select
                v-model="swapForm.targetEmployeeId"
                class="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] text-xs text-neutral-900 dark:text-white"
              >
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.name }} ({{ emp.role }})
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Tanggal Roster Yang Ingin Ditukar</label>
            <select
              v-model="swapForm.date"
              class="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] text-xs text-neutral-900 dark:text-white"
            >
              <option v-for="d in weekDays" :key="d.date" :value="d.date">
                {{ d.dayName }}, {{ d.dateLabel }} ({{ d.date }})
              </option>
            </select>
          </div>

          <div>
            <label class="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Alasan Pertukaran Shift</label>
            <textarea
              v-model="swapForm.reason"
              placeholder="Tuliskan alasan permohonan tukar shift secara jelas..."
              rows="3"
              class="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] text-xs text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <BaseButton variant="outline" size="sm" @click="swapActiveTab = 'list'">
              Batal
            </BaseButton>
            <BaseButton variant="primary" size="sm" @click="handleSubmitSwap">
              Kirim Pengajuan Tukar
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- ======================================================== -->
    <!-- 6. MODAL AUTO-ROSTER: POLA SHIFT OTOMATIS                -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="isAutoRosterModalOpen"
      title="Generator Pola Shift Otomatis (Auto-Roster)"
      subtitle="Terapkan formula rotasi shift baku industri secara serentak ke seluruh tim divisi"
      size="lg"
    >
      <div class="space-y-4 py-1 text-xs">
        <div>
          <label class="font-bold text-neutral-700 dark:text-neutral-300 block mb-2">1. Pilih Template Pola Rotasi</label>
          <div class="space-y-2.5">
            <div
              v-for="tpl in rosterTemplates"
              :key="tpl.id"
              @click="selectedTemplateId = tpl.id"
              class="p-3.5 rounded-2xl border transition cursor-pointer"
              :class="[
                selectedTemplateId === tpl.id
                  ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-soft)]/20 shadow-xs'
                  : 'border-neutral-200 dark:border-[var(--theme-border)] hover:border-neutral-300'
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-neutral-900 dark:text-white text-sm">{{ tpl.name }}</span>
                <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[var(--theme-surface-muted)]">
                  {{ tpl.pattern.join(' - ') }}
                </span>
              </div>
              <p class="text-[11px] text-neutral-500 mt-1">{{ tpl.desc }}</p>
              <span class="text-[10px] text-[var(--theme-primary)] font-medium mt-1.5 block">
                Cocok untuk: {{ tpl.suitableFor }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label class="font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">2. Terapkan Ke Divisi Target</label>
          <select
            v-model="autoRosterTargetDivisi"
            class="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] text-xs text-neutral-900 dark:text-white"
          >
            <option value="all">Semua Divisi & Unit Kerja (16 Pegawai)</option>
            <option value="Teknologi & IT">Hanya Divisi Teknologi & IT</option>
            <option value="Keamanan & Fasilitas">Hanya Divisi Keamanan & Satpam</option>
            <option value="Layanan & CS">Hanya Divisi Layanan & Customer Service</option>
            <option value="Operasional Gudang">Hanya Divisi Gudang & Logistik</option>
          </select>
        </div>
      </div>

      <template #footer="{ close }">
        <BaseButton variant="outline" size="sm" @click="close">
          Batal
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="handleApplyAutoRoster">
          <Sparkles class="w-3.5 h-3.5 mr-1" />
          <span>Terapkan Pola Shift</span>
        </BaseButton>
      </template>
    </BaseModal>

    <!-- ======================================================== -->
    <!-- 7. SLIDE-OVER DETAIL JADWAL & PREFERENSI PEGAWAI         -->
    <!-- ======================================================== -->
    <BaseSlideOver
      v-model="isDetailOpen"
      :title="selectedEmp?.name || 'Detail Jadwal Karyawan'"
      :subtitle="selectedEmp ? `${selectedEmp.nip} • ${selectedEmp.role}` : ''"
      size="md"
    >
      <div v-if="selectedEmp" class="space-y-4 text-xs">
        <!-- Identity Card -->
        <div class="p-4 rounded-2xl bg-neutral-50 dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] flex items-center gap-3">
          <BaseAvatar :name="selectedEmp.name" size="lg" />
          <div class="min-w-0">
            <h4 class="font-bold text-sm text-neutral-900 dark:text-white truncate">{{ selectedEmp.name }}</h4>
            <span class="text-xs text-[var(--theme-primary)] font-semibold block">{{ selectedEmp.role }}</span>
            <div class="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
              <span>{{ selectedEmp.divisi }}</span>
              <span>&bull;</span>
              <span>{{ selectedEmp.cabang }}</span>
            </div>
          </div>
        </div>

        <!-- 7 Hari Rincian Shift Mingguan -->
        <div class="p-3.5 rounded-2xl bg-white dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 mb-2">
            <Calendar class="w-3.5 h-3.5 text-[var(--theme-primary)]" />
            <span>Jadwal Shift Minggu Ini (10 – 16 Nov)</span>
          </h4>

          <div class="divide-y divide-neutral-100 dark:divide-[var(--theme-border)]">
            <div
              v-for="d in employeeScheduleDetails"
              :key="d.date"
              class="py-2 flex items-center justify-between"
              :class="d.isToday ? 'bg-[var(--theme-primary-soft)]/20 px-2 rounded-lg' : ''"
            >
              <div>
                <span class="font-bold text-neutral-900 dark:text-white block">{{ d.day }}</span>
                <span class="text-[10px] text-neutral-400 block">{{ d.date }}</span>
              </div>

              <div class="flex items-center gap-2">
                <div class="text-right">
                  <span class="font-bold text-neutral-800 dark:text-neutral-200 block">{{ d.name }}</span>
                  <span class="text-[10px] text-neutral-400 font-mono block">{{ d.time }}</span>
                </div>
                <BaseBadge :variant="d.badgeVariant" size="sm">
                  {{ d.code }}
                </BaseBadge>
              </div>
            </div>
          </div>
        </div>

        <!-- Preferensi Kerja & Fleksibilitas -->
        <div class="p-3.5 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface-raised)] border border-neutral-200 dark:border-[var(--theme-border)] space-y-1.5">
          <span class="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Catatan & Preferensi Shift</span>
          <p class="text-neutral-600 dark:text-neutral-300 text-[11.5px] leading-relaxed">
            Pegawai bersedia ditugaskan pada lembur akhir pekan dan memiliki sertifikasi K3 Pengamanan & Standar Respons 24 Jam.
          </p>
        </div>
      </div>

      <template #footer="{ close }">
        <BaseButton variant="outline" size="sm" @click="close">
          Tutup
        </BaseButton>
      </template>
    </BaseSlideOver>

  </div>
</template>
