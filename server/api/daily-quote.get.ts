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
      { quote: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' },
      { quote: 'It is not what we do once in a while that shapes our lives, but what we do consistently.', author: 'Tony Robbins' },
      { quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
      { quote: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
      { quote: 'Dream big, start small, but most of all start.', author: 'Simon Sinek' },
      { quote: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
      { quote: 'You don\'t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
      { quote: 'The chains of habit are too light to be felt until they are too heavy to be broken.', author: 'Warren Buffett' },
      { quote: 'Greatness is not in where we stand, but in what direction we are moving.', author: 'Oliver Wendell Holmes' },
      { quote: 'A year from now you may wish you had started today.', author: 'Karen Lamb' },
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