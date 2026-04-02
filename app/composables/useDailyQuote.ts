// composables/useDailyQuote.ts
export const useDailyQuote = () => {
  const today = new Date().toISOString().split('T')[0] // '2026-04-02'

  const cached = useCookie<{
    date:   string
    quote:  string
    author: string
  } | null>('daily-quote', {
    default:  () => null,
    maxAge:   60 * 60 * 24, // auto-expires after 24h
  })

  const quote  = ref(cached.value?.quote  ?? null)
  const author = ref(cached.value?.author ?? null)
  const loading = ref(false)
  const error   = ref(false)

  const fetchQuote = async () => {
    // Already cached for today — skip
    if (cached.value?.date === today) return

    loading.value = true
    error.value   = false

    try {
      const data = await $fetch<{ quote: string; author: string }>('/api/daily-quote')
      const today = new Date().toISOString().split('T')[0] as string

      cached.value = { date: today, quote: data.quote, author: data.author }
      quote.value  = data.quote
      author.value = data.author
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  fetchQuote()

  return { quote, author, loading, error }
}