// useAuth.ts
import {
  signInWithPopup,
  getRedirectResult,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider
} from 'firebase/auth'
import type { User } from 'firebase/auth'

// ❌ Removed isMobile() and isDev() — no longer needed
// We always use signInWithPopup now, which opens a new tab on mobile
// just like Claude.ai does. signInWithRedirect causes hydration mismatches.

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const authReady = useState<boolean>('auth-ready', () => false)
  const habitsReady = useState<boolean>('habits-ready', () => false)

  // Keep this for backward compat but it won't be set to true anymore
  // since we no longer use signInWithRedirect
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

  // ✅ This is now a no-op since we don't use signInWithRedirect anymore.
  // Kept so app.vue doesn't break.
  const handleRedirectResult = async () => {
    if (import.meta.server) return
    const { $firebase } = useNuxtApp()
    try {
      // Drain any leftover redirect result from old sessions / pre-migration visits.
      // After this runs once on a fresh deploy the result will always be null.
      const result = await getRedirectResult($firebase.auth)
      if (!result) return

      processingRedirect.value = true
      const { doc, getDoc } = await import('firebase/firestore')
      const userDocRef = doc($firebase.db, 'users', result.user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        user.value = result.user
        processingRedirect.value = false
        await navigateTo('/setup-password', { replace: true })
      } else {
        await processGoogleUser(result.user)
        processingRedirect.value = false
        await navigateTo('/home', { replace: true })
      }
    } catch (error: any) {
      console.error('Google redirect result error:', error)
      processingRedirect.value = false
    }
  }

  // ✅ Always use popup — opens as a new tab on mobile (same as Claude.ai)
  // No page reload = no hydration mismatch
  const getGoogleProvider = () => {
    const { $firebase } = useNuxtApp()
    const provider = $firebase.provider as GoogleAuthProvider
    provider.setCustomParameters({ prompt: 'select_account' })
    return provider
  }

  const signInWithGoogle = async () => {
    const { $firebase } = useNuxtApp()
    try {
      const result = await signInWithPopup($firebase.auth, getGoogleProvider())
      const { doc, getDoc } = await import('firebase/firestore')
      const userDocRef = doc($firebase.db, 'users', result.user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // ✅ New Google user — go set up a password first
        user.value = result.user
        await navigateTo('/setup-password', { replace: true })
        return
      }

      // Existing user — load their data and go home
      await processGoogleUser(result.user)
      await navigateTo('/home', { replace: true })
    } catch (error: any) {
      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/popup-blocked'
      ) return
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signUpWithGoogle = async () => {
    const { $firebase } = useNuxtApp()
    try {
      const result = await signInWithPopup($firebase.auth, getGoogleProvider())
      const { doc, getDoc } = await import('firebase/firestore')
      const userDocRef = doc($firebase.db, 'users', result.user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        // ✅ Existing user tried to register — sign them out and send to login with error
        await $firebase.auth.signOut()
        await navigateTo(
          { path: '/login', state: { email: result.user.email ?? '', error: 'existing' } },
          { replace: true }
        )
        return
      }

      // New user — go set up a password
      user.value = result.user
      await navigateTo('/setup-password', { replace: true })
    } catch (error: any) {
      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/popup-blocked'
      ) return
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