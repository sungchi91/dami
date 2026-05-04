/**
 * CanvasEditor — Fabric.js embroidery preview canvas.
 *
 * Coordinate contract (PRD §3):
 *   All positions reported via onPositionChange are *relative percentages*
 *   (0.0–1.0) of the safe-zone bounding box, measured from its top-left corner
 *   to the center of the text object. (0.5, 0.5) = dead center of safe zone.
 *
 * Safe zone geometry is driven by PRODUCT_CONFIG so each product shows the
 * correct embroidery area, correctly centered on its background.
 */

import { useEffect, useRef } from 'react'
import {
  Canvas,
  FabricImage,
  FabricText,
  IText,
  Rect,
  type FabricObject,
} from 'fabric'
import {
  ITEM_TYPES,
  PRODUCT_CONFIG,
  computeSafeZonePx,
  computePPI,
  type SafeZoneConfig,
} from '@/config/products'
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

// Physical embroidery height targets in inches: S=1", M=1.5", L=2"
const PHYSICAL_HEIGHT_INCHES: Record<TextSize, number> = { S: 1, M: 1.5, L: 2 }

const MOTIF_PHYSICAL_INCHES = 2.0
const MOTIF_ID_KEY           = '__motifId'
const BRAND_BLUE             = '#7594B4'
const FRAME_STONE            = '#C9B99A'

/**
 * Compute the uniform scale needed to render text at a physically accurate height.
 */
