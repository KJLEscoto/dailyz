<!-- pages/profile.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
</script>

<template>
  <div class="space-y-4">
    <AuthProfileInfo />
    <AuthProfilePassword />
    <AuthProfileOptions />
    <AuthProfileAbout />
  </div>
</template>