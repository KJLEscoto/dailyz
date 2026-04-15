// composables/useHabitStats.ts
import { computed } from 'vue'
import { format } from 'date-fns'
import type { Habit } from '~/types/habit'

export function useHabitStats(habits: ComputedRef<Habit[]>) {
  const today = () => format(new Date(), 'yyyy-MM-dd')

  const todoHabits = computed(() =>
    habits.value.filter(h => !h.completions?.includes(today()))
  )

  const completedHabits = computed(() =>
    habits.value.filter(h => h.completions?.includes(today()))
  )

  const habitsCount = computed(() => habits.value.length)
  const todoCount = computed(() => todoHabits.value.length)
  const completedCount = computed(() => completedHabits.value.length)

  const percentageCompleted = computed(() => {
    const total = habits.value.length
    const done = completedHabits.value.length
    return total === 0 ? 0 : Math.round((done / total) * 100)
  })

  const highestStreak = computed(() =>
    habits.value.reduce((max, h) => (h.streak > max ? h.streak : max), 0)
  )

  return {
    todoHabits,
    completedHabits,
    habitsCount,
    todoCount,
    completedCount,
    percentageCompleted,
    highestStreak,
  }
}