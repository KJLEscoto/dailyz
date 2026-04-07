<script setup lang="ts">
import { X } from '@lucide/vue'
import { onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  description?: string
  primaryLabel?: string
  cancelLabel?: string
  primaryDisabled?: boolean
  primaryLoading?: boolean
  dangerous?: boolean
}>(), {
  primaryLabel: 'Confirm',
  cancelLabel: 'Cancel',
  primaryDisabled: false,
  primaryLoading: false,
  dangerous: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  primary: []
  cancel: []
}>()

const close = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const onPrimary = () => emit('primary')

const lockScroll = () => {
  if (!import.meta.client) return
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = `${scrollbarWidth}px`
}

const unlockScroll = () => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

watch(() => props.modelValue, (val) => {
  val ? lockScroll() : unlockScroll()
})

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue) close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  if (props.modelValue) lockScroll()
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  unlockScroll()
})
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="modelValue"
        class="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm"
        role="dialog" aria-modal="true" :aria-labelledby="title" @click="close">
        <!-- Panel — has its own transform transition synced with the parent opacity -->
        <div :class="[
          'relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl',
          'flex flex-col max-h-[90dvh] sm:max-h-[85dvh] overflow-hidden',
          'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          modelValue
            ? 'translate-y-0 sm:scale-100 opacity-100'
            : 'translate-y-4 sm:translate-y-0 sm:scale-95 opacity-0'
        ]" @click.stop>
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-black/5 shrink-0">
            <div class="space-y-0.5">
              <h2 class="text-lg font-semibold text-gray-900 leading-snug">
                {{ title }}
              </h2>
              <p v-if="description" class="text-sm text-gray-400 leading-relaxed">
                {{ description }}
              </p>
            </div>
            <button
              class="shrink-0 size-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-150 cursor-pointer mt-0.5"
              @click="close" aria-label="Close">
              <X class="size-4 pointer-events-none" />
            </button>
          </div>

          <!-- Body (slot) -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <slot />
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-black/5 shrink-0">
            <button
              class="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150 cursor-pointer"
              @click="close">
              {{ cancelLabel }}
            </button>
            <button :disabled="primaryDisabled || primaryLoading" :class="[
              'px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center gap-2',
              dangerous
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-white',
              (primaryDisabled || primaryLoading) && 'opacity-50 cursor-not-allowed',
            ]" @click="onPrimary">
              <svg v-if="primaryLoading" class="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {{ primaryLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>