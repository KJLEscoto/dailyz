// server/api/daily-nature.get.ts
const KEYWORDS = ['nature', 'forest', 'mountains', 'ocean', 'waterfall', 'landscape', 'sunrise', 'jungle', 'lake', 'valley']

interface NatureResponse {
  url: string
  author: string
  authorLink: string
}

interface UnsplashPhoto {
  urls: { full: string }
  user: {
    name: string
    links: { html: string }
  }
}

export default defineEventHandler(async (): Promise<NatureResponse> => {
  const config = useRuntimeConfig()

  const keyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)] as string

  const data = await $fetch<UnsplashPhoto>('https://api.unsplash.com/photos/random', {
    query: { query: keyword, orientation: 'landscape' },
    headers: { Authorization: `Client-ID ${config.unsplashKey}` },
  }).catch(() => null)

  if (!data) {
    throw createError({ statusCode: 502, message: 'Failed to fetch image from Unsplash' })
  }

  return {
    url:        data.urls.full,
    author:     data.user.name,
    authorLink: data.user.links.html,
  }
})