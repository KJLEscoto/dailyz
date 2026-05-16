<script setup lang="ts">
import { signInWithRedirect, getRedirectResult } from 'firebase/auth'

definePageMeta({ layout: false })

onMounted(async () => {
  const { $firebase } = useNuxtApp()

  // If Google already redirected back here, there will be a pending result
  const result = await getRedirectResult($firebase.auth)

  if (result) {
    // ✅ Auth completed — notify opener and close
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        { type: 'GOOGLE_AUTH_SUCCESS' },
        window.location.origin
      )
    }
    window.close()
    return
  }

  // ✅ First visit — kick off the redirect to Google (full page nav, browser allows this)
  try {
    await signInWithRedirect($firebase.auth, $firebase.provider)
    // Browser navigates away to Google here — code below never runs until redirect back
  } catch (error: any) {
    console.error('Redirect error:', error)
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        { type: 'GOOGLE_AUTH_ERROR', code: error.code },
        window.location.origin
      )
    }
    window.close()
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