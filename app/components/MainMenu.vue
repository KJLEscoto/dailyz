<!-- components/MainMenu.vue -->
<script setup lang="ts">
import { Settings2 } from '@lucide/vue'
import { ref, onMounted, onUnmounted } from 'vue'

export interface MenuItem {
  label: string
  icon: any
  action: () => void
  danger?: boolean
  divider?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  items: MenuItem[]
  triggerClass?: string
  position?: 'left' | 'right'
  menuWidth?: number
}>(), {
  position: 'right',
  menuWidth: 190,
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

const handleScroll = () => { if (isOpen.value) isOpen.value = false }

let rafId: number | null = null
const handleResize = () => {
  if (!isOpen.value) return
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => { updateCoords(); rafId = null })
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
  item.action()
  isOpen.value = false
}
</script>

<template>
  <div :class="['relative inline-flex  shrink-0', triggerClass]">
    <button ref="triggerRef" class="cursor-pointer" @click="toggle" :aria-expanded="isOpen" aria-haspopup="true"
      aria-label="Options">
      <slot name="trigger">
        <Settings2 class="size-5 pointer-events-none text-muted" />
      </slot>
    </button>
  </div>

  <Teleport to="body">
    <Transition enter-active-class="transition duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      :enter-from-class="coords.openUpward ? 'opacity-0 scale-90 translate-y-1.5' : 'opacity-0 scale-90 -translate-y-1.5'"
      enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-[130ms] ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      :leave-to-class="coords.openUpward ? 'opacity-0 scale-95 translate-y-1' : 'opacity-0 scale-95 -translate-y-1'">
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
      }" class="drop-shadow-2xl" role="menu">
        <div class="bg-white border border-muted/10 rounded-[14px] p-1.5 overflow-hidden">
          <template v-for="(item, index) in items" :key="index">
            <div v-if="item.divider" class="h-px bg-muted/20 mx-2 my-1.5 rounded-sm" />
            <button :class="[
              'flex items-center gap-2.5 w-full px-3 py-2 rounded-[9px] border-none text-left',
              'font-primary text-sm tracking-wide cursor-pointer transition-all duration-140',
              item.danger
                ? 'text-red-400 bg-transparent hover:bg-red-50 hover:text-red-500'
                : 'text-muted bg-transparent hover:bg-foreground hover:text-black',
              item.disabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'active:scale-[0.98]'
            ]" role="menuitem" :disabled="item.disabled" @click="handleAction(item)">
              <component :is="item.icon" class="size-4 shrink-0" />
              <span class="flex-1">{{ item.label }}</span>
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>