<!-- pages/auth/google-popup.vue -->
<script setup lang="ts">
import { signInWithRedirect, getRedirectResult } from 'firebase/auth'

definePageMeta({ layout: false })

const status = ref<'redirecting' | 'finishing' | 'error'>('redirecting')

onMounted(async () => {
  const { $firebase } = useNuxtApp()

  try {
    // ✅ Always check for redirect result first
    const result = await getRedirectResult($firebase.auth)

    if (result) {
      // Google came back with a user — notify opener and close
      status.value = 'finishing'
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_SUCCESS' },
          window.location.origin
        )
      }
      // Give postMessage a moment to deliver before closing
      setTimeout(() => window.close(), 500)
      return
    }

    // ✅ No result yet — only redirect if this looks like a fresh open (has opener)
    // If there's no opener, user navigated here directly — don't redirect
    if (!window.opener) {
      status.value = 'error'
      return
    }

    // First visit from opener tab — start the Google redirect
    await signInWithRedirect($firebase.auth, $firebase.provider)

  } catch (error: any) {
    console.error('Google popup tab error:', error)
    status.value = 'error'
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        { type: 'GOOGLE_AUTH_ERROR', code: error.code },
        window.location.origin
      )
    }
    setTimeout(() => window.close(), 1500)
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <div class="text-center space-y-4">
      <div v-if="status !== 'error'"
        class="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p class="text-muted text-sm">
        {{ status === 'finishing' ? 'Almost done...' : status === 'error' ? 'Something went wrong.' : 'Connecting with Google...' }}
      </p>
      <p v-if="status !== 'error'" class="text-xs text-muted/60">This tab will close automatically.</p>
    </div>
  </div>
</template>