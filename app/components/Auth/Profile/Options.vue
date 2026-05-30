<!-- components/Auth/Profile/Options.vue -->
<script setup lang="ts">
import { LogOut, RotateCcw, Download, Gem } from '@lucide/vue'

const levelStore = useLevelStore()

const { handleSignOut, cancelSignOut, signOutLoading, countdown } = useSignOut()
const habitStore = useHabitStore()

const resetLoading = ref(false)
const showResetConfirm = ref(false)
const showResetSuccess = ref(false)

const { $firebase } = useNuxtApp()
const isEmailVerified = computed(() => ($firebase.auth as any).currentUser?.emailVerified ?? false)

const confirmResetHabits = () => { showResetConfirm.value = true }

const resetHabits = async () => {
  showResetConfirm.value = false
  resetLoading.value = true
  try {
    await Promise.all(habitStore.habits.map(h => habitStore.deleteHabit(h.id)))

    // 👇 reset XP to 0
    const { doc, setDoc } = await import('firebase/firestore')
    const uid = ($firebase.auth as any).currentUser?.uid
    if (uid) {
      const levelRef = doc($firebase.db, 'users', uid, 'level', 'data')
      await setDoc(levelRef, { totalXp: 0 })
      levelStore.totalXp = 0
    }

    showResetSuccess.value = true
  } finally {
    resetLoading.value = false
  }
}

const cancelReset = () => { showResetConfirm.value = false }

const showVerifyAlert = ref(false)

const exportData = async () => {
  if (!isEmailVerified.value) {
    showVerifyAlert.value = true
    return
  }

  const uid = ($firebase.auth as any).currentUser?.uid ?? null

  const payload = {
    exportedAt: new Date().toISOString(),
    uid,
    level: { totalXp: levelStore.totalXp },
    habits: habitStore.habits,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `habit-data-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <ClientOnly>
    <!-- Sign out progress -->
    <Alert type="danger" title="Signing out..."
      :message="`You will be signed out in ${countdown} second${countdown !== 1 ? 's' : ''}.`" :visible="signOutLoading"
      :dismissible="false" :actions="[
        { label: 'No, stay logged in', onClick: cancelSignOut },
      ]" />

    <!-- Reset confirm -->
    <Alert type="danger" title="Reset all habits?"
      message="This will permanently delete all your habits and level. This cannot be undone."
      :visible="showResetConfirm" :dismissible="false" :actions="[
        { label: 'Yes, Delete All', onClick: resetHabits },
        { label: 'No, Cancel', onClick: cancelReset },
      ]" />

    <!-- Reset progress -->
    <Alert type="info" title="Deleting all habits..." message="Please wait while your habit records are being removed."
      :visible="resetLoading" :dismissible="false" />

    <!-- Reset success -->
    <Alert type="success" title="All habits deleted!" message="Your habit records have been successfully removed."
      :visible="showResetSuccess" :timeout="3000" @dismiss="showResetSuccess = false" />

      <!-- Verify email alert -->
    <Alert type="info" title="Unverified Email"
      message="Please verify your email address before exporting your data." :visible="showVerifyAlert" :timeout="4000"
      @dismiss="showVerifyAlert = false" />

    <section class="bg-white rounded-3xl p-2 flex flex-col">
      <button @click="exportData"
        class="flex items-center gap-3 justify-between px-4 py-3 rounded-2xl hover:bg-black/5 transition-colors text-left cursor-pointer">
        <div class="flex items-center gap-3">
          <Download class="size-4 text-black/40" />
          <span class="text-sm font-medium text-black/70">Export Data as JSON</span>
        </div>
        <div class="px-2 py-1 bg-primary/10 rounded-full pointer-events-none">
          <Gem class="size-3 text-primary" />
        </div>
      </button>

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
        <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-4 py-3">
          <Skeleton width="1rem" height="1rem" rounded="9999px" />
          <Skeleton height="1rem" width="35%" />
        </div>
      </section>
    </template>
  </ClientOnly>
</template>