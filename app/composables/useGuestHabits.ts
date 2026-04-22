// composables/useGuestHabits.ts
import type { Habit } from '~/types/habit'

const sampleHabits: Habit[] = [
  {
    id: 'sample-1',
    name: 'Morning Meditation',
    time: 'morning',
    streak: 2,
    completions: [
      "2026-04-20",
      "2026-04-21",
    ],
    color: '#a8d8a8',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    name: 'Evening Walk',
    time: 'evening',
    streak: 3,
    completions: [
      "2026-04-16",
      "2026-04-17",
      "2026-04-18",
    ],
    color: '#f9c784',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    name: 'Read 10 pages',
    time: 'afternoon',
    streak: 1,
    completions: [
      "2026-04-17",
    ],
    color: '#c9b8e8',
    createdAt: new Date().toISOString(),
  },
]

export function useGuestHabits() {
  // useCookie is Nuxt's built-in — auto serializes/deserializes JSON
  const guestHabits = useCookie<Habit[]>('guest-habits', {
    default: () => [],
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  const addGuestHabit = (habit: Habit) => {
    guestHabits.value = [...guestHabits.value, habit]
  }

  const toggleGuestCompletion = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0]
    guestHabits.value = guestHabits.value.map(h => {
      if (h.id !== habit.id) return h
      const completions = h.completions.includes(today)
        ? h.completions.filter(d => d !== today)
        : [...h.completions, today]
      return { ...h, completions }
    })
  }

  const deleteGuestHabit = (id: Habit['id']) => {
    guestHabits.value = guestHabits.value.filter(h => h.id !== id)
  }

  return { guestHabits, sampleHabits, addGuestHabit, toggleGuestCompletion, deleteGuestHabit }
}