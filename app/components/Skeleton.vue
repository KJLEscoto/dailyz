<!-- components/UI/Skeleton.vue -->
<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
  rounded?: string
}>()
</script>

<template>
  <div class="skeleton overflow-hidden relative" :style="{
    width: width ?? '100%',
    height: height ?? '1rem',
    borderRadius: rounded ?? '0.5rem',
  }" />
</template>

<style scoped>
.skeleton {
  background: linear-gradient(90deg,
      #e5e7eb 25%,
      #f3f4f6 50%,
      #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>