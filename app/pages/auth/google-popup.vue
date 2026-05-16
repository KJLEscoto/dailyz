<!-- pages/auth/google-popup.vue -->
<script setup lang="ts">
// This page is opened in a new tab on mobile.
// It runs the Firebase Google popup, then closes itself.
// The opener tab detects auth state change via onAuthStateChanged.

definePageMeta({ layout: false })

onMounted(async () => {
  const { $firebase } = useNuxtApp()
  const { signInWithPopup } = await import('firebase/auth')

  try {
    await signInWithPopup($firebase.auth, $firebase.provider)
    // Auth state is now set — the opener tab's onAuthStateChanged will fire.
    // Close this tab.
    window.close()
  } catch (error: any) {
    if (
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      window.close()
      return
    }
    console.error('Google popup error:', error)
    // Give user a moment to see if something went wrong, then close
    setTimeout(() => window.close(), 2000)
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <div class="text-center space-y-4">
      <div class="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p class="text-muted text-sm">Connecting with Google...</p>
      <p class="text-xs text-muted/60">This tab will close automatically.</p>
    </div>
  </div>
</template>