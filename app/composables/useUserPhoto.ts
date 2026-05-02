// composables/useUserPhoto.ts
import md5 from 'md5'

export function useUserPhoto() {
  const { user } = useAuth()

  const gravatarUrl = (email: string) => {
    const hash = md5(email.trim().toLowerCase())
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`
  }

  const photoURL = computed(() => {
    if (!user.value) return '/images/default_user.png'

    // 👇 Google provider photo takes priority
    const googleProvider = user.value.providerData.find(p => p.providerId === 'google.com')
    if (googleProvider?.photoURL) return googleProvider.photoURL

    // 👇 Firebase Auth photoURL (set after linking)
    if (user.value.photoURL) return user.value.photoURL

    // 👇 Gravatar fallback for unverified/unlinked users
    if (user.value.email) return gravatarUrl(user.value.email)

    return '/images/default_user.png'
  })

  return { photoURL }
}