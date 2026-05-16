import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  linkWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import type { User } from 'firebase/auth'

const isMobile = () => {
  if (import.meta.server) return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const authReady = useState<boolean>('auth-ready', () => false)
  const habitsReady = useState<boolean>('habits-ready', () => false)
  const processingRedirect = useState<boolean>('processing-redirect', () => false)

  const initAuth = (onLogin?: (user: User) => Promise<void>, onLogout?: () => void) => {
    const { $firebase } = useNuxtApp()
    onAuthStateChanged($firebase.auth, async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) await onLogin?.(firebaseUser)
      else onLogout?.()
      authReady.value = true
    })
  }

  const linkPassword = async (password: string) => {
    const { $firebase } = useNuxtApp()
    const currentUser = $firebase.auth.currentUser
    if (!currentUser || !currentUser.email) throw new Error('No authenticated user')
    const credential = EmailAuthProvider.credential(currentUser.email, password)
    await linkWithCredential(currentUser, credential)
    await currentUser.reload()
    await currentUser.getIdToken(true)
    user.value = $firebase.auth.currentUser
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
    const { $firebase } = useNuxtApp()

    try {
      // ✅ getRedirectResult returns null if no redirect happened
      // It returns the user if Google just redirected back — no storage needed
      const result = await getRedirectResult($firebase.auth)
      if (!result) return // Normal page load — do nothing

      // ✅ We have a result — block middleware immediately
      processingRedirect.value = true

      // Determine signup vs signin by checking if Firestore doc exists
      // New user = no doc = signup flow; existing user = has doc = signin flow
      const { doc, getDoc } = await import('firebase/firestore')
      const userDocRef = doc($firebase.db, 'users', result.user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // ✅ New user — go to password setup (signup flow)
        user.value = result.user
        processingRedirect.value = false
        await navigateTo('/setup-password', { replace: true })
      } else {
        // ✅ Existing user — sign in flow
        await processGoogleUser(result.user)
        processingRedirect.value = false
        await navigateTo('/home', { replace: true })
      }
    } catch (error: any) {
      console.error('Google redirect result error:', error)
      processingRedirect.value = false
      await navigateTo('/login', { replace: true })
    }
  }

  const signInWithGoogle = async () => {
    const { $firebase } = useNuxtApp()
    if (isMobile()) {
      await signInWithRedirect($firebase.auth, $firebase.provider)
      return
    }
    try {
      const result = await signInWithPopup($firebase.auth, $firebase.provider)
      await processGoogleUser(result.user)
      await navigateTo('/home')
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signUpWithGoogle = async () => {
    const { $firebase } = useNuxtApp()
    if (isMobile()) {
      await signInWithRedirect($firebase.auth, $firebase.provider)
      return
    }
    try {
      const result = await signInWithPopup($firebase.auth, $firebase.provider)
      const { doc, getDoc } = await import('firebase/firestore')
      const userDocRef = doc($firebase.db, 'users', result.user.uid)
      const userDoc = await getDoc(userDocRef)
      if (userDoc.exists()) {
        await $firebase.auth.signOut()
        await navigateTo({ path: '/login', state: { email: result.user.email ?? '', error: 'existing' } }, { replace: true })
        return
      }
      user.value = result.user
      await navigateTo('/setup-password')
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return
      console.error('Google sign up error:', error)
      throw error
    }
  }

  const signOutSuccess = useState<boolean>('sign-out-success', () => false)

  const signIn = async (email: string, password: string) => {
    try {
      const { $firebase } = useNuxtApp()
      const { fetchSignInMethodsForEmail } = await import('firebase/auth')
      await fetchSignInMethodsForEmail($firebase.auth, email)
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
    await sendPasswordResetEmail($firebase.auth, email)
  }

  return {
    user, authReady, habitsReady, processingRedirect, initAuth, signIn,
    signInWithGoogle, signOut, signOutSuccess, handleRedirectResult,
    sendPasswordReset, signUpWithGoogle, linkPassword
  }
}