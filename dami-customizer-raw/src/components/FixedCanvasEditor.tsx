import { useEffect, useRef } from 'react'
import { Canvas, FabricImage, FabricText, Rect } from 'fabric'
import {
  ITEM_TYPES,
  PRODUCT_CONFIG,
  computeSafeZonePx,
  computePPI,
} from '@/config/products'
import {
  getFixedLayout,
  getMotifInches,
  isRowLayout,
  isSidenoteLayout,
  isSideMotifLayout,
  calcMotifRowPositions,
  type FixedLayoutType,
} from '@/config/fixed-layouts'
import type { TextSize, MotifEntry } from '@/hooks/useCustomizer'

// ── Constants ──────────────────────────────────────────────────────────────────

const FONT_MAP: Record<string, string> = {
  'ballantines': 'Ballantines, cursive',
  'block':       'Block, sans-serif',
  'katelyn':     'Katelyn, cursive',
  'edwardian':   'Edwardian, cursive',
  'chateauneuf': 'Chateauneuf, serif',
  'garamond':    'Garamond, Georgia, serif',
}

const DEFAULT_MOTIF_INCHES = 1.0
const MOTIF_ID_KEY           = '__motifId'
const BRAND_BLUE             = '#7594B4'
const FRAME_STONE            = '#C9B99A'

// ── Types ──────────────────────────────────────────────────────────────────────

interface SafeZonePx { left: number; top: number; width: number; height: number }

