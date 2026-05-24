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
  delete: [id: Habit['id'], name: string]
}>()
</script>

<template>
  <ul class="space-y-3 w-full">
    <li v-for="habit in props.habits" :key="habit.id">
      <HabitCard :has-menu="props.hasMenu !== false" :habit="habit" @toggle="emit('toggle', $event)"
        @edit="emit('edit', $event)" @delete="(id, name) => emit('delete', id, name)" />
    </li>
  </ul>
</template>