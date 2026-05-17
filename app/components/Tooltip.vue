<script setup lang="ts">
interface Props {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
})

const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })
const resolvedPosition = ref(props.position)
const isVisible = ref(false)

const OFFSET = 8
const EDGE_MARGIN = 8 // min distance from viewport edge

function computePosition(rect: DOMRect, tooltipWidth: number, tooltipHeight: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Space available in each direction from the trigger element
  const space = {
    top: rect.top,
    bottom: vh - rect.bottom,
    left: rect.left,
    right: vw - rect.right,
  }

  // Preferred order: try the requested position, then fallback
  const fallbackOrder: Array<'top' | 'bottom' | 'left' | 'right'> = {
    top: ['top', 'bottom', 'left', 'right'],
    bottom: ['bottom', 'top', 'left', 'right'],
    left: ['left', 'right', 'top', 'bottom'],
    right: ['right', 'left', 'top', 'bottom'],
  }[props.position] as Array<'top' | 'bottom' | 'left' | 'right'>

  // Required clearance per direction
  const required = {
    top: tooltipHeight + OFFSET,
    bottom: tooltipHeight + OFFSET,
    left: tooltipWidth + OFFSET,
    right: tooltipWidth + OFFSET,
  }

  // Pick the first direction with enough room
  const chosen = (fallbackOrder.find(dir => space[dir] >= required[dir]) ?? fallbackOrder[0]) as 'top' | 'bottom' | 'left' | 'right'
  resolvedPosition.value = chosen

  // Base x/y for the chosen direction
  let x = 0
  let y = 0

  switch (chosen) {
    case 'top':
      x = rect.left + rect.width / 2
      y = rect.top - OFFSET
      break
    case 'bottom':
      x = rect.left + rect.width / 2
      y = rect.bottom + OFFSET
      break
    case 'left':
      x = rect.left - OFFSET
      y = rect.top + rect.height / 2
      break
    case 'right':
      x = rect.right + OFFSET
      y = rect.top + rect.height / 2
      break
  }

  // Clamp x so tooltip stays within horizontal viewport bounds
  if (chosen === 'top' || chosen === 'bottom') {
    const minX = tooltipWidth / 2 + EDGE_MARGIN
    const maxX = vw - tooltipWidth / 2 - EDGE_MARGIN
    x = Math.min(Math.max(x, minX), maxX)
  }

  // Clamp y so tooltip stays within vertical viewport bounds
  if (chosen === 'left' || chosen === 'right') {
    const minY = tooltipHeight / 2 + EDGE_MARGIN
    const maxY = vh - tooltipHeight / 2 - EDGE_MARGIN
    y = Math.min(Math.max(y, minY), maxY)
  }

  return { x, y }
}

async function updatePosition() {
  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()

  // First pass: render at a safe off-screen position to measure tooltip size
  tooltipPos.value = { x: -9999, y: -9999 }
  isVisible.value = true

  await nextTick()

  const tooltipEl = tooltipRef.value
  const tooltipWidth = tooltipEl?.offsetWidth ?? 120
  const tooltipHeight = tooltipEl?.offsetHeight ?? 32

  const { x, y } = computePosition(rect, tooltipWidth, tooltipHeight)
  tooltipPos.value = { x, y }
}

function onMouseEnter() {
  updatePosition()
}

function onMouseLeave() {
  isVisible.value = false
}

const tooltipStyles = computed(() => {
  const { x, y } = tooltipPos.value
  switch (resolvedPosition.value) {
    case 'top':
      return { left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -100%)' }
    case 'bottom':
      return { left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, 0)' }
    case 'left':
      return { left: `${x}px`, top: `${y}px`, transform: 'translate(-100%, -50%)' }
    case 'right':
      return { left: `${x}px`, top: `${y}px`, transform: 'translate(0, -50%)' }
  }
})

const arrowClasses = computed(() => ({
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-white/80',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-white/80',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-white/80',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-white/80',
}[resolvedPosition.value]))

function onScroll() {
  isVisible.value = false
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, true)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll, true)
})
</script>

<template>
  <div ref="triggerRef" class="relative inline-flex" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <slot />
  </div>

  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
      <div v-if="isVisible" ref="tooltipRef" :style="tooltipStyles"
        class="drop-shadow-xl fixed z-9999 pointer-events-none text-center">
        <div class="bg-white text-muted text-xs font-medium border-muted/10 border px-2.5 py-1.5 rounded-lg text-nowrap">
          {{ text }}
        </div>
        <!-- <div :class="['absolute border-4', arrowClasses]" /> -->
      </div>
    </Transition>
  </Teleport>
</template>