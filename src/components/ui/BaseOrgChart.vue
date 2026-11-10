<script setup>
import { ref } from 'vue'
import BaseAvatar from './BaseAvatar.vue'
import BaseBadge from './BaseBadge.vue'
import { ChevronDown, ChevronUp, Users, Building2 } from 'lucide-vue-next'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  collapsible: {
    type: Boolean,
    default: true,
  },
  selectedId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['node-click', 'toggle-expand'])

// Set of expanded node IDs
const expandedSet = ref(new Set([props.data.id]))

const isExpanded = (id) => expandedSet.value.has(id)

const toggleExpand = (node) => {
  if (!props.collapsible) return
  if (expandedSet.value.has(node.id)) {
    expandedSet.value.delete(node.id)
  } else {
    expandedSet.value.add(node.id)
  }
  emit('toggle-expand', node)
}

const handleNodeClick = (node) => {
  emit('node-click', node)
}
</script>

<template>
  <div class="w-full overflow-x-auto p-4 sm:p-6 flex justify-center select-none">
    <div class="org-tree inline-flex flex-col items-center">
      <!-- Recursive Node Component -->
      <OrgNode
        :node="data"
        :collapsible="collapsible"
        :selected-id="selectedId"
        :expanded-set="expandedSet"
        @click="handleNodeClick"
        @toggle="toggleExpand"
      />
    </div>
  </div>
</template>

<!-- Subcomponent OrgNode (Recursive) -->
<script>
import { defineComponent, h } from 'vue'
import BaseAvatarComponent from './BaseAvatar.vue'
import BaseBadgeComponent from './BaseBadge.vue'
import { ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon, Users as UsersIcon } from 'lucide-vue-next'

const OrgNode = defineComponent({
  name: 'OrgNode',
  props: {
    node: { type: Object, required: true },
    collapsible: { type: Boolean, default: true },
    selectedId: { type: [String, Number], default: null },
    expandedSet: { type: Object, required: true },
  },
  emits: ['click', 'toggle'],
  setup(props, { emit }) {
    return () => {
      const n = props.node
      const hasChildren = n.children && n.children.length > 0
      const isExpanded = props.expandedSet.has(n.id)
      const isSelected = props.selectedId === n.id

      // 1. Node Card Content
      const card = h(
        'div',
        {
          class: [
            'relative z-10 w-60 sm:w-64 p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-left shadow-2xs group',
            isSelected
              ? 'border-[var(--theme-primary)] ring-2 ring-[var(--theme-primary)]/20 bg-white dark:bg-[var(--theme-surface-raised)] shadow-md'
              : 'border-neutral-200 dark:border-[var(--theme-border)] bg-white dark:bg-[var(--theme-surface-raised)] hover:border-neutral-300 dark:hover:border-[var(--theme-border-strong)] hover:shadow-xs',
          ],
          onClick: () => emit('click', n),
        },
        [
          // Header: Avatar, Name & Role
          h('div', { class: 'flex items-start gap-2.5' }, [
            h(BaseAvatarComponent, {
              name: n.name || n.role,
              size: 'md',
              class: 'shrink-0 mt-0.5',
            }),
            h('div', { class: 'min-w-0 flex-1' }, [
              h(
                'div',
                { class: 'text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:text-[var(--theme-primary)] transition' },
                n.name || 'Posisi Kosong'
              ),
              h(
                'div',
                { class: 'text-[11px] font-semibold text-[var(--theme-primary)] truncate mt-0.5' },
                n.role
              ),
              h(
                'div',
                { class: 'text-[10px] text-neutral-400 dark:text-neutral-500 truncate' },
                n.department ? `${n.division || ''} · ${n.department}` : (n.division || '')
              ),
            ]),
          ]),

          // Subordinates & Level Bar
          h(
            'div',
            { class: 'mt-2 pt-2 border-t border-neutral-100 dark:border-[var(--theme-border)] flex items-center justify-between text-[10px]' },
            [
              h(BaseBadgeComponent, {
                variant: n.badgeVariant || (n.level === 'direksi' ? 'primary' : (n.level === 'divisi' ? 'info' : 'neutral')),
                size: 'xs',
              }, () => n.levelLabel || (n.level ? n.level.toUpperCase() : 'STAF')),

              hasChildren
                ? h('span', { class: 'flex items-center gap-1 text-neutral-500 font-medium' }, [
                    h(UsersIcon, { class: 'w-3 h-3 text-neutral-400' }),
                    `${n.children.length} Tim Langsung`,
                  ])
                : null,
            ]
          ),

          // Collapse/Expand Trigger Button
          hasChildren && props.collapsible
            ? h(
                'button',
                {
                  type: 'button',
                  class:
                    'absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white dark:bg-[var(--theme-surface)] border border-neutral-300 dark:border-[var(--theme-border)] shadow-xs flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)] transition cursor-pointer z-20',
                  onClick: (e) => {
                    e.stopPropagation()
                    emit('toggle', n)
                  },
                  title: isExpanded ? 'Tutup Cabang' : 'Buka Cabang',
                },
                [
                  h(isExpanded ? ChevronUpIcon : ChevronDownIcon, { class: 'w-3 h-3' }),
                ]
              )
            : null,
        ]
      )

      // 2. Connector & Children (Orthogonal Tree Layout)
      const childrenWrapper =
        hasChildren && isExpanded
          ? h('div', { class: 'org-children-container relative pt-6 flex justify-center gap-6' }, [
              // Vertical Line from Parent Card to Sibling Crossbar
              h('div', {
                class: 'absolute left-1/2 -top-0 -translate-x-1/2 w-0.5 h-6 bg-neutral-300 dark:bg-[var(--theme-border-strong)] pointer-events-none',
              }),

              // Sibling Cards
              ...n.children.map((child, idx) => {
                const isFirst = idx === 0
                const isLast = idx === n.children.length - 1
                const isOnly = n.children.length === 1

                return h(
                  'div',
                  {
                    key: child.id,
                    class: 'org-child-branch relative flex flex-col items-center',
                  },
                  [
                    // Horizontal Crossbar above Sibling Node
                    !isOnly
                      ? h('div', {
                          class: [
                            'absolute top-0 h-0.5 bg-neutral-300 dark:bg-[var(--theme-border-strong)] pointer-events-none',
                            isFirst ? 'left-1/2 right-0' : (isLast ? 'left-0 right-1/2' : 'left-0 right-0'),
                          ],
                        })
                      : null,

                    // Vertical Line down to Child Card
                    h('div', {
                      class: 'w-0.5 h-6 bg-neutral-300 dark:bg-[var(--theme-border-strong)] pointer-events-none',
                    }),

                    // Child Node
                    h(OrgNode, {
                      node: child,
                      collapsible: props.collapsible,
                      selectedId: props.selectedId,
                      expandedSet: props.expandedSet,
                      onClick: (node) => emit('click', node),
                      onToggle: (node) => emit('toggle', node),
                    }),
                  ]
                )
              }),
            ])
          : null

      return h('div', { class: 'org-node-wrapper flex flex-col items-center' }, [
        card,
        childrenWrapper,
      ])
    }
  },
})
</script>
