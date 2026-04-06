<!-- HabitCard.vue -->
<script setup lang="ts">
import { Check, Flame, GripVertical, Leaf } from '@lucide/vue';

type HabitTime = 'morning' | 'afternoon' | 'evening' | 'anytime'

interface Habit {
  id: number
  title: string
  time: HabitTime
  streak: number
  streakSince: string
  completed: boolean
}

const props = defineProps<{
  habit: Habit
}>()

const emit = defineEmits<{
  toggle: [id: number]
  edit: [id: number]
  delete: [id: number]
}>()

const editHabit = () => {
  emit('edit', props.habit.id)
}

const deleteHabit = () => {
  emit('delete', props.habit.id)
}

</script>

<template>
  <main :class="['w-full h-auto rounded-3xl flex items-center justify-center relative p-6 group gap-4 border border-transparent hover:border-primary/20 transition-all duration-200 select-none',
    habit.completed ? 'bg-muted/5' : 'bg-white',
  ]">
    <GripVertical class="size-6 text-muted cursor-grab active:cursor-grabbing" />
    <div class="w-full">
      <section class="flex items-center gap-4">
        <section
          class="ring-2 ring-black/5 rounded-full size-12 flex items-center justify-center cursor-pointer transition-all duration-200"
          @click="emit('toggle', habit.id)">
          <div v-if="habit.completed"
            class="ring-4 ring-primary rounded-full size-9 flex items-center justify-center bg-primary">
            <Check class="size-8 text-white" />
          </div>
        </section>
        <section :class="['space-y-1', habit.completed ? 'opacity-50' : 'opacity-100']">
          <h2 :class="['text-xl font-semibold', habit.completed ? 'line-through' : '']">
            {{ habit.title }}
          </h2>
          <div class="flex items-center gap-2">
            <div class="size-2 rounded-full bg-red-500"></div>
            <UppercaseTitle size="sm">{{ habit.time }}</UppercaseTitle>
          </div>
        </section>
      </section>
    </div>
    <div class="flex items-center gap-2">
      <button :class="[
        'flex items-center gap-0.5 px-3 py-1.5 rounded-full font-secondary text-xs font-bold transition-all duration-200',
        habit.streak >= 7
          ? 'bg-danger/10 text-danger'
          : 'bg-emerald-500/10 text-emerald-500',
      ]">
        <Flame v-if="habit.streak >= 7" class="size-3.5 pointer-events-none" />
        <Leaf v-else class="size-3.5 pointer-events-none" />
        {{ habit.streak }}
      </button>
      <HabitMenu trigger-class="opacity-0 group-hover:opacity-70 transition-opacity duration-200" @edit="editHabit"
        @delete="deleteHabit" />
    </div>
  </main>
</template>