<!-- pages/profile.vue -->
<script setup lang="ts">

definePageMeta({ layout: 'auth' })

</script>

<template>
  <div class="space-y-4">
    <PageHeader title="Profile" description="Manage your profile information." />
    <AuthProfileInfo />
    <AuthProfileActivity />
    <AuthProfilePassword />
    <AuthProfileOptions />
    <AuthProfileAbout />
    <AuthProfileDeleteAccount />
  </div>
</template>