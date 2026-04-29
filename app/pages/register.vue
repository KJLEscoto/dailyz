<!-- pages/register.vue -->
<script setup lang="ts">
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import type { Auth } from 'firebase/auth'

definePageMeta({ layout: 'default', middleware: 'guest' })

const { signInWithGoogle } = useAuth()
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

const handleRegister = async () => {
  // reset errors
  fullNameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  // validate
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

    // create firebase auth user
    const { user } = await createUserWithEmailAndPassword(auth, emailAddress.value, password.value)

    // update display name in firebase auth
    await updateProfile(user, { displayName: fullName.value })

    // save to users collection in firestore
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
  <section class="text-center space-y-3">
    <h1 class="text-4xl font-bold text-primary">Create an Account</h1>
    <p class="text-muted">Sign up to start building your habits.</p>
  </section>

  <form class="w-full bg-white rounded-4xl p-10 space-y-10 h-full shadow-lg" @submit.prevent="handleRegister">
    <section class="space-y-6">
      <div class="space-y-5">
        <FormField v-model="fullName" label="Full Name" type="text" placeholder="Scott Skwiril" :error="fullNameError"
          required />
        <FormField v-model="emailAddress" label="Email Address" type="email" placeholder="scott@example.com"
          :error="emailError" required />
        <FormField v-model="password" label="Password" type="password" placeholder="••••••••" :error="passwordError"
          required />
        <FormField v-model="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••"
          :error="confirmPasswordError" required />
      </div>

      <!-- Submit -->
      <Button type="submit" size="lg" block :disabled="isLoading">
        <p>{{ isLoading ? 'Creating account...' : 'Register' }}</p>
      </Button>

      <!-- Divider -->
      <div class="flex items-center gap-3">
        <hr class="border-muted/20 w-full" />
        <UppercaseTitle size="sm">or</UppercaseTitle>
        <hr class="border-muted/20 w-full" />
      </div>

      <!-- Google Sign In -->
      <button @click="signInWithGoogle" type="button"
        class="w-full h-auto py-3 px-10 shrink-0 bg-muted/10 rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors duration-150">
        <img src="/images/webp/google.webp" alt="Sign up with Google" class="size-6" />
        <p class="text-nowrap">Continue with Google</p>
      </button>

      <p class="text-sm text-muted text-center">
        Already have an account?
        <NuxtLink to="/login" class="text-primary hover:underline">Sign In</NuxtLink>
      </p>
    </section>
  </form>
</template>