<!-- layouts/auth.vue -->
<script setup lang="ts">
const habitStore = useHabitStore()
const habits = computed(() => habitStore.habits)

const { signOut } = useAuth() // 👈 only signOut needed here
const { formatted } = useDate()
const { habitsCount, completedCount, percentageCompleted } = useHabitStats(habits)
</script>

<template>
  <div class="w-full max-w-xl mx-auto px-4 pb-30 relative">
    <AuthAppHeader :formatted="formatted" :completed-count="completedCount" :habits-count="habitsCount"
      :percentage-completed="percentageCompleted" :sign-out="signOut" />
    <slot />
    <AuthBottomNav />
  </div>
</template>