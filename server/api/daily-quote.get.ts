// server/api/daily-quote.get.ts
export default defineEventHandler(async () => {

  // Try 1: quotesapi with category filter
  try {
    const data = await $fetch<{ data: { quote: string; author: string }[] }>(
      'https://quotesapi.prayushadhikari.com.np/api/quotes/random?categories=motivation,inspiration,success&limit=1'
    )
    const picked = data.data?.[0]
    if (picked?.quote) return { quote: picked.quote, author: picked.author }
  } catch {}

  // Try 2: motivational-spark-api
  try {
    const data = await $fetch<{ quote: string; author: string }>(
      'https://motivational-spark-api.vercel.app/api/quotes/random'
    )
    if (data?.quote) return { quote: data.quote, author: data.author }
  } catch {}

  // Try 3: qapi
  try {
    const data = await $fetch<{ quote: string; author: string }>(
      'https://qapi.vercel.app/api/random'
    )
    if (data?.quote) return { quote: data.quote, author: data.author }
  } catch {}

  // Fallback: curated local list
  const FALLBACK = [
    { quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle' },
    { quote: 'Motivation is what gets you started. Habit is what keeps you going.', author: 'Jim Ryun' },
    { quote: 'The secret of your future is hidden in your daily routine.', author: 'Mike Murdock' },
    { quote: 'You do not rise to the level of your goals, you fall to the level of your systems.', author: 'James Clear' },
    { quote: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' },
    { quote: 'It is not what we do once in a while that shapes our lives, but what we do consistently.', author: 'Tony Robbins' },
    { quote: 'You\'ll never change your life until you change something you do daily.', author: 'John C. Maxwell' },
    { quote: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
    { quote: 'Either you run the day or the day runs you.', author: 'Jim Rohn' },
    { quote: 'What you do every day matters more than what you do once in a while.', author: 'Gretchen Rubin' },
    { quote: 'Consistency is the key to achieving and maintaining momentum.', author: 'Darren Hardy' },
    { quote: 'Do something today that your future self will thank you for.', author: 'Sean Patrick Flanery' },
    { quote: 'The chains of habit are too light to be felt until they are too heavy to be broken.', author: 'Warren Buffett' },
    { quote: 'Success is nothing more than a few simple disciplines practiced every day.', author: 'Jim Rohn' },
    { quote: 'A little progress each day adds up to big results.', author: 'Satya Nani' },
    { quote: 'Wake up with determination. Go to bed with satisfaction.', author: 'Unknown' },
    { quote: 'Don\'t stop when you\'re tired. Stop when you\'re done.', author: 'Unknown' },
    { quote: 'Push yourself, because no one else is going to do it for you.', author: 'Unknown' },
    { quote: 'First forget inspiration. Habit is more dependable.', author: 'Octavia Butler' },
    { quote: 'A year from now you may wish you had started today.', author: 'Karen Lamb' },
  ]

  const picked = FALLBACK[Math.floor(Math.random() * FALLBACK.length)]
  return { quote: picked!.quote, author: picked!.author }
})