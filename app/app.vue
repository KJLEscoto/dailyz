<script setup lang="ts">
const { handleRedirectResult, processingRedirect } = useAuth()
onMounted(async () => {
  await handleRedirectResult()
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>