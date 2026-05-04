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
  safeZone:                    SafeZoneConfig
  safeZonePhysicalWidthInches: number
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
    safeZonePhysicalWidthInches: 25,
  },

  'Signature Tote': {
    safeZone: { widthRatio: 0.71, heightRatio: 0.34, offsetX: -0.01, offsetY: 0.12 },
    safeZonePhysicalWidthInches: 18,
  },

  'Petite Tote': {
    safeZone: { widthRatio: 0.62, heightRatio: 0.37, offsetX: -0.01, offsetY: 0.10 },
    safeZonePhysicalWidthInches: 13.5,
  },

  'Petite Crossbody': {
    safeZone: { widthRatio: 0.73, heightRatio: 0.33, offsetX: 0.00, offsetY: 0.10 },
    safeZonePhysicalWidthInches: 13,
  },

  'Waffle Pouch': {
    safeZone: { widthRatio: 0.60, heightRatio: 0.26, offsetX: 0.04, offsetY: 0.13 },
    safeZonePhysicalWidthInches: 11,
  },

  'Grand Waffle Pouch': {
    safeZone: { widthRatio: 0.60, heightRatio: 0.26, offsetX: 0.04, offsetY: 0.13 },
    safeZonePhysicalWidthInches: 13,
  },

  'Seersucker Pouch': {
    safeZone: { widthRatio: 0.60, heightRatio: 0.26, offsetX: 0.04, offsetY: 0.13 },
    safeZonePhysicalWidthInches: 11,
  },

  'Linen Cocktail Napkin': {
    safeZone: { widthRatio: 0.42, heightRatio: 0.42, offsetX: 0.16, offsetY: 0.16 },
    safeZonePhysicalWidthInches: 5,
  },

  'The Oxford': {
    safeZone: { widthRatio: 0.60, heightRatio: 0.40, offsetX: 0.00, offsetY: 0.00 },
    safeZonePhysicalWidthInches: 10,
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Find the canonical ItemType whose key is contained in the product title, or vice versa. */
export function resolveItemType(productTitle: string): ItemType {
  const lower = productTitle.toLowerCase()
  const match = ITEM_TYPES.find(t => lower.includes(t.toLowerCase()) || t.toLowerCase().includes(lower))
  return match ?? ITEM_TYPES[0]
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
