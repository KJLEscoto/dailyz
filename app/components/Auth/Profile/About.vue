<!-- components/Profile/About.vue -->
<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue';

</script>

<template>
  <ClientOnly>

    <section class="bg-white rounded-3xl p-6 relative overflow-hidden">
      <div class="w-2/3 md:space-y-4 space-y-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <h3 class="text-xl font-bold text-primary">Dailyz</h3>
            <p class="px-2 py-0.5 rounded-full border border-primary/20 text-xs font-bold text-primary bg-primary/10 select-none">BETA</p>
          </div>
          <p class="text-sm text-black/40">Habit Tracker - v1.0.0</p>
        </div>
        <p class="text-sm text-black/70 md:leading-relaxed">
          Helps you build mindful daily habits and stay consistent — one day at a time.
        </p>
        <hr class="border-black/5" />
        <div class="flex items-center gap-1 text-xs">
          <span class="text-black/50 text-nowrap">Powered by</span>
          <a href="https://kinwebb.netlify.app/" target="_blank"
            class="font-semibold text-primary flex items-center gap-0.5">KinWebb
            <ArrowUpRight class="size-4 inline-block text-primary" />
          </a>
        </div>
      </div>

      <img src="/images/mascot/about_model.png" alt="App preview"
        class="absolute -bottom-2 sm:right-4 -right-20 sm:w-40 w-52 h-auto pointer-events-none" />
    </section>

    <template #fallback>
      <section class="bg-white rounded-3xl p-6 flex flex-col gap-3">
        <Skeleton height="1.5rem" width="30%" />
        <Skeleton height="0.875rem" width="50%" />
        <Skeleton height="1rem" width="90%" />
        <Skeleton height="1rem" width="80%" />
        <Skeleton height="0.875rem" width="40%" />
      </section>
    </template>
  </ClientOnly>
</template>