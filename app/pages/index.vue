<!-- index.vue -->
<script setup lang="ts">
import { Plus } from '@lucide/vue'
import type { Habit } from '~/types/habit'

const { user, authReady, initAuth, signIn } = useAuth()
const { formatted } = useDate()
const habitStore = useHabitStore()
const habits = computed(() => habitStore.habits)

const { todoHabits, completedHabits, habitsCount, todoCount, completedCount, percentageCompleted, highestStreak } =
  useHabitStats(habits)

const modalAddRef = ref()
const modalEditRef = ref()

const addHabit = () => modalAddRef.value?.addHabit()
const editHabit = (id: Habit['id']) => {
  const habit = habits.value.find(h => h.id === id)
  if (habit) modalEditRef.value?.editHabit(habit)
}
const deleteHabit = (id: Habit['id']) => habitStore.deleteHabit(id)
const toggleCompletion = (habit: Habit) => habitStore.toggleCompletion(habit)
const handleReorder = (newOrder: string[]) => console.log('new order:', newOrder)

onMounted(() => {
  initAuth(
    // onLogin — fires every time auth state confirms a logged-in user
    async () => {
      await habitStore.fetchHabits()
      await habitStore.resetStaleStreaks()
    },
    // onLogout
    () => {
      habitStore.habits = []
    }
  )
})

watch(user, async (newUser) => {
  if (newUser) {
    await habitStore.fetchHabits()
    await habitStore.resetStaleStreaks()
  } else {
    habitStore.habits = []
  }
})
</script>

<template>
  <!-- Fixed overlay spinner — independent of layout -->
  <div v-if="!authReady" class="fixed inset-0 z-50 flex items-center justify-center bg-foreground">
    <div class="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>

  <template v-else>
    <main>
      <!-- Not logged in -->
      <section v-if="!user" class="flex items-center justify-center h-auto py-20">
        <div class="w-full flex flex-col items-center gap-10">
          <div class="w-full h-full">
            <NatureImage />
          </div>
          <section class="space-y-3 text-center">
            <h1 class="text-4xl font-bold text-primary">Your path to serenity begins here.</h1>
            <p class="text-muted">Create your first habit and start building a more mindful life.</p>
          </section>
          <!-- <button @click="signIn"
            class="w-fit h-auto py-3 px-10 shrink-0 bg-white rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform hover:shadow-lg">
            <img src="/images/webp/google.webp" alt="Sign in with Google" class="size-6" />
            <p class="text-nowrap">Sign in with Google</p>
          </button> -->
          <Button size="lg">
            <Plus class="size-5 pointer-events-none" />
            <p>Add your First Habit</p>
          </Button>

          <section>
            <UppercaseTitle size="sm">suggested habits</UppercaseTitle>
          </section>
        </div>
      </section>

      <!-- Logged in -->
      <section v-else>
        <AppHeader :formatted="formatted" :completed-count="completedCount" :habits-count="habitsCount"
          :percentage-completed="percentageCompleted" />

        <div class="grid grid-cols-12 gap-10 items-start">
          <section class="col-span-8 w-full space-y-8 isolate">
            <HabitSection title="to do" :count="todoCount" :habits="todoHabits" @toggle="toggleCompletion"
              @edit="editHabit" @delete="deleteHabit" @reorder="handleReorder" />
            <HabitSection title="completed" :count="completedCount" :habits="completedHabits" @toggle="toggleCompletion"
              @edit="editHabit" @delete="deleteHabit" @reorder="handleReorder" />
          </section>

          <HabitSidebar :habits-count="habitsCount" :completed-count="completedCount" :highest-streak="highestStreak"
            @add-habit="addHabit" />
        </div>
      </section>
    </main>

    <ModalAdd ref="modalAddRef" />
    <ModalEdit ref="modalEditRef" />
  </template>
</template>