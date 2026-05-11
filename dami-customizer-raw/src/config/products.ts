/**
 * PRODUCT_CONFIG — safe zone geometry per product.
 * Keys are canonical short names. Lookups use contains matching — see getProductConfig().
 */

export interface SafeZoneConfig {
  widthRatio:  number
  heightRatio: number
  offsetX:     number
  offsetY:     number
}

export interface ProductConfig {
  safeZone:      SafeZoneConfig
  physicalWidth: number
  maxTextWidth:  number
}

// ── Item names (single source of truth for the dropdown) ──────────────────────

export const ITEM_TYPES = [
  'Grand Tote',
  'Signature Tote',
  'Petite Tote',
  'Petite Crossbody',
  'Waffle Pouch',
  'Grand Waffle Pouch',
  'Seersucker Pouch',
  'Linen Cocktail Napkin',
  'The Oxford',
] as const

export type ItemType = typeof ITEM_TYPES[number]

// ── Per-product configuration ─────────────────────────────────────────────────

export const PRODUCT_CONFIG: Record<ItemType, ProductConfig> = {
  'Grand Tote': {
    safeZone: { widthRatio: 0.80, heightRatio: 0.33, offsetX: -0.02, offsetY: 0.09 },
    physicalWidth: 25,
    maxTextWidth:  6.75,
  },

  'Signature Tote': {
    safeZone: { widthRatio: 0.71, heightRatio: 0.34, offsetX: -0.01, offsetY: 0.12 },
    physicalWidth: 18,
    maxTextWidth:  5,
  },

  'Petite Tote': {
    safeZone: { widthRatio: 0.62, heightRatio: 0.37, offsetX: -0.01, offsetY: 0.10 },
    physicalWidth: 13.5,
    maxTextWidth:  4,
  },

  'Petite Crossbody': {
    safeZone: { widthRatio: 0.73, heightRatio: 0.33, offsetX: 0.00, offsetY: 0.10 },
    physicalWidth: 13,
    maxTextWidth:  5,
  },

  'Waffle Pouch': {
    safeZone: { widthRatio: 0.85, heightRatio: 0.33, offsetX: -0.01, offsetY: 0.01 },
    physicalWidth: 7.9,
    maxTextWidth:  6,
  },

  'Grand Waffle Pouch': {
    safeZone: { widthRatio: 0.84, heightRatio: 0.47, offsetX: -0.01, offsetY: 0.01 },
    physicalWidth: 9,
    maxTextWidth:  7,
  },

  'Seersucker Pouch': {
    safeZone: { widthRatio: 0.60, heightRatio: 0.26, offsetX: 0.04, offsetY: 0.13 },
    physicalWidth: 11,
    maxTextWidth:  7,
  },

  'Linen Cocktail Napkin': {
    safeZone: { widthRatio: 0.53, heightRatio: 0.45, offsetX: 0.00, offsetY: -0.01 },
    physicalWidth: 6,
    maxTextWidth:  4,
  },

  'The Oxford': {
    safeZone: { widthRatio: 0.60, heightRatio: 0.40, offsetX: 0.00, offsetY: 0.00 },
    physicalWidth: 10,
    maxTextWidth:  5,
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Find the canonical ItemType whose key is contained in the product title, or vice versa. */
export function resolveItemType(productTitle: string): ItemType {
  const lower = productTitle.toLowerCase()
  const matches = ITEM_TYPES.filter(t => lower.includes(t.toLowerCase()) || t.toLowerCase().includes(lower))
  matches.sort((a, b) => b.length - a.length)
  return matches[0] ?? ITEM_TYPES[0]
}

/**
 * Convert a SafeZoneConfig into absolute pixel dimensions for Fabric.js.
 */
export function computeSafeZonePx(
  canvasW: number,
  canvasH: number,
  config:  SafeZoneConfig,
): { left: number; top: number; width: number; height: number } {
  const szW = canvasW * config.widthRatio
  const szH = canvasH * config.heightRatio
  const cx  = canvasW / 2 + canvasW * config.offsetX
  const cy  = canvasH / 2 + canvasH * config.offsetY
  return {
    left:   cx - szW / 2,
    top:    cy - szH / 2,
    width:  szW,
    height: szH,
  }
}

/**
 * Pixels per inch for the embroidery safe zone at the current canvas size.
 */
export function computePPI(safeZonePixelWidth: number, physicalWidthInches: number): number {
  return safeZonePixelWidth / physicalWidthInches
}

/**
 * Convert a SafeZoneConfig into CSS percentage values for the Photos-tab overlay.
 */
export function safeZoneCss(config: SafeZoneConfig): React.CSSProperties {
  const wPct = config.widthRatio  * 100
  const hPct = config.heightRatio * 100
  const lPct = 50 + config.offsetX * 100 - wPct / 2
  const tPct = 50 + config.offsetY * 100 - hPct / 2
  return {
    position: 'absolute',
    left:     `${lPct}%`,
    top:      `${tPct}%`,
    width:    `${wPct}%`,
    height:   `${hPct}%`,
  }
}
