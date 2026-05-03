<!-- components/Auth/Profile/Options.vue -->
<script setup lang="ts">
import { LogOut, RotateCcw } from '@lucide/vue'

const habitStore = useHabitStore()
const { signOutLoading, countdown, handleSignOut, cancelSignOut } = useSignOut()

// --- Reset state ---
const resetLoading = ref(false)
const showResetConfirm = ref(false)
const showResetSuccess = ref(false)

const confirmResetHabits = () => { showResetConfirm.value = true }

const resetHabits = async () => {
  showResetConfirm.value = false
  resetLoading.value = true
  try {
    await Promise.all(habitStore.habits.map(h => habitStore.deleteHabit(h.id)))
    showResetSuccess.value = true
  } finally {
    resetLoading.value = false
  }
}

const cancelReset = () => { showResetConfirm.value = false }
</script>

<template>
  <ClientOnly>
    <!-- Sign out countdown -->
    <Alert type="danger" title="Signing out..."
      :message="`You will be signed out in ${countdown} second${countdown === 1 ? '' : 's'}.`" :visible="signOutLoading"
      :dismissible="false" :actions="[{ label: 'No, Stay Logged In', onClick: cancelSignOut }]" />

    <!-- Reset confirm -->
    <Alert type="danger" title="Reset all habits?"
      message="This will permanently delete all your habit records. This cannot be undone." :visible="showResetConfirm"
      :dismissible="false" :actions="[
        { label: 'Yes, Delete All', onClick: resetHabits },
        { label: 'No, Cancel', onClick: cancelReset },
      ]" />

    <!-- Reset progress -->
    <Alert type="info" title="Deleting all habits..." message="Please wait while your habit records are being removed."
      :visible="resetLoading" :dismissible="false" />

    <!-- Reset success -->
    <Alert type="success" title="All habits deleted!" message="Your habit records have been successfully removed."
      :visible="showResetSuccess" :timeout="3000" @dismiss="showResetSuccess = false" />

    <section class="bg-white rounded-3xl p-2 flex flex-col">
      <button @click="handleSignOut"
        class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-black/5 transition-colors text-left cursor-pointer">
        <LogOut class="size-4 text-black/40" />
        <span class="text-sm font-medium text-black/70">Sign Out</span>
      </button>

      <button @click="confirmResetHabits"
        class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 transition-colors text-left cursor-pointer">
        <RotateCcw class="size-4 text-red-400" />
        <span class="text-sm font-medium text-red-400">Reset All Habit Records</span>
      </button>
    </section>

    <template #fallback>
      <section class="bg-white rounded-3xl p-2 flex flex-col gap-1">
        <div v-for="i in 2" :key="i" class="flex items-center gap-3 px-4 py-3">
          <Skeleton width="1rem" height="1rem" rounded="9999px" />
          <Skeleton height="1rem" width="35%" />
        </div>
      </section>
    </template>
  </ClientOnly>
</template>