<!-- pages/index.vue -->
<script setup lang="ts">
import type { Habit } from '~/types/habit';

const { sampleHabits, toggleCompletion, reorder } = useSampleHabits()
</script>

<template>
  <section class="space-y-2 text-center w-full">
    <img src="/images/mascot/intro_model.png" alt="Dailyz Mascot Meditate" class="w-full h-auto object-cover" />
    <h1 class="md:text-3xl text-xl font-bold text-primary">Your path to serenity begins here.</h1>
    <p class="text-muted md:text-lg text-sm">Create your habits for a more mindful life.</p>
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
</template>