<script setup lang="ts">
import { CalendarRange, ChevronDown, Flame, PanelsTopLeft, PlusCircle } from '@lucide/vue';
import type { Habit, HabitTime } from '~/types/habit'

const { formatted } = useDate()

const habitStore = useHabitStore()  

// accordions
const todoOpen = ref(true)
const completedOpen = ref(true)


const habits = ref<Habit[]>([
  { id: 1, name: 'Cardio Workout', time: 'morning', streak: 0, streakStarted: '', completed: false, color: '#E07B6A', createdAt: 'MAR 1, 2025' },
  { id: 2, name: 'Read for 20 minutes', time: 'evening', streak: 1, streakStarted: 'MAR 28', completed: true, color: '#7EB8D4', createdAt: 'MAR 5, 2025' },
  { id: 3, name: 'Glass of water', time: 'anytime', streak: 14, streakStarted: 'MAR 15', completed: true, color: '#7DC47D', createdAt: 'MAR 8, 2025' },
  { id: 4, name: 'Morning meditation', time: 'morning', streak: 2, streakStarted: 'MAR 27', completed: true, color: '#C47DBC', createdAt: 'MAR 10, 2025' },
  { id: 5, name: 'Journal entry', time: 'evening', streak: 7, streakStarted: 'MAR 22', completed: false, color: '#D4B84A', createdAt: 'MAR 15, 2025' },
  { id: 6, name: 'Stretch for 10 mins', time: 'morning', streak: 3, streakStarted: 'MAR 26', completed: false, color: '#4AC4B8', createdAt: 'MAR 18, 2025' },
  { id: 7, name: 'No social media', time: 'anytime', streak: 21, streakStarted: 'MAR 8', completed: true, color: '#E07B6A', createdAt: 'MAR 20, 2025' },
  { id: 8, name: 'Drink 8 glasses water', time: 'afternoon', streak: 5, streakStarted: 'MAR 24', completed: false, color: '#7EB8D4', createdAt: 'MAR 22, 2025' },
])

const todoHabits = computed(() => habits.value.filter(h => !h.completed))
const completedHabits = computed(() => habits.value.filter(h => h.completed))

function toggleHabit(id: number) {
  const habit = habits.value.find(h => h.id === id)
  if (habit) {
    habit.completed = !habit.completed
    habit.streak = habit.completed ? habit.streak + 1 : habit.streak - 1
  }
}

function getHabitsCount() {
  return habits.value.length
}

function getToDoCount() {
  return todoHabits.value.length
}

function getCompletedCount() {
  return completedHabits.value.length
}

function getPercentageCompleted() {
  const total = habits.value.length
  const completed = habits.value.filter(h => h.completed).length
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}

function getHighestStreak() {
  return habits.value.reduce((max, h) => h.streak > max ? h.streak : max, 0)
}

const modalAddRef = ref()
const modalEditRef = ref()

// replace your old addHabit() or point the button to this
function addHabit() {
  modalAddRef.value?.addHabit()
}

const editHabit = (id: number) => {
  const habit = habits.value.find(h => h.id === id)
  modalEditRef.value?.editHabit(habit)
}

const deleteHabit = (id: number) => {
  habits.value = habits.value.filter(h => h.id !== id)
}
</script>