export interface FixedCanvasEditorProps {
  embroideryText: string
  textColor:      string
  fontStyle:      string
  textSize:       TextSize
  selectedItem:   number
  canvasImage?:   string
  canvasBgColor?: string
  motifEntries:   MotifEntry[]
  customizerType: string
  colorName?:     string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const FONT_SCALE_MULTIPLIERS: Record<string, number> = {
  'edwardian':   1.2,
  'chateauneuf': 1.2,
  'ballantines': 1.4,
}

// Horizontal nudge in inches (negative = left) applied per font to correct visual centering
const FONT_X_NUDGE_INCHES: Record<string, number> = {
  'edwardian':   -0.5,
  'chateauneuf': -0.5,
}

// Additional nudge for specific product + color combinations (all fonts)
const PRODUCT_COLOR_X_NUDGE: { product: string; color: string; nudgeInches: number }[] = [
  { product: 'Grand Tote', color: 'navy', nudgeInches: -0.2 },
]

function colorXNudgePx(szWidth: number, physicalWidth: number, itemName: string, colorName?: string): number {
  const nudge = PRODUCT_COLOR_X_NUDGE.find(
    r => itemName.toLowerCase().includes(r.product.toLowerCase()) &&
         (colorName ?? '').toLowerCase().includes(r.color.toLowerCase())
  )?.nudgeInches ?? 0
  return nudge * computePPI(szWidth, physicalWidth)
}

function fontXNudgePx(fontStyle: string, textSize: TextSize, szWidth: number, physicalWidth: number, itemName: string, colorName?: string): number {
  const fontNudge = (FONT_X_NUDGE_INCHES[fontStyle] ?? 0) * textSize * computePPI(szWidth, physicalWidth)
  return fontNudge + colorXNudgePx(szWidth, physicalWidth, itemName, colorName)
}

function physicalScale(
  obj: FabricText, textSize: TextSize, fontStyle: string, szPixelWidth: number, physicalWidthInches: number,
): number {
  const ppi        = computePPI(szPixelWidth, physicalWidthInches)
  const multiplier = (FONT_SCALE_MULTIPLIERS[fontStyle] ?? 1) * 1.7
  const targetPx   = textSize * multiplier * ppi
  return targetPx / (obj.height ?? 1)
}

/**
 * Position the text and apply a fixed-anchor max-width clip in one step.
 *
 * For centered text: the clip is a fixed box centered on (anchorX, anchorY)
 * with width = maxTextWidth. When rendered text exceeds maxWidth, the text is
 * shifted rightward by half the overflow so its left edge lands at the box's
 * left bound — short text stays visually centered, long text gets cropped
 * only from the right.
 *
 * For right-anchored text (side-font): the clip's right edge sits at anchorX
 * and extends leftward by maxWidth.
 *
 * The clip is padded by SIDE_BEARING_RATIO * fontSize on each side to keep
 * cursive/italic glyphs (whose strokes extend beyond the geometric bounding
 * box) from being clipped at the edges.
 */
const SIDE_BEARING_RATIO = 0.18

function positionAndClip(
  obj: FabricText, scale: number, anchorX: number, anchorY: number,
  szPixelWidth: number, physicalWidth: number, maxTextWidth: number,
  align: 'center' | 'right' = 'center',
) {
  const ppi         = computePPI(szPixelWidth, physicalWidth)
  const maxWidthPx  = maxTextWidth * ppi
  const tallPx      = (obj.height ?? 100) * scale * 3
  const sideBearing = (obj.fontSize ?? 22) * scale * SIDE_BEARING_RATIO

  if (align === 'right') {
    obj.set({ left: anchorX, top: anchorY })
    obj.clipPath = new Rect({
      left:    anchorX - maxWidthPx - sideBearing,
      top:     anchorY - tallPx / 2,
      width:   maxWidthPx + sideBearing * 2,
      height:  tallPx,
      originX: 'left',
      originY: 'top',
      absolutePositioned: true,
    })
  } else {
    const renderedW = (obj.width ?? 0) * scale
    const xShift    = renderedW > maxWidthPx ? (renderedW - maxWidthPx) / 2 : 0
    obj.set({ left: anchorX + xShift, top: anchorY })
    obj.clipPath = new Rect({
      left:    anchorX - maxWidthPx / 2 - sideBearing,
      top:     anchorY - tallPx / 2,
      width:   maxWidthPx + sideBearing * 2,
      height:  tallPx,
      originX: 'left',
      originY: 'top',
      absolutePositioned: true,
    })
  }
}

async function applyBackground(
  fc: Canvas, config: { bgColor: string; bgImage: string | null }, w: number, h: number,
) {
  fc.set('backgroundColor', config.bgColor)
  const prev = fc.backgroundImage
  if (prev) fc.set('backgroundImage', undefined)
  if (!config.bgImage) { fc.renderAll(); return }
  const img   = await FabricImage.fromURL(config.bgImage, { crossOrigin: 'anonymous' })
  const imgW  = img.width  ?? w
  const imgH  = img.height ?? h
  const scale = Math.min(w / imgW, h / imgH)
  img.set({
    scaleX: scale, scaleY: scale, originX: 'left', originY: 'top',
    left: (w - imgW * scale) / 2, top: (h - imgH * scale) / 2,
    selectable: false, evented: false,
  })
  fc.set('backgroundImage', img)
  fc.renderAll()
}

function drawSafeZone(fc: Canvas, sz: SafeZonePx, w: number, h: number): FabricText[] {
  const border = new Rect({
    left: sz.left, top: sz.top, width: sz.width, height: sz.height,
    originX: 'left', originY: 'top',
    fill: 'rgba(117,148,180,0.04)',
    stroke: BRAND_BLUE,
    strokeWidth:     Math.max(1, w * 0.003),
    strokeDashArray: [Math.round(w * 0.012), Math.round(w * 0.008)],
    rx: 4, ry: 4,
    selectable: false, evented: false,
  })
  const label = new FabricText('Embroidery Safe Zone', {
    left: sz.left + sz.width / 2, top: sz.top - h * 0.04,
    originX: 'center',
    fontSize:   Math.round(w * 0.022),
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fill:       BRAND_BLUE, opacity: 0.6,
    selectable: false, evented: false,
  })
  fc.add(border, label)
  return [label]
}

async function createMotifObj(
  url: string, id: string, absX: number, absY: number,
  szWidth: number, physicalWidthInches: number, motifInches: number,
): Promise<FabricImage> {
  const ppi      = computePPI(szWidth, physicalWidthInches)
  const targetPx = motifInches * ppi
  const m = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
  const naturalSize = Math.max(m.width ?? 1, m.height ?? 1)
  const scale = targetPx / naturalSize
  m.set({
    left: absX, top: absY,
    originX: 'center', originY: 'center',
    scaleX: scale, scaleY: scale,
    selectable: false, evented: false,
    hasControls: false, hasBorders: false,
  })
  ;(m as any)[MOTIF_ID_KEY] = id
  return m
}

// ── Component ──────────────────────────────────────────────────────────────────

export function FixedCanvasEditor({
  embroideryText,
  textColor,
  fontStyle,
  textSize,
  selectedItem,
  canvasImage,
  canvasBgColor,
  motifEntries,
  customizerType,
  colorName,
}: FixedCanvasEditorProps) {
  const wrapperRef       = useRef<HTMLDivElement>(null)
  const canvasRef        = useRef<HTMLCanvasElement>(null)
  const fcRef            = useRef<Canvas | null>(null)
  const textRef          = useRef<FabricText | null>(null)
  const safeZoneRef      = useRef<SafeZonePx>({ left: 0, top: 0, width: 0, height: 0 })
  const motifsMapRef     = useRef<Map<string, FabricImage>>(new Map())
  const canvasSizeRef    = useRef({ w: 400, h: 500 })

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current
    const el      = canvasRef.current
    if (!wrapper || !el) return

    const w = wrapper.clientWidth  || 400
    const h = wrapper.clientHeight || 500
    canvasSizeRef.current = { w, h }

    const itemName = ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]
    const config   = PRODUCT_CONFIG[itemName]
    const sz       = computeSafeZonePx(w, h, config.safeZone)
    safeZoneRef.current = sz

