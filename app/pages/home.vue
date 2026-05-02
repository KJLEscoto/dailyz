<!-- pages/home.vue -->
<script setup lang="ts">
import type { Habit } from '~/types/habit'

definePageMeta({ layout: 'auth' })

const habitStore = useHabitStore()
const habits = computed(() => habitStore.habits)

const { todoHabits, completedHabits, todoCount, completedCount } = useHabitStats(habits)

const modalEditRef = ref()
const activeTab = ref('todo')

const tabs = computed(() => [
  { label: `To Do`, count: todoCount.value, value: 'todo' },
  { label: `Completed`, count: completedCount.value, value: 'completed' },
])

const editHabit = (id: Habit['id']) => {
  const habit = habits.value.find(h => h.id === id)
  if (habit) modalEditRef.value?.editHabit(habit)
}
const deleteHabit = (id: Habit['id']) => habitStore.deleteHabit(id)
const toggleCompletion = (habit: Habit) => habitStore.toggleCompletion(habit)
</script>

<template>
  <div class="sm:space-y-4 space-y-3">

    <div v-if="!todoHabits.length && !completedHabits.length"
      class="text-center justify-center flex flex-col items-center gap-6">
      <img src="/images/mascot/no_habits.png" alt="No habits for today"
        class="max-w-100 w-full h-auto object-contain mix-blend-darken" />
      <section class="space-y-2">
        <h1 class="md:text-3xl text-xl font-bold text-primary">You don't have any habits yet.</h1>
        <p class="text-muted md:text-lg text-sm">Create one using this button.</p>
      </section>
      <img src="/images/arrow_to_add.svg" alt="Add habit" class="sm:w-full w-2/3 h-auto object-cover" />
    </div>

    <Tabs v-if="todoHabits.length || completedHabits.length" v-model="activeTab" :tabs="tabs" />

    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-1"
      leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 translate-y-1" mode="out-in">

      <section v-if="activeTab === 'todo'" key="todo">
        <div v-if="!todoHabits.length && completedHabits.length"
          class="text-center justify-center flex flex-col items-center gap-6">
          <img src="/images/mascot/no_todo.png" alt="No habits for today"
            class="max-w-100 w-full h-auto object-contain" />
          <section class="space-y-2">
            <h1 class="md:text-3xl text-xl font-bold text-primary">No more habits for now!</h1>
            <p class="text-muted md:text-lg text-sm">Take a rest or add more habits later.</p>
          </section>
        </div>

        <HabitList v-else :has-menu="true" :habits="todoHabits" @toggle="toggleCompletion" @edit="editHabit"
          @delete="deleteHabit" />
      </section>

      <section v-else key="completed">
        <div v-if="todoHabits.length && !completedHabits.length"
          class="text-center justify-center flex flex-col items-center gap-6">
          <img src="/images/mascot/no_completions.png" alt="No completed habits"
            class="max-w-100 w-full h-auto object-contain" />
          <section class="space-y-2">
            <h1 class="md:text-3xl text-xl font-bold text-primary">You haven't completed any habits.</h1>
            <p class="text-muted md:text-lg text-sm">Complete a habit from <span class="font-bold">"To Do"</span> to see
              them here.</p>
          </section>
        </div>

        <HabitList :has-menu="true" :habits="completedHabits" @toggle="toggleCompletion" @edit="editHabit"
          @delete="deleteHabit" />
      </section>
    </Transition>

  </div>

  <ModalEdit ref="modalEditRef" />
</template>