function physicalScale(
  obj:                FabricObject,
  textSize:           TextSize,
  szPixelWidth:       number,
  physicalWidthInches: number,
): number {
  const ppi      = computePPI(szPixelWidth, physicalWidthInches)
  const targetPx = PHYSICAL_HEIGHT_INCHES[textSize] * ppi
  return targetPx / (obj.height ?? 1)
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface SafeZonePx {
  left:   number
  top:    number
  width:  number
  height: number
}

export interface CanvasEditorProps {
  embroideryText:        string
  textColor:             string
  fontStyle:             string
  textSize:              TextSize
  selectedItem:          number
  canvasImage?:          string
  canvasBgColor?:        string
  onPositionChange:      (pos: { x: number; y: number }) => void
  motifEntries:          MotifEntry[]
  onMotifPositionChange: (id: string, pos: { x: number; y: number }) => void
  onRemoveMotif:         (id: string) => void
  customizerType?:       string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Clamp text obj within safe zone and report safe-zone-relative position.
 * Uses scaled dimensions directly to avoid stale getBoundingRect() values mid-drag.
 */
function constrainToSafeZone(
  obj:   FabricObject,
  sz:    SafeZonePx,
  cbRef: { current: (pos: { x: number; y: number }) => void },
) {
  const halfW = ((obj.width  ?? 0) * (obj.scaleX ?? 1)) / 2
  const halfH = ((obj.height ?? 0) * (obj.scaleY ?? 1)) / 2
  const left  = Math.max(sz.left + halfW,        Math.min(sz.left + sz.width  - halfW, obj.left ?? 0))
  const top   = Math.max(sz.top  + halfH,        Math.min(sz.top  + sz.height - halfH, obj.top  ?? 0))
  obj.set({ left, top })
  obj.setCoords()
  cbRef.current({
    x: Math.max(0, Math.min(1, (left - sz.left) / sz.width)),
    y: Math.max(0, Math.min(1, (top  - sz.top)  / sz.height)),
  })
}

/** Same clamp for motifs — reports back with the motif's id. */
function constrainMotifToSafeZone(
  obj:   FabricObject,
  sz:    SafeZonePx,
  id:    string,
  cbRef: { current: (id: string, pos: { x: number; y: number }) => void },
) {
  const halfW = ((obj.width  ?? 0) * (obj.scaleX ?? 1)) / 2
  const halfH = ((obj.height ?? 0) * (obj.scaleY ?? 1)) / 2
  const left  = Math.max(sz.left + halfW,        Math.min(sz.left + sz.width  - halfW, obj.left ?? 0))
  const top   = Math.max(sz.top  + halfH,        Math.min(sz.top  + sz.height - halfH, obj.top  ?? 0))
  obj.set({ left, top })
  obj.setCoords()
  cbRef.current(id, {
    x: Math.max(0, Math.min(1, (left - sz.left) / sz.width)),
    y: Math.max(0, Math.min(1, (top  - sz.top)  / sz.height)),
  })
}

/** Draw the dashed safe-zone frame and corner brackets, return the objects added. */
function drawSafeZoneObjects(
  fc:  Canvas,
  sz:  SafeZonePx,
  w:   number,
  h:   number,
): FabricObject[] {
  const added: FabricObject[] = []

  const fill = new Rect({
    left: sz.left, top: sz.top, width: sz.width, height: sz.height,
    originX: 'left', originY: 'top',
    fill: 'rgba(117,148,180,0.04)', selectable: false, evented: false,
  })
  fc.add(fill)
  added.push(fill)

  const border = new Rect({
    left: sz.left, top: sz.top, width: sz.width, height: sz.height,
    originX: 'left', originY: 'top',
    fill: 'transparent',
    stroke: BRAND_BLUE,
    strokeWidth:     Math.max(1, w * 0.003),
    strokeDashArray: [Math.round(w * 0.012), Math.round(w * 0.008)],
    rx: 4, ry: 4,
    selectable: false, evented: false,
  })
  fc.add(border)
  added.push(border)

  const arm = Math.round(w * 0.04)
  const sw  = Math.max(1.5, w * 0.005)
  const corners: [number, number][] = [
    [sz.left,            sz.top],
    [sz.left + sz.width, sz.top],
    [sz.left,            sz.top + sz.height],
    [sz.left + sz.width, sz.top + sz.height],
  ]
  const signs: [number, number][] = [[1,1],[-1,1],[1,-1],[-1,-1]]

  corners.forEach(([cx, cy], i) => {
    const [sx, sy] = signs[i]
    const hArm = new Rect({
      left: cx, top: cy,
      originX: sx === 1 ? 'left' : 'right',
      originY: 'center',
      width: arm, height: sw,
      fill: BRAND_BLUE, opacity: 0.6, selectable: false, evented: false,
    })
    const vArm = new Rect({
      left: cx, top: cy,
      originX: 'center',
      originY: sy === 1 ? 'top' : 'bottom',
      width: sw, height: arm,
      fill: BRAND_BLUE, opacity: 0.6, selectable: false, evented: false,
    })
    fc.add(hArm, vArm)
    added.push(hArm, vArm)
  })

  const label = new FabricText('Embroidery Safe Zone', {
    left: sz.left + sz.width / 2,
    top:  sz.top  - h * 0.04,
    originX:    'center',
    fontSize:   Math.round(w * 0.022),
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fill:       BRAND_BLUE,
    opacity:    0.65,
    selectable: false, evented: false,
  })
  fc.add(label)
  added.push(label)

  return added
}

/**
 * Load bgImage as a contain-fitted background on the canvas.
 * Falls back to plain bgColor when bgImage is null.
 */
async function applyBackground(
  fc:     Canvas,
  config: { bgColor: string; bgImage: string | null },
  w:      number,
  h:      number,
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
    scaleX: scale, scaleY: scale,
    originX: 'left', originY: 'top',
    left:       (w - imgW * scale) / 2,
    top:        (h - imgH * scale) / 2,
    selectable: false, evented: false,
  })
  fc.set('backgroundImage', img)
  fc.renderAll()
}

/** Create a motif FabricText object for an emoji entry at absolute pixel coords. */
function createMotifObject(
  emoji:    string,
  id:       string,
  absX:     number,
  absY:     number,
  szWidth:  number,
  physicalWidthInches: number,
): FabricText {
  const ppi        = computePPI(szWidth, physicalWidthInches)
  const targetPx   = MOTIF_PHYSICAL_INCHES * ppi
  const base       = Math.round(szWidth * 0.18)
  const m = new FabricText(emoji, {
    left:         absX,
    top:          absY,
    originX:      'center',
    originY:      'center',
    fontSize:     base,
    editable:     false,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    hasControls:  false,
    hasBorders:   true,
    borderColor:  BRAND_BLUE,
    padding:      6,
    hoverCursor:  'move',
    moveCursor:   'grabbing',
  })
  const scale = targetPx / (m.height || base)
  m.set({ scaleX: scale, scaleY: scale })
  ;(m as any)[MOTIF_ID_KEY] = id
  return m
}

