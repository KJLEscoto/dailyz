<!-- components/Auth/Profile/DeleteAccount.vue -->
<script setup lang="ts">
import { Trash2 } from '@lucide/vue'
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'

const { user } = useAuth()
const { signOut } = useAuth()

const showPasswordModal = ref(false)
const passwordInput = ref('')
const passwordError = ref('')

const deleteLoading = ref(false)
const countdown = ref(4)
let deleteTimer: ReturnType<typeof setTimeout> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

const deleteAccountSuccess = useState<boolean>('delete-account-success', () => false)

const confirmDeleteAccount = () => {
  passwordInput.value = ''
  passwordError.value = ''
  showPasswordModal.value = true
}

const verifyPassword = async () => {
  passwordError.value = ''
  if (!passwordInput.value.trim()) {
    passwordError.value = 'Please enter your password.'
    return
  }

  try {
    const { $firebase } = useNuxtApp()
    const firebaseUser = $firebase.auth.currentUser
    if (!firebaseUser || !user.value?.email) return

    // 👇 reauthenticate before deleting
    const credential = EmailAuthProvider.credential(user.value.email, passwordInput.value)
    await reauthenticateWithCredential(firebaseUser, credential)

    showPasswordModal.value = false
    startDeleteCountdown()
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      passwordError.value = 'Incorrect password. Please try again.'
    } else {
      passwordError.value = 'Failed to verify. Please try again.'
    }
  }
}

const startDeleteCountdown = () => {
  deleteLoading.value = true
  countdown.value = 4

  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
    }
  }, 1000)

  deleteTimer = setTimeout(async () => {
    try {
      const { $firebase } = useNuxtApp()
      const firebaseUser = $firebase.auth.currentUser
      if (!firebaseUser) return

      const { doc, deleteDoc } = await import('firebase/firestore')
      await deleteDoc(doc($firebase.db, 'users', firebaseUser.uid))
      await firebaseUser.delete()

      deleteAccountSuccess.value = true
      await navigateTo('/')
    } catch (error: any) {
      console.error('Delete account error:', error)
    } finally {
      deleteLoading.value = false
    }
  }, 4000)
}

const cancelDelete = () => {
  if (deleteTimer) { clearTimeout(deleteTimer); deleteTimer = null }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
  deleteLoading.value = false
  countdown.value = 4
}

onUnmounted(() => {
  if (deleteTimer) clearTimeout(deleteTimer)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<template>
  <ClientOnly>
    <Alert type="danger" title="Deleting account..."
      :message="`Your account will be deleted in ${countdown} second${countdown === 1 ? '' : 's'}.`"
      :visible="deleteLoading" :dismissible="false" :actions="[{ label: 'No, Cancel', onClick: cancelDelete }]" />

    <Modal v-model="showPasswordModal" title="Confirm deletion"
      description="Enter your password to confirm you want to delete your account." primary-label="Confirm Delete"
      cancel-label="Cancel" :dangerous="true" @primary="verifyPassword" @cancel="showPasswordModal = false">
      <FormField v-model="passwordInput" label="your password" type="password" placeholder="••••••••"
        :error="passwordError" @keyup.enter="verifyPassword" />
    </Modal>

    <button @click="confirmDeleteAccount"
      class="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-700 hover:bg-red-600 transition-all duration-100 ease-in cursor-pointer w-full text-white">
      <Trash2 class="size-4 pointer-events-none" />
      <span class="text-sm font-medium">Delete My Account</span>
    </button>

    <template #fallback>
      <section class="bg-white rounded-3xl p-2">
        <div class="flex items-center gap-3 px-4 py-3">
          <Skeleton width="1rem" height="1rem" rounded="9999px" />
          <Skeleton height="1rem" width="40%" />
        </div>
      </section>
    </template>
  </ClientOnly>
</template>