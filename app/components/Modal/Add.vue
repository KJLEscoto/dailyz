<script setup lang="ts">
import type { HabitTime } from '~/types/habit'

const showAddHabitModal = ref(false)
const habitName = ref('')
const habitNameError = ref('')
const habitIcon = ref('lucide:star')   // 👈
const habitIconError = ref('')         // 👈
const habitTime = ref<HabitTime | ''>('')
const habitTimeError = ref('')
const habitReminderTime = ref('')      // 👈 e.g. "09:45 AM"
const habitColor = ref('')
const habitColorError = ref('')
const addLoading = ref(false)
const showSuccessAlert = ref(false)
const addedHabitName = ref('')

const habitStore = useHabitStore()

const addHabit = () => { showAddHabitModal.value = true }

const confirmAdd = async () => {
  habitNameError.value = ''
  habitIconError.value = ''
  habitTimeError.value = ''
  habitColorError.value = ''

  let hasError = false
  if (!habitName.value.trim()) { habitNameError.value = 'Habit name is required.'; hasError = true }
  if (!habitIcon.value) { habitIconError.value = 'Please pick an icon.'; hasError = true }
  if (!habitTime.value) { habitTimeError.value = 'Please select a time of day.'; hasError = true }
  if (!habitColor.value) { habitColorError.value = 'Please select a color.'; hasError = true }
  if (hasError) return

  addLoading.value = true
  try {
    await habitStore.addHabit({
      id: '',
      name: habitName.value,
      icon: habitIcon.value,                          // 👈
      time: habitTime.value as HabitTime,
      reminderTime: habitReminderTime.value || null,  // 👈
      streak: 0,
      completions: [],
      color: habitColor.value,
      createdAt: new Date().toISOString(),
    })

    addedHabitName.value = habitName.value
    resetForm()
    showAddHabitModal.value = false
    showSuccessAlert.value = true
  } finally {
    addLoading.value = false
  }
}

const resetForm = () => {
  habitName.value = ''
  habitIcon.value = 'lucide:star'
  habitTime.value = ''
  habitReminderTime.value = ''
  habitColor.value = ''
  habitNameError.value = ''
  habitIconError.value = ''
  habitTimeError.value = ''
  habitColorError.value = ''
}

const cancelAdd = () => {
  resetForm()
  showAddHabitModal.value = false
}

defineExpose({ addHabit })
</script>

<template>
  <Alert type="success" title="New habit added!"
    :message="`&quot;${addedHabitName}&quot; is on your list. Start your streak today!`" :visible="showSuccessAlert"
    :timeout="3000" @dismiss="showSuccessAlert = false" />

  <Modal v-model="showAddHabitModal" title="New Habit"
    description="Daily routine? Anything you want to do consistently!" primary-label="Add Habit"
    :primary-loading="addLoading" :primary-disabled="addLoading" @primary="confirmAdd" @cancel="cancelAdd">

    <form class="space-y-6">

      <!-- Name -->
      <FormField v-model="habitName" label="Habit name" type="text" placeholder="e.g. Exercise for 30 minutes"
        :error="habitNameError" required />

      <!-- Icon picker section -->
      <div class="space-y-1.5">
        <!-- Label -->
        <label class="flex items-center gap-1 md:text-sm text-xs font-medium uppercase text-muted select-none">
          icon
          <span class="text-sm leading-none text-primary">*</span>
        </label>

        <FormIconPicker v-model="habitIcon" /> <!-- 👈 matches filename IconPicker.vue -->

        <p v-if="habitIconError" class="text-xs text-red-500 mt-1">{{ habitIconError }}</p>
      </div>

      <!-- Time of day -->
      <FormRadio :error="habitTimeError" v-model="habitTime" label="Time of day" :options="[
        { label: 'Morning', value: 'morning' },
        { label: 'Afternoon', value: 'afternoon' },
        { label: 'Evening', value: 'evening' },
        { label: 'Anytime', value: 'anytime' },
      ]" required />

      <!-- Reminder time -->
      <FormReminderTime v-model="habitReminderTime" />

      <!-- Color -->
      <FormColor v-model="habitColor" label="Color" :error="habitColorError" required />

    </form>
  </Modal>
</template>