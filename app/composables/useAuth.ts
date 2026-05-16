import {
  signInWithPopup,
  signInWithRedirect,
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

const isWebview = () => {
  if (import.meta.server) return false
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua)
  const isChrome = /CriOS/i.test(ua)
  const isAndroidWebview = /Android/i.test(ua) && /wv/i.test(ua)
  if (isIOS && !isSafari && !isChrome) return true
  if (isAndroidWebview) return true
  return false
}

const AUTH_TAB_URL = 'https://dailyz.netlify.app/auth/google-popup'

const isMobile = () => {
  if (import.meta.server) return false
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

const isProduction = () => {
  if (import.meta.server) return false
  return window.location.hostname === 'dailyz.netlify.app'
}

const getGoogleProvider = () => {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return provider
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

  // ✅ Only needed for webview fallback (same-tab redirect)
  const handleRedirectResult = async () => {
    const { $firebase } = useNuxtApp()
    try {
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
      await navigateTo('/login', { replace: true })
    }
  }

  // ✅ New tab approach — works on both localhost and production
  const signInWithGoogleViaTab = (mode: 'signin' | 'signup'): Promise<void> => {
    return new Promise((resolve, reject) => {
      const authTab = window.open('https://dailyz.netlify.app/auth/google-popup', '_blank')

      if (!authTab) {
        reject(new Error('Popup blocked'))
        return
      }

      let settled = false
      const { $firebase } = useNuxtApp()

      const finish = async (firebaseUser: import('firebase/auth').User | null) => {
        if (settled) return
        settled = true
        clearInterval(tabClosedPoll)
        window.removeEventListener('message', messageHandler)

        if (!firebaseUser) {
          resolve() // cancelled
          return
        }

        try {
          if (mode === 'signup') {
            const { doc, getDoc } = await import('firebase/firestore')
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

      // ✅ Primary: listen for postMessage (works when COOP header is set)
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== 'https://dailyz.netlify.app') return
        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
          $firebase.auth.authStateReady().then(() => finish($firebase.auth.currentUser))
        } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
          settled = true
          clearInterval(tabClosedPoll)
          window.removeEventListener('message', messageHandler)
          unsubscribeAuth()
          resolve() // treat as cancelled
        }
      }
      window.addEventListener('message', messageHandler)

      // ✅ Fallback: poll onAuthStateChanged in case postMessage is blocked by COOP
      const unsubscribeAuth = onAuthStateChanged($firebase.auth, (firebaseUser) => {
        if (!firebaseUser) return // ignore sign-out events
        unsubscribeAuth()
        finish(firebaseUser)
      })

      // ✅ Tab closed without auth — user cancelled
      const tabClosedPoll = setInterval(() => {
        if (authTab.closed && !settled) {
          settled = true
          clearInterval(tabClosedPoll)
          window.removeEventListener('message', messageHandler)
          unsubscribeAuth()
          resolve()
        }
      }, 500)
    })
  }

  const signInWithGoogle = async () => {
    const { $firebase } = useNuxtApp()

    if (isWebview()) {
      await signInWithRedirect($firebase.auth, getGoogleProvider())
      return
    }

    // ✅ New tab only on mobile production — popup everywhere else
    if (isMobile() && isProduction()) {
      try {
        await signInWithGoogleViaTab('signin')
      } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return
        console.error('Google sign in error:', error)
        throw error
      }
      return
    }

    // Desktop or localhost — popup
    try {
      const result = await signInWithPopup($firebase.auth, getGoogleProvider())
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

    if (isWebview()) {
      await signInWithRedirect($firebase.auth, getGoogleProvider())
      return
    }

    // ✅ New tab only on mobile production
    if (isMobile() && isProduction()) {
      try {
        await signInWithGoogleViaTab('signup')
      } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return
        console.error('Google sign up error:', error)
        throw error
      }
      return
    }

    // Desktop or localhost — popup
    try {
      const result = await signInWithPopup($firebase.auth, getGoogleProvider())
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