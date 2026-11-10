<script setup>
import { ref, computed } from 'vue'
import {
  Map,
  Plus,
  Pencil,
  Trash2,
  Search,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Download,
  Settings,
} from 'lucide-vue-next'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseDataTable from '../../components/ui/BaseDataTable.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseSearchableSelect from '../../components/ui/BaseSearchableSelect.vue'
import BaseSwitch from '../../components/ui/BaseSwitch.vue'
import BaseMapPolygonEditor from '../../components/ui/BaseMapPolygonEditor.vue'
import { useToast } from '../../composables/useToast'
import { wilayahList, kantorList } from '../../data/wilayahKantorData'

const toast = useToast()

const kantorData = ref([...kantorList])
const wilayahData = ref([...wilayahList])
const searchQuery = ref('')
const selectedWilayah = ref('all')

// State Modal
const isWilayahModalOpen = ref(false)
const isPolygonModalOpen = ref(false)
const activeKantor = ref(null)

// Computed untuk tabel
const filteredKantor = computed(() => {
  return kantorData.value.filter(k => {
    const matchesSearch = k.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          k.alamat.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesWilayah = selectedWilayah.value === 'all' || k.wilayahId === selectedWilayah.value
    return matchesSearch && matchesWilayah
  })
})

const handleEditKantor = (row) => {
  toast.info(`Edit kantor: ${row.nama}`)
}

const handleOpenPolygon = (row) => {
  activeKantor.value = row
  isPolygonModalOpen.value = true
}

const handlePolygonSave = (newPolygon) => {
  if (activeKantor.value) {
    activeKantor.value.polygon = newPolygon
    toast.success(`Geofence untuk ${activeKantor.value.nama} berhasil diperbarui!`)
    isPolygonModalOpen.value = false
  }
}

const handleOpenWilayah = () => {
  isWilayahModalOpen.value = true
}
</script>

<template>
  <div class="h-full flex flex-col min-h-0 overflow-hidden gap-2.5 w-full max-w-7xl mx-auto select-none relative">
    <!-- Header -->
    <div class="flex items-center justify-between shrink-0 pb-1 border-b border-neutral-200 dark:border-[var(--theme-border)]">
      <div>
        <h1 class="text-base font-bold text-neutral-900 dark:text-white">Wilayah & Kantor Cabang</h1>
        <p class="text-xs text-neutral-500">Manajemen lokasi kantor dan zona geofencing absensi</p>
      </div>
      <div class="flex gap-2">
        <BaseButton variant="outline" size="sm" @click="handleOpenWilayah">
          Kelola Wilayah
        </BaseButton>
        <BaseButton variant="primary" size="sm">
          <Plus class="w-4 h-4 mr-1" />
          Tambah Kantor
        </BaseButton>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex gap-2 shrink-0">
      <BaseInput v-model="searchQuery" placeholder="Cari nama kantor..." class="w-64" />
      <BaseSearchableSelect v-model="selectedWilayah" :options="[{value: 'all', label: 'Semua Wilayah'}, ...wilayahList.map(w => ({value: w.id, label: w.nama}))]" />
    </div>

    <!-- Tabel -->
    <div class="flex-1 min-h-0 overflow-auto">
      <BaseDataTable
        :rows="filteredKantor"
        :columns="[
          { key: 'nama', label: 'Kantor & Kode' },
          { key: 'wilayahNama', label: 'Wilayah' },
          { key: 'picNama', label: 'PIC' },
          { key: 'statusAktif', label: 'Status' },
          { key: 'actions', label: 'Aksi' }
        ]"
      >
        <template #cell-nama="{ row }">
          <div class="font-bold">{{ row.nama }}</div>
          <div class="text-xs text-neutral-400">{{ row.kode }}</div>
        </template>
        <template #cell-statusAktif="{ row }">
          <BaseSwitch v-model="row.statusAktif" />
        </template>
        <template #cell-actions="{ row }">
          <div class="flex gap-1">
            <BaseButton variant="ghost" size="xs" @click="handleOpenPolygon(row)" title="Setting Geofence">
              <Map class="w-4 h-4" />
            </BaseButton>
            <BaseButton variant="ghost" size="xs" @click="handleEditKantor(row)">
              <Pencil class="w-4 h-4" />
            </BaseButton>
            <BaseButton variant="ghost" size="xs" class="text-red-500">
              <Trash2 class="w-4 h-4" />
            </BaseButton>
          </div>
        </template>
      </BaseDataTable>
    </div>

    <!-- Modal Polygon -->
    <BaseModal v-model="isPolygonModalOpen" title="Setting Polygon Geofence" size="2xl">
      <div v-if="activeKantor">
        <BaseMapPolygonEditor
          v-model="activeKantor.polygon"
          :center="activeKantor.koordinatPusat"
          :label="activeKantor.nama"
          @change="handlePolygonSave"
        />
      </div>
    </BaseModal>

    <!-- Modal Wilayah -->
    <BaseModal v-model="isWilayahModalOpen" title="Kelola Wilayah" size="md">
      <BaseDataTable
        :rows="wilayahData"
        :columns="[{key: 'nama', label: 'Nama Wilayah'}, {key: 'statusAktif', label: 'Status'}, {key: 'actions', label: 'Aksi'}]"
      >
        <template #cell-statusAktif="{ row }">
          <BaseSwitch v-model="row.statusAktif" />
        </template>
        <template #cell-actions="{ row }">
          <BaseButton variant="ghost" size="xs" class="text-red-500">Hapus</BaseButton>
        </template>
      </BaseDataTable>
    </BaseModal>
  </div>
</template>
