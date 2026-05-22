<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const ITEM_HEIGHT = 44

// Build lists
const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const periods = ['AM', 'PM']

// Parse modelValue ("HH:mm" 24h) into picker state
const parseValue = (val: string) => {
  if (!val) return { hour: '05', minute: '00', period: 'AM' }
  const [h, m] = val.split(':')
  let hour = parseInt(h ?? '5')
  const minute = String(parseInt(m ?? '0')).padStart(2, '0')
  const period = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return { hour: String(hour).padStart(2, '0'), minute, period }
}

const parsed = parseValue(props.modelValue)
const selectedHour = ref(parsed.hour)
const selectedMinute = ref(parsed.minute)
const selectedPeriod = ref(parsed.period)

// Emit 24h string on change
const emitValue = () => {
  let h = parseInt(selectedHour.value)
  if (selectedPeriod.value === 'AM') { if (h === 12) h = 0 }
  else { if (h !== 12) h += 12 }
  emit('update:modelValue', `${String(h).padStart(2, '0')}:${selectedMinute.value}`)
}

watch([selectedHour, selectedMinute, selectedPeriod], emitValue)

// --- Drum scroll logic ---
const useColumn = (items: string[], selected: Ref<string>) => {
  const el = ref<HTMLElement | null>(null)
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

  // Init scroll to selected
  onMounted(() => {
    const i = items.indexOf(selected.value)
    offset.value = -(i >= 0 ? i : 0) * ITEM_HEIGHT
  })

  const onPointerDown = (e: PointerEvent) => {
    isDragging.value = true
    isSnapping.value = false
    startY.value = e.clientY
    startOffset.value = offset.value;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging.value) return
    offset.value = startOffset.value + (e.clientY - startY.value)
  }

  const onPointerUp = () => {
    if (!isDragging.value) return
    isDragging.value = false
    snapTo(Math.round(-clampedOffset.value / ITEM_HEIGHT))
  }

  const style = computed(() => ({
    transform: `translateY(${clampedOffset.value}px)`,
    transition: isSnapping.value ? 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
    cursor: isDragging.value ? 'grabbing' : 'grab',
  }))

  return { el, style, currentIndex, onPointerDown, onPointerMove, onPointerUp, snapTo, items }
}

const hourCol = useColumn(hours, selectedHour)
const minuteCol = useColumn(minutes, selectedMinute)
const periodCol = useColumn(periods, selectedPeriod)

const display = computed(() =>
  props.modelValue
    ? `Reminder set for ${new Date('1970-01-01T' + props.modelValue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'No reminder set'
)
</script>

<template>
  <div class="space-y-1.5">
    <label class="flex items-center gap-1 md:text-sm text-xs font-medium uppercase text-muted select-none">
      reminder time
      <!-- <span class="text-xs text-black/30">(optional)</span> -->
       <span class="text-sm leading-none text-primary">*</span>
    </label>

    <!-- Picker -->
    <div
      class="relative flex items-center justify-center gap-1 bg-primary/5 rounded-2xl overflow-hidden h-[220px] select-none">

      <!-- Fade top -->
      <div
        class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none rounded-t-2xl" />
      <!-- Fade bottom -->
      <div
        class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none rounded-b-2xl" />

      <!-- Selection highlight -->
      <div
        class="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-11 rounded-xl bg-primary/5 z-10 pointer-events-none" />

      <!-- Hour column -->
      <div class="relative flex-1 h-full overflow-hidden" @pointerdown="hourCol.onPointerDown"
        @pointermove="hourCol.onPointerMove" @pointerup="hourCol.onPointerUp" @pointercancel="hourCol.onPointerUp">
        <div :style="{ ...hourCol.style.value, paddingTop: `${220 / 2 - ITEM_HEIGHT / 2}px` }"
          class="flex flex-col items-center">
          <div v-for="(h, i) in hours" :key="h" :class="['flex items-center justify-center transition-all duration-150 w-full shrink-0',
            hourCol.currentIndex.value === i
              ? 'text-lg font-bold text-primary'
              : 'text-sm font-medium text-black/25'
          ]" :style="{ height: ITEM_HEIGHT + 'px' }">
            {{ h }}
          </div>
        </div>
      </div>

      <!-- Separator -->
      <span class="text-lg font-bold text-primary/40 z-20">:</span>

      <!-- Minute column -->
      <div class="relative flex-1 h-full overflow-hidden" @pointerdown="minuteCol.onPointerDown"
        @pointermove="minuteCol.onPointerMove" @pointerup="minuteCol.onPointerUp"
        @pointercancel="minuteCol.onPointerUp">
        <div :style="{ ...minuteCol.style.value, paddingTop: `${220 / 2 - ITEM_HEIGHT / 2}px` }"
          class="flex flex-col items-center">
          <div v-for="(m, i) in minutes" :key="m" :class="['flex items-center justify-center transition-all duration-150 w-full shrink-0',
            minuteCol.currentIndex.value === i
              ? 'text-lg font-bold text-primary'
              : 'text-sm font-medium text-black/25'
          ]" :style="{ height: ITEM_HEIGHT + 'px' }">
            {{ m }}
          </div>
        </div>
      </div>

      <!-- AM/PM column -->
      <div class="relative flex-1 h-full overflow-hidden" @pointerdown="periodCol.onPointerDown"
        @pointermove="periodCol.onPointerMove" @pointerup="periodCol.onPointerUp"
        @pointercancel="periodCol.onPointerUp">
        <div :style="{ ...periodCol.style.value, paddingTop: `${220 / 2 - ITEM_HEIGHT / 2}px` }"
          class="flex flex-col items-center">
          <div v-for="(p, i) in periods" :key="p" :class="['flex items-center justify-center transition-all duration-150 w-full shrink-0',
            periodCol.currentIndex.value === i
              ? 'text-lg font-bold text-primary'
              : 'text-sm font-medium text-black/25'
          ]" :style="{ height: ITEM_HEIGHT + 'px' }">
            {{ p }}
          </div>
        </div>
      </div>

    </div>

    <p class="text-xs text-black/30">{{ display }}</p>
  </div>
</template>