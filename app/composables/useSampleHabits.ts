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
  // 👈 persist in cookie — auto serializes/deserializes JSON
  const sampleHabits = useCookie<Habit[]>('sample_habits', {
    default: () => defaultSampleHabits,
    maxAge: 60 * 60 * 24 * 30, // 30 days
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

  const toggleCompletion = (habit: Habit) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const index = sampleHabits.value.findIndex((h: Habit) => h.id === habit.id)
    if (index === -1) return

    const completions = sampleHabits.value[index]!.completions
    const updatedCompletions = completions.includes(today)
      ? completions.filter((d: string) => d !== today)
      : [...completions, today]

    // 👈 replace entire array to trigger cookie reactivity
    sampleHabits.value = sampleHabits.value.map((h: Habit) =>
      h.id === habit.id
        ? { ...h, completions: updatedCompletions, streak: calculateStreak(updatedCompletions) }
        : h
    )
  }

  const reorder = (newOrder: string[]) => {
  // sort sampleHabits based on the new order
  sampleHabits.value = newOrder
    .map(id => sampleHabits.value.find((h: Habit) => h.id === id))
    .filter(Boolean) as Habit[]
}

  return { sampleHabits, toggleCompletion, reorder }
}