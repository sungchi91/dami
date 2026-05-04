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
  calcMotifRowPositions,
  type FixedLayoutType,
} from '@/config/fixed-layouts'
import type { TextSize, MotifEntry } from '@/hooks/useCustomizer'

// ── Constants ──────────────────────────────────────────────────────────────────

const FONT_MAP: Record<string, string> = {
  cursive: 'Caveat, "Brush Script MT", cursive',
  serif:   '"Cormorant Garamond", Georgia, serif',
  block:   '"Helvetica Neue", Helvetica, Arial, sans-serif',
}

const PHYSICAL_HEIGHT_INCHES: Record<TextSize, number> = { S: 1, M: 1.5, L: 2 }
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
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function physicalScale(
  obj: FabricText, textSize: TextSize, szPixelWidth: number, physicalWidthInches: number,
): number {
  const ppi      = computePPI(szPixelWidth, physicalWidthInches)
  const targetPx = PHYSICAL_HEIGHT_INCHES[textSize] * ppi
  return targetPx / (obj.height ?? 1)
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

function createMotifObj(
  emoji: string, id: string, absX: number, absY: number,
  szWidth: number, physicalWidthInches: number, motifInches: number,
): FabricText {
  const ppi      = computePPI(szWidth, physicalWidthInches)
  const targetPx = motifInches * ppi
  const base     = Math.round(szWidth * 0.18)
  const m = new FabricText(emoji, {
    left: absX, top: absY,
    originX: 'center', originY: 'center',
    fontSize: base,
    editable: false, selectable: false, evented: false,
    hasControls: false, hasBorders: false,
  })
  m.set({ scaleX: targetPx / (m.height || base), scaleY: targetPx / (m.height || base) })
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
}: FixedCanvasEditorProps) {
  const wrapperRef       = useRef<HTMLDivElement>(null)
  const canvasRef        = useRef<HTMLCanvasElement>(null)
  const fcRef            = useRef<Canvas | null>(null)
  const textRef          = useRef<FabricText | null>(null)
  const safeZoneRef      = useRef<SafeZonePx>({ left: 0, top: 0, width: 0, height: 0 })
  const motifsMapRef     = useRef<Map<string, FabricText>>(new Map())
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

    if (!embroideryText.trim()) {
      if (textRef.current) { fc.remove(textRef.current); textRef.current = null }
      fc.renderAll()
      return
    }

    const sz = safeZoneRef.current
    const fontFamily = FONT_MAP[fontStyle] ?? FONT_MAP.cursive
    const itemName   = ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]
    const config     = PRODUCT_CONFIG[itemName]
    const layout     = getFixedLayout(itemName, customizerType as FixedLayoutType)
    const textPos    = layout?.text ?? { x: 0.5, y: 0.5 }
    const absX       = sz.left + textPos.x * sz.width
    const absY       = sz.top  + textPos.y * sz.height

    if (textRef.current) {
      textRef.current.set({ text: embroideryText, fill: textColor, fontFamily, left: absX, top: absY })
      textRef.current.setCoords()
    } else {
      const fontSize = Math.round(Math.max(22, sz.width * 0.085))
      const t = new FabricText(embroideryText, {
        left: absX, top: absY,
        originX: 'center', originY: 'center',
        fontSize, fontFamily, fill: textColor,
        editable: false, selectable: false, evented: false,
        hasControls: false, hasBorders: false,
      })
      const scale = physicalScale(t, textSize, sz.width, config.safeZonePhysicalWidthInches)
      t.set({ scaleX: scale, scaleY: scale })
      textRef.current = t
      fc.add(t)
    }
    if (textRef.current) fc.bringObjectToFront(textRef.current)
    fc.renderAll()
  }, [embroideryText, textColor, fontStyle, customizerType, selectedItem]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Text size change ───────────────────────────────────────────────────────
  useEffect(() => {
    const fc = fcRef.current
    const t  = textRef.current
    if (!fc || !t) return
    const sz     = safeZoneRef.current
    const config = PRODUCT_CONFIG[ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]]
    const scale  = physicalScale(t, textSize, sz.width, config.safeZonePhysicalWidthInches)
    t.set({ scaleX: scale, scaleY: scale })
    t.setCoords()
    fc.renderAll()
  }, [textSize, selectedItem])

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
    const motifInches = getMotifInches(itemName) ?? DEFAULT_MOTIF_INCHES
    if (!layout) { fc.renderAll(); return }

    motifEntries.forEach((entry, index) => {
      let absX: number, absY: number

      if (isRowLayout(layout)) {
        const xs = calcMotifRowPositions(layout.motifRow.centerX, motifEntries.length, motifInches, config.safeZonePhysicalWidthInches)
        absX = sz.left + xs[index] * sz.width
        absY = sz.top  + layout.motifRow.y * sz.height
      } else if (isSidenoteLayout(layout)) {
        if (index > 0) return
        absX = sz.left + layout.motif.x * sz.width
        absY = sz.top  + layout.motif.y * sz.height
      } else {
        return
      }

      const m = createMotifObj(
        entry.emoji, entry.id, absX, absY,
        sz.width, config.safeZonePhysicalWidthInches, motifInches,
      )
      motifsMapRef.current.set(entry.id, m)
      fc.add(m)
      fc.bringObjectToFront(m)
    })

    if (textRef.current) fc.bringObjectToFront(textRef.current)
    fc.renderAll()
  }, [motifEntries, selectedItem, customizerType]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={wrapperRef}
      className="relative aspect-[4/5] w-full max-w-full overflow-hidden shadow-xl"
    >
      <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%' }} />
    </div>
  )
}
