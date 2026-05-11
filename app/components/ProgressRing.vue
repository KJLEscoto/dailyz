<!-- components/ProgressRing.vue -->
<script setup lang="ts">
import { LogOut, UserRound } from '@lucide/vue'
import type { MenuItem } from '~/components/MainMenu.vue'

const { photoURL } = useUserPhoto()
const { user } = useAuth()
const { handleSignOut, cancelSignOut, signOutLoading, countdown } = useSignOut()

const props = defineProps<{
  percentage: number
  completed: number
  total: number
}>()

const circumference = 2 * Math.PI * 24
const dashOffset = ref(circumference)

const firstName = computed(() => user.value?.displayName?.split(' ')[0] ?? 'there')

const userMenuItems: MenuItem[] = [
  { label: 'Profile', icon: UserRound, action: () => navigateTo('/profile') },
  { label: 'Sign Out', icon: LogOut, action: () => handleSignOut(), danger: true },
]

onMounted(() => {
  watchEffect(() => {
    dashOffset.value = circumference * (1 - props.percentage / 100)
  })
})
</script>

<template>
  <section class="rounded-full size-16 flex items-center justify-center select-none relative shrink-0">
    <!-- Sign out progress -->
    <Alert type="danger" title="Signing out..."
      :message="`You will be signed out in ${countdown} second${countdown !== 1 ? 's' : ''}.`" :visible="signOutLoading"
      :dismissible="false" :actions="[
        { label: 'No, stay logged in', onClick: cancelSignOut },
      ]" />

    <svg class="absolute inset-0 -rotate-90" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="24" stroke="var(--color-foreground)" stroke-width="4" stroke-opacity="0.1" />
      <circle cx="28" cy="28" r="24" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round"
        :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" class="transition-all duration-500" />
    </svg>

    <MainMenu :items="userMenuItems" :menu-width="200">
      <template #trigger>
        <div class="relative size-12 rounded-full shrink-0 overflow-hidden transition-all">
          <ClientOnly>
            <img v-if="photoURL" :src="photoURL" :alt="firstName"
              class="w-full h-full object-cover hover:scale-110 transition-transform" referrerpolicy="no-referrer" />
            <img v-else src="/images/default_user.png" :alt="firstName" class="w-full h-full object-cover" />
            <template #fallback>
              <Skeleton width="3rem" height="3rem" rounded="9999px" />
            </template>
          </ClientOnly>
        </div>
      </template>
    </MainMenu>
  </section>
</template>