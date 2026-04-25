<script setup lang="ts">
const { signIn, signInWithGoogle } = useAuth()

const emailAddress = ref('')
const emailError = ref('')
const password = ref('')
const passwordError = ref('')
const isLoading = ref(false)

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

  isLoading.value = true
  try {
    await signIn(emailAddress.value, password.value)
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      passwordError.value = 'Incorrect email or password.'
    } else if (error.code === 'auth/user-not-found') {
      emailError.value = 'No account found with this email.'
    } else if (error.code === 'auth/invalid-email') {
      emailError.value = 'Invalid email address.'
    } else {
      console.error('Login error:', error)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="flex items-center flex-col justify-center min-h-screen py-20 gap-10">
    <section class="text-center space-y-3">
      <h1 class="text-4xl font-bold text-primary">Welcome back!</h1>
      <p class="text-muted">Sign in to continue building your habits.</p>
    </section>

    <form class="w-full bg-white rounded-4xl p-10 space-y-10 h-full shadow-lg" @submit.prevent="handleLogin">

      <!-- Google Sign In -->
      <button @click="signInWithGoogle" type="button"
        class="w-full h-auto py-3 px-10 shrink-0 bg-muted/10 rounded-2xl flex items-center justify-center gap-3
        cursor-pointer hover:bg-muted/20 transition-colors duration-150">
        <img src="/images/webp/google.webp" alt="Sign in with Google" class="size-6" />
        <p class="text-nowrap">Sign in with Google</p>
      </button>

      <!-- Divider -->
      <div class="flex items-center gap-3">
        <hr class="border-muted/20 w-full" />
        <UppercaseTitle size="sm">or sign in with email</UppercaseTitle>
        <hr class="border-muted/20 w-full" />
      </div>

      <!-- Email & Password -->
      <section class="space-y-6">
        <div class="space-y-5">
          <FormField v-model="emailAddress" label="email address" type="email" placeholder="hello@example.com"
            :error="emailError" required />
          <FormField v-model="password" label="password" type="password" placeholder="••••••••" :error="passwordError"
            required />
          <button type="button" class="text-sm text-primary cursor-pointer w-fit hover:underline">Forgot
            Password?</button>
        </div>

        <Button type="submit" size="lg" block :disabled="isLoading">
          <p>{{ isLoading ? 'Signing in...' : 'Sign In' }}</p>
        </Button>

        <p class="text-sm text-muted text-center">
          Don't have an account?
          <NuxtLink to="/register" class="text-primary hover:underline">Sign Up</NuxtLink>
        </p>
      </section>

    </form>
  </main>
</template>