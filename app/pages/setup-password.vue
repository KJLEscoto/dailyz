<script setup lang="ts">
definePageMeta({ middleware: 'setup-password' })

const { linkPassword } = useAuth()

const password = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const isLoading = ref(false)
const isSetupComplete = ref(false)

const handleSubmit = async () => {
  passwordError.value = ''
  confirmPasswordError.value = ''

  let hasError = false
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
    await linkPassword(password.value)
    isSetupComplete.value = true
    await navigateTo('/home', { replace: true })
  } catch (error: any) {
    if (error.code === 'auth/weak-password') {
      passwordError.value = 'Password is too weak.'
    } else if (error.code === 'auth/requires-recent-login') {
      passwordError.value = 'Session expired. Please sign in with Google again.'
    } else if (error.code === 'auth/credential-already-in-use') {
      passwordError.value = 'This password is already linked to another account.'
    } else {
      console.error('Link password error:', error)
    }
  } finally {
    isLoading.value = false
  }
}

// If user abandons setup (back button, closes tab), just sign them out cleanly.
// Their Firebase Auth account stays intact — they can sign in with Google again
// and will be prompted to finish setup via the middleware.
const handleAbandon = async () => {
  if (isSetupComplete.value) return
  const { $firebase } = useNuxtApp()
  try {
    await $firebase.auth.signOut()
  } catch {
    // best-effort
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleAbandon)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleAbandon)
  handleAbandon()
})
</script>

<template>
  <section class="text-center space-y-3">
    <h1 class="text-4xl font-bold text-primary">Set Up Your Password</h1>
    <p class="text-muted">Create a password so you can also sign in with your email.</p>
  </section>

  <form class="w-full bg-white rounded-4xl md:p-10 p-6 space-y-10 shadow-lg" @submit.prevent="handleSubmit">
    <section class="space-y-6">
      <div class="space-y-5">
        <FormField v-model="password" label="Password" type="password" placeholder="••••••••" :error="passwordError"
          :disabled="isLoading" required />
        <FormField v-model="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••"
          :error="confirmPasswordError" :disabled="isLoading" required />
      </div>

      <Button type="submit" size="lg" block :disabled="isLoading">
        <p>{{ isLoading ? 'Setting up your account...' : 'Continue' }}</p>
      </Button>
    </section>
  </form>
</template>