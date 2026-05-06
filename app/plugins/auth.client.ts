// plugins/auth.client.ts
export default defineNuxtPlugin({
  name: 'auth',
  dependsOn: ['firebase'],
  async setup() {
    const { initAuth, habitsReady, handleRedirectResult } = useAuth()
    const habitStore = useHabitStore()

    await handleRedirectResult()

    initAuth(
      async () => {
        habitsReady.value = false
        await habitStore.fetchHabits()
        await habitStore.resetStaleStreaks()
        habitsReady.value = true
      },
      () => {
        habitStore.habits = []
        habitsReady.value = false
      }
    )
  }
})