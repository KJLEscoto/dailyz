<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="space-y-1">
    <div class="flex items-center md:text-3xl text-2xl font-semibold">
      <h1 class="text-nowrap truncate">{{ title }}</h1><span>!</span>
    </div>
    <p v-if="description" class="text-black/60 md:text-base text-sm">{{ description }}</p>
  </div>
</template>