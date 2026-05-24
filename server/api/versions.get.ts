export default defineEventHandler(() => {
  return [
    {
      version_number: 'v1.1.0',
      current: true,
      features: [
        { id: 5, description: 'Added level system' },
        { id: 4, description: 'Improved home screen layout' },
        { id: 3, description: 'Icon theming on cards' },
        { id: 2, description: 'Drum-roll reminder time picker' },
        { id: 1, description: 'Improved layout and design for habit cards' },
      ],
    },
    {
      version_number: 'v1.0.0',
      current: false,
      features: [
        { id: 5, description: 'Daily habit commits with year filtering' },
        { id: 4, description: 'Habit blocks and calendar' },
        { id: 3, description: 'Weekly progress summary' },
        { id: 2, description: 'Daily quote & nature photo' },
        { id: 1, description: 'Habit tracking with streaks' },
    ],
    },
  ]
})