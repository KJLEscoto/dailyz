<!-- layouts/auth.vue -->
<script setup lang="ts">
const habitStore = useHabitStore()
const habits = computed(() => habitStore.habits)

const { formatted } = useDate()
const { habitsCount, completedCount, percentageCompleted } =
  useHabitStats(habits)
</script>

<template>
  <div class="w-full max-w-xl mx-auto px-4 pb-40 relative">
    <AppHeader :formatted="formatted" :completed-count="completedCount" :habits-count="habitsCount"
      :percentage-completed="percentageCompleted" />
    <slot />
    <AuthBottomNav />

  </div>
</template>