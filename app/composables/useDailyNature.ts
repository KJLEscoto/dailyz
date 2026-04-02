// composables/useDailyNature.ts
export const useDailyNature = () => {
  const config = useRuntimeConfig()
  const today = new Date().toISOString().split('T')[0]

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
      const data = await $fetch<any>('https://api.unsplash.com/photos/random', {
        query: { query: 'nature', orientation: 'landscape' },
        headers: { Authorization: `Client-ID ${config.public.unsplashKey}` },
      })
      const today = new Date().toISOString().split('T')[0] as string

      cached.value = {
        date:       today,
        url:        data.urls.full,
        author:     data.user.name,
        authorLink: data.user.links.html,
      }

      imageUrl.value   = cached.value.url
      author.value     = cached.value.author
      authorLink.value = cached.value.authorLink
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  fetchImage()

  return { imageUrl, author, authorLink, loading, error }
}