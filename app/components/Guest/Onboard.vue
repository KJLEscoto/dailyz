<!-- components/Guess/Onboard.vue -->
<script setup lang="ts">
import type { Habit } from '~/types/habit'

const { signIn } = useAuth()

const emit = defineEmits<{
  toggle: [habit: Habit]
  edit: [id: Habit['id']]
  delete: [id: Habit['id']]
  reorder: [newOrder: string[]]
}>()

const { guestHabits, sampleHabits, addGuestHabit, toggleGuestCompletion, deleteGuestHabit } = useGuestHabits()

const modalAddRef = ref()

const addHabit = () => modalAddRef.value?.addHabit()

const handleAdd = (habit: Habit) => {
  addGuestHabit(habit)
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-10">
    <!-- <section class="w-full h-full">
      <NatureImage />
    </section> -->

    <section class="space-y-3 text-center">
      <h1 class="text-4xl font-bold text-primary">Your path to serenity begins here.</h1>
      <p class="text-muted">Create your habit list and start building a more mindful life.</p>
    </section>

    <!-- <Button size="lg" @click="addHabit">
      <Plus class="size-5 pointer-events-none" />
      <p>Add your First Habit</p>
    </Button> -->

    <!-- Sample habits to preview -->
    <section class="w-full text-center space-y-3">
      <UppercaseTitle size="sm" class="text-primary">sample habits</UppercaseTitle>
      <HabitList v-if="sampleHabits.length > 0" 
        :habits="sampleHabits" :has-menu="false"
        @toggle="() => {}"
        @edit="() => {}"
        @delete="() => {}"
        @reorder="() => {}"
        />
    </section>

    <section class="w-full flex items-center justify-center gap-3">
      <hr class="border-muted/15 w-full">
      <div class="size-2 bg-primary rounded-full shrink-0" />
      <hr class="border-muted/15 w-full">
    </section>
 
    <section class="w-full flex flex-col items-center space-y-6">
      <p class="text-muted">Create your habit list and start building a more mindful life.</p>
      <button @click="signIn"
        class="w-1/2 h-auto py-3 px-10 shrink-0 bg-white rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform hover:shadow-lg">
        <img src="/images/webp/google.webp" alt="Sign in with Google" class="size-6" />
        <p class="text-nowrap">Sign In with Google</p>
      </button>
    </section>
  </div>

  <ModalAdd ref="modalAddRef" @add="handleAdd" />
</template>