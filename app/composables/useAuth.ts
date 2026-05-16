// composables/useAuth.ts
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

const isWebview = () => {
  if (import.meta.server) return false
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua)
  const isChrome = /CriOS/i.test(ua)
  const isAndroidBrowser = /Android/i.test(ua) && /wv/i.test(ua)
  if (isIOS && !isSafari && !isChrome) return true
  if (isAndroidBrowser) return true
  return false
}

const isMobile = () => {
  if (import.meta.server) return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const authReady = useState<boolean>('auth-ready', () => false)
  const habitsReady = useState<boolean>('habits-ready', () => false)

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

  // ✅ Same-tab redirect for actual webviews (no window.open support)
  const handleRedirectResult = async () => {
    try {
      const { $firebase } = useNuxtApp()
      const result = await getRedirectResult($firebase.auth)
      if (!result) return
      const mode = sessionStorage.getItem('google_auth_mode') ?? 'signin'
      sessionStorage.removeItem('google_auth_mode')
      if (mode === 'signup') {
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
      } else {
        await processGoogleUser(result.user)
        window.location.replace('/home')
      }
    } catch (error: any) {
      console.error('Google redirect result error:', error)
    }
  }

  // ✅ Open new tab on mobile — tab uses signInWithRedirect internally (no popup)
  const signInWithGoogleViaTab = (mode: 'signin' | 'signup'): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Must be synchronous — called directly from user gesture handler
      const authTab = window.open('/auth/google-popup', '_blank')

      if (!authTab) {
        // Tab was blocked — fall back to same-tab redirect
        sessionStorage.setItem('google_auth_mode', mode)
        const { $firebase } = useNuxtApp()
        signInWithRedirect($firebase.auth, $firebase.provider)
        resolve() // resolves immediately; page will reload after redirect
        return
      }

      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        if (!['GOOGLE_AUTH_SUCCESS', 'GOOGLE_AUTH_ERROR'].includes(event.data?.type)) return

        window.removeEventListener('message', messageHandler)
        clearInterval(tabClosedPoll)

        if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          reject({ code: event.data.code })
          return
        }

        // ✅ Auth state is already set in Firebase (shared IndexedDB)
        try {
          const { $firebase } = useNuxtApp()
          await $firebase.auth.authStateReady()
          const firebaseUser = $firebase.auth.currentUser
          if (!firebaseUser) { resolve(); return }

          if (mode === 'signup') {
            const { doc, getDoc } = await import('firebase/firestore')
            const { $firebase } = useNuxtApp()
            const userDocRef = doc($firebase.db, 'users', firebaseUser.uid)
            const userDoc = await getDoc(userDocRef)
            if (userDoc.exists()) {
              await $firebase.auth.signOut()
              await navigateTo({ path: '/login', state: { email: firebaseUser.email ?? '', error: 'existing' } }, { replace: true })
            } else {
              user.value = firebaseUser
              await navigateTo('/setup-password')
            }
          } else {
            await processGoogleUser(firebaseUser)
            await navigateTo('/home')
          }
          resolve()
        } catch (err) {
          reject(err)
        }
      }

      window.addEventListener('message', messageHandler)

      // Clean up if user closes the tab without completing auth
      const tabClosedPoll = setInterval(() => {
        if (authTab.closed) {
          clearInterval(tabClosedPoll)
          window.removeEventListener('message', messageHandler)
          resolve() // User cancelled — resolve silently
        }
      }, 500)
    })
  }

  const signInWithGoogle = async () => {
    try {
      const { $firebase } = useNuxtApp()

      if (isWebview()) {
        sessionStorage.setItem('google_auth_mode', 'signin')
        await signInWithRedirect($firebase.auth, $firebase.provider)
        return
      }

      if (isMobile()) {
        await signInWithGoogleViaTab('signin')
        return
      }

      // Desktop — popup works fine
      const result = await signInWithPopup($firebase.auth, $firebase.provider)
      await processGoogleUser(result.user)
      await navigateTo('/home')
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signUpWithGoogle = async () => {
    try {
      const { $firebase } = useNuxtApp()

      if (isWebview()) {
        sessionStorage.setItem('google_auth_mode', 'signup')
        await signInWithRedirect($firebase.auth, $firebase.provider)
        return
      }

      if (isMobile()) {
        await signInWithGoogleViaTab('signup')
        return
      }

      // Desktop
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
      if (error.code === 'auth/popup-closed-by-user') return
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
    user, authReady, habitsReady, initAuth, signIn, signInWithGoogle, signOut,
    signOutSuccess, handleRedirectResult, sendPasswordReset, signUpWithGoogle, linkPassword
  }
}