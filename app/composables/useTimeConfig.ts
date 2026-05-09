export const TIME_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  morning:   { label: 'Morning',   emoji: '☀️', color: '#92700A', bg: '#FFFEED' },
  afternoon: { label: 'Afternoon', emoji: '⛅', color: '#7A4A1A', bg: '#FFD5AD' },
  evening:   { label: 'Evening',   emoji: '🌙', color: '#2C3E52', bg: '#AABACC' },
  anytime:   { label: 'Anytime',   emoji: '☁️', color: '#4A4A4A', bg: '#F1F1F1' },
}

export const useTimeConfig = () => TIME_CONFIG