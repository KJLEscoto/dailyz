<!-- components/Auth/Profile/DeleteAccount.vue -->
<script setup lang="ts">
import { Trash2 } from '@lucide/vue'

const { user } = useAuth()
const { signOut } = useAuth()

const showEmailModal = ref(false)
const emailInput = ref('')
const emailError = ref('')

const deleteLoading = ref(false)
const countdown = ref(4)
let deleteTimer: ReturnType<typeof setTimeout> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

const deleteAccountSuccess = useState<boolean>('delete-account-success', () => false)

const confirmDeleteAccount = () => {
  emailInput.value = ''
  emailError.value = ''
  showEmailModal.value = true
}

const verifyEmail = () => {
  emailError.value = ''
  if (!emailInput.value.trim()) {
    emailError.value = 'Please enter your email.'
    return
  }
  if (emailInput.value.trim().toLowerCase() !== user.value?.email?.toLowerCase()) {
    emailError.value = 'Email does not match your account.'
    return
  }
  showEmailModal.value = false
  startDeleteCountdown()
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
    <!-- Delete countdown alert -->
    <Alert type="danger" title="Deleting account..."
      :message="`Your account will be deleted in ${countdown} second${countdown === 1 ? '' : 's'}.`"
      :visible="deleteLoading" :dismissible="false" :actions="[{ label: 'No, Cancel', onClick: cancelDelete }]" />

    <!-- Email verification modal — using your Modal component -->
    <Modal v-model="showEmailModal" title="Confirm deletion"
      description="Enter your email to confirm you want to delete your account." primary-label="Confirm Delete"
      cancel-label="Cancel" :dangerous="true" @primary="verifyEmail" @cancel="showEmailModal = false">
      <FormField v-model="emailInput" label="your email" type="email" :placeholder="user?.email ?? 'your@email.com'"
        :error="emailError" @keyup.enter="verifyEmail" />
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