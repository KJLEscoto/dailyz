<script setup lang="ts">
import { Flame } from '@lucide/vue';

</script>

<template>
  <main class="min-h-screen w-full max-w-6xl mx-auto px-4 py-16 relative overflow-hidden">
    <header class="flex items-center justify-between gap-10">
      <div class="space-y-2">
        <section class="flex items-center gap-4 font-semibold">
          <h1 class="text-4xl">Today's Habits</h1>
          <div class="text-base font-secondary text-danger bg-danger/10 px-4 rounded-full py-2 flex items-center">
            <Flame class="size-5 pointer-events-none" />
            <p class="text-nowrap">14d streak</p>
          </div>
        </section>
        <UppercaseTitle size="lg">saturday, mar 28</UppercaseTitle>
      </div>

      <div class="flex items-center gap-4 px-5 py-3 bg-black/3 rounded-3xl">
        <section class="flex flex-col items-end gap-2">
          <UppercaseTitle size="md">daily progress</UppercaseTitle>
          <h1 class="text-3xl text-primary font-semibold">3/4 done</h1>
        </section>
        <section class="ring-4 ring-black/5 rounded-full size-14 flex items-center justify-center">
          <div class="ring-4 ring-primary rounded-full size-12 flex items-center justify-center">
            <p class="text-primary font-semibold">100%</p>
          </div>  
        </section>
      </div>
    </header>

    <!-- content -->
    <div class="mt-20">
      <UppercaseTitle class="font-primary! font-semibold!" size="md">TO DO</UppercaseTitle>
    </div>
  </main>
</template>