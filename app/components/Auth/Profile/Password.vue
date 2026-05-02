<!-- components/Auth/Profile/Password.vue -->
<script setup lang="ts">
import { KeyRound, Info, Check } from '@lucide/vue'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'

const { user } = useAuth()

const showPasswordSection = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')
const passwordLoading = ref(false)

const isGoogleUser = computed(() =>
  user.value?.providerData.some(p => p.providerId === 'google.com')
)

const changePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = 'All fields are required.'
    return
  }
  if (newPassword.value.length < 6) {
    passwordError.value = 'New password must be at least 6 characters.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'New passwords do not match.'
    return
  }

  passwordLoading.value = true
  try {
    const { $firebase } = useNuxtApp()
    const firebaseUser = $firebase.auth.currentUser
    if (!firebaseUser || !firebaseUser.email) throw new Error('No user found')

    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword.value)
    await reauthenticateWithCredential(firebaseUser, credential)
    await updatePassword(firebaseUser, newPassword.value)

    passwordSuccess.value = 'Password updated successfully.'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    // showPasswordSection.value = false
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      passwordError.value = 'Current password is incorrect.'
    } else {
      passwordError.value = 'Something went wrong. Please try again.'
    }
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <section v-if="!isGoogleUser" class="bg-white rounded-3xl p-2 flex flex-col">
    <button @click="showPasswordSection = !showPasswordSection"
      class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-black/5 transition-colors text-left cursor-pointer">
      <KeyRound class="size-4 text-black/40" />
      <span class="text-sm font-medium text-black/70">Change Password</span>
      <span class="ml-auto text-xs text-black/30">{{ showPasswordSection ? 'Cancel' : 'Edit' }}</span>
    </button>

    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 -translate-y-1">
      <div v-if="showPasswordSection" class="flex flex-col gap-3 px-4 py-4">
        <FormField v-model="currentPassword" type="password" placeholder="Current password" />
        <FormField v-model="newPassword" type="password" placeholder="New password" />
        <FormField v-model="confirmPassword" type="password" placeholder="Confirm new password" />

        <p v-if="passwordError" class="text-sm text-red-400 px-1 flex items-center gap-1">
          <Info class="size-4" /> {{ passwordError }}</p>
        <p v-if="passwordSuccess" class="text-sm text-green-500 px-1 flex items-center gap-1">
          <Check class="size-4" /> {{ passwordSuccess }}</p>

        <Button @click="changePassword" :disabled="passwordLoading">
          {{ passwordLoading ? 'Updating...' : 'Update Password' }}
        </Button>
      </div>
    </Transition>
  </section>

  <section v-else class="bg-white rounded-3xl px-6 py-4 flex items-center gap-3">
    <KeyRound class="size-4 text-black/30 shrink-0" />
    <div class="flex flex-col gap-0.5">
      <p class="text-sm font-semibold text-black/70">Password managed by Google</p>
      <p class="text-sm text-black/30">
        To change your password, visit your
        <a href="https://myaccount.google.com/security" target="_blank"
          class="text-primary underline underline-offset-2">Google Account settings</a>.
      </p>
    </div>
  </section>
</template>