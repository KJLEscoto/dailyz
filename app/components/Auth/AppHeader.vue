<!-- components/Auth/AppHeader.vue -->
<script setup lang="ts">
const props = defineProps<{
  formatted: string
  completedCount: number
  habitsCount: number
  percentageCompleted: number
  signOut: () => Promise<void>
}>()

const { user } = useAuth() // 👈 directly here too
const firstName = computed(() => user.value?.displayName?.split(' ')[0] ?? 'there')
</script>

<template>
  <header class="sticky top-0 z-30 bg-foreground flex items-center justify-between gap-5 md:py-5 py-3">
    <div class="md:space-y-2 space-y-1 max-w-1/2 w-full">
      <UppercaseTitle size="sm">{{ formatted }}</UppercaseTitle>
      <ClientOnly>
        <h1 class="md:text-3xl text-2xl font-semibold text-nowrap truncate">
          Hi, {{ firstName }}!
        </h1>
        <template #fallback>
          <h1 class="md:text-3xl text-2xl font-semibold text-nowrap truncate">
            Hi, there!
          </h1>
        </template>
      </ClientOnly>
    </div>

    <div class="flex items-center gap-2 md:px-5 px-3 md:py-3 py-1.5 bg-black/3 rounded-3xl">
      <section class="flex flex-col items-end gap-1">
        <ClientOnly>
          <h1 class="text-2xl text-primary font-semibold text-nowrap">
            {{ completedCount }}/{{ habitsCount }}
          </h1>
          <template #fallback>
            <h1 class="text-2xl text-primary font-semibold text-nowrap">0/0</h1>
          </template>
        </ClientOnly>
        <UppercaseTitle size="sm">progress</UppercaseTitle>
      </section>
      <ProgressRing :percentage="percentageCompleted" :completed="completedCount" :total="habitsCount"
        :sign-out="signOut" />
    </div>
  </header>
</template>