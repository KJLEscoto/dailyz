<!-- pages/home.vue -->
<script setup lang="ts">
import { Clock } from '@lucide/vue'
import type { Habit } from '~/types/habit'

definePageMeta({ layout: 'auth' })

const habitStore = useHabitStore()
const habits = computed(() => habitStore.habits)

const { todoHabits, completedHabits, todoCount, completedCount, percentageCompleted, habitsCount } = useHabitStats(habits)
const { timeLeft } = useDayCountdown()

const modalEditRef = ref()
const activeTab = ref('todo')

// --- Delete state ---
const deleteLoading = ref(false)
const showDeleteSuccessAlert = ref(false)
const deletedHabitName = ref('')

const tabs = computed(() => [
  { label: `To Do`, count: todoCount.value, value: 'todo' },
  { label: `Completed`, count: completedCount.value, value: 'completed' },
])

const editHabit = (id: Habit['id']) => {
  const habit = habits.value.find(h => h.id === id)
  if (habit) modalEditRef.value?.editHabit(habit)
}

const deleteHabit = async (id: Habit['id'], habitName: string) => {
  deleteLoading.value = true
  deletedHabitName.value = habitName
  try {
    await habitStore.deleteHabit(id)
    showDeleteSuccessAlert.value = true
  } finally {
    deleteLoading.value = false
  }
}

const toggleCompletion = (habit: Habit) => habitStore.toggleCompletion(habit)

const { signOut } = useAuth() // 👈 only signOut needed here
const { formatted } = useDate()


</script>

<template>
  <!-- Deleting progress -->
  <Alert type="info" title="Deleting habit..." :message="`Removing &quot;${deletedHabitName}&quot; from your list.`"
    :visible="deleteLoading" :dismissible="false" />

  <!-- Delete success -->
  <Alert type="success" title="Habit deleted!"
    :message="`&quot;${deletedHabitName}&quot; has been successfully removed.`" :visible="showDeleteSuccessAlert"
    :timeout="3000" @dismiss="showDeleteSuccessAlert = false" />

  <ClientOnly>
    <span v-if="todoHabits.length || completedHabits.length">
      <AuthAppHeader :formatted="formatted" :completed-count="completedCount" :habits-count="habitsCount"
        :percentage-completed="percentageCompleted" />
    </span>

    <div class="space-y-3">
      <div v-if="!todoHabits.length && !completedHabits.length"
        class="text-center justify-center flex flex-col items-center gap-6">
        <Image src="/images/mascot/no_habits.png" alt="No habits for today"
          class="max-w-100 w-full h-auto object-contain" />
        <section class="space-y-2">
          <h1 class="md:text-3xl text-xl font-bold text-primary">You don't have any habits yet.</h1>
          <p class="text-muted md:text-lg text-sm">Create one using this button.</p>
        </section>
        <Image src="/images/arrow_to_add.svg" alt="Add habit" class="sm:w-full! w-2/3!" />
      </div>

      <Tabs v-if="todoHabits.length || completedHabits.length" v-model="activeTab" :tabs="tabs" />

      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-1"
        leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 translate-y-1" mode="out-in">

        <section v-if="activeTab === 'todo'" key="todo" class="sm:space-y-4 space-y-3">
          <div v-if="!todoHabits.length && completedHabits.length"
            class="text-center justify-center flex flex-col items-center gap-6">
            <Image src="/images/mascot/no_todo.png" alt="No habits for today" class="max-w-100 w-full object-contain" />
            <section class="space-y-2">
              <h1 class="md:text-3xl text-xl font-bold text-primary">No more habits for now!</h1>
              <p class="text-muted md:text-lg text-sm">Take a rest or add more habits later.</p>
              <div class="select-none flex items-center mt-5! gap-1 justify-center rounded-xl text-sm text-muted" >
                <Clock class="size-4 pointer-events-none" />
                <span>
                  Habits reset in <span class="font-semibold tabular-nums">{{ timeLeft }}</span>
                </span>
              </div>
            </section>
          </div>

          <HabitList v-else :has-menu="true" :habits="todoHabits" @toggle="toggleCompletion" @edit="editHabit"
            @delete="(id, name) => deleteHabit(id, name)" />
        </section>

        <section v-else key="completed">
          <div v-if="todoHabits.length && !completedHabits.length"
            class="text-center justify-center flex flex-col items-center gap-6">
            <Image src="/images/mascot/no_completions.png" alt="No completed habits" class="max-w-100 w-full object-contain" />
            <section class="space-y-2">
              <h1 class="md:text-3xl text-xl font-bold text-primary">You haven't completed any habits.</h1>
              <p class="text-muted md:text-lg text-sm">Complete a habit from <span class="font-bold">"To Do"</span> to
                see them here.</p>
            </section>
          </div>

          <HabitList :has-menu="true" :habits="completedHabits" @toggle="toggleCompletion" @edit="editHabit"
            @delete="(id, name) => deleteHabit(id, name)" />
        </section>
      </Transition>
    </div>

    <template #fallback>
      <div class="space-y-3">
        <!-- tabs skeleton -->
        <Skeleton class="mt-16" height="14rem" rounded="0.75rem" />
        <Skeleton height="3.5rem" rounded="0.75rem" />

        <!-- habit cards skeleton -->
        <div class="space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-6 bg-white rounded-3xl">
            <Skeleton width="3.5rem" height="3.5rem" rounded="14px" />
            <div class="flex-1 space-y-2">
              <Skeleton height="1.25rem" :width="`${60 + (i * 7) % 30}%`" />
              <Skeleton height="0.875rem" width="20%" />
            </div>
            <Skeleton width="3rem" height="3rem" rounded="9999px" />
          </div>
        </div>
      </div>
    </template>
  </ClientOnly>

  <ModalEdit ref="modalEditRef" />
</template>