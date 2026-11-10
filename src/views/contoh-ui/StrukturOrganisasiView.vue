<script setup>
import { ref } from 'vue'
import BaseOrgChart from '../../components/ui/BaseOrgChart.vue'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import BaseAvatar from '../../components/ui/BaseAvatar.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseDescriptionList from '../../components/ui/BaseDescriptionList.vue'
import { useToast } from '../../composables/useToast'
import { hrisOrgData, hrisHierarchySummary } from '../../data/hrisOrgData'
import {
  Network,
  Users,
  Building2,
  FolderTree,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Info,
  ChevronRight,
  ShieldCheck,
  Briefcase,
} from 'lucide-vue-next'

const toast = useToast()

const orgData = ref(hrisOrgData)
const selectedNode = ref(null)
const isNodeDetailModalOpen = ref(false)

const handleNodeClick = (node) => {
  selectedNode.value = node
  isNodeDetailModalOpen.value = true
}

// Format node detail items for BaseDescriptionList
const nodeDetailItems = computed(() => {
  if (!selectedNode.value) return []
  const n = selectedNode.value
  return [
    { label: 'Nama Pejabat / Pemegang Jabatan', value: n.name || 'Posisi Kosong (Vacant)' },
    { label: 'Nama Jabatan Resmi', value: n.role },
    { label: 'Tingkat Hierarki', value: n.levelLabel || (n.level ? n.level.toUpperCase() : 'JABATAN') },
    { label: 'Divisi Induk', value: n.division || '-' },
    { label: 'Departemen Kerja', value: n.department || '-' },
    { label: 'Jumlah Tim / Bawahan Langsung', value: n.children && n.children.length > 0 ? `${n.children.length} Posisi` : 'Tidak Ada (Staf Pelaksana)' },
  ]
})

import { computed } from 'vue'

const handleExportChart = () => {
  toast.info('Bagan organisasi sedang disiapkan dalam format PDF vektor...', 'Ekspor Struktur Organisasi')
  setTimeout(() => {
    toast.success('Bagan struktur organisasi berhasil diunduh.', 'Ekspor Selesai')
  }, 900)
}
</script>

