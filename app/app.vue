<!-- app.vue -->
<script setup lang="ts">
const { handleRedirectResult } = useAuth()
onMounted(async () => {
  await handleRedirectResult()
  console.log('localStorage mode:', localStorage.getItem('google_auth_mode'))
  console.log('localStorage errorRoute:', localStorage.getItem('google_auth_error_route'))
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>