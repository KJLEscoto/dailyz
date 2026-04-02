<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})
</script>

<template>
  <h1 class="uppercase text-muted font-secondary text-nowrap select-none" :class="{
    'text-sm': size === 'sm',
    'text-base': size === 'md',
    'text-lg': size === 'lg'
  }">
    <slot />
  </h1>
</template>