<!-- index.vue -->
<script setup lang="ts">
const { user, authReady, initAuth } = useAuth()
const habitStore = useHabitStore()

definePageMeta({ layout: false })

onMounted(() => {
  initAuth(
    // onLogin — fires every time auth state confirms a logged-in user
    async () => {
      await habitStore.fetchHabits()
      await habitStore.resetStaleStreaks()
    },
    // onLogout
    () => {
      habitStore.habits = []
    }
  )
})

watch(user, async (newUser) => {
  if (newUser) {
    await habitStore.fetchHabits()
    await habitStore.resetStaleStreaks()
  } else {
    habitStore.habits = []
  }
})
</script>

<template>
  <!-- Fixed overlay spinner — independent of layout -->
  <div v-if="!authReady" class="fixed inset-0 z-50 flex items-center justify-center bg-foreground">
    <div class="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>

  <template v-else>
    <main>
      <!-- Not logged in -->
      <NuxtLayout v-if="!user" name="default">
        <section class="flex items-center justify-center min-h-screen py-20">
          <div class="w-full space-y-10">
            <Guest />
          </div>
        </section>
      </NuxtLayout>

      <!-- Logged in -->
      <NuxtLayout v-else name="auth">
        <Auth />
      </NuxtLayout>
    </main>

  </template>
</template>