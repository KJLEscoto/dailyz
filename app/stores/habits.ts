// stores/habits.ts
import { defineStore } from 'pinia'
import type { Habit, HabitTime } from '~/types/habit'
import { addDoc, getDocs, doc, deleteDoc, updateDoc, collection, type Firestore } from 'firebase/firestore'
import { format, differenceInDays } from 'date-fns'
import type { Auth } from 'firebase/auth'

export const useHabitStore = defineStore('habitStore', {
  state: () => ({
    habits: [] as Habit[],
    loading: false,
  }),
  actions: {

    getHabitsCollection() {
      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore
      const auth = $firebase.auth as Auth

      const uid = auth.currentUser?.uid
      if (!uid) throw new Error('User not logged in')

      return collection(db, 'users', uid, 'habits')
    },

    getHabitDoc(id: Habit['id']) {
      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore
      const auth = $firebase.auth as Auth

      const uid = auth.currentUser?.uid
      if (!uid) throw new Error('User not logged in')

      return doc(db, 'users', uid, 'habits', id)
    },

    async fetchHabits() {
      if (!import.meta.client) return

      this.loading = true
      try {
        const snapshot = await getDocs(this.getHabitsCollection())
        this.habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit))
      } catch (error) {
        console.error('fetchHabits error:', error)
      } finally {
        this.loading = false
      }
    },

    async addHabit(Habit: Habit) {
      if (!import.meta.client) return

      const habit = {
        name: Habit.name,
        time: Habit.time as HabitTime,
        streak: 0,
        completions: [],
        color: Habit.color,
        createdAt: new Date().toISOString(),
      }

      const docRef = await addDoc(this.getHabitsCollection(), habit)
      this.habits.push({ id: docRef.id, ...habit })
    },

    async updateHabit(id: Habit['id'], updates: any) {
      const docRef = this.getHabitDoc(id)
      await updateDoc(docRef, updates)

      const index = this.habits.findIndex((habit) => habit.id === id)
      if (index !== -1) {
        this.habits[index] = { ...this.habits[index], ...updates }
      }
    },

    async deleteHabit(id: Habit['id']) {
      if (!import.meta.client) return

      const docRef = this.getHabitDoc(id)
      await deleteDoc(docRef)
      this.habits = this.habits.filter((habit) => habit.id !== id)
    },

    async toggleCompletion(habit: Habit) {
      const today = format(new Date(), 'yyyy-MM-dd')
      const isCompletingToday = !habit.completions.some(c => c.date === today)

      const updatedCompletions = isCompletingToday
        ? [...habit.completions, { date: today, completedAt: new Date().toISOString() }]
        : habit.completions.filter(c => c.date !== today)

      const updatedStreak = this.calculateStreak(updatedCompletions)

      await this.updateHabit(habit.id, {
        completions: updatedCompletions,
        streak: updatedStreak,
        uncompletedAt: isCompletingToday ? null : new Date().toISOString(), // 👈
      })
    },

    calculateStreak(completions: Habit['completions']) {
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
    },

    async resetStaleStreaks() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (const habit of this.habits) {
        if (!habit.completions?.length) {
          if (habit.streak !== 0) await this.updateHabit(habit.id, { streak: 0 })
          continue
        }

        const sortedDates = [...habit.completions]
          .map(c => c.date)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

        const lastCompletion = new Date(sortedDates[0] as string)
        lastCompletion.setHours(0, 0, 0, 0)

        const diffDays = Math.floor((today.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays > 1) {
          if (habit.streak !== 0) await this.updateHabit(habit.id, { streak: 0 })
          continue
        }

        const recalculated = this.calculateStreak(habit.completions)
        if (habit.streak !== recalculated) {
          await this.updateHabit(habit.id, { streak: recalculated })
        }
      }
    },
  }
})