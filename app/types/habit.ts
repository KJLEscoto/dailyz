export type HabitTime = 'morning' | 'afternoon' | 'evening' | 'anytime'

export interface Habit {
  id: number | string
  name: string
  time: HabitTime
  streak: number
  streakStarted: string
  completed: boolean
  color: string
  createdAt: string
}