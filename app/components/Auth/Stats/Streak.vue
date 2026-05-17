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
    <section :class="['rounded-3xl md:p-6 p-4 flex flex-col gap-3 justify-between h-full w-full', !highestStreak ? 'bg-white text-black/60' : highestStreak >= 3 ? 'bg-[#FFD8D8] text-red-500' : 'bg-[#E5F8E0] text-green-600']">
      <p class="text-sm font-semibold">Current Streak</p>
      <div class="space-y-2" v-if="countHighestStreak > 0">
        <div class="text-5xl font-bold flex items-center gap-2">
          {{ highestStreak }}
          <span v-if="highestStreak >= 3">
            <Image src="/gif/fire2.gif" alt="Fire" class="w-12! shrink-0 pointer-events-none" />
          </span>
          <span v-else>
            <Image src="/gif/clover.gif" alt="Clover" class="w-12! shrink-0 pointer-events-none" />
          </span>
        </div>

        <!-- display this only if there are streaks -->
        <p class="text-sm">
            In <span class="font-bold text-lg">{{ countHighestStreak }}</span>
            <span v-if="countHighestStreak <= 1"> habit</span>
            <span v-else> habits</span>.
            Keep it up!
        </p>
      </div>

      <div v-else class="rounded-xl px-4 py-2 bg-foreground h-full">
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