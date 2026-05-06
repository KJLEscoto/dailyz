<!-- pages/profile.vue -->
<script setup lang="ts">

definePageMeta({ layout: 'auth' })

</script>

<template>
  <div class="space-y-4">
    <AuthProfileInfo />
    <AuthProfileActivity />
    <AuthProfilePassword />
    <AuthProfileOptions />
    <AuthProfileAbout />
    <AuthProfileDeleteAccount />
  </div>
</template>