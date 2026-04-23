/**
 * DevVerifier — coordinate sanity checker for the Shopify cart payload.
 *
 * Only mounted in development (import.meta.env.DEV).  Vite replaces the
 * constant with `false` in production builds, making this a dead-code branch
 * that Rollup's tree-shaker eliminates from the IIFE bundle.
 *
 * Usage:
 *   1. Click "Add to Basket" in the main customizer — the panel opens and
 *      auto-renders the payload on the mini canvas.
 *   2. Or paste any _customizer_data JSON manually into the text area.
 *
 * Verification logic:
 *   x_percent × MINI_W  →  absolute px (x)
 *   y_percent × MINI_H  →  absolute px (y)
 *
 *   If the text lands at the same relative position on the 240×300 mini canvas
 *   as it does in the main 4:5 customizer canvas, the coordinate math is
 *   resolution-independent.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, FabricImage, FabricText, Rect } from 'fabric'
import { PRODUCT_CONFIG, computeSafeZonePx, computePPI } from '@/config/products'
import type { CartPayload, CustomizerData } from '@/lib/cart'

// ── Constants ──────────────────────────────────────────────────────────────────

const MINI_W = 240
const MINI_H = 300   // 4:5 — same aspect ratio as the main canvas

const BRAND_BLUE = '#7594B4'

const FONT_CSS: Record<string, string> = {
  'Cursive Script': 'Caveat, "Brush Script MT", cursive',
  'Classic Serif':  '"Cormorant Garamond", Georgia, serif',
  'Fine Block':     '"Helvetica Neue", Helvetica, Arial, sans-serif',
}


// ── Wrapper (env gate — no hooks called in production) ────────────────────────

export function DevVerifier() {
  if (!import.meta.env.DEV) return null
  return <DevVerifierInner />
}

// ── Inner component ────────────────────────────────────────────────────────────

function DevVerifierInner() {
  const [isOpen,  setIsOpen]  = useState(false)
  const [json,    setJson]    = useState('')
  const [error,   setError]   = useState<string | null>(null)
  const [status,  setStatus]  = useState<string | null>(null)

  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fcRef       = useRef<Canvas | null>(null)

  // ── Init Fabric mini-canvas ────────────────────────────────────────────────
  useEffect(() => {
    const el = canvasElRef.current
    if (!el) return
    const fc = new Canvas(el, {
      width:           MINI_W,
      height:          MINI_H,
      backgroundColor: '#EDE9E3',
      selection:       false,
    })
    fcRef.current = fc
    return () => { fc.dispose(); fcRef.current = null }
  }, [])

  // ── Render a payload onto the mini canvas ──────────────────────────────────
  const renderPayload = useCallback(async (data: CustomizerData) => {
    const fc = fcRef.current
    if (!fc) return

    const config = PRODUCT_CONFIG[data.item_base as keyof typeof PRODUCT_CONFIG]
    if (!config) {
      setError(`Unknown item_base: "${data.item_base}"`)
      return
    }

    fc.clear()
    fc.set('backgroundColor', config.bgColor)
    fc.set('backgroundImage', undefined)

    // Load product image if available (same contain-fit logic as CanvasEditor)
    if (config.bgImage) {
      const img   = await FabricImage.fromURL(config.bgImage, { crossOrigin: 'anonymous' })
      const imgW  = img.width  ?? MINI_W
      const imgH  = img.height ?? MINI_H
      const scale = Math.min(MINI_W / imgW, MINI_H / imgH)
      img.set({
        scaleX: scale, scaleY: scale,
        originX: 'left', originY: 'top',
        left: (MINI_W - imgW * scale) / 2,
        top:  (MINI_H - imgH * scale) / 2,
        selectable: false, evented: false,
      })
      fc.set('backgroundImage', img)
    }

    // Safe zone reference box
    const sz = computeSafeZonePx(MINI_W, MINI_H, config.safeZone)
    fc.add(new Rect({
      left: sz.left, top: sz.top, width: sz.width, height: sz.height,
      originX: 'left', originY: 'top',
      fill:            'rgba(117,148,180,0.06)',
      stroke:          BRAND_BLUE,
      strokeWidth:     1,
      strokeDashArray: [4, 3],
      rx: 2, ry: 2,
      selectable: false, evented: false,
    }))

    // Canvas-relative → absolute pixels on mini canvas
    const px = data.text_x_percent * MINI_W
    const py = data.text_y_percent * MINI_H

    // Red crosshair at text target point
    const CROSS = 8
    fc.add(new Rect({ left: px - CROSS, top: py - 0.5, width: CROSS * 2, height: 1, fill: 'rgba(239,68,68,0.8)', selectable: false, evented: false }))
    fc.add(new Rect({ left: px - 0.5, top: py - CROSS, width: 1, height: CROSS * 2, fill: 'rgba(239,68,68,0.8)', selectable: false, evented: false }))

    // Text — scale to match physical_height_inches using the same PPI formula as CanvasEditor
    const ppi          = computePPI(sz.width, config.safeZonePhysicalWidthInches)
    const targetPx     = data.physical_height_inches * ppi
    const baseFontSize = Math.round(MINI_W * 0.075)
    const textObj = new FabricText(data.text || '—', {
      left:       px,
      top:        py,
      originX:    'center',
      originY:    'center',
      fontSize:   baseFontSize,
      fontFamily: FONT_CSS[data.font] ?? FONT_CSS['Cursive Script'],
      fill:       data.thread_color,
      selectable: false,
      evented:    false,
    })
    const scale = targetPx / (textObj.height || baseFontSize)
    textObj.set({ scaleX: scale, scaleY: scale })
    fc.add(textObj)

    // Motifs — loop over array and render each instance
    if (data.motifs && data.motifs.length > 0 && data.motif_physical_size_inches > 0) {
      const motifPpi = computePPI(sz.width, config.safeZonePhysicalWidthInches)
      const motifTargetPx = data.motif_physical_size_inches * motifPpi
      const motifBase     = Math.round(MINI_W * 0.18)
      for (const motif of data.motifs) {
        const motifX   = motif.x_percent * MINI_W
        const motifY   = motif.y_percent * MINI_H
        const motifObj = new FabricText(motif.icon, {
          left: motifX, top: motifY,
          originX: 'center', originY: 'center',
          fontSize: motifBase,
          selectable: false, evented: false,
        })
        const motifScale = motifTargetPx / (motifObj.height || motifBase)
        motifObj.set({ scaleX: motifScale, scaleY: motifScale })
        fc.add(motifObj)
      }
    }

    fc.renderAll()
    setStatus(`↗ text (${(data.text_x_percent * 100).toFixed(1)}%, ${(data.text_y_percent * 100).toFixed(1)}%) · ${data.motifs?.length ?? 0} motif(s) on ${MINI_W}×${MINI_H}`)
    setError(null)
  }, [])

  // ── Auto-receive payload from submitToCart ─────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const payload = (e as CustomEvent<CartPayload>).detail
      const str = JSON.stringify(payload._customizer_data, null, 2)
      setJson(str)
      setIsOpen(true)
      // Give Fabric a tick to be ready if the panel was just opened
      setTimeout(() => { renderPayload(payload._customizer_data) }, 0)
    }
    window.addEventListener('dami:cart-payload', handler)
    return () => window.removeEventListener('dami:cart-payload', handler)
  }, [renderPayload])

  // ── Manual JSON paste ──────────────────────────────────────────────────────
  const handleJsonChange = (value: string) => {
    setJson(value)
    if (!value.trim()) { setError(null); setStatus(null); return }
    try {
      const parsed = JSON.parse(value) as CustomizerData
      void renderPayload(parsed)
    } catch {
      setError('Invalid JSON — paste the _customizer_data object contents')
      setStatus(null)
    }
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 9999, fontFamily: 'system-ui, sans-serif', fontSize: 13 }}>

      {/* Toggle pill */}
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          position: 'absolute', bottom: '100%', right: 16, marginBottom: 8,
          background: '#1e293b', color: '#94a3b8',
          border: '1px solid #334155', borderRadius: 9999,
          padding: '5px 13px', fontSize: 11, cursor: 'pointer',
          letterSpacing: '0.05em',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}
      >
        🔬 Dev Verify {isOpen ? '▼' : '▲'}
      </button>

      {/* Drawer */}
      <div
        style={{
          width: 580,
          background: '#0f172a',
          borderTop: '1px solid #334155',
          borderLeft: '1px solid #334155',
          borderRadius: '12px 0 0 0',
          display: isOpen ? 'flex' : 'none',
          gap: 16,
          padding: 16,
          boxShadow: '-4px -4px 32px rgba(0,0,0,0.5)',
          alignItems: 'flex-start',
        }}
      >
        {/* Left — JSON textarea */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              _customizer_data
            </span>
            <span style={{ fontSize: 10, color: '#334155' }}>
              click Add to Basket to auto-fill
            </span>
          </div>

          <textarea
            value={json}
            onChange={e => handleJsonChange(e.target.value)}
            placeholder={'{\n  "item_base": "Linen Apron",\n  "x_percent": 0.5,\n  ...\n}'}
            style={{
              height: 220,
              background: '#1e293b', color: '#4ade80',
              border: `1px solid ${error ? '#ef4444' : '#334155'}`,
              borderRadius: 8, padding: '10px',
              fontSize: 11, fontFamily: 'ui-monospace, monospace',
              resize: 'none', outline: 'none', lineHeight: 1.6,
            }}
          />

          {error  && <p style={{ margin: 0, fontSize: 11, color: '#f87171' }}>⚠ {error}</p>}
          {status && !error && <p style={{ margin: 0, fontSize: 11, color: '#4ade80' }}>✓ {status}</p>}

          <p style={{ margin: 0, fontSize: 10, color: '#475569', lineHeight: 1.5 }}>
            Text renders at <code style={{ color: '#7dd3fc' }}>x% × {MINI_W}px</code>,&nbsp;
            <code style={{ color: '#7dd3fc' }}>y% × {MINI_H}px</code>.
            If the position matches the main canvas, coordinates are sound.
          </p>
        </div>

        {/* Right — mini Fabric canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Production renderer
          </span>
          <div style={{ border: '1px solid #334155', borderRadius: 8, overflow: 'hidden' }}>
            <canvas ref={canvasElRef} />
          </div>
          <span style={{ fontSize: 10, color: '#475569' }}>{MINI_W} × {MINI_H} px</span>
        </div>
      </div>
    </div>
  )
}
