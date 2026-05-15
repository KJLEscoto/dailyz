<!-- pages/index.vue -->
<script setup lang="ts">
const { sampleHabits } = useSampleHabits()
const signOutSuccess = useState<boolean>('sign-out-success', () => false)
const deleteAccountSuccess = useState<boolean>('delete-account-success', () => false)

const mascotSrc = '/images/mascot/intro_model.png'
</script>

<template>
  <div class="flex flex-col md:gap-10 gap-6 items-center justify-center">
    <Alert type="success" title="Signed out!" message="You have been successfully signed out." :visible="signOutSuccess"
      :timeout="3000" @dismiss="signOutSuccess = false" />

    <!-- Reset success -->
    <Alert type="success" title="Account deleted!" message="Your account is not accessible anymore."
      :visible="deleteAccountSuccess" :timeout="3000" @dismiss="deleteAccountSuccess = false" />

    <section class="space-y-2 text-center w-full">
      <Image :src="mascotSrc" alt="Dailyz Mascot Scott" class="w-full h-auto" />
      <h1 class="md:text-3xl text-xl font-bold text-primary">Your path to serenity begins here.</h1>
      <p class="text-muted md:text-lg text-sm">Create your habits for a more mindful life.</p>
    </section>

    <ul class="space-y-5 pt-1 w-full">
      <li v-for="habit in sampleHabits" :key="habit.id">
        <HabitGuestCard :habit="habit" />
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
  </div>
</template>