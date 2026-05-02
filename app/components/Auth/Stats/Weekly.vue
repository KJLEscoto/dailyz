<!-- components/Auth/Stats/Weekly.vue -->
<script setup lang="ts">
import { format, subDays } from 'date-fns'
import { onClickOutside } from '@vueuse/core'
import type { Habit } from '~/types/habit'

const props = defineProps<{
  habits: Habit[]
}>()

const hoveredDay = ref<number | null>(null)
const selectedDay = ref<number | null>(null)
const chartRef = ref(null)

const toggleSelected = (index: number) => {
  selectedDay.value = selectedDay.value === index ? null : index
}

const isActive = (index: number) => hoveredDay.value === index || selectedDay.value === index

onClickOutside(chartRef, () => {
  selectedDay.value = null
})

const weeklyData = computed(() => {
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  return Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayLabel = format(date, 'EEE').charAt(0)
    const isToday = dateStr === todayStr

    // 👇 only count habits that existed on that day
    const existingHabits = props.habits.filter(h => {
      const createdDate = format(new Date(h.createdAt), 'yyyy-MM-dd')
      return createdDate <= dateStr
    })

    const completed = existingHabits.filter(h => h.completions?.some(c => c.date === dateStr)).length
    const total = existingHabits.length

    return {
      day: dayLabel,
      completed,
      total,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      isToday,
    }
  })
})
</script>

<template>
  <section class="bg-white rounded-3xl md:p-6 p-4 flex flex-col gap-3 justify-between h-full w-full">
    <p class="text-sm font-semibold text-black/60">Weekly Completion</p>
    <div ref="chartRef" class="flex items-end justify-between gap-1 h-20">
      <div v-for="(day, index) in weeklyData" :key="day.day"
        class="flex flex-col items-center gap-1 flex-1 relative group cursor-pointer" @mouseenter="hoveredDay = index"
        @mouseleave="hoveredDay = null" @click="toggleSelected(index)">
        <!-- Tooltip -->
        <div v-if="isActive(index)"
          class="absolute top-5 left-1/2 -translate-x-1/2 bg-white text-primary shadow text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap z-10">
          {{ day.percentage }}%
        </div>

        <div class="w-full rounded-t-md relative flex items-end bg-primary/5" style="height: 64px">
          <div class="w-full rounded-t-md transition-all duration-500"
            :class="day.isToday ? 'bg-primary' : 'bg-primary/20'" :style="{ height: `${day.percentage}%` }" />
        </div>
        <span class="text-xs font-semibold" :class="day.isToday ? 'text-primary font-bold' : 'text-black/30'">
          {{ day.day }}
        </span>
      </div>
    </div>
  </section>
</template>