<!-- pages/home.vue -->
<script setup lang="ts">
import { Clock, Gem, Loader2, Plus, Upload } from '@lucide/vue'
import type { Habit } from '~/types/habit'

definePageMeta({ layout: 'auth' })

const habitStore = useHabitStore()
const habits = computed(() => habitStore.habits)

const { importHabits, importing, error: importError } = useImportHabits()
const showImportErrorAlert = ref(false)
const showImportSuccessAlert = ref(false)
const importedCount = ref(0)
const showImportingOverlay = computed(() => importing.value)

const fileInputRef = ref<HTMLInputElement>()

const { $firebase } = useNuxtApp()
const isEmailVerified = computed(() => ($firebase.auth as any).currentUser?.emailVerified ?? false)
const showImportVerifyAlert = ref(false)

const triggerImport = () => {
  if (!isEmailVerified.value) {
    showImportVerifyAlert.value = true
    return
  }
  fileInputRef.value?.click()
}

const handleImportFile = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const result = await importHabits(file)
  if (result) {
    importedCount.value = result.imported
    showImportSuccessAlert.value = true
  } else {
    showImportErrorAlert.value = true
  }

  // reset input so same file can be re-selected
  if (fileInputRef.value) fileInputRef.value.value = ''
}

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

const { formatted } = useDate()

const modalAddRef = ref()
const showLimitAlert = ref(false) // 👈

const addHabit = () => {
  if (modalAddRef.value?.dailyLimitReached) {
    showLimitAlert.value = true // 👈 show alert instead
    return
  }
  modalAddRef.value?.addHabit()
}

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
    <!-- 👇 Importing overlay — replaces everything while import runs -->
    <div v-if="showImportingOverlay"
      class="flex flex-col items-center justify-center md:min-h-[calc(100vh-200px)] min-h-[calc(100vh-10rem)] gap-6">
      <Image src="/images/mascot/importing.png" alt="Importing habits" class="max-w-60 w-full h-auto object-contain" />
      <section class="space-y-2 text-center">
        <h1 class="md:text-2xl text-xl font-bold text-primary flex items-center w-full justify-center gap-2">
          <Loader2 class="animate-spin shrink-0 pointer-events-none size-6!" />
          Importing Habits...</h1>
        <p class="text-muted md:text-base text-sm">Please wait while your data is being restored.</p>
      </section>
    </div>

    <!-- 👇 wrap existing content -->
    <template v-else>
      <!-- Import error -->
      <Alert type="danger" title="Import failed" :message="importError ?? ''" :visible="showImportErrorAlert"
        :timeout="4000" @dismiss="showImportErrorAlert = false" />

      <!-- Import success -->
      <Alert type="success" title="Import successful!"
        :message="`${importedCount} habit${importedCount !== 1 ? 's' : ''} have been imported.`"
        :visible="showImportSuccessAlert" :timeout="4000" @dismiss="showImportSuccessAlert = false" />

      <!-- Import verify alert -->
      <Alert type="info" title="Unverified Email" message="Please verify your email address before importing your data."
        :visible="showImportVerifyAlert" :timeout="4000" @dismiss="showImportVerifyAlert = false" />

      <!-- hidden file input -->
      <input ref="fileInputRef" type="file" accept=".json" class="hidden" @change="handleImportFile" />

      <span v-if="todoHabits.length || completedHabits.length">
        <AuthAppHeader :formatted="formatted" :completed-count="completedCount" :habits-count="habitsCount"
          :percentage-completed="percentageCompleted" />
      </span>

      <div class="space-y-3">
        <div v-if="!todoHabits.length && !completedHabits.length"
          class="text-center justify-center flex flex-col items-center md:min-h-[calc(100vh-200px)] min-h-[calc(100vh-10rem)] gap-6">
          <Image src="/images/mascot/no_habits.png" alt="No habits for today"
            class="max-w-100 w-full h-auto object-contain" />
          <section class="space-y-2">
            <h1 class="md:text-3xl text-xl font-bold text-primary">You don't have any habits yet.</h1>
            <p class="text-muted md:text-lg text-sm">Create your habits by</p>
          </section>
          <section class="flex md:flex-row flex-col items-center gap-2 justify-center w-full">
            <Button @click="addHabit" size="lg" class="w-full">
              <Plus class="size-5! text-white pointer-events-none shrink-0" />
              Adding Manually
            </Button>
            <Button @click="triggerImport" size="lg"
              :class="`w-full text-black/80 bg-gray-200 hover:bg-gray-300/80${!isEmailVerified ? ' opacity-50 cursor-not-allowed' : ''}`">
              <Upload class="size-5! pointer-events-none shrink-0" />
              Import Your Data
              <Gem class="size-4 text-primary" />
            </Button>
          </section>
        </div>

        <Tabs v-if="todoHabits.length || completedHabits.length" v-model="activeTab" :tabs="tabs" />

        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-1"
          leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 translate-y-1" mode="out-in">
          <section v-if="activeTab === 'todo'" key="todo" class="sm:space-y-4 space-y-3">
            <div v-if="!todoHabits.length && completedHabits.length"
              class="text-center justify-center flex flex-col items-center gap-6 py-14">
              <section class="space-y-2">
                <h1 class="md:text-3xl text-xl font-bold text-primary">No more habits for now!</h1>
                <p class="text-muted md:text-lg text-sm">Take a rest or add more habits later.</p>
                <div class="select-none flex items-center mt-5! gap-1 justify-center rounded-xl text-sm text-muted">
                  <Clock class="size-4 pointer-events-none" />
                  <span>Habits reset in <span class="font-semibold tabular-nums">{{ timeLeft }}</span></span>
                </div>
              </section>
            </div>
            <HabitList v-else :has-menu="true" :habits="todoHabits" @toggle="toggleCompletion" @edit="editHabit"
              @delete="(id, name) => deleteHabit(id, name)" />
          </section>

          <section v-else key="completed">
            <div v-if="todoHabits.length && !completedHabits.length"
              class="text-center justify-center flex flex-col items-center gap-6 py-14">
              <section class="space-y-2">
                <h1 class="md:text-3xl text-xl font-bold text-primary">You haven't completed any habits.</h1>
                <p class="text-muted md:text-lg text-sm">Complete a habit from <span class="font-bold">"To Do"</span>
                  to see them here.</p>
              </section>
            </div>
            <HabitList :has-menu="true" :habits="completedHabits" @toggle="toggleCompletion" @edit="editHabit"
              @delete="(id, name) => deleteHabit(id, name)" />
          </section>
        </Transition>
      </div>
    </template>

    <template #fallback>
      <div class="space-y-3">
        <Skeleton class="mt-16" height="14rem" rounded="0.75rem" />
        <Skeleton height="3.5rem" rounded="0.75rem" />
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

  <ModalAdd ref="modalAddRef" />
  <ModalEdit ref="modalEditRef" />
</template>