// composables/useAuth.ts
import { signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, sendPasswordResetEmail, linkWithCredential, EmailAuthProvider } from 'firebase/auth'
import type { User } from 'firebase/auth'

// 👇 detect mobile/webview where popups don't work
const isMobileOrWebview = () => {
  if (import.meta.server) return false
  const ua = navigator.userAgent
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua)
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const authReady = useState<boolean>('auth-ready', () => false)
  const habitsReady = useState<boolean>('habits-ready', () => false)

  const initAuth = (onLogin?: (user: User) => Promise<void>, onLogout?: () => void) => {
    const { $firebase } = useNuxtApp()

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

  const linkPassword = async (password: string) => {
    const { $firebase } = useNuxtApp()
    const currentUser = $firebase.auth.currentUser
    if (!currentUser || !currentUser.email) throw new Error('No authenticated user')

    const credential = EmailAuthProvider.credential(currentUser.email, password)
    await linkWithCredential(currentUser, credential)

    // ✅ Reload + force token refresh BEFORE any Firestore writes
    await currentUser.reload()
    await currentUser.getIdToken(true) // 👈 ensures Firestore sees the updated auth token
    user.value = $firebase.auth.currentUser

    // Now safe to write to Firestore
    await useUserStore().createUser(currentUser.uid, {
      fullName: currentUser.displayName ?? '',
      email: currentUser.email ?? '',
      photoURL: currentUser.photoURL ?? '',
      createdAt: new Date().toISOString(),
    })

    const habitStore = useHabitStore()
    await habitStore.fetchHabits()
    await habitStore.resetStaleStreaks()
    habitsReady.value = true
  }

  const processGoogleUser = async (firebaseUser: User, { allowExisting = true } = {}) => {
    const { $firebase } = useNuxtApp()
    const { doc, getDoc } = await import('firebase/firestore')
    const userDocRef = doc($firebase.db, 'users', firebaseUser.uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      if (!allowExisting) {
        // 👇 existing account — throw so register page can redirect
        throw { code: 'auth/email-already-in-use', customData: { email: firebaseUser.email } }
      }
      const existingName = userDoc.data().fullName
      if (existingName && firebaseUser.displayName !== existingName) {
        await updateProfile(firebaseUser, { displayName: existingName })
      }
    } else {
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
  }

  const handleRedirectResult = async () => {
    try {
      const { $firebase } = useNuxtApp()
      const result = await getRedirectResult($firebase.auth)
      if (!result) return

      await processGoogleUser(result.user)
      window.location.replace('/home') // 👈 hard nav to bypass middleware race
    } catch (error: any) {
      console.error('Google redirect result error:', error)
    }
  }

  const signUpWithGoogle = async () => {
    const { $firebase } = useNuxtApp()

    if (isMobileOrWebview()) {
      await signInWithRedirect($firebase.auth, $firebase.provider)
      return
    }

    const result = await signInWithPopup($firebase.auth, $firebase.provider)

    // Check if already existing (has Firestore doc)
    const { doc, getDoc } = await import('firebase/firestore')
    const userDocRef = doc($firebase.db, 'users', result.user.uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      // Existing user tried to register — sign them out and redirect
      await $firebase.auth.signOut()
      await navigateTo({
        path: '/login',
        state: { email: result.user.email ?? '', error: 'existing' }
      }, { replace: true })
      return
    }

    // New user — don't write to Firestore yet, go to setup
    user.value = result.user
    await navigateTo('/setup-password')
  }

  const signInWithGoogle = async () => {
    try {
      const { $firebase } = useNuxtApp()

      if (isMobileOrWebview()) {
        // 👇 mobile — use redirect
        await signInWithRedirect($firebase.auth, $firebase.provider)
      } else {
        // 👇 desktop — use popup
        const result = await signInWithPopup($firebase.auth, $firebase.provider)
        await processGoogleUser(result.user)
        await navigateTo('/home')
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return
      console.error('Google sign in error:', error)
    }
  }

  const signOutSuccess = useState<boolean>('sign-out-success', () => false)

  const signIn = async (email: string, password: string) => {
    try {
      const { $firebase } = useNuxtApp()

      const { fetchSignInMethodsForEmail } = await import('firebase/auth')
      const methods = await fetchSignInMethodsForEmail($firebase.auth, email)

      // if (methods.includes('google.com') && !methods.includes('password')) {
      //   throw { code: 'auth/wrong-provider' }
      // }

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

  const sendPasswordReset = async (email: string) => {
    const { $firebase } = useNuxtApp()
    const auth = $firebase.auth
    await sendPasswordResetEmail(auth, email)
  }

  return { user, authReady, habitsReady, initAuth, signIn, signInWithGoogle, signOut, signOutSuccess, handleRedirectResult, sendPasswordReset, signUpWithGoogle, linkPassword }
}