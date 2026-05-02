<!-- components/ProgressRing.vue -->
<script setup lang="ts">
import { LogOut, UserRound } from '@lucide/vue'
import type { MenuItem } from '~/components/MainMenu.vue'

  const props = defineProps<{
  percentage: number
  completed: number
  total: number
}>()

const circumference = 2 * Math.PI * 24
const dashOffset = ref(circumference) // 👈 start as "empty" ring

const userMenuItems: MenuItem[] = [
  { label: 'Profile', icon: UserRound, action: () => navigateTo('/profile') },
  { label: 'Sign Out', icon: LogOut, action: () => signOut(), danger: true },
]

const { user, signOut } = useAuth()

onMounted(() => {
  watchEffect(() => {
    dashOffset.value = circumference * (1 - props.percentage / 100)
  })
})
</script>

<template>
  <section
    class="rounded-full size-16 flex items-center justify-center select-none relative shrink-0">
    <svg class="absolute inset-0 -rotate-90" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="24" stroke="var(--color-foreground)" stroke-width="4" stroke-opacity="0.1" />
      <circle cx="28" cy="28" r="24" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round"
        :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" class="transition-all duration-500" />
    </svg>
    <!-- <p class="text-primary font-semibold text-sm">{{ percentage }}%</p> -->
    <MainMenu :items="userMenuItems" :menu-width="200">
      <template #trigger>
        <div class="relative size-12 rounded-full shrink-0 overflow-hidden transition-all">
          <img :src="user?.photoURL ?? '/images/default_user.png'" :alt="user?.displayName ?? undefined"
            class="w-full h-full object-cover hover:scale-110 transition-transform"
            referrerpolicy="no-referrer" />
        </div>
      </template>
    </MainMenu>
  </section>
</template>