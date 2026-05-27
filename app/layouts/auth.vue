<!-- layouts/auth.vue -->
<script setup lang="ts">
</script>

<template>
  <div class="w-full max-w-xl mx-auto px-4 pt-4 pb-26 relative select-none">
    <slot />
    <ClientOnly>
      <AuthBottomNav />
    </ClientOnly>
  </div>
</template>