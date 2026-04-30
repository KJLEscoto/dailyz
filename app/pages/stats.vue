<script setup lang="ts">
import { format, subDays } from 'date-fns'
import { onClickOutside } from '@vueuse/core' // 👈

definePageMeta({ layout: 'auth' })

const habitStore = useHabitStore()
const habits = computed(() => habitStore.habits)

const highestStreak = computed(() =>
  habits.value.reduce((max, habit) => Math.max(max, habit.streak), 0)
)

const countHighestStreak = computed(() => {
  const maxStreak = highestStreak.value
  return habits.value.filter(habit => habit.streak === maxStreak).length
})

const hoveredDay = ref<number | null>(null)
const selectedDay = ref<number | null>(null)
const chartRef = ref(null) // 👈

const toggleSelected = (index: number) => {
  selectedDay.value = selectedDay.value === index ? null : index
}

const isActive = (index: number) => hoveredDay.value === index || selectedDay.value === index

// 👇 dismiss on click outside
onClickOutside(chartRef, () => {
  selectedDay.value = null
})

const weeklyData = computed(() => {
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  return Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayLabel = format(date, 'EEE').charAt(0)

    const completed = habits.value.filter(h => h.completions?.includes(dateStr)).length
    const total = habits.value.length
    const isToday = dateStr === todayStr

    return { day: dayLabel, completed, total, percentage: total === 0 ? 0 : Math.round((completed / total) * 100), isToday }
  })
})
</script>

<template>
  <div class="grid grid-cols-2 gap-4">


    <section class="bg-white rounded-3xl p-6 flex flex-col gap-2 justify-center">
      <p class="text-sm font-semibold text-black/60">Days Current Streak</p>
      <div :class="['text-5xl font-bold', highestStreak >= 3 ? 'text-red-500' : 'text-green-500']">
        {{ highestStreak }}<span v-if="highestStreak >= 3">🔥</span><span v-else>🍀</span>
      </div>
      <p class="text-sm text-black/60">In <span class="font-bold text-primary text-lg">{{ countHighestStreak }}</span> habits. Keep it up!</p>
    </section>

    <section class="row-span-2 h-full">
      <AuthStatsDonut :habits="habits" />
    </section>

    <!-- Weekly Completion Chart -->
    <section class="bg-white rounded-3xl p-6 flex flex-col gap-3 justify-center">
      <p class="text-sm font-semibold text-black/60">Weekly Completion</p>
      <div ref="chartRef" class="flex items-end justify-between gap-1 h-20"> <!-- 👈 -->
        <div v-for="(day, index) in weeklyData" :key="day.day"
          class="flex flex-col items-center gap-1 flex-1 relative group cursor-pointer" @mouseenter="hoveredDay = index"
          @mouseleave="hoveredDay = null" @click="toggleSelected(index)">
          <!-- Tooltip -->
          <div v-if="isActive(index)"
            class="absolute top-5 left-1/2 -translate-x-1/2 bg-white text-primary shadow text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap z-10">
            {{ day.percentage }}%
          </div>

          <div class="w-full rounded-t-md relative flex items-end"
            :class="day.isToday ? 'bg-primary/30' : 'bg-primary/5'" style="height: 64px">
            <div class="w-full rounded-t-md transition-all duration-500"
              :class="day.isToday ? 'bg-primary' : 'bg-primary/30'" :style="{ height: `${day.percentage}%` }" />
          </div>
          <span class="text-xs font-semibold" :class="day.isToday ? 'text-primary font-bold' : 'text-black/30'">
            {{ day.day }}
          </span>
        </div>
      </div>
    </section>

    <!-- calendar -->
    <section class="col-span-2">
      <AuthStatsCalendar :habits="habits" />
    </section>
  </div>
</template>