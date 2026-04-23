<!-- pages/login.vue -->
<script setup lang="ts">

const { signIn } = useAuth()

</script>

<template>
  <!-- <div class="w-full h-full">
    <NatureImage />
  </div> -->

  <button @click="signIn"
    class="w-fit h-auto py-3 px-10 shrink-0 bg-white rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform hover:shadow-lg">
    <img src="/images/webp/google.webp" alt="Sign in with Google" class="size-6" />
    <p class="text-nowrap">Sign in with Google</p>
  </button>
</template>