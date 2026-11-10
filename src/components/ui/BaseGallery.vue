<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import BaseBadge from './BaseBadge.vue'
import { Eye, Download, Calendar, MapPin, X, Image as ImageIcon } from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [
      { id: 'all', label: 'Semua Berkas' },
      { id: 'absen', label: 'Foto Presensi' },
      { id: 'surat', label: 'Surat Izin / Dokter' },
      { id: 'kerja', label: 'Dokumentasi Kerja' },
    ],
  },
})

const emit = defineEmits(['item-click', 'download'])

const activeCategory = ref('all')
const isLightboxOpen = ref(false)
const selectedImage = ref(null)

const filteredItems = computed(() => {
  if (activeCategory.value === 'all') return props.items
  return props.items.filter((item) => item.category === activeCategory.value)
})

const openLightbox = (item) => {
  selectedImage.value = item
  isLightboxOpen.value = true
  emit('item-click', item)
}

const handleDownload = (item) => {
  emit('download', item)
}
</script>

<template>
  <div class="space-y-4 select-none">
    <!-- Category Filter Pills -->
    <div class="flex flex-wrap items-center gap-1.5 pb-1">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        @click="activeCategory = cat.id"
        class="px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer"
        :class="[
          activeCategory === cat.id
            ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-xs font-semibold'
            : 'bg-neutral-100 dark:bg-[var(--theme-surface)] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        ]"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Gallery Grid -->
    <div
      v-if="filteredItems.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
    >
      <div
        v-for="item in filteredItems"
        :key="item.id"
        @click="openLightbox(item)"
        class="group relative aspect-4/3 rounded-2xl overflow-hidden border border-neutral-200 dark:border-[var(--theme-border)] bg-neutral-100 dark:bg-[var(--theme-surface-muted)] cursor-pointer shadow-2xs hover:shadow-md transition-all duration-200"
      >
        <!-- Thumbnail Image or SVG Placeholder with real photo stylings -->
        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 overflow-hidden">
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div v-else class="flex flex-col items-center justify-center text-neutral-400 p-2 text-center">
            <ImageIcon class="w-8 h-8 mb-1 opacity-50" />
            <span class="text-[10px]">{{ item.title }}</span>
          </div>
        </div>

        <!-- Category Badge Tag -->
        <div class="absolute top-2 left-2 z-10">
          <span class="px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/60 text-white shadow-xs">
            {{ item.categoryLabel || item.category }}
          </span>
        </div>

        <!-- Hover Overlay with Title & Timestamp -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5 text-white">
          <p class="text-xs font-bold leading-tight truncate">
            {{ item.title }}
          </p>
          <div class="text-[10px] text-neutral-300 flex items-center gap-1 mt-0.5 truncate">
            <Calendar class="w-3 h-3 shrink-0" />
            <span class="truncate">{{ item.timestamp }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-10 rounded-2xl border border-dashed border-neutral-200 dark:border-[var(--theme-border)] p-6"
    >
      <ImageIcon class="w-8 h-8 mx-auto text-neutral-400 mb-2 opacity-60" />
      <p class="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Belum ada foto dalam kategori ini</p>
      <p class="text-[11px] text-neutral-400 mt-0.5">Seluruh unggahan foto presensi atau surat izin akan otomatis tampil di sini.</p>
    </div>

    <!-- Lightbox Modal -->
    <BaseModal
      v-model="isLightboxOpen"
      :title="selectedImage ? selectedImage.title : 'Pratinjau Foto'"
      size="lg"
    >
      <div v-if="selectedImage" class="space-y-3">
        <!-- Main Image Container -->
        <div class="w-full max-h-[420px] rounded-xl overflow-hidden bg-black/95 flex items-center justify-center p-2">
          <img
            v-if="selectedImage.imageUrl"
            :src="selectedImage.imageUrl"
            :alt="selectedImage.title"
            class="max-w-full max-h-[400px] object-contain rounded-lg"
          />
          <div v-else class="h-64 flex flex-col items-center justify-center text-neutral-400">
            <ImageIcon class="w-12 h-12 mb-2 opacity-50" />
            <span class="text-xs font-medium">{{ selectedImage.title }}</span>
          </div>
        </div>

        <!-- Metadata Bar -->
        <div class="p-3 rounded-xl bg-neutral-50 dark:bg-[var(--theme-surface)] border border-neutral-200 dark:border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-neutral-900 dark:text-white">{{ selectedImage.title }}</span>
              <BaseBadge variant="primary" size="xs">
                {{ selectedImage.categoryLabel || selectedImage.category }}
              </BaseBadge>
            </div>
            <div class="text-[11px] text-neutral-500 flex items-center gap-3">
              <span class="flex items-center gap-1">
                <Calendar class="w-3 h-3 text-neutral-400" />
                {{ selectedImage.timestamp }}
              </span>
              <span v-if="selectedImage.location" class="flex items-center gap-1">
                <MapPin class="w-3 h-3 text-neutral-400" />
                {{ selectedImage.location }}
              </span>
            </div>
          </div>

          <BaseButton
            variant="secondary"
            size="sm"
            @click="handleDownload(selectedImage)"
          >
            <Download class="w-3.5 h-3.5 mr-1" />
            <span>Unduh Berkas</span>
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
