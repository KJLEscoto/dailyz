<!-- pages/index.vue -->
<script setup lang="ts">
import type { Habit } from '~/types/habit';

definePageMeta({ layout: 'default', middleware: 'guest' })

const { sampleHabits, toggleCompletion, reorder } = useSampleHabits()
</script>

<template>
  <div class="w-full space-y-10">
    <section class="space-y-3 text-center w-full">
      <h1 class="text-3xl font-bold text-primary">Your path to serenity begins here.</h1>
      <p class="text-muted">Create your habits and start building a more mindful life.</p>
    </section>

    <HabitList :habits="sampleHabits" :has-menu="false" @toggle="toggleCompletion" @reorder="reorder" />

    <section class="flex items-center gap-3 justify-center w-full">
      <hr class="border-muted/20 w-full" />
      <div class="size-2 shrink-0 bg-primary rounded-full" />
      <hr class="border-muted/20 w-full" />
    </section>

    <section class="space-y-5 text-center">
      <Button size="lg" to="/login">
        <p>Get Started</p>
      </Button>
    </section>
  </div>
</template>