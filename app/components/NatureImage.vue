<script setup lang="ts">
const { imageUrl, author, authorLink, loading, error } = useDailyNature()
</script>

<template>
  <div
    class="relative w-full h-auto aspect-video rounded-3xl overflow-hidden group filter hover:grayscale grayscale-0 transition-all duration-200">

    <!-- Loading -->
    <div v-if="loading" class="animate-pulse w-full h-full bg-muted/20" />

    <!-- Error -->
    <div v-else-if="error" class="w-full h-full flex items-center justify-center bg-muted/10 text-danger text-sm">
      Failed to load image.
    </div>

    <!-- Image -->
    <template v-else>
      <img v-if="imageUrl" :src="imageUrl" class="w-full h-full object-cover" />
      <a v-if="author && authorLink" :href="authorLink" target="_blank"
        class="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-nowrap text-transparent group-hover:text-white transition-all duration-200">
        Photo by {{ author }} on Unsplash
      </a>
    </template>

  </div>
</template>