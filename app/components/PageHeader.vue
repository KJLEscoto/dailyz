<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="space-y-1">
    <h1 class="md:text-3xl text-2xl font-semibold text-nowrap truncate">{{ title }}</h1>
    <p v-if="description" class="text-black/60 md:text-base text-sm">{{ description }}</p>
  </div>
</template>