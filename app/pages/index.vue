<!-- index.vue -->
<script setup lang="ts">
import type { Habit } from '~/types/habit'

const { user, authReady, initAuth } = useAuth()
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
    async () => {
      const { guestHabits } = useGuestHabits()

      // migrate guest habits to Firebase if any exist
      if (guestHabits.value.length > 0) {
        for (const habit of guestHabits.value) {
          await habitStore.addHabit(habit)
        }
        guestHabits.value = [] // clear cookie after migration
      }

      await habitStore.fetchHabits()
      await habitStore.resetStaleStreaks()
    },
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
        <GuestOnboard />
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