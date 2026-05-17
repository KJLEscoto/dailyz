// middleware/setup-password.ts
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const { user, authReady } = useAuth()
  const { $firebase } = useNuxtApp()

  // Wait for auth to be ready before checking
  if (!authReady.value) {
    await new Promise<void>(resolve => {
      const stop = watch(authReady, (val) => {
        if (val) { stop(); resolve() }
      })
    })
  }

  if (!user.value) return navigateTo('/login', { replace: true })

  const { doc, getDoc } = await import('firebase/firestore')
  const userDocRef = doc($firebase.db, 'users', user.value.uid)
  const userDoc = await getDoc(userDocRef)

  // Already fully set up — send to home
  if (userDoc.exists()) return navigateTo('/home', { replace: true })

  // No Firestore doc yet — allow access to setup-password
})