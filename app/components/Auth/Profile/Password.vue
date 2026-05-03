<!-- components/Auth/Profile/Password.vue -->
<script setup lang="ts">
import { KeyRound, Info } from '@lucide/vue'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth'

const RESET_COOLDOWN_KEY = 'reset_password_cooldown_until'

const { user } = useAuth()

const isEmailVerified = computed(() => user.value?.emailVerified ?? false)
const resetSent = ref(false)
const resetError = ref('')
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const startCountdown = () => {
  const until = Date.now() + 120 * 1000
  localStorage.setItem(RESET_COOLDOWN_KEY, until.toString())
  runCountdown(until)
}

const runCountdown = (until: number) => {
  if (countdownTimer) clearInterval(countdownTimer)
  const tick = () => {
    const remaining = Math.ceil((until - Date.now()) / 1000)
    if (remaining <= 0) {
      countdown.value = 0
      localStorage.removeItem(RESET_COOLDOWN_KEY)
      clearInterval(countdownTimer!)
      countdownTimer = null
    } else {
      countdown.value = remaining
    }
  }
  tick()
  countdownTimer = setInterval(tick, 1000)
}

const formattedCountdown = computed(() => {
  const mins = Math.floor(countdown.value / 60)
  const secs = countdown.value % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const sendResetPassword = async () => {
  if (countdown.value > 0) return
  resetError.value = ''
  resetSent.value = false
  try {
    const { $firebase } = useNuxtApp()
    if (!user.value?.email) throw new Error('No email')
    await sendPasswordResetEmail($firebase.auth, user.value.email)
    resetSent.value = true
    startCountdown()
  } catch (error: any) {
    if (error.code === 'auth/too-many-requests') {
      resetError.value = 'Too many requests. Please try again later.'
    } else {
      resetError.value = 'Failed to send reset email.'
    }
  }
}

onMounted(() => {
  const stored = localStorage.getItem(RESET_COOLDOWN_KEY)
  if (stored) {
    const until = parseInt(stored)
    if (until > Date.now()) {
      resetSent.value = true
      runCountdown(until)
    } else {
      localStorage.removeItem(RESET_COOLDOWN_KEY)
    }
  }
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

const showPasswordSection = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const passwordLoading = ref(false)
const showPasswordSuccessAlert = ref(false) // 👈

const changePassword = async () => {
  passwordError.value = ''

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

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    showPasswordSection.value = false
    showPasswordSuccessAlert.value = true // 👈
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
  <ClientOnly>

  <!-- Password changed success alert -->
  <Alert type="success" title="Password updated!" message="Your password has been changed successfully."
    :visible="showPasswordSuccessAlert" :timeout="3000" @dismiss="showPasswordSuccessAlert = false" />

  <!-- Email verified — use Firebase reset password -->
  <section v-if="isEmailVerified" class="bg-white rounded-3xl p-2 flex flex-col">
    <button @click="sendResetPassword" :disabled="countdown > 0"
      class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-black/5 transition-colors text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
      <KeyRound class="size-4 text-black/40" />
      <span class="text-sm font-medium text-black/70">Change Password</span>
      <span class="ml-auto text-sm text-black/30 shrink-0">
        {{ countdown > 0 ? formattedCountdown : resetSent ? 'Resend' : 'Reset' }}
      </span>
    </button>

    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 -translate-y-1">
      <div v-if="resetSent || resetError" class="flex flex-col gap-1 px-4 py-3 bg-primary/5 rounded-2xl mt-1">
        <p v-if="resetSent" class="text-sm text-primary/70">
          A password reset link has been sent to
          <span class="font-semibold text-primary/80">{{ user?.email }}</span>.
        </p>
        <p v-if="resetSent" class="flex items-center gap-1 text-xs text-black/50 mt-1">
          <Info class="size-3 pointer-events-none text-primary/70" />
          Check your spam or junk folder if you don't see it.
        </p>
        <button v-if="countdown > 0"
          class="text-sm text-black/60 text-center p-2 w-full bg-muted/30 mt-2 rounded-xl cursor-not-allowed">
          Resend in <span class="text-primary font-bold">{{ formattedCountdown }}</span>.
        </button>
        <button v-else @click="sendResetPassword"
          class="text-sm text-white text-center p-2 w-full bg-primary mt-2 rounded-xl cursor-pointer">
          Resend Again
        </button>
        <p v-if="resetError" class="text-sm text-red-400 mt-1">{{ resetError }}</p>
      </div>
    </Transition>
  </section>

  <!-- Email not verified — manual change password -->
  <section v-else class="bg-white rounded-3xl p-2 flex flex-col">
    <button @click="showPasswordSection = !showPasswordSection"
      class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-black/5 transition-colors text-left cursor-pointer">
      <KeyRound class="size-4 text-black/40" />
      <span class="text-sm font-medium text-black/70">Change Password</span>
      <span class="ml-auto text-sm text-black/30">{{ showPasswordSection ? 'Cancel' : 'Edit' }}</span>
    </button>

    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 -translate-y-1">
      <div v-if="showPasswordSection" class="flex flex-col gap-3 px-4 py-4">
        <FormField v-model="currentPassword" type="password" placeholder="Current password" />
        <FormField v-model="newPassword" type="password" placeholder="New password" />
        <FormField v-model="confirmPassword" type="password" placeholder="Confirm new password" />

        <p v-if="passwordError" class="text-sm text-red-400 px-1">{{ passwordError }}</p>

        <Button @click="changePassword" :disabled="passwordLoading" :loading="passwordLoading">
          {{ passwordLoading ? 'Updating...' : 'Update Password' }}
        </Button>
      </div>
    </Transition>
  </section>

    <template #fallback>
      <section class="bg-white rounded-3xl p-2 flex flex-col gap-1">
        <div class="flex items-center gap-3 px-4 py-3">
          <Skeleton width="1rem" height="1rem" rounded="9999px" />
          <Skeleton height="1rem" width="40%" />
          <Skeleton height="1rem" width="10%" class="ml-auto" />
        </div>
      </section>
    </template>
  </ClientOnly>
</template>