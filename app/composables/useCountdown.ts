export const useDayCountdown = () => {
  const timeLeft = ref('')
  const isUrgent = ref(false) // true when < 1 hour left
  let interval: ReturnType<typeof setInterval> | null = null

  const update = () => {
    const now = new Date()
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)

    const diff = midnight.getTime() - now.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    // isUrgent.value = hours < 1

    if (hours > 0) {
      timeLeft.value = `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      timeLeft.value = `${minutes}m ${seconds}s`
    } else {
      timeLeft.value = `${seconds}s`
    }
  }

  onMounted(() => {
    update()
    interval = setInterval(update, 1000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })

  return { timeLeft }
}