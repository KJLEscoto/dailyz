<script setup lang="ts">
interface Tab {
  label: string
  count: number
  value: string
}

const props = defineProps<{
  tabs: Tab[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="z-20 sticky top-41 w-full bg-foreground rounded-b-2xl">
    <section class="flex items-center gap-2 bg-[#f3f3f3] p-2 rounded-2xl w-full">
      <button v-for="tab in tabs" :key="tab.value" @click="emit('update:modelValue', tab.value)" :class="[
        'flex-1 py-2 px-4 rounded-xl text-base font-semibold transition-all group duration-200 font-primary cursor-pointer flex items-center justify-center gap-2',
        modelValue === tab.value
          ? 'bg-white text-primary shadow-sm'
          : 'text-muted hover:bg-foreground hover:text-black'
      ]">
        {{ tab.label }}
        <div :class="['p-2 rounded-full size-6 min-w-fit shrink-0 flex items-center justify-center  transition-all group duration-200',
          modelValue === tab.value ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted group-hover:text-black']">
          <p class="text-sm font-semibold text-nowrap">{{ tab.count }}</p>
        </div>
      </button>
    </section>
  </div>
</template>