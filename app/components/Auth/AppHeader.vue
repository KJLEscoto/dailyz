<!-- components/AppHeader.vue -->
<script setup lang="ts">
defineProps<{
  formatted: string
  completedCount: number
  habitsCount: number
  percentageCompleted: number
}>()

const { user } = useAuth()

const firstName = computed(() => user.value?.displayName?.split(' ')[0] ?? 'there')
</script>

<template>
  <header class="sticky top-0 z-30 bg-foreground flex items-center justify-between gap-10 py-5">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold">Hi, <span class="capitalize">{{ firstName }}</span>!</h1>
      <UppercaseTitle size="sm">{{ formatted }}</UppercaseTitle>
    </div>

    <div class="flex items-center gap-3 px-5 py-3 bg-black/3 rounded-3xl">
      <section class="flex flex-col items-end gap-1">
        <h1 class="text-2xl text-primary font-semibold text-nowrap">{{ completedCount }}/{{ habitsCount }}</h1>
        <UppercaseTitle size="sm">progress</UppercaseTitle>
      </section>
      <ProgressRing :percentage="percentageCompleted" :completed="completedCount" :total="habitsCount" />
    </div>
  </header>
</template>