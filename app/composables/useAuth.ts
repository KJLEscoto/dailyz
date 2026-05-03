// composables/useAuth.ts
import { signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, updateProfile } from 'firebase/auth'
import type { User } from 'firebase/auth'

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const authReady = useState<boolean>('auth-ready', () => false)
  const habitsReady = useState<boolean>('habits-ready', () => false)

  const initAuth = (onLogin?: (user: User) => Promise<void>, onLogout?: () => void) => {
    const { $firebase } = useNuxtApp()

    // no cleanup needed — plugin lives for the entire app lifetime
    onAuthStateChanged($firebase.auth, async (firebaseUser) => {
      user.value = firebaseUser

      if (firebaseUser) {
        await onLogin?.(firebaseUser)
      } else {
        onLogout?.()
      }

      authReady.value = true
    })
  }

  const signInWithGoogle = async () => {
    try {
      const { $firebase } = useNuxtApp()
      const result = await signInWithPopup($firebase.auth, $firebase.provider)
      const firebaseUser = result.user

      // 👇 fetch existing Firestore user to get original name
      const { doc, getDoc, updateDoc } = await import('firebase/firestore')
      const userDocRef = doc($firebase.db, 'users', firebaseUser.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        // 👇 user already exists — preserve their original fullName
        const existingName = userDoc.data().fullName
        if (existingName && firebaseUser.displayName !== existingName) {
          await updateProfile(firebaseUser, { displayName: existingName })
        }
      } else {
        // 👇 new user — create with Google display name
        await useUserStore().createUser(firebaseUser.uid, {
          fullName: firebaseUser.displayName ?? '',
          email: firebaseUser.email ?? '',
          photoURL: firebaseUser.photoURL ?? '',
          createdAt: new Date().toISOString(),
        })
      }

      const habitStore = useHabitStore()
      await habitStore.fetchHabits()
      await habitStore.resetStaleStreaks()
      habitsReady.value = true

      user.value = $firebase.auth.currentUser
      await navigateTo('/home')
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return
      console.error('Google sign in error:', error)
    }
  }

  const signOutSuccess = useState<boolean>('sign-out-success', () => false)

  const signIn = async (email: string, password: string) => {
    try {
      const { $firebase } = useNuxtApp()

      // 👇 check which providers are linked to this email
      const { fetchSignInMethodsForEmail } = await import('firebase/auth')
      const methods = await fetchSignInMethodsForEmail($firebase.auth, email)

      if (methods.includes('google.com') && !methods.includes('password')) {
        throw { code: 'auth/wrong-provider' }
      }

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

  return { user, authReady, habitsReady, initAuth, signIn, signInWithGoogle, signOut, signOutSuccess }
}