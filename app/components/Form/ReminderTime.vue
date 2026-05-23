<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  label?: string
  required?: boolean
  error?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const display = computed(() =>
  props.modelValue
    ? `Reminder set for ${new Date('1970-01-01T' + props.modelValue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'No reminder set'
)
</script>

<template>
  <div class="space-y-1.5">
    <label class="flex items-center gap-1 md:text-sm text-xs font-medium uppercase text-muted select-none">
      {{ label ?? 'remind me' }}
      <span v-if="required" class="text-sm leading-none text-primary">*</span>
    </label>

    <TimeSelector :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" />

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-else class="text-xs text-black/30">{{ display }}</p>
  </div>
</template>