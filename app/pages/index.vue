<!-- pages/index.vue -->
<script setup lang="ts">
import type { Habit } from '~/types/habit'
import { onAuthStateChanged } from 'firebase/auth'

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

// ✅ Replace onMounted fetchHabits with auth-aware fetching
onMounted(() => {
  const { $firebase } = useNuxtApp()

  onAuthStateChanged($firebase.auth, async (firebaseUser) => {
    if (firebaseUser) {
      await habitStore.fetchHabits() // ✅ fetches from users/{uid}/habits
    } else {
      habitStore.habits = [] // clear on logout
    }
  })
})
</script>

<template>
  <main class="w-full max-w-6xl mx-auto px-4 pb-16 relative">
    <AppHeader :formatted="formatted" :completed-count="completedCount" :habits-count="habitsCount"
      :percentage-completed="percentageCompleted" />

    <div class="grid grid-cols-12 gap-10 items-start">
      <section class="col-span-8 w-full space-y-8 isolate">
        <HabitSection title="to do" :count="todoCount" :habits="todoHabits" @toggle="toggleCompletion" @edit="editHabit"
          @delete="deleteHabit" @reorder="handleReorder" />
        <HabitSection title="completed" :count="completedCount" :habits="completedHabits" @toggle="toggleCompletion"
          @edit="editHabit" @delete="deleteHabit" @reorder="handleReorder" />
      </section>

      <HabitSidebar :habits-count="habitsCount" :completed-count="completedCount" :highest-streak="highestStreak"
        @add-habit="addHabit" />
    </div>
  </main>

  <ModalAdd ref="modalAddRef" />
  <ModalEdit ref="modalEditRef" />
</template>