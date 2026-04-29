<!-- app.vue -->
<script setup lang="ts">
const { authReady, habitsReady, user } = useAuth()
const ready = computed(() => authReady.value && (user.value ? habitsReady.value : true))
</script>

<template>
  <NuxtRouteAnnouncer />
  <!-- <div v-if="!ready" class="fixed inset-0 z-50 flex items-center justify-center bg-foreground">
    <div class="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div> -->
  
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>