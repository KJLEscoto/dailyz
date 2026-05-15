// composables/useUserPhoto.ts
export function useUserPhoto() {
  const { user } = useAuth()

  const photoURL = computed(() => {
    if (!user.value) return '/images/default_user.png'

    const googleProvider = user.value.providerData.find(p => p.providerId === 'google.com')
    if (googleProvider?.photoURL) return googleProvider.photoURL

    if (user.value.photoURL) return user.value.photoURL

    return '/images/default_user.png'
  })

  // When email becomes verified, reload the firebase user so
  // providerData (including Google photoURL) is fresh
  watch(
    () => user.value?.emailVerified,
    async (verified) => {
      if (!verified) return
      const { $firebase } = useNuxtApp()
      const firebaseUser = $firebase.auth.currentUser
      if (!firebaseUser) return

      await firebaseUser.reload()
      user.value = $firebase.auth.currentUser
    }
  )

  return { photoURL }
}