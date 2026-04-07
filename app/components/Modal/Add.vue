<script setup lang="ts">
const showAddHabitModal = ref(false)
const habitName = ref('')
const habitNameError = ref('')
const habitTime = ref('')
const habitTimeError = ref('')
const habitColor = ref('')  
const habitColorError = ref('')

const addHabit = () => {
  showAddHabitModal.value = true
}

const confirmAdd = () => {
  console.log({
    name: habitName.value,
    time: habitTime.value,
    color: habitColor.value,
  })
  showAddHabitModal.value = false
}

defineExpose({ addHabit })
</script>

<template>
  <Modal v-model="showAddHabitModal" title="New Habit"
    description="Daily routine? Anything you want to do consistently!" primary-label="Add Habit" @primary="confirmAdd">
    <form class="space-y-6">
      <FormField v-model="habitName" label="habit name" type="text" placeholder="e.g, Exercise for 30 minutes"
        :error="habitNameError" required>
      </FormField>
      <FormRadio v-model="habitTime" label="time of day" :options="[
        { label: 'Morning', value: 'morning' },
        { label: 'Afternoon', value: 'afternoon' },
        { label: 'Evening', value: 'evening' },
        { label: 'Anytime', value: 'anytime' },
      ]" required />
      <FormColor v-model="habitColor" label="color" :error="habitColorError" required />
    </form>
  </Modal>
</template>