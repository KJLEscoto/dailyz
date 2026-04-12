<script setup lang="ts">
import type { Habit, HabitTime } from '~/types/habit'
import { format } from 'date-fns'

const showEditHabitModal = ref(false)
const habitId = ref<Habit['id']>(null)
const habitName = ref('')
const habitNameError = ref('')
const habitTime = ref('')
const habitTimeError = ref('')
const habitColor = ref('')
const habitColorError = ref('')
const habitCreatedAt = ref('')

const habitStore = useHabitStore()

const editHabit = (habit: Habit) => {
  habitId.value = habit.id
  habitName.value = habit.name    
  habitTime.value = habit.time
  habitColor.value = habit.color
  habitCreatedAt.value = habit.createdAt
  showEditHabitModal.value = true
}

const confirmEdit = async () => {
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

  await habitStore.updateHabit(habitId.value,
    { 
      name: habitName.value,
      time: habitTime.value as HabitTime,
      color: habitColor.value,
    })

  showEditHabitModal.value = false

  // reset fields
  habitName.value = ''
  habitTime.value = ''
  habitColor.value = ''

  showEditHabitModal.value = false
}

const cancelAdd = () => {
  showEditHabitModal.value = false
  // reset errors
  habitNameError.value = ''
  habitTimeError.value = ''
  habitColorError.value = ''
} 

const dateCreated = computed(() => 'Created on ' + format(habitCreatedAt.value ? new Date(habitCreatedAt.value) : new Date(), 'MMM d, yyyy'))

defineExpose({ editHabit })
</script>

<template>
  <Modal v-model="showEditHabitModal" title="Edit Habit"
    :description="dateCreated" primary-label="Update Habit" @primary="confirmEdit()" @cancel="cancelAdd">
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