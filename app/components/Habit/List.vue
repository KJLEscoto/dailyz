<!-- components/Habit/List.vue -->
<script setup lang="ts">
import type { Habit } from '~/types/habit'

const props = defineProps<{
  habits: Habit[]
  hasMenu?: boolean
}>()

const emit = defineEmits<{
  toggle: [habit: Habit]
  edit: [id: Habit['id']]
  delete: [id: Habit['id']]
}>()
</script>

<template>
  <ul class="sm:space-y-4 space-y-3 w-full">
    <li v-for="habit in props.habits" :key="habit.id">
      <HabitCard :has-menu="props.hasMenu !== false" :habit="habit" @toggle="emit('toggle', $event)"
        @edit="emit('edit', $event)" @delete="emit('delete', $event)" />
    </li>
  </ul>
</template>