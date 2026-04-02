<script setup lang="ts">
import { CalendarRange, ChevronDown, Flame, PanelsTopLeft, PlusCircle } from '@lucide/vue';

const todoOpen = ref(true)
const completedOpen = ref(true)

const todoItems = 30
const completedItems = 30
</script>

<template>
  <main class="w-full max-w-6xl mx-auto px-4 pb-16 relative">

    <!-- Sticky Header -->
    <header class="sticky top-0 z-10 bg-foreground flex items-center justify-between gap-10 py-16">
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

    <!-- Content -->
    <div class="grid grid-cols-12 gap-10 items-start">

      <!-- Left section — scrolls naturally with the page -->
      <section class="col-span-8 w-full space-y-8">

        <!-- TO DO Section -->
        <div class="w-full space-y-4">
          <button class="flex items-center gap-2 w-full cursor-pointer sticky top-55 bg-foreground" @click="todoOpen = !todoOpen">
            <UppercaseTitle class="font-primary! font-semibold!" size="md">to do</UppercaseTitle>
            <div class="p-2 rounded-full bg-muted/5 size-8 shrink-0 flex items-center justify-center">
              <p class="text-base font-bold text-muted font-secondary text-nowrap">{{ todoItems }}</p>
            </div>
            <hr class="w-full border-muted/5" />
            <ChevronDown class="pointer-events-none size-5 text-muted transition-transform duration-300"
              :class="todoOpen ? 'rotate-0' : '-rotate-90'" />
          </button>

          <div class="grid transition-all duration-300 ease-in-out"
            :class="todoOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
            <ul class="overflow-hidden space-y-3">
              <div v-for="num in todoItems" :key="num">
                <li>{{ num }}</li>
              </div>
            </ul>
          </div>
        </div>

        <!-- Completed Section -->
        <div class="w-full space-y-4">
          <button class="flex items-center gap-2 w-full cursor-pointer sticky top-55 bg-foreground" @click="completedOpen = !completedOpen">
            <UppercaseTitle class="font-primary! font-semibold!" size="md">completed</UppercaseTitle>
            <div class="p-2 rounded-full bg-muted/5 size-8 shrink-0 flex items-center justify-center">
              <p class="text-base font-bold text-muted font-secondary text-nowrap">{{ completedItems }}</p>
            </div>
            <hr class="w-full border-muted/5" />
            <ChevronDown class="pointer-events-none size-5 text-muted transition-transform duration-300"
              :class="completedOpen ? 'rotate-0' : '-rotate-90'" />
          </button>

          <div class="grid transition-all duration-300 ease-in-out"
            :class="completedOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
            <ul class="overflow-hidden space-y-3">
              <div v-for="num in completedItems" :key="num">
                <li>{{ num }}</li>
              </div>
            </ul>
          </div>
        </div>

      </section>

      <!-- Right section — sticks while left scrolls -->
      <aside class="sticky top-55 col-span-4 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-none">
        <Button size="lg" class="group rounded-3xl! py-8! group" block>
          <template #icon-left>
            <PlusCircle
              class="size-5 opacity-20 rotate-0 group-hover:rotate-90 duration-200 ease-in transition-all group-hover:opacity-100 pointer-events-none" />
          </template>
          <p class="text-xl text-nowrap">New Habit</p>
        </Button>

        <!-- overview section -->
        <div class="space-y-4 p-6 bg-white rounded-4xl">
          <section class="flex items-center gap-1 w-full">
            <PanelsTopLeft class="size-5 opacity-40 pointer-events-none" />
            <UppercaseTitle class="text-black!" size="md">overview</UppercaseTitle>
          </section>

          <section class="flex items-center gap-4 w-full">
            <div class="space-y-1 rounded-3xl p-5 border-b border-primary bg-foreground w-full">
              <UppercaseTitle class="text-muted" size="sm">habits</UppercaseTitle>
              <p class="font-bold text-primary text-2xl">4</p>
            </div>
            <div class="space-y-1 rounded-3xl p-5 border-b border-primary bg-foreground w-full">
              <UppercaseTitle class="text-muted" size="sm">done</UppercaseTitle>
              <p class="font-bold text-primary text-2xl">3</p>
            </div>
          </section>

          <section class="rounded-3xl p-5 border-b border-primary bg-foreground w-full flex items-end justify-between">
            <div class="space-y-1">
              <UppercaseTitle class="text-muted" size="sm">current streak</UppercaseTitle>
              <p class="font-bold text-primary text-2xl">14 days</p>
            </div>
            <CalendarRange class="size-10 text-primary pointer-events-none" />
          </section>

          <!-- daily quote section -->
          <section class="space-y-2">
            <NatureImage />
            <DailyQuote />
          </section>
        </div>
      </aside>

    </div>
  </main>
</template>