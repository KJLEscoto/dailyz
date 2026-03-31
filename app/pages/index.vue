<script setup lang="ts">
const hasUser = ref(false)

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

function handleLogin() {
  errors.email = form.email ? '' : 'Email is required'
  errors.password = form.password.length >= 8 ? '' : 'Min 8 characters'
}

function handleGoogleLogin() {
  console.log('google');
}
</script>

<template>
  <main class="min-h-screen px-4 py-20 w-full flex items-center justify-center relative overflow-hidden">
    <div v-if="!hasUser" class="max-w-lg mx-auto w-full flex flex-col items-center gap-6">
      <section class="flex items-center gap-1">
        <img class="size-6 shrink-0" src="/images/icon_primary.svg" alt="dailyz">
        <p class="font-secondary font-bold text-2xl text-primary">Dailyz</p>
      </section>
      <section class="text-center space-y-2">
        <h1 class="text-4xl text-black font-bold font-primary ">Welcome back!</h1>
        <p class="text-muted text-lg">Continue your journey to a mindful lifestyle.</p>
      </section>

      <form @submit.prevent="handleLogin" class="flex flex-col gap-6 rounded-3xl p-10 bg-white w-full shadow">

        <FormField v-model="form.email" label="Email" type="email" placeholder="hello@example.com" :error="errors.email"
          required />

        <FormField v-model="form.password" label="Password" type="password" placeholder="••••••••"
          :error="errors.password" required />

        <section class="flex flex-col gap-2">
          <Button type="submit" size="lg">Sign In</Button>
          <NuxtLink to="#" class="text-sm text-primary hover:underline cursor-pointer select-none w-fit">Forgot
            password?
          </NuxtLink>
        </section>

        <section class="flex items-center gap-4">
          <hr class="w-full border-black/5">
          <p class="text-muted/50 text-nowrap text-xs font-bold">OR SIGN IN WITH EMAIL</p>
          <hr class="w-full border-black/5">
        </section>

        <Button @click="handleGoogleLogin" size="lg" class="w-full bg-foreground! text-muted! flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 48 48">
            <rect width="48" height="48" fill="none" />
            <path fill="#ffc107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917" />
            <path fill="#ff3d00"
              d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691" />
            <path fill="#4caf50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44" />
            <path fill="#1976d2"
              d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917" />
          </svg>
          Continue with Google
        </Button>
      </form>

    </div>
  </main>
</template>