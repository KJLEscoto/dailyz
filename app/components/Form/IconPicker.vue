<script setup lang="ts">
const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [icon: string] }>()

const icons = [
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
  { name: 'lucide:star', label: 'All In' },
]
</script>

<template>
  <div class="space-y-3">

    <!-- Grid -->
    <div class="grid md:grid-cols-4 grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
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
  </div>
</template>