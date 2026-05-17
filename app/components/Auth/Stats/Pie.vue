<!-- components/Auth/Stats/Pie.vue -->
<script setup lang="ts">
import type { Habit } from '~/types/habit'

const props = defineProps<{
  habits: Habit[]
}>()

const TIME_CONFIG = useTimeConfig()

const segments = computed(() => {
  const groups: Record<string, { count: number }> = {}

  props.habits.forEach(habit => {
    const time = habit.time ?? 'anytime'
    if (!groups[time]) groups[time] = { count: 0 }
    groups[time]!.count++
  })

  const total = props.habits.length
  return Object.entries(groups).map(([time, data]) => ({
    time,
    count: data.count,
    bg: TIME_CONFIG[time]?.bg ?? '#F1F1F1',        // 👈 for pie fill
    color: TIME_CONFIG[time]?.color ?? '#4A4A4A',  // 👈 for text
    label: TIME_CONFIG[time]?.label ?? time,
    emoji: TIME_CONFIG[time]?.emoji ?? '🕐',
    percentage: total === 0 ? 0 : (data.count / total) * 100,
  }))
})

// SVG pie chart math
const SIZE = 200
const CENTER = SIZE / 2
const RADIUS = 80
const GAP_DEGREES = 1.5
const showBlocks = ref(false)

interface PieSlice {
  time: string
  count: number
  color: string
  label: string
  emoji: string
  percentage: number
  path: string
  labelX: number
  labelY: number
  emojiX: number
  emojiY: number
}

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const describeSlice = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

const slices = computed<PieSlice[]>(() => {
  let currentAngle = 0
  return segments.value.map(seg => {
    const sliceAngle = (seg.percentage / 100) * 360
    const startAngle = currentAngle + GAP_DEGREES / 2
    const endAngle = currentAngle + sliceAngle - GAP_DEGREES / 2
    const midAngle = currentAngle + sliceAngle / 2

    const midPos = polarToCartesian(CENTER, CENTER, RADIUS * 0.62, midAngle)

    currentAngle += sliceAngle

    return {
      ...seg,
      path: describeSlice(CENTER, CENTER, RADIUS, startAngle, endAngle),
      emojiX: midPos.x - 8,  // 👈 emoji left
      emojiY: midPos.y,
      labelX: midPos.x + 8,  // 👈 count right
      labelY: midPos.y,
    }
  })
})
</script>

<template>
  <ClientOnly>
    <section class="bg-white rounded-3xl md:p-6 p-4 flex flex-col gap-2 h-full relative overflow-hidden">
      <Image v-if="habits.length" class="shrink-0 absolute md:-bottom-10 -bottom-2 -right-6 md:h-48! h-52!" src="/images/mascot/pie_model.png"
        alt="Donut Model" />

      <p class="text-sm font-semibold text-black/60">
        <span v-if="habits.length">Total of {{ habits.length }} habits</span>
        <span v-else>0 habit</span>
      </p>

      <div v-if="habits.length" class="flex flex-col items-center gap-4">
        <!-- Pie SVG -->
        <div
          class="relative flex flex-col items-center md:scale-100 scale-115 cursor-pointer md:hover:scale-105 hover:scale-120 duration-300 md:active:scale-100 active:scale-115"
          @click="showBlocks = true">

          <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`">
            <!-- Gradient defs -->
            <defs>
              <radialGradient v-for="slice in slices" :key="`grad-${slice.time}`" :id="`grad-${slice.time}`" cx="50%"
                cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" :stop-color="TIME_CONFIG[slice.time]?.bg" stop-opacity="0.4" />
                <stop offset="100%" :stop-color="TIME_CONFIG[slice.time]?.bg" stop-opacity="1" />
              </radialGradient>
            </defs>

            <g v-for="slice in slices" :key="slice.time" class="select-none">
              <path :d="slice.path" :fill="`url(#grad-${slice.time})`" class="transition-all duration-500" />
              <text :x="slice.emojiX" :y="slice.emojiY + 5" text-anchor="middle" dominant-baseline="middle"
                font-size="14" fill="currentColor">{{ slice.emoji }}</text>
              <text :x="slice.labelX" :y="slice.labelY + 4" text-anchor="middle" dominant-baseline="middle"
                font-size="12" font-weight="bold" :fill="TIME_CONFIG[slice.time]?.color ?? '#4A4A4A'">{{ slice.count
                }}</text>
            </g>
          </svg>

          <!-- Total below chart -->
          <!-- <p class="text-sm font-bold text-black/70 -mt-2">{{ habits.length }} habits</p> -->
        </div>

        <!-- Legend -->
        <div class="flex flex-col gap-1 w-full">
          <div v-for="seg in segments" :key="seg.time" class="flex items-center gap-2">
            <span class="text-sm">{{ TIME_CONFIG[seg.time]?.emoji }}</span>
            <span class="text-sm font-medium" :style="{ color: TIME_CONFIG[seg.time]?.color }">
              {{ seg.label }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="rounded-xl px-4 py-6 bg-foreground h-full">
        <p class="text-sm text-black/50">No habits yet. Add some!</p>
      </div>

      <ModalHabitBlocks v-model="showBlocks" :habits="habits" />

    </section>

    <template #fallback>
      <section class="bg-white rounded-3xl md:p-6 p-4 flex flex-col gap-4 h-full">
        <Skeleton height="1rem" width="40%" />
        <div class="flex flex-col items-center gap-4">
          <Skeleton width="200px" height="200px" rounded="9999px" />
          <div class="flex flex-col gap-2 w-full">
            <div v-for="i in 4" :key="i" class="flex items-center gap-2">
              <Skeleton width="1rem" height="1rem" rounded="9999px" />
              <Skeleton height="0.875rem" :width="`${40 + (i * 13) % 30}%`" />
            </div>
          </div>
        </div>
      </section>
    </template>
  </ClientOnly>
</template>