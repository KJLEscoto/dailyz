<!-- components/AppHeader.vue -->
<script setup lang="ts">
import { LogOut, UserRound } from '@lucide/vue'
import type { MenuItem } from '~/components/MainMenu.vue'

const { user, signOut } = useAuth()

defineProps<{
  formatted: string
  completedCount: number
  habitsCount: number
  percentageCompleted: number
}>()

const userMenuItems: MenuItem[] = [
  { label: 'Profile', icon: UserRound, action: () => navigateTo('/profile') },
  { label: 'Logout', icon: LogOut, action: () => signOut(), danger: true },
]

</script>

<template>
  <header class="sticky top-0 z-30 bg-foreground flex items-center justify-between gap-10 py-16">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold">Today's Habits</h1>
      <UppercaseTitle size="lg">{{ formatted }}</UppercaseTitle>
    </div>

    <section class="flex items-center justify-center gap-5">
      <div class="flex items-center gap-4 px-5 py-3 bg-black/3 rounded-3xl">
        <section class="flex flex-col items-end gap-2">
          <UppercaseTitle size="sm">daily progress</UppercaseTitle>
          <h1 class="text-3xl text-primary font-semibold text-nowrap">{{ completedCount }}/{{ habitsCount }} done</h1>
        </section>
        <ProgressRing :percentage="percentageCompleted" :completed="completedCount" :total="habitsCount" />
      </div>
    
      <MainMenu :items="userMenuItems" :menu-width="200">
        <template #trigger>
          <img :src="user?.photoURL ?? '/images/default_user.svg'" :alt="user?.displayName ?? undefined"
            class="size-20 shrink-0 rounded-full object-cover hover:ring-2 hover:ring-primary transition-all"
            referrerpolicy="no-referrer" />
        </template>
      </MainMenu>
    </section>
  </header>
</template>