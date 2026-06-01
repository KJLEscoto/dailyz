<!-- layouts/auth.vue -->
<script setup lang="ts">
const levelStore = useLevelStore()
const { habitsReady } = useAuth()

watch(habitsReady, async (ready) => {
  if (ready) {
    await levelStore.fetchLevel()
  }
}, { immediate: true })
</script>

<template>
  <div class="w-full max-w-xl mx-auto px-4 pt-4 pb-26 relative select-none">
    <slot />
    <ClientOnly>
      <AuthBottomNav />
    </ClientOnly>
  </div>
</template>