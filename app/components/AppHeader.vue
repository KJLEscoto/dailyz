<!-- components/AppHeader.vue -->
<script setup lang="ts">
import { LogOut, UserRound, ChevronDown } from '@lucide/vue'
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

const firstName = computed(() => user.value?.displayName?.split(' ')[0] ?? 'there')
</script>

<template>
  <header class="sticky top-0 z-30 bg-foreground flex items-center justify-between gap-10 py-10">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold">Hi, <span class="capitalize">{{ firstName }}</span>!</h1>
      <UppercaseTitle size="sm">{{ formatted }}</UppercaseTitle>
    </div>

    <section class="flex items-center justify-center gap-3">
      <div class="flex items-center gap-4 px-5 py-3 bg-black/3 rounded-3xl">
        <section class="flex flex-col items-end gap-2">
          <h1 class="text-2xl text-primary font-semibold text-nowrap">{{ completedCount }}/{{ habitsCount }}</h1>
          <UppercaseTitle size="sm">progress</UppercaseTitle>
        </section>
        <ProgressRing :percentage="percentageCompleted" :completed="completedCount" :total="habitsCount" />
      </div>

      <MainMenu :items="userMenuItems" :menu-width="200">
        <template #trigger>
          <div class="relative group">
            <div class="relative size-16 rounded-full shrink-0 overflow-hidden transition-all">
              <img :src="user?.photoURL ?? '/images/default_user.png'" :alt="user?.displayName ?? undefined"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform"
                referrerpolicy="no-referrer" />
            </div>
            <div class=" absolute -bottom-2 right-0 p-1 bg-white rounded-full border border-muted/30">
              <ChevronDown class="size-4 text-muted-foreground" />
            </div>
          </div>
        </template>
      </MainMenu>
    </section>
  </header>
</template>