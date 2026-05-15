<!-- error.vue (Nuxt root error page) -->
<script setup lang="ts">
import { useError, clearError } from '#app'

const error = useError()

const router = useRouter()
const goBack = () => clearError().then(() => router.back())
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-foreground">
    <Image src="/images/mascot/error.png" alt="Dailyz Mascot Scott" class="max-w-120" />
    <h1 class="text-6xl! font-bold text-primary">{{ error?.statusCode ?? '?' }}</h1>
    <h1 class="text-xl font-semibold text-black/70">{{ error?.statusMessage ?? 'Something went wrong' }}</h1>
    <p class="text-sm text-muted text-center max-w-sm">{{ error?.message }}</p>
    <Button @click="goBack">Go Back</Button>
  </div>
</template>