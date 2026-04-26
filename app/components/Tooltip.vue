<script setup lang="ts">
interface Props {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
})

const triggerRef = ref<HTMLElement | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })
const isVisible = ref(false)

function updatePosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()

  switch (props.position) {
    case 'top':
      tooltipPos.value = { x: rect.left + rect.width / 2, y: rect.top }
      break
    case 'bottom':
      tooltipPos.value = { x: rect.left + rect.width / 2, y: rect.bottom }
      break
    case 'left':
      tooltipPos.value = { x: rect.left, y: rect.top + rect.height / 2 }
      break
    case 'right':
      tooltipPos.value = { x: rect.right, y: rect.top + rect.height / 2 }
      break
  }
}

function onMouseEnter() {
  updatePosition()
  isVisible.value = true
}

function onMouseLeave() {
  isVisible.value = false
}

const tooltipStyles = computed(() => {
  switch (props.position) {
    case 'top':
      return { left: `${tooltipPos.value.x}px`, top: `${tooltipPos.value.y}px`, transform: 'translate(-50%, calc(-100% - 8px))' }
    case 'bottom':
      return { left: `${tooltipPos.value.x}px`, top: `${tooltipPos.value.y}px`, transform: 'translate(-50%, 8px)' }
    case 'left':
      return { left: `${tooltipPos.value.x}px`, top: `${tooltipPos.value.y}px`, transform: 'translate(calc(-100% - 8px), -50%)' }
    case 'right':
      return { left: `${tooltipPos.value.x}px`, top: `${tooltipPos.value.y}px`, transform: 'translate(8px, -50%)' }
  }
})

const arrowClasses = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-white/80',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-white/80',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-white/80',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-white/80',
}

function onScroll() {
  isVisible.value = false
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, true)  // true = capture all scroll events
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
      <div v-if="isVisible" :style="tooltipStyles" class="drop-shadow-xl fixed z-9999 pointer-events-none whitespace-nowrap">
        <div class="bg-white text-muted text-sm font-medium border-muted/10 border px-2.5 py-1.5 rounded-lg">
          {{ text }}
        </div>
        <!-- <div :class="['absolute border-4', arrowClasses[position]]" /> -->
      </div>
    </Transition>
  </Teleport>
</template>