// types/habit.ts
export type HabitTime = 'morning' | 'afternoon' | 'evening' | 'anytime'

export interface Habit {
  id: any
  name: string
  time: HabitTime
  streak: number
  completions: string[]
  color: string
  createdAt: string
  orderInToDo?: number
  orderInCompleted?: number
}