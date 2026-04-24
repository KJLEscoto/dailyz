<!-- components/Habit/Sidebar.vue -->
<script setup lang="ts">
import { PanelsTopLeft, CalendarRange, PlusCircle } from '@lucide/vue'

defineProps<{
  habitsCount: number
  completedCount: number
  highestStreak: number
}>()

defineEmits<{ addHabit: [] }>()
</script>

<template>
  <aside class="sticky top-55 col-span-12 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-none w-full">
    <Button @click="$emit('addHabit')" size="lg" class="group rounded-3xl! py-8! group" block>
      <template #icon-left>
        <PlusCircle
          class="size-5 opacity-20 rotate-0 group-hover:rotate-90 duration-200 ease-in transition-all group-hover:opacity-100 pointer-events-none" />
      </template>
      <p class="text-xl text-nowrap">New Habit</p>
    </Button>

    <div class="space-y-4 p-6 bg-white rounded-4xl">
      <section class="flex items-center gap-1 w-full">
        <PanelsTopLeft class="size-5 opacity-40 pointer-events-none" />
        <UppercaseTitle class="text-black!" size="md">overview</UppercaseTitle>
      </section>

      <section class="flex items-center gap-4 w-full">
        <div class="space-y-1 rounded-3xl p-5 border-b border-primary bg-foreground w-full">
          <UppercaseTitle class="text-muted" size="sm">habits</UppercaseTitle>
          <p class="font-bold text-primary text-2xl">{{ habitsCount }}</p>
        </div>
        <div class="space-y-1 rounded-3xl p-5 border-b border-primary bg-foreground w-full">
          <UppercaseTitle class="text-muted" size="sm">done</UppercaseTitle>
          <p class="font-bold text-primary text-2xl">{{ completedCount }}</p>
        </div>
      </section>

      <section class="rounded-3xl p-5 border-b border-primary bg-foreground w-full flex items-end justify-between">
        <div class="space-y-1">
          <UppercaseTitle class="text-muted" size="sm">streak calendar</UppercaseTitle>
          <p class="font-bold text-primary text-2xl">
            {{ highestStreak }}
            <span>{{ highestStreak < 2 ? 'day' : 'days' }}</span>
          </p>
        </div>
        <CalendarRange class="size-10 text-primary pointer-events-none" />
      </section>

      <section class="space-y-2">
        <NatureImage />
        <DailyQuote />
      </section>
    </div>
  </aside>
</template>