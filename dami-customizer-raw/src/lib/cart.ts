/**
 * Cart payload utilities for the Shopify Cart API.
 *
 * Coordinate conversion:
 *   CanvasEditor tracks text position as a fraction of the safe-zone bounding
 *   box (0.0–1.0 per axis).  For the Shopify payload we convert to fractions
 *   of the full canvas / product image so the coordinates are product-agnostic
 *   and scale to any render resolution.
 *
 *   Given safe-zone config and a safe-zone-relative position (sx, sy):
 *
 *     x_percent = 0.5 + offsetX + (sx - 0.5) * widthRatio
 *     y_percent = 0.5 + offsetY + (sy - 0.5) * heightRatio
 *
 *   No pixel dimensions needed — the math works purely from the ratios stored
 *   in PRODUCT_CONFIG.
 */

import { ITEM_TYPES, PRODUCT_CONFIG, resolveItemType } from '@/config/products'
import {
  getFixedLayout, getMotifInches,
  isRowLayout, isSidenoteLayout, calcMotifRowPositions,
  type FixedLayoutType,
} from '@/config/fixed-layouts'
import type { TextPosition, TextSize, MotifEntry } from '@/hooks/useCustomizer'

// ── Label maps ────────────────────────────────────────────────────────────────

const FONT_LABELS: Record<string, string> = {
  cursive: 'Cursive Script',
  serif:   'Classic Serif',
  block:   'Fine Block',
}

const PHYSICAL_HEIGHT_INCHES: Record<TextSize, number> = { S: 1, M: 1.5, L: 2 }
const SIZE_LABELS:            Record<TextSize, string> = { S: 'Small', M: 'Medium', L: 'Large' }

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MotifPayload {
  icon:      string
  x_percent: number
  y_percent: number
}

export interface CustomizerData {
  item_base:                  string
  text:                       string
  font:                       string
  thread_color:               string
  size:                       string
  physical_height_inches:     number
  text_x_percent:             number
  text_y_percent:             number
  motif_physical_size_inches: number
  motifs:                     MotifPayload[]
}

export interface CartPayload {
  _customizer_data: CustomizerData
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert a safe-zone-relative position to a canvas-relative percentage.
 */
function toCanvasRelative(
  pos:          TextPosition,
  selectedItem: number,
): { x: number; y: number } {
  const itemName = ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]
  const { safeZone } = PRODUCT_CONFIG[itemName]
  return {
    x: parseFloat((0.5 + safeZone.offsetX + (pos.x - 0.5) * safeZone.widthRatio).toFixed(4)),
    y: parseFloat((0.5 + safeZone.offsetY + (pos.y - 0.5) * safeZone.heightRatio).toFixed(4)),
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function buildCartPayload(params: {
  selectedItem:   number
  embroideryText: string
  fontStyle:      string
  textColor:      string
  textSize:       TextSize
  textPosition:   TextPosition
  motifEntries:   MotifEntry[]
  customizerType?: string
}): CartPayload {
  const { selectedItem, embroideryText, fontStyle, textColor, textSize,
          textPosition, motifEntries, customizerType } = params

  const itemName = ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]
  const config   = PRODUCT_CONFIG[resolveItemType(itemName)]

  let text_x: number, text_y: number
  let motifs: MotifPayload[]
  let motifPhysicalInches: number

  const isFixed = customizerType && customizerType !== 'freeform'
  const layout  = isFixed ? getFixedLayout(itemName, customizerType as FixedLayoutType) : null

  if (isFixed && layout) {
    // Fixed layout — positions come from the config, not from drag state
    const textPos = toCanvasRelative(layout.text, selectedItem)
    text_x = textPos.x
    text_y = textPos.y

    motifPhysicalInches = getMotifInches(itemName)
    const physW = config.safeZonePhysicalWidthInches

    if (isRowLayout(layout) && motifEntries.length > 0) {
      const xs = calcMotifRowPositions(layout.motifRow.centerX, motifEntries.length, motifPhysicalInches, physW)
      motifs = motifEntries.map((entry, i) => {
        const { x, y } = toCanvasRelative({ x: xs[i], y: layout.motifRow.y }, selectedItem)
        return { icon: entry.emoji, x_percent: x, y_percent: y }
      })
    } else if (isSidenoteLayout(layout) && motifEntries.length > 0) {
      const { x, y } = toCanvasRelative(layout.motif, selectedItem)
      motifs = [{ icon: motifEntries[0].emoji, x_percent: x, y_percent: y }]
    } else {
      motifs = []
    }
  } else {
    // Freeform — positions come from drag state
    const pos = toCanvasRelative(textPosition, selectedItem)
    text_x = pos.x
    text_y = pos.y
    motifPhysicalInches = motifEntries.length > 0 ? getMotifInches(itemName) : 0
    motifs = motifEntries.map(entry => {
      const { x, y } = toCanvasRelative(entry.position, selectedItem)
      return { icon: entry.emoji, x_percent: x, y_percent: y }
    })
  }

  return {
    _customizer_data: {
      item_base:                  itemName,
      text:                       embroideryText,
      font:                       FONT_LABELS[fontStyle] ?? fontStyle,
      thread_color:               textColor,
      size:                       SIZE_LABELS[textSize],
      physical_height_inches:     PHYSICAL_HEIGHT_INCHES[textSize],
      text_x_percent:             text_x,
      text_y_percent:             text_y,
      motif_physical_size_inches: motifPhysicalInches,
      motifs,
    },
  }
}

export async function submitToCart(variantId: number, payload: CartPayload): Promise<void> {
  const d = payload._customizer_data
  const hasCustomization = d.text.length > 0 || d.motifs.length > 0

  const item: Record<string, unknown> = { id: variantId, quantity: 1 }
  if (hasCustomization) {
    item.properties = {
      '_Item':            d.item_base,
      'Text':             d.text,
      'Font':             d.font,
      'Thread Color':     d.thread_color,
      'Size':             d.size,
      ...(d.motifs.length > 0 ? { 'Motifs': d.motifs.map(m => m.icon).join('  ') } : {}),
      '_customizer_data': JSON.stringify(d),
    }
  }

  const body = { items: [item] }

  const res = await fetch('/cart/add.js', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(body.message ?? `Cart error ${res.status}`)
  }

  window.location.href = '/cart'
}
