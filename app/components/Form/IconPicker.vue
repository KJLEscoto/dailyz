<script setup lang="ts">
const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [icon: string] }>()

const icons = [
  { name: 'lucide:star', label: 'All In' },
  { name: 'lucide:dumbbell', label: 'Workout' },
  { name: 'lucide:bike', label: 'Cycling' },
  { name: 'lucide:footprints', label: 'Walking' },
  { name: 'lucide:moon', label: 'Sleep' },
  { name: 'lucide:droplets', label: 'Hydration' },
  { name: 'lucide:apple', label: 'Eating' },
  { name: 'lucide:coffee', label: 'Coffee' },
  { name: 'lucide:book-open', label: 'Reading' },
  { name: 'lucide:pencil', label: 'Writing' },
  { name: 'lucide:music', label: 'Music' },
  { name: 'lucide:brain', label: 'Focus' },
  { name: 'lucide:heart', label: 'Love' },
  { name: 'lucide:smile', label: 'Mood' },
  { name: 'lucide:sparkles', label: 'Mindful' },
  { name: 'lucide:graduation-cap', label: 'Study' },
  { name: 'lucide:briefcase', label: 'Work' },
  { name: 'lucide:wallet', label: 'Finance' },
  { name: 'lucide:target', label: 'Goals' },
  { name: 'lucide:bell', label: 'Reminder' },
]

const scrollEl = ref<HTMLElement | null>(null)
const atTop = ref(true)
const atBottom = ref(false)

const onScroll = () => {
  if (!scrollEl.value) return
  const { scrollTop, scrollHeight, clientHeight } = scrollEl.value
  atTop.value = scrollTop < 8
  atBottom.value = scrollTop + clientHeight >= scrollHeight - 8
}

onMounted(() => {
  onScroll() // init check
})
</script>

<template>
  <div class="space-y-3">
    <div class="relative">

      <!-- Fade top -->
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
        leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0">
        <div v-if="!atTop"
          class="absolute inset-x-0 top-0 h-10 bg-linear-to-b from-white to-transparent z-10 pointer-events-none rounded-t-2xl" />
      </Transition>

      <!-- Grid -->
      <div ref="scrollEl" @scroll="onScroll"
        class="grid md:grid-cols-4 grid-cols-5 gap-2 md:max-h-72 h-44 overflow-y-auto pr-1 scrollbar-none">
        <button v-for="icon in icons" :key="icon.name" type="button" @click="emit('update:modelValue', icon.name)"
          :class="[
            'flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-150',
            modelValue === icon.name
              ? 'border-primary bg-primary/10 scale-95'
              : 'border-transparent bg-foreground hover:bg-black/5'
          ]">
          <Icon :name="icon.name" class="size-7" fallback="lucide:circle-dashed"
            :class="modelValue === icon.name ? 'text-primary' : 'text-black/70'" />
          <span class="text-[10px] font-medium text-center leading-tight"
            :class="modelValue === icon.name ? 'text-primary' : 'text-black/50'">
            {{ icon.label }}
          </span>
        </button>
      </div>

      <!-- Fade bottom -->
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
        leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0">
        <div v-if="!atBottom"
          class="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-white to-transparent z-10 pointer-events-none rounded-b-2xl" />
      </Transition>

    </div>
  </div>
</template>