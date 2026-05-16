<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
interface Props {
  src?: string
  alt: string
}

defineProps<Props>()
</script>

<template>
  <img v-bind="$attrs" :src="src" :alt="alt" draggable="false" class="object-cover select-none" />
</template>