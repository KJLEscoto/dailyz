<!-- components/Habit/Menu.vue -->
<script setup lang="ts">
import { SquarePen, Trash } from '@lucide/vue'
import type { MenuItem } from '~/components/MainMenu.vue'

const props = defineProps<{
  triggerClass?: string
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const items: MenuItem[] = [
  { label: 'Edit', icon: SquarePen, action: () => emit('edit') },
  { label: 'Delete', icon: Trash, action: () => emit('delete'), danger: true },
]
</script>

<template>
  <MainMenu :items="items" :trigger-class="triggerClass" />
</template>