<template>
  <div class="space-y-4 sm:space-y-5 w-full max-w-7xl mx-auto select-none pb-12">

    <!-- ======================================================== -->
    <!-- 1. HEADER HALAMAN STRUKTUR ORGANISASI                    -->
    <!-- ======================================================== -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-[var(--theme-border)]">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 shadow-2xs">
            Struktur Organisasi
          </span>
          <h1 class="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            Bagan Hierarki Perusahaan (Org Chart)
          </h1>
        </div>
        <p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          Pemetaan berjenjang: Direksi &rsaquo; Divisi &rsaquo; Departemen &rsaquo; Jabatan fungsional & operasional
        </p>
      </div>

      <!-- Quick Action: Ekspor PDF & Cetak -->
      <div class="flex items-center gap-2">
        <BaseButton
          variant="secondary"
          size="sm"
          @click="handleExportChart"
        >
          <Download class="w-3.5 h-3.5 mr-1" />
          <span>Ekspor Bagan PDF</span>
        </BaseButton>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. SUMMARY KPI HIERARKI (3 TINGKAT)                      -->
    <!-- ======================================================== -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="p-3.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Building2 class="w-4.5 h-4.5" />
        </div>
        <div>
          <span class="text-[10px] text-neutral-400 uppercase font-bold block leading-none">Divisi Kerja</span>
          <span class="text-base font-bold text-neutral-900 dark:text-white block mt-0.5">3 Divisi</span>
          <span class="text-[10px] text-neutral-500">Teknologi, Ops, Finance</span>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <FolderTree class="w-4.5 h-4.5" />
        </div>
        <div>
          <span class="text-[10px] text-neutral-400 uppercase font-bold block leading-none">Departemen</span>
          <span class="text-base font-bold text-neutral-900 dark:text-white block mt-0.5">6 Departemen</span>
          <span class="text-[10px] text-neutral-500">Unit Fungsional</span>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Briefcase class="w-4.5 h-4.5" />
        </div>
        <div>
          <span class="text-[10px] text-neutral-400 uppercase font-bold block leading-none">Posisi Jabatan</span>
          <span class="text-base font-bold text-neutral-900 dark:text-white block mt-0.5">27 Posisi</span>
          <span class="text-[10px] text-neutral-500">Job Title Resmi</span>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-white dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] shadow-2xs flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Users class="w-4.5 h-4.5" />
        </div>
        <div>
          <span class="text-[10px] text-neutral-400 uppercase font-bold block leading-none">Total Personil</span>
          <span class="text-base font-bold text-neutral-900 dark:text-white block mt-0.5">1.284 Staf</span>
          <span class="text-[10px] text-neutral-500">4 Kantor Cabang</span>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 3. CANVAS BAGAN ORGANISASI (BaseOrgChart)                 -->
    <!-- ======================================================== -->
    <div class="rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-neutral-50/50 dark:bg-[var(--theme-surface-muted)] overflow-hidden shadow-2xs">
      <!-- Toolbar Canvas -->
      <div class="p-3 px-4 bg-white dark:bg-[var(--theme-surface)] border-b border-neutral-200 dark:border-[var(--theme-border)] flex items-center justify-between text-xs">
        <div class="flex items-center gap-2 text-neutral-500 text-[11px]">
          <Info class="w-3.5 h-3.5 text-[var(--theme-primary)]" />
          <span>Klik kartu jabatan untuk detail pejabat, atau klik tombol <strong>+ / −</strong> untuk buka-tutup cabang</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[10.5px] text-neutral-400">Scroll horizontal untuk geser</span>
        </div>
      </div>

      <!-- Interactive Tree Component -->
      <BaseOrgChart
        :data="orgData"
        collapsible
        @node-click="handleNodeClick"
      />
    </div>

    <!-- ======================================================== -->
    <!-- 4. TABEL REKAPITULASI HIERARKI DIVISI & DEPARTEMEN       -->
    <!-- ======================================================== -->
    <div class="rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface)] p-4 sm:p-5 shadow-xs">
      <div class="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[var(--theme-border)] mb-3">
        <div class="flex items-center gap-2">
          <Network class="w-4 h-4 text-[var(--theme-primary)]" />
          <h2 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
            Rangkuman Hierarki Divisi & Departemen
          </h2>
        </div>
        <span class="text-[11px] text-neutral-400">3 Divisi Induk</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div
          v-for="div in hrisHierarchySummary"
          :key="div.divisi"
          class="p-3.5 rounded-xl border border-neutral-200 dark:border-[var(--theme-border)] bg-neutral-50/60 dark:bg-[var(--theme-surface-muted)] space-y-2.5"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-neutral-900 dark:text-white">{{ div.divisi }}</span>
            <BaseBadge variant="primary" size="xs">Divisi</BaseBadge>
          </div>
          <div class="text-[11px] text-neutral-500">
            Pimpinan: <strong class="text-neutral-800 dark:text-neutral-200">{{ div.kepalaDivisi }}</strong>
          </div>

          <div class="pt-2 border-t border-neutral-200 dark:border-[var(--theme-border)] space-y-1.5 text-xs">
            <div
              v-for="dept in div.departemenList"
              :key="dept.nama"
              class="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-[var(--theme-surface)] border border-neutral-100 dark:border-[var(--theme-border)] text-[11px]"
            >
              <div>
                <span class="font-semibold text-neutral-800 dark:text-neutral-200 block">{{ dept.nama }}</span>
                <span class="text-[10px] text-neutral-400">Head: {{ dept.head }}</span>
              </div>
              <div class="text-right">
                <span class="font-bold text-neutral-900 dark:text-white font-mono">{{ dept.totalKaryawan }}</span>
                <span class="text-[9.5px] text-neutral-400 block">staf</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL DETAIL JABATAN / PEJABAT                           -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="isNodeDetailModalOpen"
      title="Rincian Posisi Jabatan & Hierarki"
      size="md"
    >
      <div v-if="selectedNode" class="space-y-4 text-xs">
        <div class="p-3.5 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] flex items-center gap-3">
          <BaseAvatar
            :name="selectedNode.name || selectedNode.role"
            size="lg"
            status="online"
          />
          <div>
            <h3 class="text-sm font-bold text-neutral-900 dark:text-white">
              {{ selectedNode.name || 'Posisi Kosong (Vacant)' }}
            </h3>
            <p class="text-[11px] font-semibold text-[var(--theme-primary)]">{{ selectedNode.role }}</p>
            <div class="mt-1">
              <BaseBadge :variant="selectedNode.badgeVariant || 'primary'" size="xs">
                {{ selectedNode.levelLabel || (selectedNode.level ? selectedNode.level.toUpperCase() : 'JABATAN') }}
              </BaseBadge>
            </div>
          </div>
        </div>

        <BaseDescriptionList
          :items="nodeDetailItems"
          layout="divided"
        />
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton
            variant="neutral"
            size="sm"
            @click="isNodeDetailModalOpen = false"
          >
            Tutup
          </BaseButton>
          <BaseButton
            variant="primary"
            size="sm"
            @click="toast.info(`Membuka profil lengkap: ${selectedNode.name}`)"
          >
            Buka Profil Karyawan
          </BaseButton>
        </div>
      </template>
    </BaseModal>

  </div>
</template>

