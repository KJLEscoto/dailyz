<!-- components/Auth/index.vue -->
<script setup lang="ts">
import type { Habit } from '~/types/habit'

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
const handleReorder = (newOrder: string[]) => console.log('new order:', newOrder)
</script>

<template>
  <div class="space-y-4">

    <!-- empty state if no habits exist -->
    <div v-if="!todoHabits.length && !completedHabits.length"
      class="text-center justify-center flex flex-col items-center gap-6">
      <img src="/images/no_habits.png" alt="No habits for today"
        class="max-w-[400px] w-full h-auto object-contain mix-blend-darken" />
      <section class="space-y-3">
        <h1 class="text-3xl font-bold text-primary">You don’t have any habits yet.</h1>
        <p class="text-muted text-lg">Create one using this button.</p>
      </section>
      <img src="/images/arrow_to_add.svg" alt="Add habit" class="w-full h-auto object-cover" />
    </div>

    <!-- Tabs -->
    <Tabs v-if="todoHabits.length || completedHabits.length" v-model="activeTab" :tabs="tabs" />

    <!-- Tab Content -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-1"
      leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 translate-y-1" mode="out-in">
      <section v-if="activeTab === 'todo'" key="todo">

        <div v-if="!todoHabits.length && completedHabits.length" 
          class="text-center justify-center flex flex-col items-center gap-6">
          <img src="/images/todo_done.png" alt="No habits for today"
            class="max-w-[400px] w-full h-auto object-contain" />
          <section class="space-y-3">
            <h1 class="text-3xl font-bold text-primary">No more habits for now!</h1>
            <p class="text-muted text-lg">Take a rest or add more habits later.</p>
          </section>
        </div>

        <HabitList v-else :has-menu="true" :habits="todoHabits" @toggle="toggleCompletion" @edit="editHabit"
          @delete="deleteHabit" @reorder="handleReorder" /> 
      </section>

      <section v-else key="completed">

        <div v-if="todoHabits.length && !completedHabits.length"
          class="text-center justify-center flex flex-col items-center gap-6">
          <img src="/images/no_habits.png" alt="No habits for today"
            class="max-w-[400px] w-full h-auto object-contain" />
          <section class="space-y-3">
            <h1 class="text-3xl font-bold text-primary">You don’t have any habits yet.</h1>
            <p class="text-muted text-lg">Create one using this button.</p>
          </section>
        </div>

        <HabitList :has-menu="true" :habits="completedHabits" @toggle="toggleCompletion" @edit="editHabit"
          @delete="deleteHabit" @reorder="handleReorder" />
      </section>
    </Transition>

  </div>

  <ModalEdit ref="modalEditRef" />
</template>