export type HabitTime = 'morning' | 'afternoon' | 'evening' | 'anytime'

export interface Habit {
  id: any
  name: string
  time: HabitTime
  streak: number
  streakStarted: string
  completed: boolean
  color: string
  createdAt: string
}