<script setup lang="ts">
import type { HabitTime } from '~/types/habit'

const showAddHabitModal = ref(false)
const habitName = ref('')
const habitNameError = ref('')
const habitTime = ref('')
const habitTimeError = ref('')
const habitColor = ref('')
const habitColorError = ref('')

const habitStore = useHabitStore()

const addHabit = () => {
  showAddHabitModal.value = true
}

const confirmAdd = async () => {
  // reset errors
  habitNameError.value = ''
  habitTimeError.value = ''
  habitColorError.value = ''

  // validate
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

  await habitStore.addHabit({
    id: '',                          
    name: habitName.value,
    time: habitTime.value as HabitTime,
    streak: 0,                      
    streakStarted: '',               
    completions: [],              
    color: habitColor.value,
    createdAt: new Date().toISOString(),  
  })

  showAddHabitModal.value = false  
  
  // reset fields
  habitName.value = ''
  habitTime.value = ''
  habitColor.value = ''
}

const cancelAdd = () => {
  showAddHabitModal.value = false
  // reset fields and errors
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
  <Modal v-model="showAddHabitModal" title="New Habit"
    description="Daily routine? Anything you want to do consistently!" primary-label="Add Habit" @primary="confirmAdd" @cancel="cancelAdd">
    <form class="space-y-6">
      <FormField v-model="habitName" label="habit name" type="text" placeholder="e.g, Exercise for 30 minutes"
        :error="habitNameError" required>
      </FormField>
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