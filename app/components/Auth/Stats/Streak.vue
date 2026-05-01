<!-- components/Auth/Stats/Streak.vue -->
<script setup lang="ts">
import type { Habit } from '~/types/habit'

const props = defineProps<{
  habits: Habit[]
}>()

const highestStreak = computed(() =>
  props.habits.reduce((max, habit) => Math.max(max, habit.streak), 0)
)

const countHighestStreak = computed(() => {
  const maxStreak = highestStreak.value
  return props.habits.filter(habit => habit.streak === maxStreak).length
})
</script>

<template>
  <section class="bg-white rounded-3xl p-6 flex flex-col gap-2 justify-center">
    <p class="text-sm font-semibold text-black/60">Days Current Streak</p>
    <div :class="['text-5xl font-bold', highestStreak >= 3 ? 'text-red-500' : 'text-green-500']">
      {{ highestStreak }}<span v-if="highestStreak >= 3">🔥</span><span v-else>🍀</span>
    </div>
    <p class="text-sm text-black/60">
      In <span class="font-bold text-primary text-lg">{{ countHighestStreak }}</span>
      <span v-if="countHighestStreak <= 1"> habit</span>
      <span v-else> habits</span>.
      Keep it up!
    </p>
  </section>
</template>