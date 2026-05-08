<!-- pages/login.vue -->
<script setup lang="ts">
import { Info } from '@lucide/vue'

const { signIn, signInWithGoogle } = useAuth()

const state = import.meta.client ? history.state : {}
const emailAddress = ref((state?.email as string) ?? '')
const emailError = ref(state?.error === 'existing' ? 'This account already exists. Please sign in instead.' : '')
const password = ref('')
const passwordError = ref('')
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const showForgotPassword = ref(false)
const showGoogleUnavailable = ref(false)

const isAnyLoading = computed(() => isLoading.value || isGoogleLoading.value)

// --- Rate limiting ---
const MAX_ATTEMPTS = 5
const LOCKOUT_PREFIX = 'login_lockout_'
const ATTEMPTS_PREFIX = 'login_attempts_'

const attemptsLeft = ref(MAX_ATTEMPTS)
const lockoutCountdown = ref(0)
let lockoutTimer: ReturnType<typeof setInterval> | null = null

const isLockedOut = computed(() => lockoutCountdown.value > 0)

const formattedLockout = computed(() => {
  const mins = Math.floor(lockoutCountdown.value / 60)
  const secs = lockoutCountdown.value % 60
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
})

const getEmailKey = (email: string) => email.trim().toLowerCase()

const runLockoutCountdown = (until: number, email: string) => {
  if (lockoutTimer) clearInterval(lockoutTimer)
  const key = getEmailKey(email)
  const tick = () => {
    const remaining = Math.ceil((until - Date.now()) / 1000)
    if (remaining <= 0) {
      lockoutCountdown.value = 0
      attemptsLeft.value = MAX_ATTEMPTS
      localStorage.removeItem(LOCKOUT_PREFIX + key)
      localStorage.removeItem(ATTEMPTS_PREFIX + key)
      clearInterval(lockoutTimer!)
      lockoutTimer = null
    } else {
      lockoutCountdown.value = remaining
    }
  }
  tick()
  lockoutTimer = setInterval(tick, 1000)
}

const checkEmailLockout = (email: string) => {
  const key = getEmailKey(email)
  const storedLockout = localStorage.getItem(LOCKOUT_PREFIX + key)
  const storedAttempts = parseInt(localStorage.getItem(ATTEMPTS_PREFIX + key) ?? '0')

  if (storedLockout) {
    const until = parseInt(storedLockout)
    if (until > Date.now()) {
      attemptsLeft.value = 0
      runLockoutCountdown(until, email)
      return true
    } else {
      localStorage.removeItem(LOCKOUT_PREFIX + key)
      localStorage.removeItem(ATTEMPTS_PREFIX + key)
      attemptsLeft.value = MAX_ATTEMPTS
      return false
    }
  } else {
    attemptsLeft.value = MAX_ATTEMPTS - storedAttempts
    return false
  }
}

const recordFailedAttempt = (email: string) => {
  const key = getEmailKey(email)
  const current = parseInt(localStorage.getItem(ATTEMPTS_PREFIX + key) ?? '0') + 1
  localStorage.setItem(ATTEMPTS_PREFIX + key, current.toString())
  attemptsLeft.value = MAX_ATTEMPTS - current

  if (current >= MAX_ATTEMPTS) {
    const until = Date.now() + 5 * 60 * 1000
    localStorage.setItem(LOCKOUT_PREFIX + key, until.toString())
    runLockoutCountdown(until, email)
  }
}

const resetAttempts = (email: string) => {
  const key = getEmailKey(email)
  localStorage.removeItem(ATTEMPTS_PREFIX + key)
  localStorage.removeItem(LOCKOUT_PREFIX + key)
  attemptsLeft.value = MAX_ATTEMPTS
  lockoutCountdown.value = 0
}

watch(emailAddress, (val) => {
  if (lockoutTimer) {
    clearInterval(lockoutTimer)
    lockoutTimer = null
    lockoutCountdown.value = 0
  }
  if (val.trim()) checkEmailLockout(val)
  else attemptsLeft.value = MAX_ATTEMPTS
})

onUnmounted(() => {
  if (lockoutTimer) clearInterval(lockoutTimer)
})

// TODO: Re-enable when Google Sign-In is available
const handleGoogleLogin = async () => {
  showGoogleUnavailable.value = true
  // isGoogleLoading.value = true
  // try {
  //   await signInWithGoogle()
  // } catch (error: any) {
  //   if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return
  //   console.error('Google sign in error:', error)
  // } finally {
  //   isGoogleLoading.value = false
  // }
}

