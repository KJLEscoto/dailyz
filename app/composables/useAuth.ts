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

// ✅ Only treat as webview — Safari/Chrome on iOS handles popups fine in new tabs
const isWebview = () => {
  if (import.meta.server) return false
  const ua = navigator.userAgent
  // Detect embedded webviews (not Safari/Chrome themselves)
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua)
  const isChrome = /CriOS/i.test(ua)
  const isAndroidBrowser = /Android/i.test(ua) && /wv/i.test(ua)

  // If it's iOS but NOT Safari or Chrome → it's a webview
  if (isIOS && !isSafari && !isChrome) return true
  // Android webview
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
    try {
      const { $firebase } = useNuxtApp()
      const result = await getRedirectResult($firebase.auth)
      if (!result) return

      await processGoogleUser(result.user)
      window.location.replace('/home')
    } catch (error: any) {
      console.error('Google redirect result error:', error)
    }
  }

  // ✅ New: open Google OAuth in a new tab on mobile, wait for auth state to update
  const signInWithGoogleNewTab = (onSuccess: () => Promise<void>, onError: (err: any) => void) => {
    const { $firebase } = useNuxtApp()

    // Open the new tab immediately (must be synchronous to avoid popup blockers)
    const authTab = window.open('/auth/google-popup', '_blank')

    if (!authTab) {
      // Popup was blocked — fall back to redirect
      signInWithRedirect($firebase.auth, $firebase.provider)
      return
    }

    // Listen for auth state change triggered by the new tab completing OAuth
    const unsubscribe = onAuthStateChanged($firebase.auth, async (firebaseUser) => {
      if (!firebaseUser) return
      unsubscribe()
      try {
        await onSuccess()
      } catch (err) {
        onError(err)
      }
    })

    // Clean up listener if tab is closed without signing in
    const pollClosed = setInterval(() => {
      if (authTab.closed) {
        clearInterval(pollClosed)
        // Give a short grace period in case auth state fires right as tab closes
        setTimeout(() => unsubscribe(), 2000)
      }
    }, 500)
  }

  const signUpWithGoogle = async () => {
    const { $firebase } = useNuxtApp()

    if (isWebview()) {
      await signInWithRedirect($firebase.auth, $firebase.provider)
      return
    }

    if (isMobile()) {
      // ✅ Open in new tab on mobile — avoids iOS Safari popup/redirect issues
      return new Promise<void>((resolve, reject) => {
        signInWithGoogleNewTab(
          async () => {
            const firebaseUser = $firebase.auth.currentUser
            if (!firebaseUser) return

            const { doc, getDoc } = await import('firebase/firestore')
            const userDocRef = doc($firebase.db, 'users', firebaseUser.uid)
            const userDoc = await getDoc(userDocRef)

            if (userDoc.exists()) {
              await $firebase.auth.signOut()
              await navigateTo({
                path: '/login',
                state: { email: firebaseUser.email ?? '', error: 'existing' }
              }, { replace: true })
            } else {
              user.value = firebaseUser
              await navigateTo('/setup-password')
            }
            resolve()
          },
          reject
        )
      })
    }

    // Desktop: popup as before
    const result = await signInWithPopup($firebase.auth, $firebase.provider)

    const { doc, getDoc } = await import('firebase/firestore')
    const userDocRef = doc($firebase.db, 'users', result.user.uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      await $firebase.auth.signOut()
      await navigateTo({
        path: '/login',
        state: { email: result.user.email ?? '', error: 'existing' }
      }, { replace: true })
      return
    }

    user.value = result.user
    await navigateTo('/setup-password')
  }

  const signInWithGoogle = async () => {
    try {
      const { $firebase } = useNuxtApp()

      if (isWebview()) {
        await signInWithRedirect($firebase.auth, $firebase.provider)
        return
      }

      if (isMobile()) {
        // ✅ Open in new tab on mobile
        return new Promise<void>((resolve, reject) => {
          signInWithGoogleNewTab(
            async () => {
              const firebaseUser = $firebase.auth.currentUser
              if (!firebaseUser) return
              await processGoogleUser(firebaseUser)
              await navigateTo('/home')
              resolve()
            },
            reject
          )
        })
      }

      // Desktop: popup as before
      const result = await signInWithPopup($firebase.auth, $firebase.provider)
      await processGoogleUser(result.user)
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