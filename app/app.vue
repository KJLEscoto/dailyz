<script setup lang="ts">
const { handleRedirectResult, processingRedirect } = useAuth()
onMounted(async () => {
  await handleRedirectResult()
})
</script>

<template>
  <NuxtRouteAnnouncer />

  <!-- ✅ Covers any flash during webview redirect processing -->
  <Transition name="fade">
    <div v-if="processingRedirect" class="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p class="text-sm text-gray-400">Signing in with Google...</p>
      </div>
    </div>
  </Transition>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>