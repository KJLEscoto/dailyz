<!-- Add inside app.vue template -->
<template>
  <NuxtRouteAnnouncer />
  <!-- ✅ Full screen loader during Google redirect processing -->
  <Transition name="fade">
    <div v-if="processingRedirect" class="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p class="text-muted text-sm">Signing in with Google...</p>
      </div>
    </div>
  </Transition>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { handleRedirectResult, processingRedirect } = useAuth()
onMounted(async () => {
  await handleRedirectResult()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>