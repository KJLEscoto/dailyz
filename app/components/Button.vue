<script setup lang="ts">
import { twMerge } from 'tailwind-merge'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  to?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
  block: false,
  class: '',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const variantClasses: Record<string, string> = {
  primary: 'bg-primary text-white',
  secondary: 'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 active:bg-slate-800',
  ghost: 'bg-transparent text-slate-300 hover:bg-gray-200 active:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 shadow-[0_1px_12px_rgba(239,68,68,0.3)] hover:shadow-[0_1px_18px_rgba(239,68,68,0.45)]',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-[0_1px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_1px_18px_rgba(16,185,129,0.45)]',
}

const sizeClasses: Record<string, string> = {
  sm: 'h-8  px-3.5 text-xs  gap-1.5 rounded-lg',
  md: 'h-10 px-5   text-sm  gap-2   rounded-xl',
  lg: 'h-12 px-7   text-base gap-2.5 rounded-2xl',
}

const spinnerSize: Record<string, string> = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
}

const computedClass = computed(() =>
  twMerge(
    'inline-flex items-center justify-center font-primary font-semibold tracking-wide select-none',
    'transition-all duration-150 outline-none cursor-pointer',
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.block ? 'w-full' : 'w-auto',
    isDisabled.value && 'opacity-50 cursor-not-allowed',
    props.class,
  )
)
</script>

<template>
  <!-- NuxtLink when `to` is provided -->
  <NuxtLink v-if="to" :to="to" :class="computedClass">
    <slot name="icon-left" />
    <slot />
    <slot name="icon-right" />
  </NuxtLink>

  <!-- Regular button -->
  <button v-else :type="type" :disabled="isDisabled" :class="computedClass"
    @click="!isDisabled && emit('click', $event)">
    <svg v-if="loading" :class="['animate-spin shrink-0', spinnerSize[size]]" xmlns="http://www.w3.org/2000/svg"
      fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>

    <slot v-if="!loading" name="icon-left" />
    <slot />
    <slot v-if="!loading" name="icon-right" />
  </button>
</template>