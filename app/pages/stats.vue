<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const habitStore = useHabitStore()
const habits = computed(() => habitStore.habits)
</script>

<template>
  <div class="grid grid-cols-2 gap-4">

    <AuthStatsStreak :habits="habits" />

    <!-- i want the auth stats weekly to be here in md -->
    <span class="md:hidden block">
      <AuthStatsWeekly :habits="habits" />
    </span>

    <section class="md:row-span-2 md:col-span-1 col-span-2 row-span-1 h-full">
      <AuthStatsPie :habits="habits" />
    </section>

    <span class="hidden md:block">
      <AuthStatsWeekly :habits="habits" />
    </span>

    <!-- calendar -->
    <section class="col-span-2">
      <AuthStatsCalendar :habits="habits" />
    </section>
  </div>
</template>