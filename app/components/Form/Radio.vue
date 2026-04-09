<script setup lang="ts">
import { Info } from '@lucide/vue'

interface Option {
  label: string
  value: string | number
}

interface Props {
  modelValue?: string | number
  label?: string
  options: Option[]
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const groupName = `radio-${Math.random().toString(36).slice(2, 7)}`
</script>

<template>
  <div :class="['flex flex-col gap-1.5', disabled && 'opacity-50 pointer-events-none']">

    <!-- Label -->
    <label v-if="label"
      class="flex items-center gap-1 text-sm font-medium uppercase text-muted select-none font-secondary">
      {{ label }}
      <span v-if="required" class="text-sm leading-none text-primary">*</span>
    </label>

    <!-- Options -->
    <div class="flex flex-wrap gap-2">
      <label v-for="option in options" :key="option.value" :class="[
        'flex items-center gap-3 py-2 px-4 rounded-full border transition-all duration-150 cursor-pointer',
        modelValue === option.value
          ? 'border-primary text-primary bg-primary/10'
          : 'border-muted/20 text-muted hover:border-primary',
      ]">
        <input type="radio" :name="groupName" :value="option.value" :checked="modelValue === option.value"
          :disabled="disabled" class="hidden" @change="emit('update:modelValue', option.value)" />
        <!-- Custom radio circle -->
        <!-- <span :class="[
          'size-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors duration-150',
          modelValue === option.value ? 'border-primary' : 'border-muted/30'
        ]">
          <span v-if="modelValue === option.value" class="size-2 rounded-full bg-primary" />
        </span> -->
        <span class="text-sm font-primary">{{ option.label }}</span>
      </label>
    </div>

    <!-- Error / Hint -->
    <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="-translate-y-1 opacity-0"
      leave-active-class="transition duration-100 ease-in" leave-to-class="-translate-y-1 opacity-0">
      <p v-if="error" class="flex items-center gap-1 text-xs text-red-400">
        <Info class="size-3" />
        {{ error }}
      </p>
      <p v-else-if="hint" class="text-xs text-muted">{{ hint }}</p>
    </Transition>

  </div>
</template>