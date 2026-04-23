/**
 * PRODUCT_CONFIG — safe zone geometry and per-product fallbacks for data
 * not yet set in Shopify (colors, maxMotifs).
 *
 * What lives here vs Shopify:
 *   HERE      — safeZone ratios, safeZonePhysicalWidthInches, colors fallback, maxMotifs fallback
 *   SHOPIFY   — bgColor (section setting), bgImage (product image alt="canvas"),
 *               description, dimensions, care (product metafields),
 *               maxMotifs (custom.max_motifs), colors (variant swatches),
 *               price, tagline, founder name
 *
 * Safe zone geometry (all values are ratios of the canvas dimension):
 *   widthRatio  — safe zone width  ÷ canvas width
 *   heightRatio — safe zone height ÷ canvas height
 *   offsetX     — center offset from canvas center, as fraction of canvas width  (positive = right)
 *   offsetY     — center offset from canvas center, as fraction of canvas height (positive = down)
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
  'The Grand Market Tote',
  'The Signature Day Tote',
  'The Petit Café Tote',
  'The Promenade Crossbody',
  'The Souvenir Charm',
  'The Companion Pouch',
  'The Atelier Apron',
  'The Apéritif Napkins',
  'The Heirloom Tea Towels',
] as const

export type ItemType = typeof ITEM_TYPES[number]

// ── Per-product configuration ─────────────────────────────────────────────────

export const PRODUCT_CONFIG: Record<ItemType, ProductConfig> = {
  'The Grand Market Tote': {
    safeZone: { widthRatio: 0.78, heightRatio: 0.33, offsetX: -0.02, offsetY: 0.10 },
    safeZonePhysicalWidthInches: 25,
  },

  'The Signature Day Tote': {
    safeZone: { widthRatio: 0.62, heightRatio: 0.30, offsetX: -0.01, offsetY: 0.12 },
    safeZonePhysicalWidthInches: 18,
  },

  'The Petit Café Tote': {
    safeZone: { widthRatio: 0.58, heightRatio: 0.35, offsetX: 0.00, offsetY: 0.11 },
    safeZonePhysicalWidthInches: 13,
  },

  'The Promenade Crossbody': {
    safeZone: { widthRatio: 0.73, heightRatio: 0.33, offsetX: 0.00, offsetY: 0.10 },
    safeZonePhysicalWidthInches: 13,
  },

  'The Souvenir Charm': {
    safeZone: { widthRatio: 0.40, heightRatio: 0.40, offsetX: 0, offsetY: 0 },
    safeZonePhysicalWidthInches: 1.25,
  },

  'The Companion Pouch': {
    safeZone: { widthRatio: 0.60, heightRatio: 0.26, offsetX: 0.04, offsetY: 0.13 },
    safeZonePhysicalWidthInches: 11.0,
  },

  'The Atelier Apron': {
    safeZone: { widthRatio: 0.52, heightRatio: 0.38, offsetX: 0, offsetY: -0.08 },
    safeZonePhysicalWidthInches: 5.0,
  },

  'The Apéritif Napkins': {
    safeZone: { widthRatio: 0.42, heightRatio: 0.42, offsetX: 0.16, offsetY: 0.16 },
    safeZonePhysicalWidthInches: 5.0,
  },

  'The Heirloom Tea Towels': {
    safeZone: { widthRatio: 0.72, heightRatio: 0.28, offsetX: 0, offsetY: 0.06 },
    safeZonePhysicalWidthInches: 14.0,
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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
