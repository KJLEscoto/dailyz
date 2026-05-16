<script setup lang="ts">
const { handleRedirectResult } = useAuth()
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