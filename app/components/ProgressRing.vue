<!-- components/ProgressRing.vue -->
<script setup lang="ts">
const props = defineProps<{
  percentage: number
  completed: number
  total: number
}>()

const circumference = 2 * Math.PI * 24
const dashOffset = ref(circumference) // 👈 start as "empty" ring

onMounted(() => {
  watchEffect(() => {
    dashOffset.value = circumference * (1 - props.percentage / 100)
  })
})
</script>

<template>
  <section
    class="rounded-full size-14 flex items-center justify-center select-none relative ring-3 ring-muted/10 shrink-0">
    <svg class="absolute inset-0 -rotate-90" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="24" stroke="var(--color-foreground)" stroke-width="4" stroke-opacity="0.1" />
      <circle cx="28" cy="28" r="24" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round"
        :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" class="transition-all duration-500" />
    </svg>
    <p class="text-primary font-semibold text-sm">{{ percentage }}%</p>
  </section>
</template>