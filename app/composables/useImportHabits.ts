// composables/useImportHabits.ts
import type { Habit } from '~/types/habit'

interface ImportPayload {
  exportedAt: string
  uid: string
  level: { totalXp: number; hash: string }
  habits: Habit[]
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
      // parse json
      const text = await file.text()
      const payload = JSON.parse(text) as ImportPayload

      // validate shape
      if (!payload.uid || !Array.isArray(payload.habits) || !payload.level) {
        throw new Error('INVALID_FORMAT')
      }

      // verify uid matches current user
      const { $firebase } = useNuxtApp()
      const currentUid = ($firebase.auth as any).currentUser?.uid
      if (!currentUid) throw new Error('NOT_LOGGED_IN')
      if (payload.uid !== currentUid) throw new Error('UID_MISMATCH')

      // verify level hash
      const { uid, level } = payload
      const encoder = new TextEncoder()
      const data = encoder.encode(`${uid}:${level.totalXp}`)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const expectedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      if (level.hash !== expectedHash) throw new Error('TAMPERED')

      // import habits directly to firestore (bypass daily limit)
      const { addDoc, setDoc, doc } = await import('firebase/firestore')
      for (const habit of payload.habits) {
        const { id, ...habitData } = habit
        const docRef = await addDoc(habitStore.getHabitsCollection(), habitData)
        habitStore.habits.push({ id: docRef.id, ...habitData })
      }

      // restore level/xp
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