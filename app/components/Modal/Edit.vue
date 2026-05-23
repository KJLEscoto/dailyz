// Edit.vue
<script setup lang="ts">
import type { Habit, HabitTime } from '~/types/habit'
import { format } from 'date-fns'

const showEditHabitModal = ref(false)
const habitId = ref<Habit['id']>('')
const habitName = ref('')
const habitNameError = ref('')
const habitIcon = ref('lucide:star')
const habitIconError = ref('')
const habitTime = ref<HabitTime | ''>('')
const habitTimeError = ref('')
const habitReminderTime = ref('')
const habitReminderTimeError = ref('')
const habitColor = ref('')
const habitColorError = ref('')
const habitCreatedAt = ref('')
const editLoading = ref(false)
const showSuccessAlert = ref(false)
const updatedHabitName = ref('')

// --- Refs for focus ---
const fieldName = ref<HTMLElement | null>(null)
const fieldIcon = ref<HTMLElement | null>(null)
const fieldTime = ref<HTMLElement | null>(null)
const fieldReminder = ref<HTMLElement | null>(null)
const fieldColor = ref<HTMLElement | null>(null)

const habitStore = useHabitStore()

const editHabit = (habit: Habit) => {
  habitId.value = habit.id
  habitName.value = habit.name
  habitIcon.value = habit.icon || 'lucide:star'
  habitTime.value = habit.time
  habitReminderTime.value = habit.reminderTime ?? ''
  habitColor.value = habit.color
  habitCreatedAt.value = habit.createdAt
  showEditHabitModal.value = true
}

const confirmEdit = async () => {
  habitNameError.value = ''
  habitIconError.value = ''
  habitTimeError.value = ''
  habitReminderTimeError.value = ''
  habitColorError.value = ''

  let firstErrorRef: Ref<HTMLElement | null> | null = null

  const flag = (errorRef: Ref<string>, msg: string, elRef: Ref<HTMLElement | null>) => {
    errorRef.value = msg
    if (!firstErrorRef) firstErrorRef = elRef
  }

  if (!habitName.value.trim()) flag(habitNameError, 'Habit name is required.', fieldName)
  if (!habitIcon.value) flag(habitIconError, 'Please pick an icon.', fieldIcon)
  if (!habitTime.value) flag(habitTimeError, 'Please select a time of day.', fieldTime)
  if (!habitReminderTime.value) flag(habitReminderTimeError, 'Please set a reminder time.', fieldReminder)
  if (!habitColor.value) flag(habitColorError, 'Please select a color.', fieldColor)

  if (firstErrorRef) {
    await nextTick()
      ; (firstErrorRef as Ref<HTMLElement | null>).value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  editLoading.value = true
  try {
    await habitStore.updateHabit(habitId.value, {
      name: habitName.value,
      icon: habitIcon.value,
      time: habitTime.value as HabitTime,
      reminderTime: habitReminderTime.value,
      color: habitColor.value,
    })

    updatedHabitName.value = habitName.value
    showEditHabitModal.value = false
    showSuccessAlert.value = true
  } finally {
    editLoading.value = false
  }
}

const cancelEdit = () => {
  showEditHabitModal.value = false
  habitNameError.value = ''
  habitIconError.value = ''
  habitTimeError.value = ''
  habitReminderTimeError.value = ''
  habitColorError.value = ''
}

const dateCreated = computed(() =>
  'Created on ' + format(habitCreatedAt.value ? new Date(habitCreatedAt.value) : new Date(), 'MMM d, yyyy')
)

defineExpose({ editHabit })
</script>

<template>
  <Alert type="info" title="Habit updated!"
    :message="`Your &quot;${updatedHabitName}&quot; habit has been updated successfully.`" :visible="showSuccessAlert"
    :timeout="3000" @dismiss="showSuccessAlert = false" />

  <Modal v-model="showEditHabitModal" title="Edit Habit" :description="dateCreated" primary-label="Update Habit"
    :primary-loading="editLoading" :primary-disabled="editLoading" @primary="confirmEdit" @cancel="cancelEdit">

    <form class="space-y-6">

      <!-- Name -->
      <div ref="fieldName">
        <FormField v-model="habitName" label="Habit name" type="text" placeholder="e.g. Exercise for 30 minutes"
          :error="habitNameError" required />
      </div>

      <!-- Icon -->
      <div ref="fieldIcon" class="space-y-1.5">
        <label class="flex items-center gap-1 md:text-sm text-xs font-medium uppercase text-muted select-none">
          icon <span class="text-sm leading-none text-primary">*</span>
        </label>
        <FormIconPicker v-model="habitIcon" />
        <p v-if="habitIconError" class="text-xs text-red-500 mt-1">{{ habitIconError }}</p>
      </div>

      <!-- Time of day -->
      <div ref="fieldTime">
        <FormRadio :error="habitTimeError" v-model="habitTime" label="Time of day" :options="[
          { label: 'Morning', value: 'morning' },
          { label: 'Afternoon', value: 'afternoon' },
          { label: 'Evening', value: 'evening' },
          { label: 'Anytime', value: 'anytime' },
        ]" required />
      </div>

      <!-- Reminder time -->
      <div ref="fieldReminder">
        <FormReminderTime v-model="habitReminderTime" required :error="habitReminderTimeError" />
      </div>

      <!-- Color -->
      <div ref="fieldColor">
        <FormColor v-model="habitColor" label="Color" :error="habitColorError" required />
      </div>

    </form>
  </Modal>
</template>