<template>
  <main class="w-full max-w-6xl mx-auto px-4 pb-16 relative">

    <!-- Sticky Header -->
    <header class="sticky top-0 z-30 bg-foreground flex items-center justify-between gap-10 py-16">
      <div class="space-y-2">
        <section class="flex items-center gap-4 font-semibold">
          <h1 class="text-4xl">Today's Habits</h1>
          <div class="text-base font-secondary text-danger bg-danger/10 px-4 rounded-full py-2 flex items-center">
            <Flame class="size-5 pointer-events-none" />
            <p class="text-nowrap">{{ getHighestStreak() }}-day highest streak</p>
          </div>
        </section>
        <UppercaseTitle size="lg">{{ formatted }}</UppercaseTitle>
      </div>

      <div class="flex items-center gap-4 px-5 py-3 bg-black/3 rounded-3xl">
        <section class="flex flex-col items-end gap-2">
          <UppercaseTitle size="md">daily progress</UppercaseTitle>
          <h1 class="text-3xl text-primary font-semibold">{{ getCompletedCount() }}/{{ getHabitsCount() }} done</h1>
        </section>
        <section class="rounded-full size-14 flex items-center justify-center select-none relative ring-3 ring-muted/10 shrink-0">
          <svg class="absolute inset-0 -rotate-90" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="24" stroke="var(--color-foreground)" stroke-width="4" stroke-opacity="0.1" />
            <circle cx="28" cy="28" r="24" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round"
              :stroke-dasharray="`${2 * Math.PI * 24}`"
              :stroke-dashoffset="`${2 * Math.PI * 24 * (1 - getPercentageCompleted() / 100)}`"
              class="transition-all duration-500" />
          </svg>
          <div class="bg-transparent rounded-full w-12 h-12 flex items-center justify-center">
            <p class="text-primary font-semibold text-sm">{{ getPercentageCompleted() }}%</p>
          </div>
        </section>
      </div>
    </header>

    <!-- Content -->
    <div class="grid grid-cols-12 gap-10 items-start">

      <!-- Left section — scrolls naturally with the page -->
      <section class="col-span-8 w-full space-y-8 isolate">

        <!-- TO DO Section -->
        <div class="w-full">
          <button class="flex items-center z-20 gap-2 w-full cursor-pointer sticky top-55 bg-foreground pb-2"
            @click="todoOpen = !todoOpen">
            <UppercaseTitle class="font-primary! font-semibold!" size="md">to do</UppercaseTitle>
            <div class="p-2 rounded-full bg-muted/5 size-8 shrink-0 flex items-center justify-center">
              <p class="text-base font-bold text-muted font-secondary text-nowrap">{{ getToDoCount() }}</p>
            </div>
            <hr class="w-full border-muted/5" />
            <ChevronDown class="pointer-events-none size-5 text-muted transition-transform duration-300"
              :class="todoOpen ? 'rotate-0' : '-rotate-90'" />
          </button>

          <div class="grid transition-all duration-300 ease-in-out"
            :class="todoOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
            <div class="overflow-hidden">
              <ul class="space-y-5 pt-1">
                <HabitCard v-for="habit in todoHabits" :key="habit.id" :habit="habit" @toggle="toggleHabit" @edit="editHabit" @delete="deleteHabit" />
              </ul>
            </div>
          </div>
        </div>

        <!-- Completed Section -->
        <div class="w-full">
          <button class="flex items-center z-20 gap-2 w-full cursor-pointer sticky top-55 bg-foreground pb-2"
            @click="completedOpen = !completedOpen">
            <UppercaseTitle class="font-primary! font-semibold!" size="md">completed</UppercaseTitle>
            <div class="p-2 rounded-full bg-muted/5 size-8 shrink-0 flex items-center justify-center">
              <p class="text-base font-bold text-muted font-secondary text-nowrap">{{ getCompletedCount() }}</p>
            </div>
            <hr class="w-full border-muted/5" />
            <ChevronDown class="pointer-events-none size-5 text-muted transition-transform duration-300"
              :class="completedOpen ? 'rotate-0' : '-rotate-90'" />
          </button>

          <div class="grid transition-all duration-300 ease-in-out"
            :class="completedOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
            <div class="overflow-hidden">
              <ul class="space-y-5 pt-1">
                <HabitCard v-for="habit in completedHabits" :key="habit.id" :habit="habit" @toggle="toggleHabit"                   @edit="editHabit" @delete="deleteHabit" />
              </ul>
            </div>
          </div>
        </div>

      </section>

      <!-- Right section — sticks while left scrolls -->
      <aside class="sticky top-55 col-span-4 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-none">
        <Button @click="addHabit" size="lg" class="group rounded-3xl! py-8! group" block>
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
              <p class="font-bold text-primary text-2xl">{{ getHabitsCount() }}</p>
            </div>
            <div class="space-y-1 rounded-3xl p-5 border-b border-primary bg-foreground w-full">
              <UppercaseTitle class="text-muted" size="sm">done</UppercaseTitle>
              <p class="font-bold text-primary text-2xl">{{ getCompletedCount() }}</p>
            </div>
          </section>

          <section class="rounded-3xl p-5 border-b border-primary bg-foreground w-full flex items-end justify-between">
            <div class="space-y-1">
              <UppercaseTitle class="text-muted" size="sm">streak calendar</UppercaseTitle>
              <p class="font-bold text-primary text-2xl">{{ getHighestStreak() }} days</p>
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

  <!-- modals -->
  <ModalAdd ref="modalAddRef" />
  <ModalEdit ref="modalEditRef" />
  
</template>