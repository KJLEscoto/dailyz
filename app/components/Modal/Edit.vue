<script setup lang="ts">
const showEditHabitModal = ref(false)
const habitName = ref('')
const habitNameError = ref('')
const habitTime = ref('')
const habitTimeError = ref('')
const habitColor = ref('')
const habitColorError = ref('')
const habitCreatedAt = ref('')

const editHabit = (habit: { id: number, name: string, time: string, color: string, created_at: string }) => {
  habitName.value = habit.name    // 👈 pre-fill
  habitTime.value = habit.time
  habitColor.value = habit.color
  habitCreatedAt.value = habit.created_at
  showEditHabitModal.value = true
}

const confirmAdd = () => {
  console.log({
    name: habitName.value,
    time: habitTime.value,
    color: habitColor.value,
    created_at: habitCreatedAt.value,
  })
  showEditHabitModal.value = false
}

const dateCreated = computed(() => 'Created on ' + habitCreatedAt.value)

defineExpose({ editHabit })
</script>

<template>
  <Modal v-model="showEditHabitModal" title="Edit Habit"
    :description="dateCreated" primary-label="Update Habit" @primary="confirmAdd">
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