// composables/useImportHabits.ts
import type { Habit } from '~/types/habit'

interface ImportPayload {
  exportedAt: string
  uid: string
  hash: string // 👈 moved to top-level
  level: { totalXp: number }
  habits: Habit[]
}

const recalculateStreak = (completions: Habit['completions']): number => {
  if (!completions?.length) return 0

  const dates = [...new Set(completions.map(c => c.date))].sort((a, b) => b.localeCompare(a))

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  if (dates[0] !== today && dates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] as string)
    const curr = new Date(dates[i] as string)
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000)
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export const useImportHabits = () => {
  const habitStore = useHabitStore()
  const levelStore = useLevelStore()

  const importing = ref(false)
  const error = ref<string | null>(null)

  const importHabits = async (file: File) => {
    importing.value = true
    error.value = null

    try {
      const text = await file.text()
      const payload = JSON.parse(text) as ImportPayload

      if (!payload.uid || !payload.hash || !Array.isArray(payload.habits) || !payload.level) {
        throw new Error('INVALID_FORMAT')
      }

      const { $firebase } = useNuxtApp()
      const currentUid = ($firebase.auth as any).currentUser?.uid
      if (!currentUid) throw new Error('NOT_LOGGED_IN')
      if (payload.uid !== currentUid) throw new Error('UID_MISMATCH')

      // verify overall hash
      const encoder = new TextEncoder()
      const raw = JSON.stringify({ uid: payload.uid, totalXp: payload.level.totalXp, habits: payload.habits })
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(raw))
      const expectedHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      if (payload.hash !== expectedHash) throw new Error('TAMPERED')

      // import habits with recalculated streak
      const { addDoc, setDoc, doc } = await import('firebase/firestore')
      for (const habit of payload.habits) {
        const { id, ...habitData } = habit
        const correctedHabit = {
          ...habitData,
          streak: recalculateStreak(habitData.completions), // 👈 always recalculate
        }
        const docRef = await addDoc(habitStore.getHabitsCollection(), correctedHabit)
        habitStore.habits.push({ id: docRef.id, ...correctedHabit })
      }

      // restore level/xp
      const { uid, level } = payload  // 👈 add this line
      const levelRef = doc($firebase.db, 'users', uid, 'level', 'data')
      await setDoc(levelRef, { totalXp: level.totalXp })
      levelStore.totalXp = level.totalXp

      return { imported: payload.habits.length }
    } catch (e: any) {
      if (e.message === 'UID_MISMATCH') {
        error.value = 'This file belongs to a different account.'
      } else if (e.message === 'INVALID_FORMAT') {
        error.value = 'Invalid file format. Please use a valid exported JSON file.'
      } else if (e.message === 'NOT_LOGGED_IN') {
        error.value = 'You must be logged in to import data.'
      } else if (e.message === 'TAMPERED') {
        error.value = 'This file has been modified and cannot be imported.'
      } else {
        error.value = 'Something went wrong while importing.'
      }
      return null
    } finally {
      importing.value = false
    }
  }

  return { importHabits, importing, error }
}