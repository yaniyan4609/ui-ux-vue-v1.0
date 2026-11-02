<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  activeId: {
    type: String,
    required: true,
  },
  capsule: {
    type: Boolean,
    default: false, // Mode capsule pill rounded top & bottom (Wireframe 1 mobile)
  },
})

const emit = defineEmits(['select'])
const router = useRouter()
const route = useRoute()

const handleItemClick = (item) => {
  emit('select', item.id)
  router.push(item.route)
}
</script>

<template>
  <!-- Wireframe "MENU" Column -->
  <aside
    class="shrink-0 flex flex-col items-center select-none transition-all duration-200"
    :class="[
      capsule
        ? 'w-18 sm:w-20 my-3 ml-3 mr-1 py-4 px-1 rounded-[26px] border-2 border-neutral-300 dark:border-[#2e2e36] bg-neutral-100/90 dark:bg-[#1a1a1e] shadow-2xs h-[calc(100%-24px)]'
        : 'w-20 sm:w-22 bg-white dark:bg-[#121214] border-r border-neutral-200 dark:border-[#27272a] py-5 z-20'
    ]"
  >
    <!-- Wireframe "MENU" Text Indicator -->
    <div class="mb-5 px-2 text-center">
      <span class="text-[10px] font-bold tracking-widest text-neutral-600 dark:text-neutral-400 uppercase px-2 py-0.5 rounded-md border border-neutral-300 dark:border-[#27272a] bg-white dark:bg-[#1c1c20] shadow-2xs">
        MENU
      </span>
    </div>

    <!-- Menu Items: Beranda, Data, Setting -->
    <nav class="w-full flex flex-col items-center gap-2 px-1">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        @click="handleItemClick(item)"
        class="group w-full py-2.5 px-1 flex flex-col items-center justify-center rounded-2xl transition-all duration-150 cursor-pointer text-center relative"
        :class="[
          activeId === item.id
            ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-sm font-semibold'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-[#25252b] hover:text-neutral-900 dark:hover:text-white',
        ]"
      >
        <component
          :is="item.icon"
          class="w-5 h-5 transition-transform duration-150 group-hover:scale-105"
        />

        <span class="text-[10px] sm:text-[10.5px] tracking-tight mt-1 font-medium leading-none">
          {{ item.label }}
        </span>

        <!-- Active side indicator bar (hanya di mode desktop rail) -->
        <span
          v-if="activeId === item.id && !capsule"
          class="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-[var(--theme-primary)]"
        />
      </button>
    </nav>
  </aside>
</template>
