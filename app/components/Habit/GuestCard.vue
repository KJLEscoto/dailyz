<!-- components/Habit/GuestCard.vue -->
<script setup lang="ts">
import { Check, Loader2 } from '@lucide/vue'
import type { Habit } from '~/types/habit'
import { format } from 'date-fns'

const props = defineProps<{ habit: Habit }>()

const { toggleCompletion } = useSampleHabits()

const today = format(new Date(), 'yyyy-MM-dd')
const toggleLoading = ref(false)

const REVEAL_WIDTH = 0 // no actions for guest, keep swipe disabled
const translateX = ref(0)
const isRevealed = ref(false)
const startX = ref(0)
const isDragging = ref(false)
const isAnimating = ref(false)
const isMouseDragging = ref(false)

const cardStyle = computed(() => ({
  transform: `translateX(${translateX.value}px)`,
  transition: isAnimating.value ? 'transform 0.25s ease' : 'none',
}))

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
  <div class="relative rounded-3xl overflow-hidden">

    <main :style="cardStyle" :class="[
      'w-full h-auto rounded-3xl flex items-center justify-center bg-white relative p-6 gap-4 select-none cursor-default',
    ]">
      <div class="w-full">
        <section class="flex items-center gap-4">

          <!-- Icon -->
          <section class="size-14 rounded-xl flex items-center justify-center shrink-0"
            :style="{ backgroundColor: habit.color + '22' }">
            <Icon :name="habit.icon || 'lucide:star'" class="size-6!" :style="{ color: habit.color }" />
          </section>

          <section class="space-y-2 w-[80%]">
            <h2
              :class="['sm:text-xl text-base font-semibold leading-5 line-clamp-1', isCompletedToday ? 'line-through' : '']"
              :style="{ color: habit.color }">
              {{ habit.name }}
            </h2>
            <div class="flex items-center gap-1">
              <Tooltip :text="streakStarted" position="top">
                <button :class="[
                  'flex items-center gap-1 text-xs font-bold transition-all duration-200',
                  habit.streak >= 3 ? 'text-danger' : 'text-green-600',
                ]">
                  <span v-if="habit.streak >= 3">
                    <Image src="/gif/fire2.gif" alt="Fire" class="w-4! shrink-0 pointer-events-none" />
                  </span>
                  <span v-else>
                    <Image src="/gif/clover.gif" alt="Clover" class="w-4! shrink-0 pointer-events-none" />
                  </span>
                  {{ habit.streak }}
                </button>
              </Tooltip>
            </div>
          </section>

        </section>
      </div>

      <!-- Toggle button -->
      <section :class="[
        'ring-2 rounded-full! size-12 flex items-center shrink-0 justify-center transition-all duration-200',
        toggleLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
      ]" :style="{
        boxShadow: isCompletedToday ? `0 0 0 1px ${habit.color}40` : '0 0 0 2px rgba(0,0,0,0.05)',
      }" @click="handleToggle">

        <Loader2 v-if="toggleLoading" class="size-6 pointer-events-none animate-spin" :style="{ color: habit.color }" />

        <div v-else-if="isCompletedToday" class="ring-4 rounded-full! size-9 flex items-center justify-center"
          :style="{ backgroundColor: habit.color, boxShadow: `0 0 0 4px ${habit.color}` }">
          <Check class="size-7! text-white" />
        </div>

        <Check v-else class="size-7! text-black/10" />
      </section>
    </main>
  </div>
</template>