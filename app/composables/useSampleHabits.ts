// composables/useSampleHabits.ts
import type { Habit } from '~/types/habit'
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

// 👈 helper to safely get date string from any completion format
const getDate = (c: any): string => typeof c === 'string' ? c : c?.date ?? ''

export function useSampleHabits() {
  const sampleHabits = useCookie<Habit[]>('sample_habits', {
    default: () => defaultSampleHabits,
    maxAge: 60 * 60 * 24 * 30,
  })

  const calculateStreak = (completions: any[]) => {
    const sortedDates = [...completions]
      .map(c => getDate(c))
      .filter(Boolean)
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

  const getActiveCompletions = (completions: any[]): any[] => {
    if (!completions.length) return []

    const sorted = [...completions].sort((a, b) =>
      new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime()
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastCompletion = new Date(getDate(sorted[0]))
    lastCompletion.setHours(0, 0, 0, 0)
    if (differenceInDays(today, lastCompletion) > 1) return []

    const active: any[] = [sorted[0]!]
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = new Date(getDate(sorted[i]))
      const next = new Date(getDate(sorted[i + 1]))
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
    const alreadyCompleted = completions.some(c => getDate(c) === today)

    // 👈 store as simple string to match useHabitStats format
    const updatedCompletions = alreadyCompleted
      ? completions.filter(c => getDate(c) !== today)
      : [...completions, today]

    sampleHabits.value = sampleHabits.value.map((h: Habit) =>
      h.id === habit.id
        ? { ...h, completions: updatedCompletions as Habit['completions'], streak: calculateStreak(updatedCompletions) }
        : h
    )
  }

  const reorder = (newOrder: string[]) => {
    sampleHabits.value = newOrder
      .map(id => sampleHabits.value.find((h: Habit) => h.id === id))
      .filter(Boolean) as Habit[]
  }

  // clear cookie if format is inconsistent (migration guard)
  if (sampleHabits.value.some(h =>
    h.completions.some(c => typeof c === 'object' && !('date' in c))
  )) {
    sampleHabits.value = defaultSampleHabits
  }

  resetStaleStreaks()

  return { sampleHabits, toggleCompletion, reorder }
}