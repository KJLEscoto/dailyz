// types/habit.ts
export type HabitTime = 'morning' | 'afternoon' | 'evening' | 'anytime'

export interface HabitCompletion {
  date: string
  completedAt: string
}

export interface Habit {
  id: any
  name: string
  time: HabitTime
  streak: number
  completions: HabitCompletion[]
  color: string
  createdAt: string
  uncompletedAt?: string // 👈 tracks when habit was last uncompleted today
}