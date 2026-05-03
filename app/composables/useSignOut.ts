// composables/useSignOut.ts
export const useSignOut = () => {
  const { signOut } = useAuth()

  const signOutLoading = ref(false)
  const signOutCancelled = ref(false)
  const countdown = ref(4)
  let signOutTimer: ReturnType<typeof setTimeout> | null = null
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  const signOutSuccess = useState<boolean>('sign-out-success', () => false)

  const handleSignOut = () => {
    signOutLoading.value = true
    signOutCancelled.value = false
    countdown.value = 4

    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer!)
        countdownTimer = null
      }
    }, 1000)

    signOutTimer = setTimeout(async () => {
      if (signOutCancelled.value) return
      try {
        signOutSuccess.value = true
        await signOut()
      } finally {
        signOutLoading.value = false
      }
    }, 4000)
  }

  const cancelSignOut = () => {
    if (signOutTimer) { clearTimeout(signOutTimer); signOutTimer = null }
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
    signOutCancelled.value = true
    signOutLoading.value = false
    countdown.value = 4
  }

  onUnmounted(() => {
    if (signOutTimer) clearTimeout(signOutTimer)
    if (countdownTimer) clearInterval(countdownTimer)
  })

  return {
    signOutLoading,
    countdown,
    handleSignOut,
    cancelSignOut,
  }
}