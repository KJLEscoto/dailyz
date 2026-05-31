export interface Level {
  totalXp: number
}

export interface LevelMeta {
  name: string
  color: string
  badge: string   // svg path
  minXp: number
  maxXp: number   // -1 = no cap (last tier)
}

export const LEVEL_TIERS: LevelMeta[] = [
  { name: 'Seedling', color: '#c87235', badge: '/svg/badges/Seedling.svg', minXp: 0, maxXp: 149  },
  { name: 'Frostbite', color: '#274366', badge: '/svg/badges/Frostbite.svg', minXp: 150, maxXp: 349  },
  { name: 'Forest', color: '#46840f', badge: '/svg/badges/Forest.svg',   minXp: 350,  maxXp: 699  },
  { name: 'Grove Guardian', color: '#055963', badge: '/svg/badges/Grove Guardian.svg',  minXp: 700,  maxXp: 1199 },
  { name: 'Mystic Oak', color: '#6130b5', badge: '/svg/badges/Mystic Oak.svg',  minXp: 1200,  maxXp: 1499 },
  { name: 'Royal Crest', color: '#e58a00', badge: '/svg/badges/Royal Crest.svg',   minXp: 1500, maxXp: -1   },
]

export const XP_PER_COMPLETION = 15