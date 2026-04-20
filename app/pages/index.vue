<!-- index.vue -->
<script setup lang="ts">
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
  <main class="w-full max-w-6xl mx-auto px-4 pb-16 relative">

    <!-- Auth not ready yet — show nothing or a spinner -->
    <section v-if="!authReady" class="flex items-center justify-center h-screen">
      <div class="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </section>

    <!-- Not logged in -->
    <section v-else-if="!user">
      <button @click="signIn"
        class="size-20 shrink-0 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform hover:shadow-lg">
        <img src="/images/webp/google.webp" alt="Sign in with Google" class="size-8" />
      </button>
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