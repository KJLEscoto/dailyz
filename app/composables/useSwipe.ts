// composables/useSwipe.ts
export const useSwipe = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 50
) => {
  const startX = ref(0)
  const isDragging = ref(false)

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    startX.value = touch.clientX
    isDragging.value = true
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (!isDragging.value) return
    isDragging.value = false
    const touch = e.changedTouches[0]
    if (!touch) return
    const delta = touch.clientX - startX.value
    if (delta < -threshold) onSwipeLeft()
    else if (delta > threshold) onSwipeRight()
  }

  return { onTouchStart, onTouchEnd }
}