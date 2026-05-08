<!-- pages/register.vue -->
<script setup lang="ts">
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import type { Auth } from 'firebase/auth'

const { signUpWithGoogle } = useAuth()
const userStore = useUserStore()

const fullName = ref('')
const fullNameError = ref('')
const emailAddress = ref('')
const emailError = ref('')
const password = ref('')
const passwordError = ref('')
const confirmPassword = ref('')
const confirmPasswordError = ref('')
const isLoading = ref(false)
const isGoogleLoading = ref(false) // 👈
const showGoogleUnavailable = ref(false)

const isAnyLoading = computed(() => isLoading.value || isGoogleLoading.value)

const handleGoogleSignUp = async () => {
  // TODO: Re-enable when Google Sign-Up is available
  showGoogleUnavailable.value = true
  return

  isGoogleLoading.value = true
  try {
    await signUpWithGoogle()
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return

    if (error.code === 'auth/email-already-in-use') {
      // sign them out since Firebase auto signed them in
      const { $firebase } = useNuxtApp()
      await $firebase.auth.signOut()

      await navigateTo({
        path: '/login',
        state: { email: error.customData?.email ?? '', error: 'existing' }
      }, { replace: true })
      return
    }

    console.error('Google sign up error:', error)
  } finally {
    isGoogleLoading.value = false
  }
}

const handleRegister = async () => {
  fullNameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  let hasError = false
  if (!fullName.value.trim()) {
    fullNameError.value = 'Full name is required.'
    hasError = true
  }
  if (!emailAddress.value.trim()) {
    emailError.value = 'Email address is required.'
    hasError = true
  }
  if (!password.value.trim()) {
    passwordError.value = 'Password is required.'
    hasError = true
  }
  if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters.'
    hasError = true
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match.'
    hasError = true
  }
  if (hasError) return

  isLoading.value = true
  try {
    const { $firebase } = useNuxtApp()
    const auth = $firebase.auth as Auth

    const { user } = await createUserWithEmailAndPassword(auth, emailAddress.value, password.value)
    await updateProfile(user, { displayName: fullName.value })
    await userStore.createUser(user.uid, {
      fullName: fullName.value,
      email: emailAddress.value,
      photoURL: user.photoURL ?? '',
      createdAt: new Date().toISOString(),
    })

    await navigateTo('/')
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      emailError.value = 'This email is already registered.'
    } else if (error.code === 'auth/invalid-email') {
      emailError.value = 'Invalid email address.'
    } else if (error.code === 'auth/weak-password') {
      passwordError.value = 'Password is too weak.'
    } else {
      console.error('Register error:', error)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <!-- Google unavailable alert -->
  <Alert type="danger" title="Under Maintenance!" message="Please register using the form below."
    :visible="showGoogleUnavailable" :timeout="5000" @dismiss="showGoogleUnavailable = false" />

  <section class="text-center space-y-3">
    <h1 class="text-4xl font-bold text-primary">Create an Account</h1>
    <p class="text-muted">Sign up to start building your habits.</p>
  </section>

  <form class="w-full bg-white rounded-4xl md:p-10 p-6 space-y-10 h-full shadow-lg" @submit.prevent="handleRegister">
    <section class="space-y-6">
      <div class="space-y-5">
        <FormField v-model="fullName" label="Full Name" type="text" placeholder="John Doe" :error="fullNameError"
          :disabled="isAnyLoading" required />
        <FormField v-model="emailAddress" label="Email Address" type="email" placeholder="john@gmail.com"
          :error="emailError" :disabled="isAnyLoading" required />
        <FormField v-model="password" label="Password" type="password" placeholder="••••••••" :error="passwordError"
          :disabled="isAnyLoading" required />
        <FormField v-model="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••"
          :error="confirmPasswordError" :disabled="isAnyLoading" required />
      </div>

      <Button type="submit" size="lg" block :disabled="isAnyLoading">
        <p>{{ isLoading ? 'Creating account...' : isGoogleLoading ? 'Signing up with Google...' : 'Register' }}</p>
      </Button>

      <div class="flex items-center gap-3">
        <hr class="border-muted/20 w-full" />
        <UppercaseTitle size="sm">or</UppercaseTitle>
        <hr class="border-muted/20 w-full" />
      </div>

      <button @click="handleGoogleSignUp" type="button" :disabled="isAnyLoading"
        class="w-full h-auto py-3 px-10 shrink-0 bg-muted/10 rounded-2xl flex items-center justify-center gap-3
        cursor-pointer hover:bg-muted/20 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
        <img v-if="!isGoogleLoading" src="/images/webp/google.webp" alt="Sign up with Google" class="size-6" />
        <div v-else class="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p class="text-nowrap">{{ isGoogleLoading ? 'Signing up...' : 'Continue with Google' }}</p>
      </button>

      <p class="text-sm text-muted text-center">
        Already have an account?
        <NuxtLink to="/login" class="text-primary hover:underline">Sign In</NuxtLink>
      </p>
    </section>
  </form>
</template>