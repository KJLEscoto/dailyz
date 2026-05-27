<script setup lang="ts">
import type { Habit } from '~/types/habit'

const props = defineProps<{ habits: Habit[] }>()

const SIZE = 200
const CENTER = SIZE / 2
const RADIUS = 80
const GAP_DEGREES = 1.5
const showBlocks = ref(false)

// Group habits by color and count
const segments = computed(() => {
  const groups: Record<string, number> = {}
  props.habits.forEach(h => {
    const color = h.color || '#4A4A4A'
    groups[color] = (groups[color] ?? 0) + 1
  })
  const total = props.habits.length || 1
  return Object.entries(groups).map(([color, count]) => ({
    color,
    count,
    percentage: (count / total) * 100,
  }))
})

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

const slices = computed(() => {
  let currentAngle = 0
  return segments.value.map(seg => {
    const sliceAngle = (seg.percentage / 100) * 360
    const startAngle = currentAngle + GAP_DEGREES / 2
    const endAngle = currentAngle + sliceAngle - GAP_DEGREES / 2
    currentAngle += sliceAngle
    return {
      ...seg,
      path: describeSlice(CENTER, CENTER, RADIUS, startAngle, endAngle),
    }
  })
})
</script>

<template>
  <ClientOnly>
    <section class="bg-white rounded-3xl md:p-6 p-4 flex flex-col gap-2 h-full relative overflow-hidden">
      <!-- <Image v-if="habits.length" class="shrink-0 absolute md:-bottom-10 -bottom-2 -right-6 md:h-48! h-52!"
        src="/images/mascot/pie_model.png" alt="Donut Model" /> -->

      <p class="text-sm font-semibold text-black/60">
        <span v-if="habits.length">Total of {{ habits.length }} habits</span>
        <span v-else>0 habit</span>
      </p>

      <div v-if="habits.length" class="flex flex-col items-center gap-4">
        <div
          class="relative flex flex-col items-center md:scale-100 scale-115 cursor-pointer md:hover:scale-105 hover:scale-120 duration-300 md:active:scale-100 active:scale-115"
          @click="showBlocks = true">
          <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`">
            <g v-for="slice in slices" :key="slice.color">
              <path :d="slice.path" :fill="slice.color" class="transition-all duration-500" />
            </g>
          </svg>
        </div>

        <!-- Legend: color dot + count -->
        <div class="grid grid-cols-2 gap-1 w-full">
          <div v-for="seg in segments" :key="seg.color" class="flex items-center gap-2">
            <div class="size-2.5 rounded-full shrink-0" :style="{ backgroundColor: seg.color }" />
            <span class="text-sm font-medium text-black/60">{{ seg.count }} 
              <!-- {{ seg.count === 1 ? 'habit' : 'habits'}} -->
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
              <Skeleton width="0.625rem" height="0.625rem" rounded="9999px" />
              <Skeleton height="0.875rem" :width="`${40 + (i * 13) % 30}%`" />
            </div>
          </div>
        </div>
      </section>
    </template>
  </ClientOnly>
</template>