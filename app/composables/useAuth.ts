// app/composables/useAuth.ts
import { signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'

let unsubscribe: (() => void) | null = null

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const authReady = useState<boolean>('auth-ready', () => false)
  const habitsReady = useState<boolean>('habits-ready', () => false)

  const initAuth = (onLogin?: (user: User) => void, onLogout?: () => void) => {
    if (unsubscribe) return

    const { $firebase } = useNuxtApp()

    unsubscribe = onAuthStateChanged($firebase.auth, (firebaseUser) => {
      user.value = firebaseUser
      authReady.value = true

      if (firebaseUser) {
        onLogin?.(firebaseUser)
      } else {
        onLogout?.()
      }
    })
  }

  const signInWithGoogle = async () => {
    const { $firebase } = useNuxtApp()
    const result = await signInWithPopup($firebase.auth, $firebase.provider)
    user.value = result.user

    const userStore = useUserStore()
    await userStore.createUser(result.user.uid, {
      fullName: result.user.displayName ?? '',
      email: result.user.email ?? '',
      photoURL: result.user.photoURL ?? '',
      createdAt: new Date().toISOString(),
    })

    const habitStore = useHabitStore()
    await habitStore.fetchHabits()
    await habitStore.resetStaleStreaks()
    habitsReady.value = true

    await navigateTo('/home')
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { $firebase } = useNuxtApp()
      const result = await signInWithEmailAndPassword($firebase.auth, email, password)
      user.value = result.user

      const habitStore = useHabitStore()
      await habitStore.fetchHabits()
      await habitStore.resetStaleStreaks()
      habitsReady.value = true

      await navigateTo('/home')
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { $firebase } = useNuxtApp()
    await $firebase.auth.signOut()
    user.value = null
    habitsReady.value = false
    await navigateTo('/')
  }

  return { user, authReady, habitsReady, initAuth, signIn, signInWithGoogle, signOut }
}