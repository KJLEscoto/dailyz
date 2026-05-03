<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue';

const { imageUrl, author, authorLink, loading, error } = useDailyNature()
</script>

<template>
  <ClientOnly>
    <div class="relative w-full h-auto group filter hover:grayscale grayscale-0 transition-all duration-200">

      <!-- Loading -->
      <div v-if="loading" class="animate-pulse w-full aspect-video bg-muted/20" />

      <!-- Error -->
      <div v-else-if="error"
        class="w-full aspect-video flex items-center justify-center bg-muted/10 text-danger text-sm">
        Failed to load image.
      </div>

      <!-- Image -->
      <template v-else>
        <img v-if="imageUrl" :src="imageUrl" class="w-full h-full object-cover" />
        <a v-if="author && authorLink" :href="authorLink" target="_blank"
          class="absolute top-4 right-4 text-xs text-nowrap text-transparent group-hover:text-white transition-all duration-200">
          Photo by {{ author }} on Unsplash
          <ArrowUpRight class="size-4 inline-block" />
        </a>
      </template>

    </div>

    <template #fallback>
      <Skeleton width="100%" height="56.25vw" rounded="0" />
    </template>
  </ClientOnly>
</template>