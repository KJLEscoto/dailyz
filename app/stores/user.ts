// stores/user.ts
import { defineStore } from 'pinia'
import { doc, setDoc, getDoc, type Firestore } from 'firebase/firestore'
import type { AppUser } from '~/types/user'
import type { Auth } from 'firebase/auth'

export const useUserStore = defineStore('userStore', {
  state: () => ({
    profile: null as AppUser | null,
    loading: false,
  }),
  actions: {
    async createUser(uid: string, data: Omit<AppUser, 'uid'>) {
      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore

      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)

      // don't overwrite if user already exists
      if (userDoc.exists()) {
        this.profile = { uid, ...userDoc.data() } as AppUser
        return
      }

      const newUser: AppUser = { uid, ...data }
      await setDoc(userRef, newUser)
      this.profile = newUser
    },

    async fetchUser(uid: string) {
      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore

      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        this.profile = { uid, ...userDoc.data() } as AppUser
      }
    },

    clearUser() {
      this.profile = null
    }
  }
})