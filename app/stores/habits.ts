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

    // helper to get the habits collection path for the current user
    getHabitsCollection() {
      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore
      const auth = $firebase.auth as Auth

      const uid = auth.currentUser?.uid
      if (!uid) throw new Error('User not logged in')

      return collection(db, 'users', uid, 'habits') // 👈 users/{uid}/habits
    },

    // helper to get a single habit doc ref
    getHabitDoc(id: Habit['id']) {
      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore
      const auth = $firebase.auth as Auth

      const uid = auth.currentUser?.uid
      if (!uid) throw new Error('User not logged in')

      return doc(db, 'users', uid, 'habits', id) // 👈 users/{uid}/habits/{id}
    },

    // fetch all habits
    async fetchHabits() {
      if (!import.meta.client) return

      this.loading = true
      try {
        const snapshot = await getDocs(this.getHabitsCollection())
        this.habits = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Habit))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // 👈 sort by order
      } catch (error) {
        console.error('fetchHabits error:', error)
      } finally {
        this.loading = false
      }
    },

    // add new habit
    async addHabit(Habit: Habit) {
      if (!import.meta.client) return

      const habit = {
        name: Habit.name,
        time: Habit.time as HabitTime,
        streak: 0,
        completions: [],
        color: Habit.color,
        createdAt: new Date().toISOString(),
        order: this.habits.length
      }

      const docRef = await addDoc(this.getHabitsCollection(), habit)
      this.habits.push({ id: docRef.id, ...habit })
    },

    // update habit
    async updateHabit(id: Habit['id'], updates: any) {
      const docRef = this.getHabitDoc(id)
      await updateDoc(docRef, updates)

      const index = this.habits.findIndex((habit) => habit.id === id)
      if (index !== -1) {
        this.habits[index] = { ...this.habits[index], ...updates }
      }
    },

    // delete habit
    async deleteHabit(id: Habit['id']) {
      if (!import.meta.client) return

      const docRef = this.getHabitDoc(id)
      await deleteDoc(docRef)
      this.habits = this.habits.filter((habit) => habit.id !== id)
    },

    // complete a habit for today
  async toggleCompletion(habit: Habit) {
    const today = format(new Date(), 'yyyy-MM-dd')

    // 👈 work on a copy, not the original
    const updatedCompletions = habit.completions.includes(today)
      ? habit.completions.filter(date => date !== today)
      : [...habit.completions, today]

    const updatedStreak = this.calculateStreak(updatedCompletions)

    // 👈 await the update
    await this.updateHabit(habit.id, {
      completions: updatedCompletions,
      streak: updatedStreak
    })
  },

    calculateStreak(completions: Habit['completions']) {
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
    },

    async resetStaleStreaks() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (const habit of this.habits) {
        if (!habit.completions?.length) {
          if (habit.streak !== 0) await this.updateHabit(habit.id, { streak: 0 })
          continue
        }

        const sortedDates = [...habit.completions].sort((a, b) =>
          new Date(b).getTime() - new Date(a).getTime()
        )
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

    // save order to Firestore
    async saveOrder(newOrder: string[]) {
      // update local state immediately
      const reordered = newOrder
        .map(id => this.habits.find(h => h.id === id))
        .filter(Boolean) as Habit[]
      const rest = this.habits.filter(h => !newOrder.includes(h.id))
      this.habits = [...reordered, ...rest]

      // persist each habit's order to Firestore in parallel
      await Promise.all(
        newOrder.map((id, index) => {
          const docRef = this.getHabitDoc(id)
          return updateDoc(docRef, { order: index })
        })
      )
    },
  }
})