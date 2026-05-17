<!-- components/Habit/GuestCard.vue -->
<script setup lang="ts">
import { Check, Loader2 } from '@lucide/vue'
import type { Habit } from '~/types/habit'
import { format } from 'date-fns'

const props = defineProps<{ habit: Habit }>()

const { toggleCompletion } = useSampleHabits()

const today = format(new Date(), 'yyyy-MM-dd')
const toggleLoading = ref(false)

const isCompletedToday = computed(() =>
  props.habit.completions?.some(c =>
    typeof c === 'string' ? c === today : c.date === today
  ) ?? false
)

const streakStarted = computed(() => {
  if (!props.habit.completions?.length || props.habit.streak === 0) {
    return 'Complete to start a streak'
  }

  const sorted = [...props.habit.completions]
    .map(c => typeof c === 'string' ? c : c.date)
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))

  if (!sorted.length) return 'Complete to start a streak'

  let streakStart = sorted[0]!
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = new Date(sorted[i]!)
    const next = new Date(sorted[i + 1]!)
    const diffDays = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays === 1) {
      streakStart = sorted[i + 1]!
    } else {
      break
    }
  }

  return 'Streak since ' + format(new Date(streakStart), 'MMM d')
})

const handleToggle = async () => {
  if (toggleLoading.value) return
  toggleLoading.value = true
  try {
    toggleCompletion(props.habit)
  } finally {
    toggleLoading.value = false
  }
}
</script>

<template>
  <main :class="[
    'w-full h-auto rounded-3xl flex items-center justify-center relative p-6 gap-4 select-none',
    isCompletedToday ? 'bg-[#f1f1f1]' : 'bg-white',
  ]">
    <div class="w-full">
      <section class="flex items-center gap-4">

        <!-- Toggle button -->
        <section :class="[
          'ring-2 ring-black/5 rounded-full! size-12 flex items-center shrink-0 justify-center transition-all duration-200',
          toggleLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:ring-primary/40 hover:bg-primary/10'
        ]" @click="handleToggle">
          <Loader2 v-if="toggleLoading" class="size-6 text-primary pointer-events-none animate-spin" />
          <div v-else-if="isCompletedToday"
            class="ring-4 ring-primary rounded-full! size-9 flex items-center justify-center bg-primary">
            <Check class="size-8 text-white" />
          </div>
        </section>

        <section :class="['space-y-1', isCompletedToday ? 'opacity-50' : 'opacity-100']">
          <h2
            :class="['sm:text-xl text-base font-semibold leading-5 line-clamp-2', isCompletedToday ? 'line-through' : '']">
            {{ habit.name }}
          </h2>
          <div class="flex items-center gap-2">
            <div class="size-2 rounded-full!" :style="{ backgroundColor: habit.color }" />
            <p class="text-sm text-muted capitalize">{{ habit.time }}</p>
          </div>
        </section>
      </section>
    </div>

    <div class="flex items-center gap-1">
      <Tooltip :text="streakStarted" position="top">
        <button :class="[
          'flex items-center gap-1 px-3 py-1.5 rounded-full! text-xs font-bold transition-all duration-200',
          habit.streak >= 3 ? 'bg-danger/10 text-danger' : 'bg-emerald-500/10 text-emerald-500',
        ]">
          <span v-if="habit.streak >= 3">
            <Image src="/gif/fire2.gif" alt="Fire" class="w-6! shrink-0 pointer-events-none" />
          </span>
          <span v-else>
            <Image src="/gif/clover.gif" alt="Clover" class="w-6! shrink-0 pointer-events-none" />
          </span>
          {{ habit.streak }}
        </button>
      </Tooltip>
    </div>
  </main>
</template>