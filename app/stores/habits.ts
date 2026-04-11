import { defineStore } from 'pinia'
import type { Habit, HabitTime } from '~/types/habit'
import { addDoc, getDocs, doc, deleteDoc, updateDoc, collection, type Firestore } from 'firebase/firestore'
import { format } from 'date-fns'

export const useHabitStore = defineStore('habitStore', {
  state: () => ({
    habits: [] as Habit[],
    loading: false,
  }),
  actions: {

    // fetch all habits
    async fetchHabits() {
      if (!import.meta.client) return

      this.loading = true
      try {
        const { $firebase } = useNuxtApp()
        const db = $firebase.db as Firestore

        const snapshot = await getDocs(collection(db, 'habits'))
        this.habits = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Habit[]
      } catch (error) {
        console.error('fetchHabits error:', error)
      } finally {
        this.loading = false
      }
    },

    // add new habit
    async addHabit(Habit: Habit) {
      if (!import.meta.client) return

      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore

      const habit = {
        name: Habit.name,
        time: Habit.time as HabitTime,
        streak: 0,
        streakStarted: '',
        completions: [],
        color: Habit.color,
        createdAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, 'habits'), habit)
      this.habits.push({ id: docRef.id, ...habit })
    },

    // update habit
    async updateHabit(id: Habit['id'], updates: any) {
      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore

      const docRef = doc(db, 'habits', id)
      await updateDoc(docRef, updates)

      const index = this.habits.findIndex((habit) => habit.id === id)
      if (index !== -1) {
        this.habits[index] = { ...this.habits[index], ...updates }
      }
    },

    // delete habit
    async deleteHabit(id: Habit['id']) {
      if (!import.meta.client) return

      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore

      const docRef = doc(db, 'habits', id)
      await deleteDoc(docRef)
      this.habits = this.habits.filter((habit) => habit.id !== id)
    },

    // complete a habit for today
    async toggleCompletion(habit: Habit) {
      const today = format(new Date(), 'yyyy-MM-dd')

      if (habit.completions.includes(today)) {
        habit.completions = habit.completions.filter(date => date !== today)
        // habit.streak = Math.max(0, habit.streak - 1)
      } else {
        habit.completions.push(today)
      }

      this.updateHabit(habit.id, { 
        completions: habit.completions 
      })
    }
  }
})