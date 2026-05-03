<script setup lang="ts">
import type { HabitTime } from '~/types/habit'

const showAddHabitModal = ref(false)
const habitName = ref('')
const habitNameError = ref('')
const habitTime = ref('')
const habitTimeError = ref('')
const habitColor = ref('')
const habitColorError = ref('')
const addLoading = ref(false)
const showSuccessAlert = ref(false) // 👈
const addedHabitName = ref('') // 👈 store name for the alert message

const habitStore = useHabitStore()

const addHabit = () => {
  showAddHabitModal.value = true
}

const confirmAdd = async () => {
  habitNameError.value = ''
  habitTimeError.value = ''
  habitColorError.value = ''

  let hasError = false
  if (!habitName.value.trim()) {
    habitNameError.value = 'Habit name is required.'
    hasError = true
  }
  if (!habitTime.value) {
    habitTimeError.value = 'Please select a time of day.'
    hasError = true
  }
  if (!habitColor.value) {
    habitColorError.value = 'Please select a color.'
    hasError = true
  }
  if (hasError) return

  addLoading.value = true
  try {
    await habitStore.addHabit({
      id: '',
      name: habitName.value,
      time: habitTime.value as HabitTime,
      streak: 0,
      completions: [],
      color: habitColor.value,
      createdAt: new Date().toISOString(),
    })

    addedHabitName.value = habitName.value // 👈 save before reset
    showAddHabitModal.value = false
    habitName.value = ''
    habitTime.value = ''
    habitColor.value = ''

    // 👇 show success alert then auto-dismiss after 3s
    showSuccessAlert.value = true
  } finally {
    addLoading.value = false
  }
}

const cancelAdd = () => {
  showAddHabitModal.value = false
  habitName.value = ''
  habitTime.value = ''
  habitColor.value = ''
  habitNameError.value = ''
  habitTimeError.value = ''
  habitColorError.value = ''
}

defineExpose({ addHabit })
</script>

<template>
  <!-- Success alert -->
  <Alert type="success" title="New habit is added!"
    :message="`&quot;${addedHabitName}&quot; is on To Do. Make your streak today!`" :visible="showSuccessAlert" :timeout="3000"
    @dismiss="showSuccessAlert = false" />

  <Modal v-model="showAddHabitModal" title="New Habit"
    description="Daily routine? Anything you want to do consistently!" primary-label="Add Habit"
    :primary-loading="addLoading" :primary-disabled="addLoading" @primary="confirmAdd" @cancel="cancelAdd">
    <form class="space-y-6">
      <FormField v-model="habitName" label="habit name" type="text" placeholder="e.g, Exercise for 30 minutes"
        :error="habitNameError" required />
      <FormRadio :error="habitTimeError" v-model="habitTime" label="time of day" :options="[
        { label: 'Morning', value: 'morning' },
        { label: 'Afternoon', value: 'afternoon' },
        { label: 'Evening', value: 'evening' },
        { label: 'Anytime', value: 'anytime' },
      ]" required />
      <FormColor v-model="habitColor" label="color" :error="habitColorError" required />
    </form>
  </Modal>
</template>