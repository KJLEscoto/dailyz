<script setup lang="ts">
import { Info } from '@lucide/vue'

interface Props {
  modelValue?: string
  label?: string
  colors?: string[]
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => ['#E07B6A', '#7EB8D4', '#7DC47D', '#C47DBC', '#D4B84A', '#4AC4B8'],
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div :class="['flex flex-col gap-1.5', disabled && 'opacity-50 pointer-events-none']">

    <!-- Label -->
    <label v-if="label"
      class="flex items-center gap-1 text-sm font-medium uppercase text-muted select-none">
      {{ label }}
      <span v-if="required" class="text-sm leading-none text-primary">*</span>
    </label>

    <!-- Color circles -->
    <div class="flex items-center gap-3">
      <button v-for="color in colors" :key="color" type="button" :aria-label="`Select color ${color}`" :class="[
        'size-8 rounded-full transition-all duration-150 shrink-0 cursor-pointer',
        modelValue === color
          ? 'ring-2 ring-offset-2 ring-black scale-100'
          : 'hover:scale-95',
      ]" :style="{ backgroundColor: color }" @click="emit('update:modelValue', color)" />
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