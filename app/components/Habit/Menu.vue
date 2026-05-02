<!-- components/Habit/Menu.vue -->
<script setup lang="ts">
import { EllipsisVertical, SquarePen, Trash } from '@lucide/vue'
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
  <MainMenu :items="items" :menu-width="200">
    <template #trigger>
      <div class="p-1.5 hover:bg-black/5 rounded-xl text-black/40 hover:text-black/80 transition-colors">
        <EllipsisVertical class="size-4 pointer-events-none" />
      </div>
    </template>
  </MainMenu>
</template>