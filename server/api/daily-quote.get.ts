// server/api/daily-quote.get.ts
export default defineEventHandler(async () => {
  try {
    const data = await $fetch<{ content: string; author: string }>(
      'https://api.quotable.io/random?tags=inspirational|success|motivation',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Dailyz/1.0)' } }
    )

    return {
      quote: data.content,
      author: data.author,
    }
  } catch (err) {
    console.error('[daily-quote] Failed to fetch:', err)

    // fallback so the app never breaks
    const FALLBACK = [
      { quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle' },
      { quote: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
      { quote: 'Motivation is what gets you started. Habit is what keeps you going.', author: 'Jim Ryun' },
      { quote: 'The secret of your future is hidden in your daily routine.', author: 'Mike Murdock' },
      { quote: 'You do not rise to the level of your goals, you fall to the level of your systems.', author: 'James Clear' },
    ]

    const picked = FALLBACK[Math.floor(Math.random() * FALLBACK.length)]
    return { quote: picked?.quote, author: picked?.author }
  }
})