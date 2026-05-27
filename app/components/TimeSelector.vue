<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const ITEM_HEIGHT = 44
const VISIBLE_HEIGHT = 220

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const periods = ['AM', 'PM']

const parseValue = (val: string) => {
  if (!val) return { hour: '08', minute: '00', period: 'AM' }
  const [h, m] = val.split(':')
  let hour = parseInt(h ?? '8')
  const minute = String(parseInt(m ?? '0')).padStart(2, '0')
  const period = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return { hour: String(hour).padStart(2, '0'), minute, period }
}

const parsed = parseValue(props.modelValue)
const selectedHour = ref(parsed.hour)
const selectedMinute = ref(parsed.minute)
const selectedPeriod = ref(parsed.period)

const emitValue = () => {
  let h = parseInt(selectedHour.value)
  if (selectedPeriod.value === 'AM') { if (h === 12) h = 0 }
  else { if (h !== 12) h += 12 }
  emit('update:modelValue', `${String(h).padStart(2, '0')}:${selectedMinute.value}`)
}

onMounted(() => emitValue())
watch([selectedHour, selectedMinute, selectedPeriod], emitValue)

const useColumn = (items: string[], selected: Ref<string>) => {
  const isDragging = ref(false)
  const startY = ref(0)
  const startOffset = ref(0)
  const offset = ref(0)
  const isSnapping = ref(false)

  const clampedOffset = computed(() =>
    Math.min(0, Math.max(-(items.length - 1) * ITEM_HEIGHT, offset.value))
  )

  const currentIndex = computed(() =>
    Math.round(-clampedOffset.value / ITEM_HEIGHT)
  )

  const snapTo = (index: number) => {
    isSnapping.value = true
    offset.value = -index * ITEM_HEIGHT
    selected.value = items[index] ?? items[0]!
    setTimeout(() => isSnapping.value = false, 300)
  }

  onMounted(() => {
    const i = items.indexOf(selected.value)
    offset.value = -(i >= 0 ? i : 0) * ITEM_HEIGHT
  })

  // --- unified start/move/end used by both pointer and touch ---
  const onStart = (y: number) => {
    isDragging.value = true
    isSnapping.value = false
    startY.value = y
    startOffset.value = offset.value
  }

  const onMove = (y: number) => {
    if (!isDragging.value) return
    offset.value = startOffset.value + (y - startY.value)
  }

  const onEnd = () => {
    if (!isDragging.value) return
    isDragging.value = false
    snapTo(Math.round(-clampedOffset.value / ITEM_HEIGHT))
  }

  // Pointer (desktop + some mobile)
  const onPointerDown = (e: PointerEvent) => {
    onStart(e.clientY)
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { }
  }
  const onPointerMove = (e: PointerEvent) => onMove(e.clientY)
  const onPointerUp = () => onEnd()

  // Touch (iOS Safari)
  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault() // 👈 stops iOS scroll from stealing the drag
    onStart(e.touches[0]!.clientY)
  }
  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    onMove(e.touches[0]!.clientY)
  }
  const onTouchEnd = () => onEnd()

  const style = computed(() => ({
    transform: `translateY(${clampedOffset.value}px)`,
    transition: isSnapping.value ? 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
    cursor: isDragging.value ? 'grabbing' : 'grab',
    touchAction: 'none', // 👈 critical for iOS
  }))

  return {
    style, currentIndex,
    onPointerDown, onPointerMove, onPointerUp,
    onTouchStart, onTouchMove, onTouchEnd,
  }
}

const hourCol = useColumn(hours, selectedHour)
const minuteCol = useColumn(minutes, selectedMinute)
const periodCol = useColumn(periods, selectedPeriod)
</script>

<template>
  <div class="relative flex items-center justify-center gap-1 bg-primary/5 rounded-2xl overflow-hidden h-55 select-none"
    style="touch-action: none;">

    <!-- Fade top -->
    <div class="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-white to-transparent z-10 pointer-events-none" />
    <!-- Fade bottom -->
    <div class="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-white to-transparent z-10 pointer-events-none" />

    <!-- Selection highlight -->
    <div
      class="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-11 rounded-xl bg-primary/10 z-10 pointer-events-none" />

    <!-- Hour -->
    <div class="relative flex-1 h-full overflow-hidden" @pointerdown="hourCol.onPointerDown"
      @pointermove="hourCol.onPointerMove" @pointerup="hourCol.onPointerUp" @pointercancel="hourCol.onPointerUp"
      @touchstart.prevent="hourCol.onTouchStart" @touchmove.prevent="hourCol.onTouchMove"
      @touchend="hourCol.onTouchEnd">
      <div :style="{ ...hourCol.style.value, paddingTop: `${VISIBLE_HEIGHT / 2 - ITEM_HEIGHT / 2}px` }"
        class="flex flex-col items-center">
        <div v-for="(h, i) in hours" :key="h" :style="{ height: ITEM_HEIGHT + 'px' }" :class="['flex items-center justify-center transition-all duration-150 w-full shrink-0',
          hourCol.currentIndex.value === i ? 'text-lg font-bold text-primary' : 'text-sm font-medium text-black/25'
        ]">
          {{ h }}
        </div>
      </div>
    </div>

    <!-- Separator -->
    <span class="text-lg font-bold text-primary/40 z-20">:</span>

    <!-- Minute -->
    <div class="relative flex-1 h-full overflow-hidden" @pointerdown="minuteCol.onPointerDown"
      @pointermove="minuteCol.onPointerMove" @pointerup="minuteCol.onPointerUp" @pointercancel="minuteCol.onPointerUp"
      @touchstart.prevent="minuteCol.onTouchStart" @touchmove.prevent="minuteCol.onTouchMove"
      @touchend="minuteCol.onTouchEnd">
      <div :style="{ ...minuteCol.style.value, paddingTop: `${VISIBLE_HEIGHT / 2 - ITEM_HEIGHT / 2}px` }"
        class="flex flex-col items-center">
        <div v-for="(m, i) in minutes" :key="m" :style="{ height: ITEM_HEIGHT + 'px' }" :class="['flex items-center justify-center transition-all duration-150 w-full shrink-0',
          minuteCol.currentIndex.value === i ? 'text-lg font-bold text-primary' : 'text-sm font-medium text-black/25'
        ]">
          {{ m }}
        </div>
      </div>
    </div>

    <!-- AM/PM -->
    <div class="relative flex-1 h-full overflow-hidden" @pointerdown="periodCol.onPointerDown"
      @pointermove="periodCol.onPointerMove" @pointerup="periodCol.onPointerUp" @pointercancel="periodCol.onPointerUp"
      @touchstart.prevent="periodCol.onTouchStart" @touchmove.prevent="periodCol.onTouchMove"
      @touchend="periodCol.onTouchEnd">
      <div :style="{ ...periodCol.style.value, paddingTop: `${VISIBLE_HEIGHT / 2 - ITEM_HEIGHT / 2}px` }"
        class="flex flex-col items-center">
        <div v-for="(p, i) in periods" :key="p" :style="{ height: ITEM_HEIGHT + 'px' }" :class="['flex items-center justify-center transition-all duration-150 w-full shrink-0',
          periodCol.currentIndex.value === i ? 'text-lg font-bold text-primary' : 'text-sm font-medium text-black/25'
        ]">
          {{ p }}
        </div>
      </div>
    </div>

  </div>
</template>