<script setup lang="ts">
import { CalendarRange, ChevronDown, Flame, PanelsTopLeft, PlusCircle } from '@lucide/vue';

type HabitTime = 'morning' | 'afternoon' | 'evening' | 'anytime'

interface Habit {
  id: number
  title: string
  time: HabitTime
  streak: number
  streakSince: string
  completed: boolean
}

const todoOpen = ref(true)
const completedOpen = ref(true)

const habits = ref<Habit[]>([
  { id: 1, title: 'Cardio Workout', time: 'morning', streak: 0, streakSince: '', completed: false },
  { id: 2, title: 'Read for 20 minutes', time: 'evening', streak: 1, streakSince: 'MAR 28', completed: true },
  { id: 3, title: 'Glass of water', time: 'anytime', streak: 14, streakSince: 'MAR 15', completed: true },
  { id: 4, title: 'Morning meditation', time: 'morning', streak: 2, streakSince: 'MAR 27', completed: true },
  { id: 5, title: 'Journal entry', time: 'evening', streak: 7, streakSince: 'MAR 22', completed: false },
  { id: 6, title: 'Stretch for 10 mins', time: 'morning', streak: 3, streakSince: 'MAR 26', completed: false },
  { id: 7, title: 'No social media', time: 'anytime', streak: 21, streakSince: 'MAR 8', completed: true },
  { id: 8, title: 'Drink 8 glasses water', time: 'afternoon', streak: 5, streakSince: 'MAR 24', completed: false },
])

const todoHabits = computed(() => habits.value.filter(h => !h.completed))
const completedHabits = computed(() => habits.value.filter(h => h.completed))

// ── Toggle: move between sections ───────────────────────
function toggleHabit(id: string | number) {
  const habit = habits.value.find(h => h.id === id)
  if (!habit) return

  habit.completed = !habit.completed

  // Remove from current position
  habits.value = habits.value.filter(h => h.id !== id)

  if (habit.completed) {
    // Checked → add to the TOP of completed
    const firstCompletedIndex = habits.value.findIndex(h => h.completed)
    if (firstCompletedIndex === -1) {
      habits.value.push(habit)
    } else {
      habits.value.splice(firstCompletedIndex, 0, habit)
    }
  } else {
    // Unchecked → add to the BOTTOM of todo
    const lastTodoIndex = habits.value.reduce((acc, h, i) => (!h.completed ? i : acc), -1)
    habits.value.splice(lastTodoIndex + 1, 0, habit)
  }
}

// ── Drag & Drop ─────────────────────────────────────────
const dragId = ref<number | null>(null)

function onDragStart(id: string | number) {
  dragId.value = Number(id)
}

function onDragEnd() {
  dragId.value = null
}

function onDragOver(e: DragEvent, targetId: string | number) {
  e.preventDefault()
  if (dragId.value === null || dragId.value === targetId) return

  const fromIndex = habits.value.findIndex(h => h.id === dragId.value)
  const toIndex = habits.value.findIndex(h => h.id === targetId)

  if (fromIndex === -1 || toIndex === -1) return

  const fromHabit = habits.value[fromIndex]
  const toHabit = habits.value[toIndex]

  // Guard against undefined
  if (!fromHabit || !toHabit) return

  // Only allow swapping within the same section
  if (fromHabit.completed !== toHabit.completed) return

  const updated = [...habits.value]
  updated.splice(fromIndex, 1)
  updated.splice(toIndex, 0, fromHabit)
  habits.value = updated
}

function editHabit(id: string | number) {
  console.log('edit', id)
}

function deleteHabit(id: string | number) {
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
        <div class="w-full">
          <button class="flex items-center z-20 gap-2 w-full cursor-pointer sticky top-55 bg-foreground pb-2"
            @click="todoOpen = !todoOpen">
            <UppercaseTitle class="font-primary! font-semibold!" size="md">to do</UppercaseTitle>
            <div class="p-2 rounded-full bg-muted/5 size-8 shrink-0 flex items-center justify-center">
              <p class="text-base font-bold text-muted font-secondary text-nowrap">1</p>
            </div>
            <hr class="w-full border-muted/5" />
            <ChevronDown class="pointer-events-none size-5 text-muted transition-transform duration-300"
              :class="todoOpen ? 'rotate-0' : '-rotate-90'" />
          </button>

          <div class="grid transition-all duration-300 ease-in-out"
            :class="todoOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
            <div class="overflow-hidden">
              <ul class="space-y-5 pt-1">
                <HabitTest v-for="habit in todoHabits" :key="habit.id" :id="habit.id" :title="habit.title"
                  :time="habit.time" :streak="habit.streak" :streak-since="habit.streakSince"
                  :completed="habit.completed" @toggle="toggleHabit" @edit="editHabit" @delete="deleteHabit"
                  @drag-start="onDragStart" @drag-end="onDragEnd" @dragover="onDragOver($event, habit.id)" />
              </ul>
            </div>
          </div>
        </div>

        <!-- Completed Section -->
        <div class="w-full">
          <button class="flex items-center gap-2 w-full cursor-pointer sticky top-55 bg-foreground pb-2"
            @click="completedOpen = !completedOpen">
            <UppercaseTitle class="font-primary! font-semibold!" size="md">completed</UppercaseTitle>
            <div class="p-2 rounded-full bg-muted/5 size-8 shrink-0 flex items-center justify-center">
              <p class="text-base font-bold text-muted font-secondary text-nowrap">2</p>
            </div>
            <hr class="w-full border-muted/5" />
            <ChevronDown class="pointer-events-none size-5 text-muted transition-transform duration-300"
              :class="completedOpen ? 'rotate-0' : '-rotate-90'" />
          </button>

          <div class="grid transition-all duration-300 ease-in-out"
            :class="completedOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
            <ul class="overflow-hidden space-y-3">
              <HabitTest v-for="habit in completedHabits" :key="habit.id" :id="habit.id" :title="habit.title"
                :time="habit.time" :streak="habit.streak" :streak-since="habit.streakSince" :completed="habit.completed"
                @toggle="toggleHabit" @edit="editHabit" @delete="deleteHabit" @drag-start="onDragStart"
                @drag-end="onDragEnd" @dragover="onDragOver($event, habit.id)" />
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