export default defineNuxtPlugin(async () => {
  const habitStore = useHabitStore()

  // wait for habits to be fetched
  await habitStore.fetchHabits()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const habit of habitStore.habits) {
    if (!habit.completions?.length) {
      if (habit.streak !== 0) {
        await habitStore.updateHabit(habit.id, { streak: 0 })
      }
      continue
    }

    const recalculated = habitStore.calculateStreak(habit.completions)

    // only write to firestore if the stored streak is actually stale
    if (habit.streak !== recalculated) {
      await habitStore.updateHabit(habit.id, { streak: recalculated })
    }
  }
})