    const fc = new Canvas(el, { width: w, height: h, selection: false })
    fcRef.current = fc

    applyBackground(fc, { bgColor: canvasBgColor || '#F0EBE0', bgImage: canvasImage || null }, w, h)

    if (!canvasImage) fc.add(new Rect({
      left: w * 0.06, top: h * 0.06, originX: 'left', originY: 'top',
      width: w * 0.88, height: h * 0.88,
      fill: 'transparent', stroke: FRAME_STONE,
      strokeWidth: Math.max(1, w * 0.003), rx: w * 0.06, ry: h * 0.04,
      selectable: false, evented: false,
    }))

    fc.renderAll()

    return () => {
      fc.dispose()
      fcRef.current = null; textRef.current = null
      motifsMapRef.current.clear()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Product / background change ────────────────────────────────────────────
  useEffect(() => {
    const fc = fcRef.current
    if (!fc) return
    const { w, h } = canvasSizeRef.current
    const itemName = ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]
    const config   = PRODUCT_CONFIG[itemName]
    applyBackground(fc, { bgColor: canvasBgColor || '#F0EBE0', bgImage: canvasImage || null }, w, h)
    const sz = computeSafeZonePx(w, h, config.safeZone)
    safeZoneRef.current = sz
    fc.renderAll()
  }, [selectedItem])

  useEffect(() => {
    const fc = fcRef.current
    if (!fc) return
    void applyBackground(fc, { bgColor: canvasBgColor || '#F0EBE0', bgImage: canvasImage || null }, ...Object.values(canvasSizeRef.current) as [number, number])
  }, [canvasImage, canvasBgColor])

  // ── Text sync ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fc = fcRef.current
    if (!fc) return

    const isMotifOnly = customizerType === 'side-motif' || customizerType === 'classic-motif'

    if (isMotifOnly || !embroideryText.trim()) {
      if (textRef.current) { fc.remove(textRef.current); textRef.current = null }
      fc.renderAll()
      return
    }

