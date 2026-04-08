// composables/useDate.ts
export function useDate() {
  const now = new Date()

  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
  const monthName = now.toLocaleDateString('en-US', { month: 'short' })
  const day = now.getDate()

  const formatted = `${dayName}, ${monthName} ${day}` // e.g. "Saturday, Mar 28"

  return { now, dayName, monthName, day, formatted }
}