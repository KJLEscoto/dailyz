// composables/useUserPhoto.ts
export function useUserPhoto() {
  const { user } = useAuth()

  const photoURL = computed(() => {
    if (!user.value) return '/images/default_user.png'

    // Google provider photo takes priority
    const googleProvider = user.value.providerData.find(p => p.providerId === 'google.com')
    if (googleProvider?.photoURL) return googleProvider.photoURL

    // Firebase Auth photoURL
    if (user.value.photoURL) return user.value.photoURL

    return '/images/default_user.png'
  })

  return { photoURL }
}