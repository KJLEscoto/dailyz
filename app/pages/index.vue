<!-- pages/index.vue -->
<script setup lang="ts">
const { sampleHabits, toggleCompletion } = useSampleHabits()
const habitStore = useHabitStore()
const signOutSuccess = useState<boolean>('sign-out-success', () => false)

// 👈 patch the store's toggleCompletion for guest mode
const originalToggle = habitStore.toggleCompletion
habitStore.toggleCompletion = (habit) => {
  toggleCompletion(habit)
  return Promise.resolve()
}

// 👈 sync sample habits into the store so HabitCard reads from it
watchEffect(() => {
  habitStore.habits = sampleHabits.value
})

onUnmounted(() => {
  // 👈 restore original and clear habits when leaving
  habitStore.toggleCompletion = originalToggle
  habitStore.habits = []
})
</script>

<template>
  <Alert type="success" title="Signed out!" message="You have been successfully signed out." :visible="signOutSuccess"
    :timeout="3000" @dismiss="signOutSuccess = false" />

  <section class="space-y-2 text-center w-full">
    <img src="/images/mascot/intro_model.png" alt="Dailyz Mascot Meditate" class="w-full h-auto object-cover" />
    <h1 class="md:text-3xl text-xl font-bold text-primary">Your path to serenity begins here.</h1>
    <p class="text-muted md:text-lg text-sm">Create your habits for a more mindful life.</p>
  </section>

  <ul class="space-y-5 pt-1 w-full">
    <li v-for="habit in sampleHabits" :key="habit.id">
      <HabitCard :habit="habit" :has-menu="false" @edit="() => { }" @delete="() => { }" />
    </li>
  </ul>

  <section class="flex items-center gap-3 justify-center w-[80%]">
    <hr class="border-muted/20 w-full" />
    <div class="size-2 shrink-0 bg-primary rounded-full" />
    <hr class="border-muted/20 w-full" />
  </section>

  <section class="space-y-5 text-center">
    <Button size="lg" to="/login">
      <p>Get Started</p>
    </Button>
  </section>
</template>