<script setup lang="ts">
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth'

definePageMeta({ layout: false })

onMounted(async () => {
  const { $firebase } = useNuxtApp()

  try {
    const result = await getRedirectResult($firebase.auth)

    if (result) {
      localStorage.removeItem('google_tab_pending')
      // ✅ Use '*' so message reaches localhost opener too
      window.opener?.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*')
      setTimeout(() => window.close(), 300)
      return
    }

    if (localStorage.getItem('google_tab_pending')) {
      localStorage.removeItem('google_tab_pending')
      window.opener?.postMessage({ type: 'GOOGLE_AUTH_ERROR', code: 'no-result' }, '*')
      window.close()
      return
    }

    localStorage.setItem('google_tab_pending', '1')
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithRedirect($firebase.auth, provider)

  } catch (error: any) {
    localStorage.removeItem('google_tab_pending')
    window.opener?.postMessage({ type: 'GOOGLE_AUTH_ERROR', code: error.code ?? 'unknown' }, '*')
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