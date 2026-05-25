import { defineStore } from 'pinia'
import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore'
import type { Auth } from 'firebase/auth'
import type { Level, LevelMeta } from '~/types/level'
import { LEVEL_TIERS, XP_PER_COMPLETION } from '~/types/level'

export const useLevelStore = defineStore('levelStore', {
  state: () => ({
    totalXp: 0,
    loading: false,
  }),

  getters: {
    currentTier(state) {
      return [...LEVEL_TIERS].reverse().find(t => state.totalXp >= t.minXp) ?? LEVEL_TIERS[0]!
    },
    nextTier(state): LevelMeta | null {
      const idx = LEVEL_TIERS.findIndex(t => t === this.currentTier)
      return LEVEL_TIERS[idx + 1] ?? null
    },
    xpIntoCurrentTier(state): number {
      return state.totalXp - this.currentTier.minXp
    },
    xpNeededForNextTier(): number {
      if (!this.nextTier) return 1
      return this.nextTier.minXp - this.currentTier.minXp
    },
    progressPercent(): number {
      if (!this.nextTier) return 100
      return Math.min(100, Math.round((this.xpIntoCurrentTier / this.xpNeededForNextTier) * 100))
    },
  },

  actions: {
    getLevelDoc() {
      const { $firebase } = useNuxtApp()
      const db = $firebase.db as Firestore
      const auth = $firebase.auth as Auth
      const uid = auth.currentUser?.uid
      if (!uid) throw new Error('User not logged in')
      return doc(db, 'users', uid, 'level', 'data')
    },

    async fetchLevel() {
      if (!import.meta.client) return
      this.loading = true
      try {
        const snap = await getDoc(this.getLevelDoc())
        if (snap.exists()) {
          this.totalXp = (snap.data() as Level).totalXp ?? 0
        } else {
          // first time — create the doc
          await setDoc(this.getLevelDoc(), { totalXp: 0 })
          this.totalXp = 0
        }
      } catch (e) {
        console.error('fetchLevel error:', e)
      } finally {
        this.loading = false
      }
    },

    async _adjustXp(delta: number) {
      const newXp = Math.max(0, this.totalXp + delta)
      this.totalXp = newXp
      await setDoc(this.getLevelDoc(), { totalXp: newXp })
    },

    async addXp()    { await this._adjustXp(+XP_PER_COMPLETION) },
    async removeXp() { await this._adjustXp(-XP_PER_COMPLETION) },
  },
})