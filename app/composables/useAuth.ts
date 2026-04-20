// composables/useAuth.ts
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth'
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
        onLogin?.(firebaseUser) // 👈 callback when logged in
      } else {
        onLogout?.()            // 👈 callback when logged out
      }
    })
  }

  const signIn = async () => {
    try {
      const { $firebase } = useNuxtApp()
      // console.log('signing in...')
      const result = await signInWithPopup($firebase.auth, $firebase.provider)
      // console.log('signed in:', result.user.uid) // 👈 does this log?
      user.value = result.user
      // console.log('user ref updated:', user.value) // 👈 does this log?
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return
      console.error('Sign in error:', error)
    }
  }

  const signOut = async () => {
    const { $firebase } = useNuxtApp()
    await $firebase.auth.signOut()
    user.value = null
  }

  return { user, authReady, initAuth, signIn, signOut }
}