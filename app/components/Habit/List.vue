<!-- components/Habit/List.vue -->
<script setup lang="ts">
import { createSwapy, utils } from 'swapy'
import type { Habit } from '~/types/habit'

const props = defineProps<{
  habits: Habit[]
  hasMenu?: boolean
}>()

const emit = defineEmits<{
  toggle: [habit: Habit]
  edit: [id: Habit['id']]
  delete: [id: Habit['id']]
  reorder: [newOrder: string[]]
}>()

const container = ref<HTMLElement | null>(null)
const swapy = ref<ReturnType<typeof createSwapy> | null>(null)

const slotItemMap = ref(utils.initSlotItemMap(props.habits, 'id'))
const slottedItems = computed(() =>
  utils.toSlottedItems(props.habits, 'id', slotItemMap.value)
)

watch(
  () => props.habits,
  () => {
    utils.dynamicSwapy(
      swapy.value,
      props.habits,
      'id',
      slotItemMap.value,
      (value) => (slotItemMap.value = value)
    )
  },
  { deep: true }
)
const holdingItemId = ref<string | null>(null) // tracks WHICH card is being held

const HOLD_DURATION = 120
const SCALE_DELAY = 120 // only scale if held longer than this
let holdTimer: ReturnType<typeof setTimeout> | null = null
let scaleTimer: ReturnType<typeof setTimeout> | null = null  // 👈 separate timer for scale

function onPointerDown(e: PointerEvent) {
  const noDrag = (e.target as HTMLElement).closest('[data-swapy-no-drag]')
  if (noDrag) return

  const item = (e.target as HTMLElement).closest('[data-swapy-item]')
  const itemId = item?.getAttribute('data-swapy-item') ?? null

  swapy.value?.enable(false)

  // delay the scale slightly so quick clicks never see it
  scaleTimer = setTimeout(() => {
    holdingItemId.value = itemId
  }, SCALE_DELAY)

  holdTimer = setTimeout(() => {
    swapy.value?.enable(true)
  }, HOLD_DURATION)
}

function onPointerUp() {
  holdingItemId.value = null

  if (scaleTimer) {
    clearTimeout(scaleTimer)  // 👈 cancel scale if released too quickly
    scaleTimer = null
  }
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
  nextTick(() => swapy.value?.enable(false))
}

onMounted(() => {
  if (!container.value) return

  swapy.value = createSwapy(container.value, {
    manualSwap: true,
    animation: 'spring',
    dragAxis: 'y',
    enabled: false, // start disabled — hold activates it
  })

  swapy.value.onSwap((event) => {
    requestAnimationFrame(() => {
      slotItemMap.value = event.newSlotItemMap.asArray
      const newOrder = slotItemMap.value
        .map((entry) => entry.item)
        .filter(Boolean) as string[]
      emit('reorder', newOrder)
    })
  })

  swapy.value.onSwapEnd(() => {
    // always re-disable after a swap so buttons stay clickable
    swapy.value?.enable(false)
  })
})

onUnmounted(() => {
  swapy.value?.destroy()
})
</script>

<template>
  <ul ref="container" class="space-y-5 pt-1" @pointerdown="onPointerDown" @pointerup="onPointerUp"
    @pointercancel="onPointerUp">
    <li v-for="{ slotId, itemId, item: habit } in slottedItems" :key="slotId" :data-swapy-slot="slotId">
      <div :key="itemId" :data-swapy-item="itemId">
        <HabitCard :has-menu="props.hasMenu !== false" v-if="habit" :habit="habit" :is-holding="holdingItemId === itemId" @toggle="emit('toggle', $event)"
          @edit="emit('edit', $event)" @delete="emit('delete', $event)" />
      </div>
    </li>
  </ul>
</template>