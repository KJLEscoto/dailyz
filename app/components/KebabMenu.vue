<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface MenuItem {
  label: string
  icon: string
  action?: () => void
  danger?: boolean
  divider?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  triggerClass?: string
  items?: MenuItem[]
  position?: 'left' | 'right'
  menuWidth?: number
}>(), {
  position: 'right',
  menuWidth: 190,
  items: () => [
    { label: 'Edit', icon: '✎' },
    { label: 'Duplicate', icon: '⎘' },
    { label: 'Share', icon: '↗' },
    { label: 'Move to', icon: '⇥', divider: true },
    { label: 'Archive', icon: '⊡', disabled: true },
    { label: 'Delete', icon: '⌫', danger: true },
  ]
})

const isOpen = ref(false)
const triggerRef = ref<HTMLButtonElement | null>(null)
const menuRef = ref<HTMLDivElement | null>(null)

const MENU_ITEM_HEIGHT = 37
const MENU_PADDING = 12
const MENU_GAP = 8

const coords = ref({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  viewportWidth: 0,
  viewportHeight: 0,
  openUpward: false,
})

const updateCoords = () => {
  if (!triggerRef.value) return
  const r = triggerRef.value.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  const itemCount = props.items.filter(i => !i.divider).length
  const dividerCount = props.items.filter(i => i.divider).length
  const estimatedHeight = itemCount * MENU_ITEM_HEIGHT + dividerCount * 13 + MENU_PADDING

  const spaceBelow = vh - r.bottom - MENU_GAP
  const openUpward = spaceBelow < estimatedHeight && r.top > estimatedHeight

  coords.value = {
    top: r.bottom,
    bottom: r.top,
    left: r.left,
    right: r.right,
    viewportWidth: vw,
    viewportHeight: vh,
    openUpward,
  }
}

const toggle = () => {
  if (!isOpen.value) {
    updateCoords()
    isOpen.value = true
  } else {
    isOpen.value = false
  }
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node
  if (triggerRef.value?.contains(target) || menuRef.value?.contains(target)) return
  isOpen.value = false
}

// Close on any scroll — menu should not follow when user scrolls
const handleScroll = () => {
  if (isOpen.value) isOpen.value = false
}

let rafId: number | null = null
const handleResize = () => {
  if (!isOpen.value) return
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    updateCoords()
    rafId = null
  })
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleResize)
  if (rafId) cancelAnimationFrame(rafId)
})

const handleAction = (item: MenuItem) => {
  if (item.disabled) return
  item.action?.()
  isOpen.value = false
}
</script>

<template>
  <div :class="['relative inline-flex', triggerClass, isOpen ? 'opacity-70' : '']">
    <button ref="triggerRef" :class="[
      'flex flex-col items-center justify-center gap-1 w-9 h-9 rounded-lg p-0 border-none',
      'bg-transparent cursor-pointer outline-none transition-all duration-150',
      isOpen
        ? 'bg-violet-100 scale-95'
        : 'hover:bg-violet-50 focus-visible:bg-violet-50'
    ]" @click="toggle" :aria-expanded="isOpen" aria-haspopup="true" aria-label="Options">
      <span v-for="n in 3" :key="n" :class="[
        'block w-1 h-1 rounded-full transition-colors duration-150',
        isOpen ? 'bg-violet-800' : 'bg-violet-600'
      ]" />
    </button>
  </div>

  <Teleport to="body">
    <Transition enter-active-class="transition duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]" :enter-from-class="coords.openUpward
      ? 'opacity-0 scale-90 translate-y-1.5'
      : 'opacity-0 scale-90 -translate-y-1.5'" enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-[130ms] ease-in" leave-from-class="opacity-100 scale-100 translate-y-0"
      :leave-to-class="coords.openUpward
        ? 'opacity-0 scale-95 translate-y-1'
        : 'opacity-0 scale-95 -translate-y-1'">
      <div v-if="isOpen" ref="menuRef" :style="{
        position: 'fixed',
        ...(coords.openUpward
          ? { bottom: `${coords.viewportHeight - coords.bottom + 8}px` }
          : { top: `${coords.top + 8}px` }
        ),
        ...(props.position === 'right'
          ? { right: `${coords.viewportWidth - coords.right}px` }
          : { left: `${coords.left}px` }
        ),
        zIndex: 9999,
        minWidth: `${props.menuWidth}px`,
      }" class="drop-shadow-[0_8px_24px_rgba(109,40,217,0.18)]" role="menu">
        <div class="bg-[#0f0d1a] border border-[#2d2545] rounded-[14px] p-1.5 overflow-hidden">
          <template v-for="(item, index) in items" :key="index">
            <div v-if="item.divider" class="h-px bg-[#2d2545] mx-2 my-1.5 rounded-sm" />
            <button :class="[
              'flex items-center gap-2.5 w-full px-3 py-2 rounded-[9px] border-none text-left',
              'font-mono text-[13px] tracking-wide cursor-pointer',
              'transition-all duration-140',
              item.danger
                ? 'text-red-400 bg-transparent hover:bg-red-950/60 hover:text-red-300'
                : 'text-violet-200 bg-transparent hover:bg-[#1e1535] hover:text-violet-100',
              item.disabled
                ? 'opacity-30 cursor-not-allowed pointer-events-none'
                : 'hover:translate-x-0.5 active:translate-x-0.5 active:scale-[0.98]'
            ]" role="menuitem" :disabled="item.disabled" @click="handleAction(item)">
              <span class="text-[15px] min-w-4.5 text-center leading-none">{{ item.icon }}</span>
              <span class="flex-1">{{ item.label }}</span>
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>