<script setup lang="ts">
import { Check, Loader2, Pencil, Trash2 } from '@lucide/vue'
import type { Habit } from '~/types/habit'
import { format } from 'date-fns'

const props = defineProps<{
  habit: Habit
  hasMenu?: boolean
}>()

const emit = defineEmits<{
  toggle: [habit: Habit]
  edit: [id: Habit['id']]
  delete: [id: Habit['id'], name: string]
}>()

const habitStore = useHabitStore()
const today = format(new Date(), 'yyyy-MM-dd')
const showDeleteAlert = ref(false)
const toggleLoading = ref(false) // 👈

const REVEAL_WIDTH = 170 // px — must match the two button widths combined
const translateX = ref(0)
const isRevealed = ref(false)
const startX = ref(0)
const isDragging = ref(false)
const isAnimating = ref(false)

// add these refs
const isMouseDragging = ref(false)

const onMouseDown = (e: MouseEvent) => {
  e.preventDefault() // 👈 stops text selection and image drag during swipe
  startX.value = e.clientX
  isMouseDragging.value = true
  isDragging.value = true
  isAnimating.value = false
}

const onMouseMove = (e: MouseEvent) => {
  if (!isMouseDragging.value) return
  const delta = e.clientX - startX.value
  if (Math.abs(delta) > 5) {
    const base = isRevealed.value ? -REVEAL_WIDTH : 0
    translateX.value = Math.min(0, Math.max(-REVEAL_WIDTH, base + delta))
  }
}

const onMouseUp = (e: MouseEvent) => {
  if (!isMouseDragging.value) return
  isMouseDragging.value = false
  isDragging.value = false
  const delta = e.clientX - startX.value
  const total = (isRevealed.value ? -REVEAL_WIDTH : 0) + delta
  snapTo(total < -REVEAL_WIDTH / 2 ? -REVEAL_WIDTH : 0)
}

const cardStyle = computed(() => ({
  transform: `translateX(${translateX.value}px)`,
  transition: isAnimating.value ? 'transform 0.25s ease' : 'none',
}))

const snapTo = (target: number) => {
  isAnimating.value = true
  translateX.value = target
  isRevealed.value = target !== 0
}

// --- Touch ---
const onTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0]
  if (!touch) return
  startX.value = touch.clientX
  isDragging.value = true
  isAnimating.value = false
}

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  const touch = e.touches[0]
  if (!touch) return
  const delta = touch.clientX - startX.value
  // only hijack horizontal swipes, let vertical scroll pass through
  if (Math.abs(delta) > 5) e.preventDefault()
  const base = isRevealed.value ? -REVEAL_WIDTH : 0
  translateX.value = Math.min(0, Math.max(-REVEAL_WIDTH, base + delta))
}

const onTouchEnd = (e: TouchEvent) => {
  if (!isDragging.value) return
  isDragging.value = false
  const touch = e.changedTouches[0]
  if (!touch) return
  const delta = touch.clientX - startX.value
  const total = (isRevealed.value ? -REVEAL_WIDTH : 0) + delta
  snapTo(total < -REVEAL_WIDTH / 2 ? -REVEAL_WIDTH : 0)
}

const closeActions = () => snapTo(0)

const handleEdit = () => {
  closeActions()
  emit('edit', props.habit.id)
}

const handleDeleteRequest = () => {
  closeActions()
  showDeleteAlert.value = true
}

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
    await habitStore.toggleCompletion(props.habit)
  } finally {
    toggleLoading.value = false
  }
}

const confirmDelete = () => {
  showDeleteAlert.value = false
  emit('delete', props.habit.id, props.habit.name)
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <Alert type="danger" title="Delete this habit?"
    :message="`&quot;${habit.name}&quot; will be permanently removed along with all its history.`"
    :visible="showDeleteAlert" :actions="[
      { label: 'No, Cancel', onClick: () => showDeleteAlert = false },
      { label: 'Yes, Delete it.', onClick: confirmDelete }
    ]" @dismiss="showDeleteAlert = false" />

  <!-- 👇 wrapper holds card + revealed buttons -->
  <div class="relative rounded-3xl overflow-hidden">

    <!-- Action buttons (revealed underneath) -->
    <div class="absolute inset-0 flex items-stretch justify-end pr-1 py-0.5">
      <button @click="handleEdit"
        class="flex flex-col items-center justify-center gap-1 w-20 bg-blue-500 hover:bg-blue-400 text-white text-xs font-medium cursor-pointer rounded-l-3xl duration-200">
        <Pencil class="size-5 pointer-events-none" />
        Edit
      </button>
      <button @click="handleDeleteRequest"
        class="flex flex-col items-center justify-center gap-1 w-20 bg-red-500 hover:bg-red-400 text-white text-xs font-medium cursor-pointer rounded-r-3xl duration-200">
        <Trash2 class="size-5 pointer-events-none" />
        Delete
      </button>
    </div>

    <main :style="cardStyle" :class="[
      'w-full h-auto rounded-3xl flex items-center justify-center bg-white relative p-6 gap-4 select-none',
      isMouseDragging ? 'cursor-grabbing' : 'cursor-grab',
    ]" @mousedown="onMouseDown" @touchstart.passive="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <div class="w-full">
        <section class="flex items-center gap-4">
          <section class="size-14 rounded-xl flex items-center justify-center shrink-0"
            :style="{ backgroundColor: habit.color + '22' }">
            <Icon :name="habit.icon || 'lucide:star'" class="size-6!" :style="{ color: habit.color }" />
          </section>

          <section class="space-y-2 w-[80%]">
            <h2
              :class="['sm:text-xl text-base font-semibold leading-5 line-clamp-1', isCompletedToday ? 'line-through' : '']" :style="{ color: habit.color }">
              {{ habit.name }}
            </h2>
            <!-- <div class="flex items-center gap-2">
              <div class="size-2 rounded-full!" :style="{ backgroundColor: habit.color }" />
              <p class="text-sm text-muted capitalize">{{ habit.time }}</p>
            </div> -->
            <div class="flex items-center gap-1">
              <Tooltip :text="streakStarted" position="top">
                <button :class="[
                  'flex items-center gap-1 text-xsfont-bold transition-all duration-200',
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
        'ring-2 ring-black/5 rounded-full! size-12 flex items-center shrink-0 justify-center transition-all duration-200',
        toggleLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:ring-primary/40 hover:bg-primary/10'
      ]" @click="handleToggle">

        <!-- Loading spinner -->
        <Loader2 v-if="toggleLoading" class="size-6 text-primary pointer-events-none animate-spin" />

        <!-- Completed -->
        <div v-else-if="isCompletedToday"
          class="ring-4 ring-primary rounded-full! size-9 flex items-center justify-center bg-primary">
          <Check class="size-8 text-white" />
        </div>
      </section>
    </main>
  </div>
</template>