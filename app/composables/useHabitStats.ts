// composables/useHabitStats.ts
import { computed } from 'vue'
import { format } from 'date-fns'
import type { Habit } from '~/types/habit'

export function useHabitStats(habits: ComputedRef<Habit[]>) {
  const today = () => format(new Date(), 'yyyy-MM-dd')

  const getDate = (c: any) => typeof c === 'string' ? c : c.date

  const todoHabits = computed(() =>
    habits.value
      .filter(h => !h.completions?.some(c => getDate(c) === today()))
      .sort((a, b) => {
        const aTime = a.uncompletedAt ? new Date(a.uncompletedAt).getTime() : 0
        const bTime = b.uncompletedAt ? new Date(b.uncompletedAt).getTime() : 0

        if (bTime !== aTime) return bTime - aTime // 👈 most recently uncompleted first

        // fallback for habits never completed
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
  )

  const completedHabits = computed(() =>
    habits.value
      .filter(h => h.completions?.some(c => getDate(c) === today()))
      .sort((a, b) => {
        const aCompletion = a.completions.find(c => getDate(c) === today())
        const bCompletion = b.completions.find(c => getDate(c) === today())

        const aTime = typeof aCompletion === 'string' ? aCompletion : aCompletion?.completedAt ?? ''
        const bTime = typeof bCompletion === 'string' ? bCompletion : bCompletion?.completedAt ?? ''

        return new Date(bTime).getTime() - new Date(aTime).getTime() // 👈 most recent first
      })
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