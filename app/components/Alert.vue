<!-- components/Alert.vue -->
<script setup lang="ts">
import { X, TriangleAlert, CircleCheck, Info } from '@lucide/vue'

interface AlertAction {
  label: string
  onClick: () => void
}

defineOptions({ inheritAttrs: false })

interface Props {
  toast?: boolean
  type?: 'success' | 'danger' | 'info'
  title?: string
  message: string
  actions?: AlertAction[]
  dismissible?: boolean
  visible?: boolean
  timeout?: number // ms, e.g. 3000 — omit for no auto-dismiss
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: true,
  visible: true,
})

const emit = defineEmits<{
  dismiss: []
}>()

const config = computed(() => ({
  success: {
    bg: 'bg-white',
    text: 'text-emerald-600',
    subtext: 'text-muted',
    icon: CircleCheck,
    actionPrimary: 'text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 cursor-pointer rounded-xl text-xs font-semibold transition-colors active:scale-95 ease-in-out transition-all duration-150',
    actionSecondary: 'text-muted hover:text-black/70 px-4 py-2 cursor-pointer rounded-xl text-xs font-semibold transition-colors hover:bg-muted/10 active:scale-95 ease-in-out transition-all duration-150',
  },
  danger: {
    bg: 'bg-white',
    text: 'text-red-600',
    subtext: 'text-muted',
    icon: TriangleAlert,
    actionPrimary: 'text-white bg-red-500 hover:bg-red-600 px-4 py-2 cursor-pointer rounded-xl text-xs font-semibold transition-colors active:scale-95 ease-in-out transition-all duration-150',
    actionSecondary: 'text-muted hover:text-black/70 px-4 py-2 cursor-pointer rounded-xl text-xs font-semibold transition-colors hover:bg-muted/10 active:scale-95 ease-in-out transition-all duration-150',
  },
  info: {
    bg: 'bg-white',
    text: 'text-blue-600',
    subtext: 'text-muted',
    icon: Info,
    actionPrimary: 'text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 cursor-pointer rounded-xl text-xs font-semibold transition-colors active:scale-95 ease-in-out transition-all duration-150',
    actionSecondary: 'text-muted hover:text-black/70 px-4 py-2 cursor-pointer rounded-xl text-xs font-semibold transition-colors hover:bg-muted/10 active:scale-95 ease-in-out transition-all duration-150',
  },
}[props.type]))

// --- Auto dismiss ---
let timer: ReturnType<typeof setTimeout> | null = null

const startTimer = () => {
  if (!props.timeout) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => emit('dismiss'), props.timeout)
}

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

watch(() => props.visible, (val) => {
  if (val) startTimer()
  else clearTimer()
}, { immediate: true })

onUnmounted(() => clearTimer())

// --- Swipe to dismiss ---
const dragY = ref(0)
const isDragging = ref(false)
const isSwiping = ref(false) // true once swipe threshold triggered (locks to CSS transition)

let startY = 0
let startX = 0
let isScrollGesture = false // true if user is scrolling sideways

const DISMISS_THRESHOLD = -60  // px upward to trigger dismiss
const RESISTANCE = 0.4         // drag resistance factor for downward pull

const cardStyle = computed(() => {
  if (isSwiping.value) return {} // CSS transition takes over
  if (!isDragging.value) return {}
  const y = dragY.value < 0
    ? dragY.value                          // free upward movement
    : dragY.value * RESISTANCE             // resist downward pull
  const opacity = dragY.value < 0
    ? Math.max(0, 1 + dragY.value / 120)  // fade as you swipe up
    : 1
  return {
    transform: `translateY(${y}px)`,
    opacity,
    transition: 'none',
  }
})

const onPointerDown = (e: PointerEvent) => {
  if (!props.dismissible) return
  isDragging.value = true
  isSwiping.value = false
  isScrollGesture = false
  dragY.value = 0
  startY = e.clientY
  startX = e.clientX
  clearTimer()
    ; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

const onPointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return
  const dy = e.clientY - startY
  const dx = e.clientX - startX

  // If horizontal movement is dominant early on, treat as a scroll — bail out
  if (!isScrollGesture && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
    isScrollGesture = true
  }
  if (isScrollGesture) return

  dragY.value = dy

  // Trigger dismiss flight once threshold is crossed
  if (dy < DISMISS_THRESHOLD) {
    isSwiping.value = true
    isDragging.value = false
    emit('dismiss')
  }
}

const onPointerUp = () => {
  if (!isDragging.value) return
  isDragging.value = false
  dragY.value = 0   // snap back with CSS transition
  if (props.visible) startTimer()
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4 scale-95" leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 -translate-y-4 scale-95">
      <div v-if="visible" class="fixed top-4 left-1/2 -translate-x-1/2 z-999 w-full max-w-sm px-4">
        <div :class="['rounded-2xl p-4 flex flex-col gap-3 shadow-xl select-none touch-none', config.bg,
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
          !isDragging && !isSwiping ? 'transition-[transform,opacity] duration-200 ease-out' : '',
        ]" :style="cardStyle" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp"
          @pointercancel="onPointerUp">
          <!-- Header -->
          <div class="flex items-start gap-3">
            <component v-if="dismissible || type !== 'info'" :is="config.icon"
              :class="['size-5 shrink-0 sm:mt-0 mt-0.5', config.text]" />
            <div v-else
              :class="['size-5 shrink-0 border-2 border-t-transparent rounded-full animate-spin', 'border-blue-400']" />
            <div class="flex-1 min-w-0">
              <p v-if="title" :class="['sm:text-base text-sm font-semibold', config.text]">{{ title }}</p>
              <p :class="['sm:text-sm text-xs mt-1.5', title ? config.subtext : config.text]">{{ message }}</p>
            </div>
            <button v-if="dismissible" @click="emit('dismiss')" @pointerdown.stop
              class="shrink-0 p-1 rounded-lg transition-colors hover:bg-black/5 text-muted">
              <X class="size-4" />
            </button>
          </div>

          <!-- Actions -->
          <div v-if="actions?.length" class="flex items-center justify-end gap-1 select-none">
            <button v-for="(action, index) in actions" :key="index" @click="action.onClick" @pointerdown.stop
              :class="index === 0 ? config.actionSecondary : config.actionPrimary">
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>