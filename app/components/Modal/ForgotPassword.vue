<script setup lang="ts">
import { MailCheck } from '@lucide/vue'

const { sendPasswordReset } = useAuth()

const modelValue = defineModel<boolean>({ default: false })

const email = ref('')
const emailError = ref('')
const isLoading = ref(false)
const isSuccess = ref(false)

const close = () => {
  modelValue.value = false
}

const resetState = () => {
  email.value = ''
  emailError.value = ''
  isLoading.value = false
  isSuccess.value = false
}

// Reset state when modal closes
watch(modelValue, (val) => {
  if (!val) setTimeout(resetState, 300) // after close animation
})

const handleSubmit = async () => {
  emailError.value = ''

  if (!email.value.trim()) {
    emailError.value = 'Email address is required.'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    emailError.value = 'Please enter a valid email address.'
    return
  }

  isLoading.value = true
  try {
    await sendPasswordReset(email.value.trim())
    isSuccess.value = true
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      emailError.value = 'No account found with this email address.'
    } else if (error.code === 'auth/invalid-email') {
      emailError.value = 'Invalid email address.'
    } else if (error.code === 'auth/too-many-requests') {
      emailError.value = 'Too many requests. Please wait a moment and try again.'
    } else {
      emailError.value = 'Something went wrong. Please try again.'
      console.error('Password reset error:', error)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Modal v-model="modelValue" :title="isSuccess ? 'Check your inbox' : 'Reset your password'"
    :description="isSuccess ? undefined : 'Enter your email and we\'ll send you a reset link.'"
    :primary-label="isSuccess ? 'Done' : 'Send Reset Link'" :cancel-label="isSuccess ? undefined : 'Cancel'"
    :primary-loading="isLoading" :primary-disabled="isLoading" @primary="isSuccess ? close() : handleSubmit()"
    @cancel="close">
    <!-- Success state -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100">
      <div v-if="isSuccess" class="flex flex-col items-center gap-4 py-2 text-center">
        <div class="size-14 rounded-2xl bg-green-50 flex items-center justify-center">
          <MailCheck class="size-7 text-green-500" />
        </div>
        <div class="space-y-1">
          <p class="font-medium text-gray-800">Reset link sent!</p>
          <p class="text-sm text-muted leading-relaxed">
            If <span class="font-semibold text-gray-700">{{ email }}</span> is registered,
            you'll receive a reset link shortly. Check your spam folder if you don't see it.
          </p>
        </div>
      </div>
    </Transition>

    <!-- 4621 + 175 + 480 saved so far 1586 -->

    <!-- Form state -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100">
      <div v-if="!isSuccess">
        <FormField v-model="email" label="email address" type="email" placeholder="hello@example.com"
          :error="emailError" :disabled="isLoading" required @keydown.enter="handleSubmit" />
      </div>
    </Transition>
  </Modal>
</template>