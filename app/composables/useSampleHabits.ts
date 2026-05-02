// composables/useSampleHabits.ts
import type { Habit, HabitCompletion } from '~/types/habit'
import { format, differenceInDays } from 'date-fns'

const defaultSampleHabits: Habit[] = [
  {
    id: 'sample-1',
    name: 'Morning Meditation',
    time: 'morning',
    streak: 0,
    completions: [],
    color: '#a8d8a8',
    createdAt: new Date().toISOString(),
  },
]

export function useSampleHabits() {
  const sampleHabits = useCookie<Habit[]>('sample_habits', {
    default: () => defaultSampleHabits,
    maxAge: 60 * 60 * 24 * 30,
  })

  const calculateStreak = (completions: HabitCompletion[]) => {
    const sortedDates = [...completions]
      .map(c => c.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const date of sortedDates) {
      const completionDate = new Date(date)
      completionDate.setHours(0, 0, 0, 0)

      const diff = differenceInDays(currentDate, completionDate)
      if (diff > 1) break

      streak += 1
      currentDate = completionDate
    }

    return streak
  }

  const getActiveCompletions = (completions: HabitCompletion[]): HabitCompletion[] => {
    if (!completions.length) return []

    const sorted = [...completions].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastCompletion = new Date(sorted[0]!.date)
    lastCompletion.setHours(0, 0, 0, 0)
    if (differenceInDays(today, lastCompletion) > 1) return []

    const active: HabitCompletion[] = [sorted[0]!]
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = new Date(sorted[i]!.date)
      const next = new Date(sorted[i + 1]!.date)
      current.setHours(0, 0, 0, 0)
      next.setHours(0, 0, 0, 0)

      if (differenceInDays(current, next) === 1) {
        active.push(sorted[i + 1]!)
      } else {
        break
      }
    }

    return active
  }

  const resetStaleStreaks = () => {
    sampleHabits.value = sampleHabits.value.map((h: Habit) => {
      const activeCompletions = getActiveCompletions(h.completions)
      const streak = calculateStreak(activeCompletions)
      return { ...h, completions: activeCompletions, streak }
    })
  }

  const toggleCompletion = (habit: Habit) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const index = sampleHabits.value.findIndex((h: Habit) => h.id === habit.id)
    if (index === -1) return

    const completions = sampleHabits.value[index]!.completions
    const alreadyCompleted = completions.some(c => c.date === today)

    const updatedCompletions: HabitCompletion[] = alreadyCompleted
      ? completions.filter(c => c.date !== today)
      : [...completions, { date: today, completedAt: new Date().toISOString() }]

    sampleHabits.value = sampleHabits.value.map((h: Habit) =>
      h.id === habit.id
        ? { ...h, completions: updatedCompletions, streak: calculateStreak(updatedCompletions) }
        : h
    )
  }

  resetStaleStreaks()

  return { sampleHabits, toggleCompletion }
}