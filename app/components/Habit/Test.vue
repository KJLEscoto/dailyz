<script setup lang="ts">
import { Check, Flame, GripVertical, Leaf, MoreVertical, Pencil, Trash2 } from '@lucide/vue'

interface Props {
  id: string | number
  title: string
  time?: 'morning' | 'afternoon' | 'evening' | 'anytime'
  streak?: number
  streakSince?: string
  completed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  time: 'anytime',
  streak: 0,
  completed: false,
})

const emit = defineEmits<{
  toggle: [id: string | number]
  edit: [id: string | number]
  delete: [id: string | number]
  dragStart: [id: string | number]
  dragEnd: [id: string | number]
  dragover: [event: DragEvent]
}>()

// ── Refs ────────────────────────────────────────────────
const menuOpen = ref(false)
const tooltipOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const streakBadgeRef = ref<HTMLElement | null>(null)
const cardRef = ref<HTMLElement | null>(null)

const tooltipX = ref(0)
const tooltipY = ref(0)
const tooltipFlip = ref(false) // true = show below badge

const menuX = ref(0)
const menuY = ref(0)
const menuFlip = ref(false) // true = show above button

const MENU_HEIGHT = 100 // approx dropdown height px
const TOOLTIP_HEIGHT = 60 // approx tooltip height px

// ── Drag ────────────────────────────────────────────────
const isDragging = ref(false)

function onDragStart(e: DragEvent) {
  isDragging.value = true
  e.dataTransfer?.setData('text/plain', String(props.id))
  emit('dragStart', props.id)
}

function onDragEnd() {
  isDragging.value = false
  emit('dragEnd', props.id)
}

// ── Styles ──────────────────────────────────────────────
const timeColors: Record<string, string> = {
  morning: 'bg-yellow-400',
  afternoon: 'bg-orange-400',
  evening: 'bg-blue-400',
  anytime: 'bg-emerald-400',
}

const isLongStreak = computed(() => props.streak >= 7)

// ── Tooltip ─────────────────────────────────────────────
function onStreakMouseEnter() {
  const rect = streakBadgeRef.value?.getBoundingClientRect()
  if (!rect) return

  const spaceAbove = rect.top
  const spaceBelow = window.innerHeight - rect.bottom

  tooltipFlip.value = spaceAbove < TOOLTIP_HEIGHT && spaceBelow > TOOLTIP_HEIGHT

  tooltipX.value = rect.left + rect.width / 2
  tooltipY.value = tooltipFlip.value ? rect.bottom + 6 : rect.top - 6

  nextTick(() => { tooltipOpen.value = true })
}

function onStreakMouseLeave() {
  tooltipOpen.value = false
}

// ── Menu ────────────────────────────────────────────────
function toggleMenu(e: MouseEvent) {
  e.stopPropagation()

  if (menuOpen.value) {
    menuOpen.value = false
    return
  }

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  menuFlip.value = spaceBelow < MENU_HEIGHT && spaceAbove > MENU_HEIGHT

  menuX.value = rect.right - 128
  menuY.value = menuFlip.value ? rect.top - MENU_HEIGHT - 4 : rect.bottom + 4

  menuOpen.value = true
}

function onClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <li ref="cardRef" :draggable="true" :class="[
    'group relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 select-none cursor-grab active:cursor-grabbing',
    completed ? 'bg-muted/5' : 'bg-white',
    isDragging ? 'opacity-40 scale-[0.98] shadow-inner' : 'opacity-100',
  ]" @dragstart="onDragStart" @dragend="onDragEnd" @dragover="emit('dragover', $event)">

    <!-- Drag handle -->
    <GripVertical class="size-5 shrink-0 text-muted/30 cursor-grab active:cursor-grabbing" />

    <!-- Check button -->
    <button :class="[
      'shrink-0 size-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer',
      completed
        ? 'bg-primary border-primary'
        : 'border-muted/20 hover:border-primary/50 bg-transparent',
    ]" @click="emit('toggle', id)">
      <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 scale-50"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-50">
        <Check v-if="completed" class="size-5 text-white pointer-events-none" stroke-width="3" />
      </Transition>
    </button>

    <!-- Title + time -->
    <div class="flex-1 min-w-0">
      <p :class="[
        'font-semibold text-sm truncate transition-all duration-200',
        completed ? 'line-through text-muted/50' : 'text-foreground-text',
      ]">
        {{ title }}
      </p>
      <div class="flex items-center gap-1.5 mt-0.5">
        <span :class="['size-2 rounded-full shrink-0', timeColors[time]]" />
        <span class="text-xs uppercase tracking-widest font-semibold text-muted/50">{{ time }}</span>
      </div>
    </div>

    <!-- Streak badge + 3-dot menu -->
    <section class="flex items-center gap-2">

      <!-- Streak badge -->
      <button ref="streakBadgeRef" :class="[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200',
        isLongStreak
          ? 'bg-danger/10 text-danger'
          : 'bg-emerald-500/10 text-emerald-500',
      ]" @mouseenter="onStreakMouseEnter" @mouseleave="onStreakMouseLeave" @click.stop>
        <Flame v-if="isLongStreak" class="size-3.5 pointer-events-none" />
        <Leaf v-else class="size-3.5 pointer-events-none" />
        {{ streak }}d
      </button>

      <!-- 3-dot menu button — stays visible when menu is open -->
      <div ref="menuRef">
        <button :class="[
          'size-auto flex items-center justify-center rounded-xl text-muted transition-all duration-150 cursor-pointer',
          menuOpen
            ? 'opacity-70'
            : 'opacity-0 group-hover:opacity-70',
        ]" @click="toggleMenu">
          <MoreVertical class="size-4 pointer-events-none" />
        </button>
      </div>

    </section>
  </li>

  <!-- Tooltip -->
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-show="tooltipOpen && streakSince" :style="{ top: `${tooltipY}px`, left: `${tooltipX}px` }" :class="[
        'fixed z-50 bg-white shadow-lg rounded-xl px-3 py-2 text-xs text-nowrap pointer-events-none -translate-x-1/2',
        tooltipFlip ? 'translate-y-0 origin-top' : '-translate-y-full origin-bottom',
      ]">
        <p class="text-muted/60 font-medium">{{ streak }}-day streak since</p>
        <p class="text-primary font-bold uppercase tracking-wide text-sm">{{ streakSince }}</p>
        <!-- Arrow -->
        <span :class="[
          'absolute left-1/2 -translate-x-1/2 size-3 bg-white rotate-45',
          tooltipFlip ? '-top-1.5' : '-bottom-1.5',
        ]" />
      </div>
    </Transition>
  </Teleport>

  <!-- Dropdown -->
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-show="menuOpen" :style="{ top: `${menuY}px`, left: `${menuX}px` }" :class="[
        'fixed z-50 bg-white shadow-xl rounded-2xl py-1.5 min-w-32 border border-black/5',
        menuFlip ? 'origin-bottom' : 'origin-top',
      ]">
        <button
          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted hover:bg-muted/5 transition-colors duration-100"
          @click="emit('edit', id); menuOpen = false">
          <Pencil class="size-4 pointer-events-none" />
          <span class="font-medium">Edit</span>
        </button>
        <button
          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors duration-100"
          @click="emit('delete', id); menuOpen = false">
          <Trash2 class="size-4 pointer-events-none" />
          <span class="font-semibold">Delete</span>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>