<!-- components/Habit/Section.vue -->
<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import type { Habit } from '~/types/habit'

defineProps<{
  title: string
  count: number
  habits: Habit[]
}>()

defineEmits<{
  toggle: [habit: Habit]
  edit: [id: Habit['id']]
  delete: [id: Habit['id']]
  reorder: [newOrder: string[]]
}>()

const isOpen = ref(true)
</script>

<template>
  <div class="w-full">
    <button class="flex items-center z-20 gap-2 w-full cursor-pointer sticky top-55 bg-foreground pb-2"
      @click="isOpen = !isOpen">
      <UppercaseTitle class="font-primary! font-semibold!" size="md">{{ title }}</UppercaseTitle>
      <div class="p-2 rounded-full bg-muted/5 size-8 shrink-0 flex items-center justify-center">
        <p class="text-base font-bold text-muted text-nowrap">{{ count }}</p>
      </div>
      <hr class="w-full border-muted/5" />
      <ChevronDown class="pointer-events-none size-5 text-muted transition-transform duration-300"
        :class="isOpen ? 'rotate-0' : '-rotate-90'" />
    </button>

    <div class="grid transition-all duration-300 ease-in-out" :class="isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
      <div class="overflow-hidden">
        <HabitList :has-menu="true" :habits="habits" @toggle="$emit('toggle', $event)" @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)" @reorder="$emit('reorder', $event)" />
      </div>
    </div>
  </div>
</template>