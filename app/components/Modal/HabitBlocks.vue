<!-- components/Modal/HabitBlocks.vue -->
<script setup lang="ts">
import type { Habit } from '~/types/habit'

const props = defineProps<{ habits: Habit[] }>()

const modelValue = defineModel<boolean>({ default: false })
const fallKey = ref(0)

const TIME_CONFIG = useTimeConfig()

const blocks = computed(() => {
  const groups: Record<string, number> = {}
  props.habits.forEach(h => {
    const t = h.time ?? 'anytime'
    groups[t] = (groups[t] ?? 0) + 1
  })
  const total = props.habits.length || 1
  return Object.entries(groups).map(([time, count]) => ({
    time,
    count,
    percentage: count / total,
    ...TIME_CONFIG[time] ?? TIME_CONFIG.anytime!,
  }))
})
</script>

<template>
  <Modal v-model="modelValue" title="Habit Blocks" primary-label="Free Fall" cancel-label="Close"
    description="Drag it and play around your habits." @primary="fallKey++" @cancel="modelValue = false">
    <HabitBlockCanvas :key="fallKey" :blocks="blocks" :open="modelValue" />
  </Modal>
</template>