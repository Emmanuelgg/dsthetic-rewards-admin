export const COLORS = {
  black:           '#0A0A0A',
  blackDeep:       '#050505',
  blackPanel:      '#111110',
  blackPanelLo:    '#0d0c0b',
  blackElev:       '#171511',
  gold:            '#C9A84C',
  goldSoft:        '#a78a3a',
  goldDim:         'rgba(201,168,76,0.55)',
  goldGlow:        'rgba(201,168,76,0.18)',
  ivory:           '#F0E8D0',
  ivoryDim:        'rgba(240,232,208,0.62)',
  ivoryMute:       'rgba(240,232,208,0.38)',
  ivoryFaint:      'rgba(240,232,208,0.22)',
  hairline:        'rgba(240,232,208,0.10)',
  hairlineStrong:  'rgba(240,232,208,0.18)',
  rose:            '#d99a8a',
  sage:            '#9aab8a',
  amber:           '#d9b86a',
} as const

export const SERIF = `'Cormorant Garamond', 'Times New Roman', serif`
export const SANS  = `'Jost', ui-sans-serif, system-ui, -apple-system, sans-serif`
export const MONO  = `'JetBrains Mono', ui-monospace, 'SF Mono', monospace`

// NOTE: `floor`/`ceil` here are fallback display defaults only.
// Authoritative values come from the API (`GET /tiers`). The boundaries panel
// in /niveles edits them at runtime; this constant is for color/ord/lookup.
// Removed `perks` — benefits per tier now come from `rewards.min_tier`
// relationally (see `useTierRewards`).
export const TIERS = {
  plata: {
    key: 'plata', label: 'PLATA', name: 'Plata', next: 'oro',
    floor: 0, ceil: 400, ord: 1,
    accent: '#bfb6a3', ornament: '◇',
    multiplier: '1.0×',
  },
  oro: {
    key: 'oro', label: 'ORO', name: 'Oro', next: 'diamante',
    floor: 400, ceil: 1200, ord: 2,
    accent: '#C9A84C', ornament: '◈',
    multiplier: '1.5×',
  },
  diamante: {
    key: 'diamante', label: 'DIAMANTE', name: 'Diamante', next: null,
    floor: 1200, ceil: null, ord: 3,
    accent: '#e8dba0', ornament: '◆',
    multiplier: '2.0×',
  },
} as const

export type TierKey = keyof typeof TIERS

export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024 } as const
