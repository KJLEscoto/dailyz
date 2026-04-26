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

    <!-- Tabs -->
    <Tabs v-model="activeTab" :tabs="tabs" />

    <!-- Tab Content -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-1"
      leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 translate-y-1" mode="out-in">
      <section v-if="activeTab === 'todo'" key="todo">
        <HabitList :has-menu="true" :habits="todoHabits" @toggle="toggleCompletion" @edit="editHabit"
          @delete="deleteHabit" @reorder="handleReorder" />
      </section>

      <section v-else key="completed">
        <HabitList :has-menu="true" :habits="completedHabits" @toggle="toggleCompletion" @edit="editHabit"
          @delete="deleteHabit" @reorder="handleReorder" />
      </section>
    </Transition>

  </div>

  <ModalEdit ref="modalEditRef" />
</template>