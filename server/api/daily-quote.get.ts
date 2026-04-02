// server/api/daily-quote.get.ts
const KEYWORDS = [
  'discipline', 'routine', 'consistent', 'consistency', 'habit', 'habits',
  'motivation', 'progress', 'daily', 'focus', 'persist', 'effort',
  'work', 'improve', 'goal', 'action', 'commit', 'dedicated', 'growth',
]

function matchesKeywords(quote: string): boolean {
  const lower = quote.toLowerCase()
  return KEYWORDS.some(kw => lower.includes(kw))
}

export default defineEventHandler(async () => {
  const data = await $fetch<Array<{ q: string; a: string }>>(
    'https://zenquotes.io/api/quotes' // returns 50 quotes at once
  )

  if (!data || data.length === 0) {
    throw createError({ statusCode: 502, message: 'No quotes returned from ZenQuotes' })
  }

  // Filter by keywords, fall back to full list if nothing matches
  const filtered = data.filter(item => matchesKeywords(item.q))
  const pool = filtered.length > 0 ? filtered : data

  // Pick a random one from the pool
  const picked = pool[Math.floor(Math.random() * pool.length)]

  return {
    quote:  picked?.q,
    author: picked?.a,
  }
})