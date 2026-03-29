<script setup lang="ts">
const hasUser = ref(false)

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

function handleLogin() {
  errors.email = form.email ? '' : 'Email is required'
  errors.password = form.password.length >= 8 ? '' : 'Min 8 characters'
}
</script>

<template>
  <main class="min-h-screen px-4 py-20 w-full flex items-center justify-center relative overflow-hidden">
    <div v-if="!hasUser" class="max-w-lg mx-auto w-full flex flex-col items-center gap-6">
      <section class="flex items-center gap-1">
        <img class="size-6 shrink-0" src="/images/icon_primary.svg" alt="dailyz">
        <p class="font-primary font-bold text-2xl text-primary">Dailyz</p>
      </section>
      <section class="text-center space-y-2">
        <h1 class="text-4xl text-black font-bold font-primary ">Welcome back!</h1>
        <p class="font-secondary text-muted text-lg">Continue your journey to a mindful lifestyle.</p>
      </section>

      <form @submit.prevent="handleLogin" class="flex flex-col gap-6 rounded-3xl p-10 bg-white w-full shadow">

        <FormField v-model="form.email" label="Email" type="email" placeholder="hello@example.com" :error="errors.email" required/>

        <FormField v-model="form.password" label="Password" type="password" placeholder="••••••••"
          :error="errors.password" required/>

        <Button type="submit" size="lg">Sign In</Button>
      </form>
    </div>
  </main>
</template>