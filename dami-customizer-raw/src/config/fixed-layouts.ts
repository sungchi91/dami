export type FixedLayoutType = 'classic' | 'statement' | 'sidenote' | 'crown' | 'pedestal'

interface Pos { x: number; y: number }

export interface ClassicLayout   { text: Pos }
export interface StatementLayout { text: Pos }
export interface SidenoteLayout  { text: Pos; motif: Pos }
export interface RowLayout       { text: Pos; motifRow: { centerX: number; y: number } }

export type AnyFixedLayout = ClassicLayout | StatementLayout | SidenoteLayout | RowLayout

export interface ProductFixedLayouts {
  motifInches?: number   // physical motif size — defaults to 1.0
  classic?:   ClassicLayout
  statement?: StatementLayout
  sidenote?:  SidenoteLayout
  crown?:     RowLayout
  pedestal?:  RowLayout
}

// Center-to-center distance as a multiple of motif diameter
export const MOTIF_GAP_MULTIPLIER = 1.2

export function calcMotifRowPositions(
  centerX: number, count: number, motifInches: number, physicalWidthInches: number,
): number[] {
  const gap = MOTIF_GAP_MULTIPLIER * motifInches / physicalWidthInches
  if (count === 1) return [centerX]
  if (count === 2) return [centerX - gap / 2, centerX + gap / 2]
  return [centerX - gap, centerX, centerX + gap]
}

export function isRowLayout(layout: AnyFixedLayout): layout is RowLayout {
  return 'motifRow' in layout
}

export function isSidenoteLayout(layout: AnyFixedLayout): layout is SidenoteLayout {
  return 'motif' in layout
}

function resolveKey(productTitle: string): string | undefined {
  const lower = productTitle.toLowerCase()
  return Object.keys(FIXED_LAYOUTS).find(k =>
    lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)
  )
}

/** Find layout by contains match — key contained in title or title contained in key. */
export function getFixedLayout(productTitle: string, type: FixedLayoutType): AnyFixedLayout | undefined {
  const key = resolveKey(productTitle)
  return key ? FIXED_LAYOUTS[key]?.[type] : undefined
}

/** Motif physical size in inches for the product (defaults to 1.0). */
export function getMotifInches(productTitle: string): number {
  const key = resolveKey(productTitle)
  return key ? (FIXED_LAYOUTS[key]?.motifInches ?? 1.0) : 1.0
}

// ── Product configs — paste output from Fixed Layout Positions tool ────────────

export const FIXED_LAYOUTS: Record<string, ProductFixedLayouts> = {
  'Grand Tote': {
    motifInches: 1.50,
    classic:   { text: { x: 0.51, y: 0.19 } },
    statement: { text: { x: 0.51, y: 0.65 } },
    sidenote:  { text: { x: 0.51, y: 0.18 }, motif: { x: 0.84, y: 0.88 } },
    crown:     { text: { x: 0.51, y: 0.26 }, motifRow: { centerX: 0.51, y: 0.12 } },
    pedestal:  { text: { x: 0.51, y: 0.09 }, motifRow: { centerX: 0.51, y: 0.24 } },
  },
  'Signature Tote': {
    motifInches: 1.25,
    classic:   { text: { x: 0.49, y: 0.17 } },
    statement: { text: { x: 0.49, y: 0.60 } },
    sidenote:  { text: { x: 0.49, y: 0.18 }, motif: { x: 0.85, y: 0.88 } },
    crown:     { text: { x: 0.49, y: 0.27 }, motifRow: { centerX: 0.49, y: 0.13 } },
    pedestal:  { text: { x: 0.49, y: 0.12 }, motifRow: { centerX: 0.49, y: 0.26 } },
  },
  'Petite Tote': {
    classic:   { text: { x: 0.52, y: 0.19 } },
    statement: { text: { x: 0.53, y: 0.54 } },
    sidenote:  { text: { x: 0.53, y: 0.17 }, motif: { x: 0.90, y: 0.86 } },
    crown:     { text: { x: 0.53, y: 0.24 }, motifRow: { centerX: 0.53, y: 0.12 } },
    pedestal:  { text: { x: 0.52, y: 0.11 }, motifRow: { centerX: 0.52, y: 0.24 } },
  },
  'Petite Crossbody': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.35, y: 0.50 }, motif: { x: 0.75, y: 0.50 } },
    crown:     { text: { x: 0.50, y: 0.20 }, motifRow: { centerX: 0.50, y: 0.80 } },
    pedestal:  { text: { x: 0.50, y: 0.80 }, motifRow: { centerX: 0.50, y: 0.20 } },
  },
  'Waffle Pouch': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.35, y: 0.50 }, motif: { x: 0.75, y: 0.50 } },
    crown:     { text: { x: 0.50, y: 0.20 }, motifRow: { centerX: 0.50, y: 0.80 } },
    pedestal:  { text: { x: 0.50, y: 0.80 }, motifRow: { centerX: 0.50, y: 0.20 } },
  },
  'Grand Waffle Pouch': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.35, y: 0.50 }, motif: { x: 0.75, y: 0.50 } },
    crown:     { text: { x: 0.50, y: 0.20 }, motifRow: { centerX: 0.50, y: 0.80 } },
    pedestal:  { text: { x: 0.50, y: 0.80 }, motifRow: { centerX: 0.50, y: 0.20 } },
  },
  'Seersucker Pouch': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.35, y: 0.50 }, motif: { x: 0.75, y: 0.50 } },
    crown:     { text: { x: 0.50, y: 0.20 }, motifRow: { centerX: 0.50, y: 0.80 } },
    pedestal:  { text: { x: 0.50, y: 0.80 }, motifRow: { centerX: 0.50, y: 0.20 } },
  },
  'Linen Cocktail Napkin': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.35, y: 0.50 }, motif: { x: 0.75, y: 0.50 } },
    crown:     { text: { x: 0.50, y: 0.20 }, motifRow: { centerX: 0.50, y: 0.80 } },
    pedestal:  { text: { x: 0.50, y: 0.80 }, motifRow: { centerX: 0.50, y: 0.20 } },
  },
  'The Oxford': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.35, y: 0.50 }, motif: { x: 0.75, y: 0.50 } },
    crown:     { text: { x: 0.50, y: 0.20 }, motifRow: { centerX: 0.50, y: 0.80 } },
    pedestal:  { text: { x: 0.50, y: 0.80 }, motifRow: { centerX: 0.50, y: 0.20 } },
  },
}
