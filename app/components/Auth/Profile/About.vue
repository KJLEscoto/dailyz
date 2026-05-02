<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue';

</script>

<!-- components/Profile/About.vue -->
<template>
  <section class="bg-white rounded-3xl p-6 relative overflow-hidden">
    <div class="w-2/3 md:space-y-4 space-y-3">
      <div>
        <h3 class="text-xl font-bold text-primary">Dailyz</h3>
        <p class="text-sm text-black/40">Habit Tracker</p>
      </div>
      <p class="text-sm text-black/70 md:leading-relaxed">
        Dailyz helps you build mindful daily habits, track your progress, and stay consistent — one day at a time.
      </p>
      <hr class="border-black/5" />
      <div class="flex items-center gap-1 text-xs">
        <span class="text-black/50 text-nowrap">Powered by</span>
        <a href="https://kinwebb.netlify.app/" target="_blank" class="font-semibold text-primary flex items-center gap-0.5">KinWebb
          <ArrowUpRight class="size-4 inline-block text-primary" />
        </a>
      </div>
    </div>

    <img src="/images/mascot/about_model.png" alt="App preview" class="absolute bottom-0 sm:right-4 -right-20 sm:w-40 w-52 h-auto pointer-events-none" />
  </section>
</template>