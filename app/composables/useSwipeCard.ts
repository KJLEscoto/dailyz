// composables/useSwipeCard.ts
const activeCardId = ref<string | null>(null)

export function useSwipeCard(id: string, closeCallback: () => void) {
  const activate = () => {
    if (activeCardId.value && activeCardId.value !== id) {
      // a different card is open — it will close itself via the watcher
    }
    activeCardId.value = id
  }

  // watch for when another card becomes active
  watch(activeCardId, (newId) => {
    if (newId !== id) {
      closeCallback()
    }
  })

  return { activate }
}