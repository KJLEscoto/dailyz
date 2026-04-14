<!-- index -->
<script setup lang="ts">
import { CalendarRange, ChevronDown, PanelsTopLeft, PlusCircle } from '@lucide/vue';
import type { Habit } from '~/types/habit'
import { format } from 'date-fns'

const { formatted } = useDate()

const habitStore = useHabitStore()

const habits = computed(() => habitStore.habits)

// accordions
const todoOpen = ref(true)
const completedOpen = ref(true)

// const habitOrder = ref<string[]>([])

// sync order when habits load
// watch(() => habitStore.habits, (newHabits) => {
//   newHabits.forEach(h => {
//     if (!habitOrder.value.includes(h.id)) {
//       habitOrder.value.push(h.id)   // 👈 new habits go to the end
//     }
//   })
// }, { immediate: true })

// const sortByOrder = (list: Habit[]) =>
//   [...list].sort((a, b) => habitOrder.value.indexOf(a.id) - habitOrder.value.indexOf(b.id))

const todoHabits = computed(() => {
  const today = format(new Date(), 'yyyy-MM-dd')
  return habits.value.filter(h => !h.completions?.includes(today))
})

const completedHabits = computed(() => {
  const today = format(new Date(), 'yyyy-MM-dd')
  return habits.value.filter(h => h.completions?.includes(today))
})

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
  const completed = habits.value.filter(h => h.completions.includes(format(new Date(), 'yyyy-MM-dd'))).length
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

const editHabit = (id: Habit['id']) => {
  const habit = habits.value.find(h => h.id === id)
  if (!habit) return
  modalEditRef.value?.editHabit(habit)
}

const deleteHabit = async (id: Habit['id']) => {
  await habitStore.deleteHabit(id)
}

const toggleCompletion = async (habit: Habit) => {
  await habitStore.toggleCompletion(habit)
}

// New: handle reorder events from HabitList
const handleReorder = (newOrder: string[]) => {
  // persist or use newOrder as needed — e.g. store it if your habitStore supports it
  console.log('new order:', newOrder)
}

onMounted(async () => {
  await habitStore.fetchHabits()
  console.log(habitStore.habits)
})
</script>

<template>
  <main class="w-full max-w-6xl mx-auto px-4 pb-16 relative">

    <!-- Sticky Header -->
    <header class="sticky top-0 z-30 bg-foreground flex items-center justify-between gap-10 py-16">
      <div class="space-y-2">
        <h1 class="text-4xl font-semibold">Today's Habits</h1>
        <UppercaseTitle size="lg">{{ formatted }}</UppercaseTitle>
      </div>

      <div class="flex items-center gap-4 px-5 py-3 bg-black/3 rounded-3xl">
        <section class="flex flex-col items-end gap-2">
          <UppercaseTitle size="md">daily progress</UppercaseTitle>
          <h1 class="text-3xl text-primary font-semibold">{{ getCompletedCount() }}/{{ getHabitsCount() }} done</h1>
        </section>
        <section
          class="rounded-full size-14 flex items-center justify-center select-none relative ring-3 ring-muted/10 shrink-0">
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
              <HabitList :habits="todoHabits" @toggle="toggleCompletion" @edit="editHabit" @delete="deleteHabit"
                @reorder="handleReorder" />
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
              <HabitList :habits="completedHabits" @toggle="toggleCompletion" @edit="editHabit" />
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
              <p class="font-bold text-primary text-2xl">{{ getHighestStreak() }} 
                <span v-if="getHighestStreak() < 2">day</span>
                <span v-else>days</span>
              </p>
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