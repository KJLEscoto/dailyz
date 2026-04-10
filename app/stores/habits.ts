import { defineStore } from 'pinia'
import type { Habit, HabitTime } from '~/types/habit'
import { addDoc, getDocs, doc, deleteDoc, collection, type Firestore } from 'firebase/firestore'

export const useHabitStore = defineStore('habitStore', {
  state: () => ({
    habits: [] as Habit[],
  }),
  actions: {

    // fetch all habits
    async fetchHabits() {
      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore

      const snapshot =await getDocs(collection(db, 'habits'))
      this.habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Habit[]
    },

    // add new habit
    async addHabit(Habit: Habit) {
      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore

      const habit = {
        name: Habit.name,
        time: Habit.time as HabitTime,
        streak: 0,
        streakStarted: '',
        completed: false,
        color: Habit.color,
        createdAt: new Date().toISOString(),
      }

      const docRef =await addDoc(collection(db, 'habits'), habit)
      this.habits.push({ id: docRef.id, ...habit })
    },

    // update habit
    // updateHabit

    // delete habit
    async deleteHabit(id: any) {
      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore

      const docRef = doc(db, 'habits', id)
      await deleteDoc(docRef)
      this.habits = this.habits.filter((habit) => habit.id !== id)
    }
  }
})