<!-- HabitCard.vue -->
<script setup lang="ts">
import { Check, Flame, GripVertical, Leaf } from '@lucide/vue';
import type { Habit } from '~/types/habit'
import { format } from 'date-fns'

const props = defineProps<{
  habit: Habit
}>()

const emit = defineEmits<{
  toggle: [habit: Habit]
  edit: [id: Habit['id']]
  delete: [id: Habit['id']]
}>()

const today = format(new Date(), 'yyyy-MM-dd') // "2025-04-11"

const isCompletedToday = computed(() =>
  props.habit.completions?.includes(today) ?? false
)

const editHabit = () => {
  emit('edit', props.habit.id)
}

const deleteHabit = () => {
  emit('delete', props.habit.id)
}

const toggleCompletion = () => {
  emit('toggle', props.habit)
}

const streakStarted = computed(() => {
  if (!props.habit.completions?.length) {
    return 'Complete to start a streak'
  } else {
    const firstCompletion = format(new Date(props.habit.completions[props.habit.completions.length - 1]!), 'MMM d')
    return 'Streak since ' + firstCompletion
  }
})

</script>

<template>
  <main :class="['w-full h-auto rounded-3xl flex items-center justify-center relative p-6 group gap-4 border border-transparent hover:border-primary/20 transition-all duration-200 select-none',
    isCompletedToday ? 'bg-muted/5' : 'bg-white',
  ]">
    <GripVertical class="size-6 text-muted cursor-grab active:cursor-grabbing" />
    <div class="w-full">
      <section class="flex items-center gap-4">
        <section
          class="ring-2 ring-black/5 rounded-full size-12 flex items-center justify-center cursor-pointer transition-all duration-200"
          @click="toggleCompletion">
          <div v-if="isCompletedToday"
            class="ring-4 ring-primary rounded-full size-9 flex items-center justify-center bg-primary">
            <Check class="size-8 text-white" />
          </div>
        </section>
        <section :class="['space-y-1', isCompletedToday ? 'opacity-50' : 'opacity-100']">
          <h2 :class="['text-xl font-semibold', isCompletedToday ? 'line-through' : '']">
            {{ habit.name }}
          </h2>
          <div class="flex items-center gap-2">
            <div class="size-2 rounded-full" :style="{ backgroundColor: habit.color }"></div>
            <UppercaseTitle size="sm">{{ habit.time }}</UppercaseTitle>
          </div>
        </section>
      </section>
    </div>
    <div class="flex items-center gap-2">
      <Tooltip :text="`${streakStarted ? streakStarted : 'No streak yet'}`" position="top">
        <button :class="[
          'flex items-center gap-0.5 px-3 py-1.5 rounded-full font-secondary text-xs font-bold transition-all duration-200',
          habit.streak >= 3
            ? 'bg-danger/10 text-danger'
            : 'bg-emerald-500/10 text-emerald-500',
        ]">
          <Flame v-if="habit.streak >= 3" class="size-3.5 pointer-events-none" />
          <Leaf v-else class="size-3.5 pointer-events-none" />
          {{ habit.streak }}
        </button>
      </Tooltip>
      <HabitMenu trigger-class="opacity-0 group-hover:opacity-70 transition-opacity duration-200" @edit="editHabit"
        @delete="deleteHabit" />
    </div>
  </main>
</template>