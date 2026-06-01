// stores/level.ts
import { defineStore } from 'pinia'
import { watch } from 'vue'
import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore'
import type { Auth } from 'firebase/auth'
import type { Level, LevelMeta } from '~/types/level'
import { LEVEL_TIERS, XP_PER_COMPLETION } from '~/types/level'

const DEFAULT_PRIMARY = '#c87235'
const COOKIE_KEY = 'level-color'

const applyLevelColor = (color: string) => {
  if (import.meta.client) {
    document.documentElement.style.setProperty('--color-primary', color)
    const cookie = useCookie(COOKIE_KEY, { maxAge: 60 * 60 * 24 * 365 })
    cookie.value = color
  }
}

let tierWatcherStarted = false  // module-level flag — survives store resets

export const useLevelStore = defineStore('levelStore', {
  state: () => ({
    totalXp: 0,
    loading: false,
  }),

  getters: {
    currentTier(state): LevelMeta {
      return [...LEVEL_TIERS].reverse().find(t => state.totalXp >= t.minXp) ?? LEVEL_TIERS[0]!
    },
    nextTier(): LevelMeta | null {
      const idx = LEVEL_TIERS.findIndex(t => t === this.currentTier)
      return LEVEL_TIERS[idx + 1] ?? null
    },
    xpIntoCurrentTier(): number {
      return this.totalXp - this.currentTier.minXp
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

    _startTierWatcher() {
      if (tierWatcherStarted || !import.meta.client) return
      tierWatcherStarted = true
      watch(
        () => this.currentTier,
        (tier) => applyLevelColor(tier.color),
        { immediate: true }
      )
    },

    async fetchLevel() {
      if (!import.meta.client || this.loading) return
      this.loading = true
      try {
        const snap = await getDoc(this.getLevelDoc())
        if (snap.exists()) {
          this.totalXp = (snap.data() as Level).totalXp ?? 0
        } else {
          await setDoc(this.getLevelDoc(), { totalXp: 0 })
          this.totalXp = 0
        }
        this._startTierWatcher()
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
      // no need to call applyLevelColor here — the watcher handles it
    },

    async addXp()    { await this._adjustXp(+XP_PER_COMPLETION) },
    async removeXp() { await this._adjustXp(-XP_PER_COMPLETION) },

    resetLevelColor() {
      tierWatcherStarted = false
      const cookie = useCookie(COOKIE_KEY)
      cookie.value = null
      applyLevelColor(DEFAULT_PRIMARY)
    },
  },
})