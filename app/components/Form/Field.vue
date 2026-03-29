<script setup lang="ts">
import { Eye, EyeClosed, Info } from '@lucide/vue'

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputId = props.id ?? `input-${Math.random().toString(36).slice(2, 7)}`
const isFocused = ref(false)
const showPassword = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') return showPassword.value ? 'text' : 'password'
  return props.type
})

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

function onFocus(e: FocusEvent) {
  isFocused.value = true
  emit('focus', e)
}

function onBlur(e: FocusEvent) {
  isFocused.value = false
  emit('blur', e)
}
</script>

<template>
  <div :class="['flex flex-col gap-1.5', disabled && 'opacity-50 pointer-events-none']">

    <!-- Label -->
    <label v-if="label" :for="inputId"
      class="flex font-secondary items-center gap-1 text-sm font-medium uppercase text-muted select-none">
      {{ label }}
      <span v-if="required" class="text-sm leading-none text-primary">*</span>
    </label>

    <!-- Input container -->
    <div :class="[
      'relative flex items-center rounded-xl border bg-white transition-all duration-150',
      error
        ? 'border-red-500'
        : isFocused
          ? 'border-primary'
          : 'border-muted/20 hover:border-primary',
    ]">
      <!-- Left icon slot -->
      <span v-if="$slots.icon" class="pointer-events-none absolute left-3 flex items-center text-muted">
        <slot name="icon" />
      </span>

      <!-- Input field -->
      <input :id="inputId" :type="inputType" :value="modelValue" :placeholder="placeholder" :disabled="disabled" autocomplete="off" :class="[
          'h-11 w-full rounded-xl bg-transparent text-sm text-black outline-none placeholder:text-muted font-primary',
          $slots.icon ? 'pl-9' : 'pl-4',
          type === 'password' || $slots.suffix ? 'pr-10' : 'pr-4',
        ]" @input="onInput" @focus="onFocus" @blur="onBlur" />

      <!-- Password toggle -->
      <button v-if="type === 'password'" type="button" :aria-label="showPassword ? 'Hide password' : 'Show password'"
        class="absolute right-3 flex items-center justify-center rounded-md p-0.5 text-muted transition-colors duration-150 hover:text-black/80 cursor-pointer"
        @click="showPassword = !showPassword">
        <Eye v-if="showPassword" class="size-4" />
        <EyeClosed v-else class="size-4" />
      </button>

      <!-- Right suffix slot -->
      <span v-else-if="$slots.suffix" class="pointer-events-none absolute right-3 flex items-center text-muted">
        <slot name="suffix" />
      </span>
    </div>

    <!-- Error / Hint message -->
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