    const sz          = safeZoneRef.current
    const fontFamily  = FONT_MAP[fontStyle] ?? Object.values(FONT_MAP)[0]
    const itemName    = ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]
    const config      = PRODUCT_CONFIG[itemName]
    const layout      = getFixedLayout(itemName, customizerType as FixedLayoutType)
    const textPos     = layout?.text ?? { x: 0.5, y: 0.5 }
    const absX        = sz.left + textPos.x * sz.width + fontXNudgePx(fontStyle, textSize, sz.width, config.physicalWidth, itemName, colorName)
    const absY        = sz.top  + textPos.y * sz.height
    const fontSize    = Math.round(Math.max(22, sz.width * 0.085))
    const primaryFont = fontFamily.split(',')[0].trim()

    const isSideFont = customizerType === 'side-font'
    const originX:   'center' | 'right' = isSideFont ? 'right' : 'center'
    const textAlign: 'center' | 'right' = isSideFont ? 'right' : 'center'
    const clipAlign: 'center' | 'right' = isSideFont ? 'right' : 'center'

    ;(async () => {
      await document.fonts.load(`${fontSize}px "${primaryFont}"`)
      if (!fcRef.current) return

      if (textRef.current) {
        textRef.current.set({ text: embroideryText, fill: textColor, fontFamily, originX, textAlign })
        const scale = physicalScale(textRef.current, textSize, fontStyle, sz.width, config.physicalWidth)
        textRef.current.set({ scaleX: scale, scaleY: scale })
        positionAndClip(textRef.current, scale, absX, absY, sz.width, config.physicalWidth, config.maxTextWidth, clipAlign)
        textRef.current.setCoords()
      } else {
        const t = new FabricText(embroideryText, {
          left: absX, top: absY,
          originX, originY: 'center',
          textAlign,
          fontSize, fontFamily, fill: textColor,
          editable: false, selectable: false, evented: false,
          hasControls: false, hasBorders: false,
        })
        const scale = physicalScale(t, textSize, fontStyle, sz.width, config.physicalWidth)
        t.set({ scaleX: scale, scaleY: scale })
        positionAndClip(t, scale, absX, absY, sz.width, config.physicalWidth, config.maxTextWidth, clipAlign)
        textRef.current = t
        fc.add(t)
      }
      if (textRef.current) fcRef.current.bringObjectToFront(textRef.current)
      fcRef.current.renderAll()
    })()
  }, [embroideryText, textColor, fontStyle, customizerType, selectedItem]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Text size change ───────────────────────────────────────────────────────
  useEffect(() => {
    const fc = fcRef.current
    const t  = textRef.current
    if (!fc || !t) return
    const sz       = safeZoneRef.current
    const itemName = ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]
    const config   = PRODUCT_CONFIG[itemName]
    const layout   = getFixedLayout(itemName, customizerType as FixedLayoutType)
    const textPos  = (layout && 'text' in layout && layout.text) ? layout.text : { x: 0.5, y: 0.5 }
    const absX     = sz.left + textPos.x * sz.width + fontXNudgePx(fontStyle, textSize, sz.width, config.physicalWidth, itemName, colorName)
    const absY     = sz.top  + textPos.y * sz.height
    const scale    = physicalScale(t, textSize, fontStyle, sz.width, config.physicalWidth)
    const clipAlign: 'center' | 'right' = customizerType === 'side-font' ? 'right' : 'center'
    t.set({ scaleX: scale, scaleY: scale })
    positionAndClip(t, scale, absX, absY, sz.width, config.physicalWidth, config.maxTextWidth, clipAlign)
    t.setCoords()
    fc.renderAll()
  }, [textSize, selectedItem]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Motif sync (re-layout all on any change) ───────────────────────────────
  useEffect(() => {
    const fc = fcRef.current
    if (!fc) return

    // Remove all existing motif objects
    motifsMapRef.current.forEach(obj => fc.remove(obj))
    motifsMapRef.current.clear()

    if (motifEntries.length === 0) { fc.renderAll(); return }

    const sz          = safeZoneRef.current
    const itemName    = ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]
    const config      = PRODUCT_CONFIG[itemName]
    const layout      = getFixedLayout(itemName, customizerType as FixedLayoutType)
    if (!layout) { fc.renderAll(); return }

    const rowSpacingInches = getMotifInches(itemName) ?? DEFAULT_MOTIF_INCHES
    const tasks: Promise<void>[] = []
    motifEntries.forEach((entry, index) => {
      let absX: number, absY: number

      const xNudge = colorXNudgePx(sz.width, config.physicalWidth, itemName, colorName)
      if (isRowLayout(layout)) {
        const xs = calcMotifRowPositions(layout.motifRow.centerX, motifEntries.length, rowSpacingInches, config.physicalWidth)
        absX = sz.left + xs[index] * sz.width + xNudge
        absY = sz.top  + layout.motifRow.y * sz.height
      } else if (isSidenoteLayout(layout)) {
        if (index > 0) return
        absX = sz.left + layout.motif.x * sz.width + xNudge
        absY = sz.top  + layout.motif.y * sz.height
      } else if (isSideMotifLayout(layout)) {
        if (index > 0) return
        absX = sz.left + layout.motif.x * sz.width + xNudge
        absY = sz.top  + layout.motif.y * sz.height
      } else {
        return
      }

      const renderInches = isSideMotifLayout(layout) ? Math.min(entry.widthInches, 1.5) : entry.widthInches
      tasks.push(
        createMotifObj(entry.url, entry.id, absX, absY, sz.width, config.physicalWidth, renderInches)
          .then(m => {
            if (!fcRef.current) return
            motifsMapRef.current.set(entry.id, m)
            fc.add(m)
            fc.bringObjectToFront(m)
          })
      )
    })

    void Promise.all(tasks).then(() => {
      if (!fcRef.current) return
      if (textRef.current) fc.bringObjectToFront(textRef.current)
      fc.renderAll()
    })
  }, [motifEntries, selectedItem, customizerType]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div
        ref={wrapperRef}
        className="relative aspect-[4/5] w-full max-w-full overflow-hidden shadow-xl"
      >
        <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%' }} />
      </div>
      <p style={{ fontSize: '1rem', color: 'var(--foreground)', marginTop: '0.5rem', lineHeight: '1.5' }}>
        Motif positioning is a guide only; exact placement may shift slightly to suit the item's shape and embroidery hoop constraints.
      </p>
    </>
  )
}
