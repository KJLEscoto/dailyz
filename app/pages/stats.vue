<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const habitStore = useHabitStore()
const habits = computed(() => habitStore.habits)
</script>

<template>
  <div class="grid grid-cols-2 gap-4">

    <AuthStatsStreak :habits="habits" />

    <section class="row-span-2 h-full">
      <AuthStatsDonut :habits="habits" />
    </section>

    <AuthStatsWeekly :habits="habits" />

    <!-- calendar -->
    <section class="col-span-2">
      <AuthStatsCalendar :habits="habits" />
    </section>
  </div>
</template>