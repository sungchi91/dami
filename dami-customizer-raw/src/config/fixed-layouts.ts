export type FixedLayoutType = 'classic' | 'statement' | 'sidenote' | 'crown' | 'pedestal' | 'side-motif' | 'side-font' | 'classic-motif'

interface Pos { x: number; y: number }

export interface ClassicLayout   { text: Pos }
export interface StatementLayout { text: Pos }
export interface SidenoteLayout  { text: Pos; motif: Pos }
export interface RowLayout       { text: Pos; motifRow: { centerX: number; y: number } }
export interface SideMotifLayout { motif: Pos }

export type AnyFixedLayout = ClassicLayout | StatementLayout | SidenoteLayout | RowLayout | SideMotifLayout

export interface ProductFixedLayouts {
  motifInches?:   number
  classic?:       ClassicLayout
  statement?:     StatementLayout
  sidenote?:      SidenoteLayout
  crown?:         RowLayout
  pedestal?:      RowLayout
  'side-motif'?:  SideMotifLayout
  'side-font'?:   ClassicLayout
  'classic-motif'?: SideMotifLayout
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
  return 'motif' in layout && 'text' in layout
}

export function isSideMotifLayout(layout: AnyFixedLayout): layout is SideMotifLayout {
  return 'motif' in layout && !('text' in layout)
}

function resolveKey(productTitle: string): string | undefined {
  const lower = productTitle.toLowerCase()
  const matches = Object.keys(FIXED_LAYOUTS).filter(k =>
    lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)
  )
  matches.sort((a, b) => b.length - a.length)
  return matches[0]
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
    classic:   { text: { x: 0.53, y: 0.16 } },
    statement: { text: { x: 0.53, y: 0.65 } },
    sidenote:  { text: { x: 0.52, y: 0.19 }, motif: { x: 0.83, y: 0.80 } },
    crown:     { text: { x: 0.52, y: 0.26 }, motifRow: { centerX: 0.52, y: 0.13 } },
    pedestal:  { text: { x: 0.52, y: 0.09 }, motifRow: { centerX: 0.52, y: 0.24 } },
  },
  'Signature Tote': {
    motifInches: 1.25,
    classic:   { text: { x: 0.50, y: 0.18 } },
    statement: { text: { x: 0.51, y: 0.59 } },
    sidenote:  { text: { x: 0.49, y: 0.18 }, motif: { x: 0.83, y: 0.85 } },
    crown:     { text: { x: 0.51, y: 0.26 }, motifRow: { centerX: 0.51, y: 0.15 } },
    pedestal:  { text: { x: 0.50, y: 0.11 }, motifRow: { centerX: 0.50, y: 0.25 } },
  },
  'Petite Tote': {
    classic:   { text: { x: 0.52, y: 0.19 } },
    statement: { text: { x: 0.53, y: 0.54 } },
    sidenote:  { text: { x: 0.53, y: 0.17 }, motif: { x: 0.90, y: 0.86 } },
    crown:     { text: { x: 0.53, y: 0.21 }, motifRow: { centerX: 0.53, y: 0.12 } },
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
    motifInches: 0.75,
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.52, y: 0.50 }, motif: { x: 0.87, y: 0.82 } },
    crown:     { text: { x: 0.52, y: 0.60 }, motifRow: { centerX: 0.52, y: 0.33 } },
    pedestal:  { text: { x: 0.51, y: 0.34 }, motifRow: { centerX: 0.52, y: 0.62 } },
  },
  'Grand Waffle Pouch': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.51, y: 0.48 }, motif: { x: 0.90, y: 0.84 } },
    crown:     { text: { x: 0.50, y: 0.53 }, motifRow: { centerX: 0.50, y: 0.34 } },
    pedestal:  { text: { x: 0.52, y: 0.37 }, motifRow: { centerX: 0.52, y: 0.60 } },
  },
  'Seersucker Pouch': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.35, y: 0.50 }, motif: { x: 0.75, y: 0.50 } },
    crown:     { text: { x: 0.50, y: 0.20 }, motifRow: { centerX: 0.50, y: 0.80 } },
    pedestal:  { text: { x: 0.50, y: 0.80 }, motifRow: { centerX: 0.50, y: 0.20 } },
  },
  'Linen Cocktail Napkin': {
    motifInches: 1,
    classic:         { text: { x: 0.50, y: 0.50 } },
    statement:       { text: { x: 0.50, y: 0.50 } },
    sidenote:        { text: { x: 0.35, y: 0.50 }, motif: { x: 0.75, y: 0.50 } },
    crown:           { text: { x: 0.50, y: 0.20 }, motifRow: { centerX: 0.50, y: 0.80 } },
    pedestal:        { text: { x: 0.50, y: 0.80 }, motifRow: { centerX: 0.50, y: 0.20 } },
    'side-font':     { text: { x: 0.91, y: 0.86 } },
    'side-motif':    { motif: { x: 0.81, y: 0.82 } },
    'classic-motif': { motif: { x: 0.52, y: 0.50 } },
  },
  'The Oxford': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.35, y: 0.50 }, motif: { x: 0.75, y: 0.50 } },
    crown:     { text: { x: 0.50, y: 0.20 }, motifRow: { centerX: 0.50, y: 0.80 } },
    pedestal:  { text: { x: 0.50, y: 0.80 }, motifRow: { centerX: 0.50, y: 0.20 } },
  },
}
