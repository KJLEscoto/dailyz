<!-- components/Habit/Card.vue -->
<script setup lang="ts">
import { Check, Flame, GripVertical, Leaf } from '@lucide/vue';
import type { Habit } from '~/types/habit'
import { format } from 'date-fns'

const props = defineProps<{
  habit: Habit
  isHolding?: boolean
  hasMenu?: boolean
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
  if (!props.habit.completions?.length || props.habit.streak === 0) {
    return 'Complete to start a streak'
  }

  // sort descending (latest first)
  const sorted = [...props.habit.completions].sort((a, b) => b.localeCompare(a))

  // walk backwards to find where the current consecutive streak starts
  let streakStart = sorted[0]!
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = new Date(sorted[i]!)
    const next = new Date(sorted[i + 1]!)

    // check if next date is exactly 1 day before current
    const diffDays = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      streakStart = sorted[i + 1]!  // keep going back
    } else {
      break  // gap found, stop here
    }
  }

  return 'Streak since ' + format(new Date(streakStart), 'MMM d')
})

</script>

<template>
  <main :class="['w-full h-auto rounded-3xl! flex items-center justify-center relative p-6 group gap-4 border border-transparent hover:border-primary/20 transition-all duration-200 select-none cursor-move',
    isCompletedToday ? 'bg-[#f3f3f3]' : 'bg-white',
  ]" 
  :style="{ transform: isHolding ? 'scale(0.95)' : 'scale(1)' }">
    <GripVertical class="size-6 text-muted cursor-move" />
    <div class="w-full">
      <section class="flex items-center gap-4">
        <section
          class="ring-2 ring-black/5 rounded-full! size-12 flex items-center shrink-0 justify-center cursor-pointer transition-all duration-200"
          @click="toggleCompletion">
          <div v-if="isCompletedToday" data-swapy-no-drag
            class="ring-4 ring-primary rounded-full! size-9 flex items-center justify-center bg-primary">
            <Check class="size-8 text-white" data-swapy-no-drag />
          </div>
        </section>
        <section :class="['space-y-1', isCompletedToday ? 'opacity-50' : 'opacity-100']">
          <h2 :class="['text-xl font-semibold', isCompletedToday ? 'line-through' : '']">
            {{ habit.name }}
          </h2>
          <div class="flex items-center gap-2">
            <div class="size-2 rounded-full!" :style="{ backgroundColor: habit.color }"></div>
            <p class="text-sm text-muted capitalize">{{ habit.time }}</p>
          </div>
        </section>
      </section>
    </div>
    <div class="flex items-center gap-2">
      <Tooltip :text="`${streakStarted ? streakStarted : 'No streak yet'}`" position="top">
        <button :class="[
          'flex items-center gap-0.5 px-3 py-1.5 rounded-full! text-xs font-bold transition-all duration-200',
          habit.streak >= 3
            ? 'bg-danger/10 text-danger'
            : 'bg-emerald-500/10 text-emerald-500',
        ]">
          <Flame v-if="habit.streak >= 3" class="size-3.5 pointer-events-none" />
          <Leaf v-else class="size-3.5 pointer-events-none" />
          {{ habit.streak }}
        </button>
      </Tooltip>
      <HabitMenu v-if="hasMenu !== false" data-swapy-no-drag
        trigger-class="shrink-0" @edit="editHabit"
        @delete="deleteHabit" />
    </div>
  </main>
</template>

<style scoped>
/* the card itself gets the scale transition always */
main {
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

/* when THIS card's parent item is being dragged, scale it down */
[data-swapy-item][data-swapy-dragging] main {
  transform: scale(0.95);
}
</style>