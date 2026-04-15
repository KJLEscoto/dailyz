<!-- components/AppHeader.vue -->
<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

defineProps<{
  formatted: string
  completedCount: number
  habitsCount: number
  percentageCompleted: number
}>()

const { user, signIn, signOut } = useAuth()
</script>

<template>
  <header class="sticky top-0 z-30 bg-foreground flex items-center justify-between gap-10 py-16">
    <div class="space-y-2">
      <h1 class="text-4xl font-semibold">Today's Habits</h1>
      <UppercaseTitle size="lg">{{ formatted }}</UppercaseTitle>
    </div>

    <section class="flex items-center justify-center gap-5">
      <div class="flex items-center gap-4 px-5 py-3 bg-black/3 rounded-3xl">
        <section class="flex flex-col items-end gap-2">
          <UppercaseTitle size="md">daily progress</UppercaseTitle>
          <h1 class="text-3xl text-primary font-semibold">{{ completedCount }}/{{ habitsCount }} done</h1>
        </section>
        <ProgressRing :percentage="percentageCompleted" :completed="completedCount" :total="habitsCount" />
      </div>

      <button v-if="!user" @click="signIn"
        class="size-20 shrink-0 bg-white rounded-full flex items-center justify-center cursor-pointer">
        <img src="" alt="Sign in with Google" class="size-8" />
      </button>
      <button v-else @click="signOut" class="size-20 shrink-0 rounded-full overflow-hidden cursor-pointer">
        <img :src="user.photoURL ?? undefined" :alt="user.displayName ?? undefined" class="w-full h-full object-cover"
          referrerpolicy="no-referrer" />
      </button>
    </section>
  </header>
</template>