// ── Component ──────────────────────────────────────────────────────────────────

export function CanvasEditor({
  embroideryText,
  textColor,
  fontStyle,
  textSize,
  selectedItem,
  canvasImage,
  canvasBgColor,
  onPositionChange,
  motifEntries,
  onMotifPositionChange,
  onRemoveMotif,
}: CanvasEditorProps) {
  const wrapperRef            = useRef<HTMLDivElement>(null)
  const canvasRef             = useRef<HTMLCanvasElement>(null)
  const fcRef                 = useRef<Canvas | null>(null)
  const textRef               = useRef<IText | null>(null)
  const safeZoneRef           = useRef<SafeZonePx>({ left: 0, top: 0, width: 0, height: 0 })
  const szObjectsRef          = useRef<FabricObject[]>([])
  const motifsMapRef          = useRef<Map<string, FabricText>>(new Map())
  const prevSelectedItemRef   = useRef(selectedItem)
  const onChangeCb            = useRef(onPositionChange)
  const onMotifPositionChangeCb = useRef(onMotifPositionChange)
  const onRemoveCb            = useRef(onRemoveMotif)
  const canvasSizeRef         = useRef({ w: 400, h: 500 })

  useEffect(() => { onChangeCb.current              = onPositionChange })
  useEffect(() => { onMotifPositionChangeCb.current  = onMotifPositionChange })
  useEffect(() => { onRemoveCb.current               = onRemoveMotif })

  // ── Canvas initialisation (mount only) ────────────────────────────────────
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
      left: w * 0.06, top: h * 0.06,
      originX: 'left', originY: 'top',
      width: w * 0.88, height: h * 0.88,
      fill: 'transparent',
      stroke: FRAME_STONE,
      strokeWidth: Math.max(1, w * 0.003),
      rx: w * 0.06, ry: h * 0.04,
      selectable: false, evented: false,
    }))

    szObjectsRef.current = drawSafeZoneObjects(fc, sz, w, h)



    fc.renderAll()

    fc.on('object:moving', (e) => {
      if (!e.target) return
      const motifId = (e.target as any)[MOTIF_ID_KEY] as string | undefined
      if (motifId) {
        constrainMotifToSafeZone(e.target, safeZoneRef.current, motifId, onMotifPositionChangeCb)
      } else {
        constrainToSafeZone(e.target, safeZoneRef.current, onChangeCb)
      }
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      const canvas = fcRef.current
      if (!canvas) return
      const active = canvas.getActiveObject()
      if (!active) return
      const motifId = (active as any)[MOTIF_ID_KEY] as string | undefined
      if (motifId) onRemoveCb.current(motifId)
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      fc.dispose()
      fcRef.current          = null
      textRef.current        = null
      szObjectsRef.current   = []
      motifsMapRef.current.clear()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Safe zone + background redraws when product changes ───────────────────
  useEffect(() => {
    const fc = fcRef.current
    if (!fc) return

    const { w, h } = canvasSizeRef.current
    const itemName = ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]
    const config   = PRODUCT_CONFIG[itemName]

    applyBackground(fc, { bgColor: canvasBgColor || '#F0EBE0', bgImage: canvasImage || null }, w, h)

    szObjectsRef.current.forEach((obj) => fc.remove(obj))
    const sz = computeSafeZonePx(w, h, config.safeZone)
    safeZoneRef.current = sz
    szObjectsRef.current = drawSafeZoneObjects(fc, sz, w, h)

    const t = textRef.current
    if (t) {
      t.set({ left: sz.left + sz.width / 2, top: sz.top + sz.height / 2 })
      t.setCoords()
      fc.bringObjectToFront(t)
    }

    if (ph) fc.bringObjectToFront(ph)
    fc.renderAll()
  }, [selectedItem])

  // ── Background swap when selected color changes ────────────────────────────
  useEffect(() => {
    const fc = fcRef.current
    if (!fc) return
    const { w, h } = canvasSizeRef.current
    void applyBackground(fc, { bgColor: canvasBgColor || '#F0EBE0', bgImage: canvasImage || null }, w, h)
  }, [canvasImage, canvasBgColor])

  // ── Motif reconciliation: syncs motifEntries → Fabric objects ─────────────
  useEffect(() => {
    const fc = fcRef.current
    if (!fc) return

    const sz       = safeZoneRef.current
    const itemName = ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]
    const config   = PRODUCT_CONFIG[itemName]

    // When product changes, clear all existing Fabric motif objects so they
    // respawn at positions mapped to the new safe zone.
    const itemChanged = prevSelectedItemRef.current !== selectedItem
    prevSelectedItemRef.current = selectedItem
    if (itemChanged) {
      motifsMapRef.current.forEach(obj => fc.remove(obj))
      motifsMapRef.current.clear()
    }

    // Remove Fabric objects for entries that were deleted from React state
    const entryIds = new Set(motifEntries.map(e => e.id))
    motifsMapRef.current.forEach((obj, id) => {
      if (!entryIds.has(id)) {
        fc.remove(obj)
        motifsMapRef.current.delete(id)
      }
    })

    // Add Fabric objects for entries that don't yet have one
    for (const entry of motifEntries) {
      if (motifsMapRef.current.has(entry.id)) continue

      const absX = sz.left + entry.position.x * sz.width
      const absY = sz.top  + entry.position.y * sz.height
      const m    = createMotifObject(
        entry.emoji, entry.id, absX, absY,
        sz.width, config.safeZonePhysicalWidthInches,
      )
      motifsMapRef.current.set(entry.id, m)
      fc.add(m)
      fc.bringObjectToFront(m)
    }

    fc.renderAll()
  }, [motifEntries, selectedItem])

  // ── Sync text content, color, and font ───────────────────────────────────
  useEffect(() => {
    const fc          = fcRef.current
    if (!fc) return

    if (!embroideryText.trim()) {
      if (textRef.current) {
        fc.remove(textRef.current)
        textRef.current = null
        fc.discardActiveObject()
      }
      fc.renderAll()
      return
    }

    const sz         = safeZoneRef.current
    const fontFamily = FONT_MAP[fontStyle] ?? Object.values(FONT_MAP)[0]
    const config     = PRODUCT_CONFIG[ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]]
    const fontSize   = Math.round(Math.max(22, sz.width * 0.085))
    const primaryFont = fontFamily.split(',')[0].trim()

    ;(async () => {
      await document.fonts.load(`${fontSize}px "${primaryFont}"`)
      if (!fcRef.current) return

      if (textRef.current) {
        textRef.current.set({ text: embroideryText, fill: textColor, fontFamily })
        textRef.current.setCoords()
      } else {
        const t = new IText(embroideryText, {
          left:         sz.left + sz.width  / 2,
          top:          sz.top  + sz.height / 2,
          originX:      'center',
          originY:      'center',
          fontSize,
          fontFamily,
          fill:         textColor,
          editable:     false,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          hasControls:  false,
          hasBorders:   true,
          borderColor:  BRAND_BLUE,
          cornerColor:  BRAND_BLUE,
          padding:      8,
          hoverCursor:  'move',
          moveCursor:   'grabbing',
        })
        const scale = physicalScale(t, textSize, sz.width, config.safeZonePhysicalWidthInches)
        t.set({ scaleX: scale, scaleY: scale })
        textRef.current = t
        fc.add(t)
        fc.setActiveObject(t)
        onChangeCb.current({ x: 0.5, y: 0.5 })
      }

      fc.renderAll()
    })()
  }, [embroideryText, textColor, fontStyle]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Apply physical size when textSize changes ─────────────────────────────
  useEffect(() => {
    const fc = fcRef.current
    const t  = textRef.current
    if (!fc || !t) return

    const sz     = safeZoneRef.current
    const config = PRODUCT_CONFIG[ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]]
    const scale  = physicalScale(t, textSize, sz.width, config.safeZonePhysicalWidthInches)
    t.set({ scaleX: scale, scaleY: scale })
    t.setCoords()
    constrainToSafeZone(t, safeZoneRef.current, onChangeCb)
    fc.renderAll()
  }, [textSize, selectedItem])

  return (
    <div
      ref={wrapperRef}
      className="relative aspect-[4/5] w-full max-w-full overflow-hidden shadow-xl"
    >
      <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%' }} />
    </div>
  )
}
