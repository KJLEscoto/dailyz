<script setup lang="ts">
import type { Habit } from '~/types/habit'

const props = defineProps<{ habits: Habit[] }>()
const modelValue = defineModel<boolean>({ default: false })
const fallKey = ref(0)
</script>

<template>
  <Modal v-model="modelValue" title="Habit Blocks" primary-label="Free Fall" cancel-label="Close"
    description="Drag it and play around your habits." @primary="fallKey++" @cancel="modelValue = false">
    <HabitBlockCanvas :key="fallKey" :habits="habits" :open="modelValue" />
  </Modal>
</template>