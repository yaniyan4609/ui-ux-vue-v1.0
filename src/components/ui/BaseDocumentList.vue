<script setup>
import { computed } from 'vue'
import BaseBadge from './BaseBadge.vue'
import BaseButton from './BaseButton.vue'
import {
  FileText,
  FileCheck,
  FileSpreadsheet,
  Download,
  Eye,
  Upload,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-vue-next'

const props = defineProps({
  documents: {
    type: Array,
    default: () => [],
  },
  allowUpload: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['preview', 'download', 'upload'])

const getStatusBadge = (status) => {
  switch (status) {
    case 'verified':
      return { variant: 'success', label: 'Terverifikasi' }
    case 'pending':
      return { variant: 'warning', label: 'Menunggu Verifikasi' }
    case 'expired':
      return { variant: 'danger', label: 'Kedaluwarsa' }
    case 'missing':
      return { variant: 'neutral', label: 'Belum Diunggah' }
    default:
      return { variant: 'neutral', label: status || 'Tercatat' }
  }
}
</script>

<template>
  <div class="space-y-3 select-none">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="p-3.5 rounded-2xl border border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] shadow-2xs hover:border-neutral-300 dark:hover:border-[var(--theme-border-strong)] transition flex flex-col justify-between gap-3 group"
      >
        <!-- Top Info -->
        <div class="flex items-start gap-3">
          <!-- File Icon -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
            :class="[
              doc.status === 'verified'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : (doc.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-neutral-100 dark:bg-[var(--theme-surface-muted)] text-neutral-500')
            ]"
          >
            <FileText class="w-5 h-5" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-1.5">
              <h4 class="text-xs font-bold text-neutral-900 dark:text-white truncate">
                {{ doc.title }}
              </h4>
              <BaseBadge
                :variant="getStatusBadge(doc.status).variant"
                size="xs"
              >
                {{ getStatusBadge(doc.status).label }}
              </BaseBadge>
            </div>

            <!-- Nomor Dokumen jika ada -->
            <div v-if="doc.fileNumber" class="text-[11px] font-mono text-neutral-600 dark:text-neutral-300 mt-0.5 truncate">
              No: {{ doc.fileNumber }}
            </div>

            <div class="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-2 mt-1">
              <span>{{ doc.fileName }}</span>
              <span>·</span>
              <span>{{ doc.fileSize }}</span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="pt-2 border-t border-neutral-100 dark:border-[var(--theme-border)] flex items-center justify-between text-[11px]">
          <span class="text-neutral-400 text-[10.5px]">
            Diperbarui: {{ doc.updatedAt }}
          </span>

          <div class="flex items-center gap-1.5">
            <BaseButton
              v-if="doc.status !== 'missing'"
              variant="ghost"
              size="xs"
              @click="emit('preview', doc)"
              title="Lihat Pratinjau Dokumen"
            >
              <Eye class="w-3.5 h-3.5 mr-1" />
              <span>Lihat</span>
            </BaseButton>

            <BaseButton
              v-if="doc.status !== 'missing'"
              variant="secondary"
              size="xs"
              @click="emit('download', doc)"
              title="Unduh Berkas"
            >
              <Download class="w-3.5 h-3.5 mr-1" />
              <span>Unduh</span>
            </BaseButton>

            <BaseButton
              v-else
              variant="primary"
              size="xs"
              @click="emit('upload', doc)"
            >
              <Upload class="w-3.5 h-3.5 mr-1" />
              <span>Unggah</span>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

