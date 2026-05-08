// middleware/setup-password.ts
export default defineNuxtRouteMiddleware(async () => {
  const { user } = useAuth()
  const { $firebase } = useNuxtApp()

  if (!user.value) return navigateTo('/login')

  const { doc, getDoc } = await import('firebase/firestore')
  const userDocRef = doc($firebase.db, 'users', user.value.uid)
  const userDoc = await getDoc(userDocRef)

  // Already fully set up — send to home
  if (userDoc.exists()) return navigateTo('/home')
})