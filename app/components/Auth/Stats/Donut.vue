<script setup lang="ts">
import type { Habit } from '~/types/habit'

const props = defineProps<{
  habits: Habit[]
}>()

const TIME_LABELS: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  anytime: 'Anytime',
}

const segments = computed(() => {
  const groups: Record<string, { count: number; color: string }> = {}

  props.habits.forEach(habit => {
    const time = habit.time ?? 'anytime'
    if (!groups[time]) {
      groups[time] = { count: 0, color: habit.color } // 👈 first habit's color per group
    }
    groups[time]!.count++
  })

  return Object.entries(groups).map(([time, data]) => ({
    time,
    count: data.count,
    color: data.color,
    label: TIME_LABELS[time] ?? time,
    percentage: Math.round((data.count / props.habits.length) * 100),
  }))
})

const SIZE = 100
const RADIUS = 42
const STROKE = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const CENTER = SIZE / 2

const arcs = computed(() => {
  let offset = 0
  return segments.value.map(seg => {
    const dash = (seg.percentage / 100) * CIRCUMFERENCE
    const gap = CIRCUMFERENCE - dash
    const arc = { ...seg, dash, gap, offset }
    offset += dash
    return arc
  })
})
</script>

<template>
  <section class="bg-white rounded-3xl p-6 flex flex-col gap-4 h-full relative overflow-hidden">
    <img class="shrink-0 absolute bottom-0 right-0 w-auto h-32" src="/images/mascot/crop_donut_model.png" alt="Donut Model" />

    <p class="text-sm font-semibold text-black/60">Habits by Time</p>

    <div v-if="habits.length" class="flex flex-col items-start gap-4">
      <!-- Donut SVG -->
      <div class="shrink-0 relative flex items-center justify-center w-full">
        <svg :width="SIZE * 1.6" :height="SIZE * 1.2" :viewBox="`0 0 ${SIZE} ${SIZE}`">
          <circle :cx="CENTER" :cy="CENTER" :r="RADIUS" fill="none" stroke="#f0f0f0" :stroke-width="STROKE" />
          <circle v-for="arc in arcs" :key="arc.time" :cx="CENTER" :cy="CENTER" :r="RADIUS" fill="none"
            :stroke="arc.color" :stroke-width="STROKE" :stroke-dasharray="`${arc.dash} ${arc.gap}`"
            :stroke-dashoffset="-arc.offset" stroke-linecap="butt"
            style="transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dasharray 0.5s ease" />
        </svg>
      </div>

      <!-- Legend -->
      <div class="flex flex-col gap-2 flex-1 min-w-0">
        <div v-for="seg in segments" :key="seg.time" class="flex items-center gap-2">
          <span class="size-2.5 rounded-full shrink-0" :style="{ backgroundColor: seg.color }" />
          <span class="text-xs text-black/60 flex-1">{{ seg.label }}</span>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-4">
      <p class="text-sm text-black/30">No habits yet.</p>
    </div>
  </section>
</template>