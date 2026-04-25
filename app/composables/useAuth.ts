// composables/useAuth.ts
import { signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const authReady = useState<boolean>('auth-ready', () => false)

  const initAuth = (onLogin?: (user: User) => void, onLogout?: () => void) => {
    const { $firebase } = useNuxtApp()
    onAuthStateChanged($firebase.auth, (firebaseUser) => {
      user.value = firebaseUser
      authReady.value = true

      if (firebaseUser) {
        onLogin?.(firebaseUser)
      } else {
        onLogout?.()
      }
    })
  }

  // Google sign in
  const signInWithGoogle = async () => {
    try {
      const { $firebase } = useNuxtApp()
      const result = await signInWithPopup($firebase.auth, $firebase.provider)
      user.value = result.user

      // save google user to firestore if first time
      const userStore = useUserStore()
      await userStore.createUser(result.user.uid, {
        fullName: result.user.displayName ?? '',
        email: result.user.email ?? '',
        photoURL: result.user.photoURL ?? '',
        createdAt: new Date().toISOString(),
      })

      await navigateTo('/')
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return
      console.error('Google sign in error:', error)
    }
  }

  // Email/password sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { $firebase } = useNuxtApp()
      const result = await signInWithEmailAndPassword($firebase.auth, email, password)
      user.value = result.user
      await navigateTo('/')
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw error // 👈 throw so the page can handle the error message
    }
  }

  const signOut = async () => {
    const { $firebase } = useNuxtApp()
    await $firebase.auth.signOut()
    user.value = null
    await navigateTo('/login')
  }

  return { user, authReady, initAuth, signIn, signInWithGoogle, signOut }
}