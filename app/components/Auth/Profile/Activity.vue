<!-- components/Auth/Profile/LastLogin.vue -->
<script setup lang="ts">
import { Clock } from '@lucide/vue'
import { format } from 'date-fns'

const { user } = useAuth()

const lastLogin = computed(() => {
  const time = user.value?.metadata?.lastSignInTime
  if (!time) return null
  return format(new Date(time), 'MMMM d, yyyy • h:mm a')
})

const createdAt = computed(() => {
  const time = user.value?.metadata?.creationTime
  if (!time) return null
  return format(new Date(time), 'MMMM d, yyyy')
})
</script>

<template>
  <section class="bg-white rounded-3xl p-6 flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <Clock class="size-4 text-black/30" />
      <h3 class="text-sm font-semibold text-black/70">Account Activity</h3>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-sm text-black/50">Last login</span>
        <span class="text-sm font-medium text-black/70">{{ lastLogin ?? '—' }}</span>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-black/5">
        <span class="text-sm text-black/50">Member since</span>
        <span class="text-sm font-medium text-black/70">{{ createdAt ?? '—' }}</span>
      </div>
    </div>
  </section>
</template>