const handleLogin = async () => {
  emailError.value = ''
  passwordError.value = ''

  let hasError = false
  if (!emailAddress.value.trim()) {
    emailError.value = 'Email address is required.'
    hasError = true
  }
  if (!password.value.trim()) {
    passwordError.value = 'Password is required.'
    hasError = true
  }
  if (hasError) return

  if (checkEmailLockout(emailAddress.value)) return

  isLoading.value = true
  try {
    await signIn(emailAddress.value, password.value)
    resetAttempts(emailAddress.value)
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      recordFailedAttempt(emailAddress.value)
      if (!isLockedOut.value) {
        passwordError.value = `Incorrect email or password. <strong>${attemptsLeft.value}</strong> attempt${attemptsLeft.value === 1 ? '' : 's'} left.`
      }
    } else if (error.code === 'auth/user-not-found') {
      emailError.value = 'No account found with this email.'
    } else if (error.code === 'auth/invalid-email') {
      emailError.value = 'Invalid email address.'
    } else if (
      error.code === 'auth/account-exists-with-different-credential' ||
      error.code === 'auth/wrong-provider'
    ) {
      emailError.value = 'This email is linked to a Google account. Please sign in with Google.'
    } else if (error.code === 'auth/too-many-requests') {
      const until = Date.now() + 5 * 60 * 1000
      const key = getEmailKey(emailAddress.value)
      localStorage.setItem(LOCKOUT_PREFIX + key, until.toString())
      localStorage.setItem(ATTEMPTS_PREFIX + key, MAX_ATTEMPTS.toString())
      attemptsLeft.value = 0
      runLockoutCountdown(until, emailAddress.value)
    } else {
      console.error('Login error:', error)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <!-- Google unavailable alert -->
  <Alert type="danger" title="Under Maintenance!" message="Please sign in with your email and password instead."
    :visible="showGoogleUnavailable" :timeout="5000" @dismiss="showGoogleUnavailable = false" />

  <section class="text-center space-y-3">
    <h1 class="text-4xl font-bold text-primary">Welcome back!</h1>
    <p class="text-muted">Sign in to continue building your habits.</p>
  </section>

  <form class="w-full bg-white rounded-4xl md:p-10 p-6 space-y-10 h-full shadow-lg" @submit.prevent="handleLogin">

    <!-- Google Sign In -->
    <button @click="handleGoogleLogin" type="button" :disabled="isAnyLoading" class="w-full h-auto py-3 px-10 shrink-0 bg-muted/10 rounded-2xl flex items-center justify-center gap-3
      cursor-pointer hover:bg-muted/20 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
      <img v-if="!isGoogleLoading" src="/images/webp/google.webp" alt="Sign in with Google" class="size-6" />
      <div v-else class="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p class="text-nowrap">{{ isGoogleLoading ? 'Signing in...' : 'Sign in with Google' }}</p>
    </button>

    <!-- Divider -->
    <div class="flex items-center gap-3">
      <hr class="border-muted/20 w-full" />
      <UppercaseTitle size="sm">or sign in with email</UppercaseTitle>
      <hr class="border-muted/20 w-full" />
    </div>

    <!-- Email & Password -->
    <section class="space-y-6">

      <!-- Lockout banner -->
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1"
        leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 -translate-y-1">
        <div v-if="isLockedOut" class="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex flex-col gap-1">
          <p class="text-sm font-semibold text-red-500">Too many failed attempts. Try other Email Address.</p>
          <p class="text-xs text-red-400">
            Please try again in <span class="font-bold">{{ formattedLockout }}</span>.
          </p>
        </div>
      </Transition>

      <div class="space-y-5">
        <FormField v-model="emailAddress" label="email address" type="email" placeholder="hello@example.com"
          :error="emailError" :disabled="isAnyLoading" required />
        <FormField v-model="password" label="password" type="password" placeholder="••••••••"
          :disabled="isAnyLoading || isLockedOut" required />

        <!-- password error with bold support -->
        <p v-if="passwordError" class="flex items-center gap-1 text-xs text-red-400 -mt-3">
          <Info class="size-3 shrink-0" />
          <span v-html="passwordError" />
        </p>

        <button type="button" :disabled="isAnyLoading" @click="showForgotPassword = true"
          class="text-sm text-primary cursor-pointer w-fit hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
          Forgot Password?
        </button>
      </div>

      <ModalForgotPassword v-model="showForgotPassword" />

      <Button type="submit" size="lg" block :disabled="isAnyLoading || isLockedOut">
        <p>{{ isLoading ? 'Signing in...' : isGoogleLoading ? 'Signing In...' : 'Sign In' }}</p>
      </Button>

      <p class="text-sm text-muted text-center">
        Don't have an account?
        <NuxtLink to="/register" class="text-primary hover:underline">Sign Up</NuxtLink>
      </p>
    </section>
  </form>
</template>