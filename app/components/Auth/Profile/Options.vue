<!-- components/Auth/Profile/Options.vue -->
<script setup lang="ts">
import { LogOut, RotateCcw } from '@lucide/vue'

const { signOut } = useAuth()
const habitStore = useHabitStore()

const resetHabits = async () => {
  if (!confirm('Are you sure you want to delete all habits? This cannot be undone.')) return
  await Promise.all(habitStore.habits.map(h => habitStore.deleteHabit(h.id)))
}
</script>

<template>
  <section class="bg-white rounded-3xl p-2 flex flex-col">
    <button @click="signOut"
      class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-black/5 transition-colors text-left cursor-pointer">
      <LogOut class="size-4 text-black/40" />
      <span class="text-sm font-medium text-black/70">Sign Out</span>
    </button>

    <button @click="resetHabits"
      class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 transition-colors text-left cursor-pointer">
      <RotateCcw class="size-4 text-red-400" />
      <span class="text-sm font-medium text-red-400">Reset All Habit Records</span>
    </button>
  </section>
</template>