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
  if (highestStreak.value === 0) return 0 // 👈 no active streaks
  return props.habits.filter(habit => habit.streak === highestStreak.value).length
})
</script>

<template>
  <ClientOnly>
    <section class="bg-white rounded-3xl md:p-6 p-4 flex flex-col gap-3 justify-between h-full w-full">
      <p class="text-sm font-semibold text-black/60">Current Streak</p>
      
      <div class="space-y-2" v-if="countHighestStreak > 0">
        <div :class="['text-5xl font-bold', highestStreak >= 3 ? 'text-red-500' : 'text-green-500']">
          {{ highestStreak }}<span v-if="highestStreak >= 3">🔥</span><span v-else>🍀</span>
        </div>

        <!-- display this only if there are streaks -->
        <p class="text-sm text-black/60">
            In <span class="font-bold text-primary text-lg">{{ countHighestStreak }}</span>
            <span v-if="countHighestStreak <= 1"> habit</span>
            <span v-else> habits</span>.
            Keep it up!
        </p>
      </div>

      <div v-else class="rounded-xl px-4 py-2 bg-foreground">
        <p class="text-sm text-black/60">No active streaks to track.</p>
      </div>
    </section>

    <template #fallback>
      <section class="bg-white rounded-3xl md:p-6 p-4 flex flex-col gap-3 h-full w-full">
        <Skeleton height="1rem" width="40%" />
        <Skeleton height="3.5rem" width="60%" />
        <Skeleton height="1rem" width="80%" />
      </section>
    </template>
  </ClientOnly>
</template>