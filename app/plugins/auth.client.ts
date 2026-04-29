// plugins/auth.client.ts
export default defineNuxtPlugin({
  name: 'auth',
  dependsOn: ['firebase'],
  setup() {
    const { initAuth, habitsReady } = useAuth()
    const habitStore = useHabitStore()

    initAuth(
      async () => {
        await habitStore.fetchHabits()
        await habitStore.resetStaleStreaks()
        habitsReady.value = true // 👈
      },
      () => {
        habitStore.habits = []
        habitsReady.value = false // 👈
      }
    )
  }
})