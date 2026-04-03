// composables/useDailyNature.ts
export const useDailyNature = () => {
  const today = new Date().toISOString().split('T')[0] as string

  const cached = useCookie<{
    date: string
    url: string
    author: string
    authorLink: string
  } | null>('daily-nature', {
    default: () => null,
    maxAge: 60 * 60 * 24,
  })

  const imageUrl   = ref(cached.value?.url        ?? null)
  const author     = ref(cached.value?.author     ?? null)
  const authorLink = ref(cached.value?.authorLink ?? null)
  const loading    = ref(false)
  const error      = ref(false)

  const fetchImage = async () => {
    if (cached.value && cached.value.date === today) return

    loading.value = true
    error.value   = false

    try {
      const data = await $fetch<{ url: string; author: string; authorLink: string }>('/api/daily-nature')

      cached.value = { date: today, url: data.url, author: data.author, authorLink: data.authorLink }
      imageUrl.value   = data.url
      author.value     = data.author
      authorLink.value = data.authorLink
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  fetchImage()

  return { imageUrl, author, authorLink, loading, error }
}