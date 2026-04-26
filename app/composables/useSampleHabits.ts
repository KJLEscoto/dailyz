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
  {
    id: 'sample-2',
    name: 'Evening Walk',
    time: 'evening',
    streak: 0,
    completions: [],
    color: '#f9c784',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    name: 'Read 10 pages',
    time: 'afternoon',
    streak: 0,
    completions: [],
    color: '#c9b8e8',
    createdAt: new Date().toISOString(),
  },
]

export function useSampleHabits() {
  const sampleHabits = useCookie<Habit[]>('sample_habits', {
    default: () => defaultSampleHabits,
    maxAge: 60 * 60 * 24 * 30,
  })

  const calculateStreak = (completions: string[]) => {
    const sortedDates = [...completions].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

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

  // get the consecutive streak dates only (drop anything before a gap)
  const getActiveCompletions = (completions: string[]): string[] => {
    if (!completions.length) return []

    const sortedDates = [...completions].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // if last completion was more than 1 day ago, streak is broken — clear all
    const lastCompletion = new Date(sortedDates[0] as string)
    lastCompletion.setHours(0, 0, 0, 0)
    if (differenceInDays(today, lastCompletion) > 1) return []

    // keep only the consecutive streak dates
    const activeCompletions: string[] = [sortedDates[0] as string]
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = new Date(sortedDates[i] as string)
      const next = new Date(sortedDates[i + 1] as string)
      current.setHours(0, 0, 0, 0)
      next.setHours(0, 0, 0, 0)

      const diff = differenceInDays(current, next)
      if (diff === 1) {
        activeCompletions.push(sortedDates[i + 1] as string)
      } else {
        break // gap found — stop here
      }
    }

    return activeCompletions
  }

  // 👈 run on composable init — reset stale streaks and clean completions
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
    const updatedCompletions = completions.includes(today)
      ? completions.filter((d: string) => d !== today)
      : [...completions, today]

    sampleHabits.value = sampleHabits.value.map((h: Habit) =>
      h.id === habit.id
        ? { ...h, completions: updatedCompletions, streak: calculateStreak(updatedCompletions) }
        : h
    )
  }

  const reorder = (newOrder: string[]) => {
    sampleHabits.value = newOrder
      .map(id => sampleHabits.value.find((h: Habit) => h.id === id))
      .filter(Boolean) as Habit[]
  }

  // 👈 run immediately when composable is used
  resetStaleStreaks()

  return { sampleHabits, toggleCompletion, reorder }
}