// composables/useAuth.ts
import { ref, onMounted } from 'vue'
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'

export function useAuth() {
  const user = ref<User | null>(null)

  onMounted(() => {
    const { $firebase } = useNuxtApp()
    onAuthStateChanged($firebase.auth, (firebaseUser) => {
      user.value = firebaseUser
    })
  })

  const signIn = async () => {
    const { $firebase } = useNuxtApp()
    const result = await signInWithPopup($firebase.auth, $firebase.provider)
    user.value = result.user
  }

  const signOut = async () => {
    const { $firebase } = useNuxtApp()
    await $firebase.auth.signOut()
    user.value = null
  }

  return { user, signIn, signOut }
}