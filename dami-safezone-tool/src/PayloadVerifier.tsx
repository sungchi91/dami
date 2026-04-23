import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, FabricImage, FabricText, Rect } from 'fabric'
import { PRESETS } from './presets'

const MINI_W = 300
const MINI_H = 375  // 4:5

const FONT_CSS: Record<string, string> = {
  'Cursive Script': 'Caveat, "Brush Script MT", cursive',
  'Classic Serif':  '"Cormorant Garamond", Georgia, serif',
  'Fine Block':     '"Helvetica Neue", Helvetica, Arial, sans-serif',
}

interface CustomizerData {
  item_base:                  string
  text:                       string
  font:                       string
  thread_color:               string
  size:                       string
  physical_height_inches:     number
  text_x_percent:             number
  text_y_percent:             number
  motif_physical_size_inches: number
  motifs: { icon: string; x_percent: number; y_percent: number }[]
}

function computeSafeZonePx(w: number, h: number, p: { widthRatio: number; heightRatio: number; offsetX: number; offsetY: number }) {
  const szW = w * p.widthRatio
  const szH = h * p.heightRatio
  const cx  = w / 2 + w * p.offsetX
  const cy  = h / 2 + h * p.offsetY
  return { left: cx - szW / 2, top: cy - szH / 2, width: szW, height: szH }
}

function computePPI(safeZonePixelWidth: number, physicalWidthInches: number) {
  return safeZonePixelWidth / physicalWidthInches
}

export default function PayloadVerifier() {
  const [json,   setJson]   = useState('')
  const [error,  setError]  = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fcRef       = useRef<Canvas | null>(null)

  useEffect(() => {
    const el = canvasElRef.current
    if (!el) return
    const fc = new Canvas(el, { width: MINI_W, height: MINI_H, backgroundColor: '#EDE9E3', selection: false })
    fcRef.current = fc
    return () => { fc.dispose(); fcRef.current = null }
  }, [])

  const renderPayload = useCallback(async (data: CustomizerData) => {
    const fc = fcRef.current
    if (!fc) return

    const preset = PRESETS.find(p => p.name === data.item_base)
    if (!preset) {
      setError(`Unknown item_base: "${data.item_base}"`)
      return
    }

    fc.clear()
    fc.set('backgroundColor', preset.bgColor)
    fc.set('backgroundImage', undefined as never)

    if (preset.bgImage) {
      const img   = await FabricImage.fromURL(preset.bgImage, { crossOrigin: 'anonymous' })
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

    const sz = computeSafeZonePx(MINI_W, MINI_H, preset)
    fc.add(new Rect({
      left: sz.left, top: sz.top, width: sz.width, height: sz.height,
      originX: 'left', originY: 'top',
      fill: 'rgba(117,148,180,0.06)', stroke: '#7594B4', strokeWidth: 1,
      strokeDashArray: [4, 3], rx: 2, ry: 2,
      selectable: false, evented: false,
    }))

    const px = data.text_x_percent * MINI_W
    const py = data.text_y_percent * MINI_H

    // Crosshair at text anchor
    const C = 8
    fc.add(new Rect({ left: px - C, top: py - 0.5, width: C * 2, height: 1, fill: 'rgba(239,68,68,0.8)', selectable: false, evented: false }))
    fc.add(new Rect({ left: px - 0.5, top: py - C, width: 1, height: C * 2, fill: 'rgba(239,68,68,0.8)', selectable: false, evented: false }))

    const ppi        = computePPI(sz.width, preset.physicalWidthInches)
    const targetPx   = data.physical_height_inches * ppi
    const baseFont   = Math.round(MINI_W * 0.075)
    const fontFamily = FONT_CSS[data.font] ?? FONT_CSS['Cursive Script']
    await document.fonts.load(`${baseFont}px ${fontFamily.split(',')[0].trim()}`)
    const textObj    = new FabricText(data.text || '—', {
      left: px, top: py, originX: 'center', originY: 'center',
      fontSize: baseFont,
      fontFamily: fontFamily,
      fill: data.thread_color,
      selectable: false, evented: false,
    })
    const textScale = targetPx / (textObj.height || baseFont)
    textObj.set({ scaleX: textScale, scaleY: textScale })
    fc.add(textObj)

    if (data.motifs?.length > 0 && data.motif_physical_size_inches > 0) {
      const motifPPI      = computePPI(sz.width, preset.physicalWidthInches)
      const motifTargetPx = data.motif_physical_size_inches * motifPPI
      const motifBase     = Math.round(MINI_W * 0.18)
      for (const motif of data.motifs) {
        const mx  = motif.x_percent * MINI_W
        const my  = motif.y_percent * MINI_H
        const obj = new FabricText(motif.icon, {
          left: mx, top: my, originX: 'center', originY: 'center',
          fontSize: motifBase, selectable: false, evented: false,
        })
        obj.set({ scaleX: motifTargetPx / (obj.height || motifBase), scaleY: motifTargetPx / (obj.height || motifBase) })
        fc.add(obj)
      }
    }

    fc.renderAll()
    setStatus(`"${data.text}" · ${data.font} · ${data.size} · ${data.motifs?.length ?? 0} motif(s)`)
    setError(null)
  }, [])

  const handleChange = (value: string) => {
    setJson(value)
    if (!value.trim()) { setError(null); setStatus(null); return }
    try {
      const parsed = JSON.parse(value) as CustomizerData
      void renderPayload(parsed)
    } catch {
      setError('Invalid JSON — paste the _customizer_data object')
      setStatus(null)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

      {/* Left — JSON input */}
      <div style={{ flex: '1 1 320px', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
            Paste <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>_customizer_data</code> JSON
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
            From the order sheet, or run in your browser console on the cart page:
          </p>
          <pre style={{ margin: '0.5rem 0 0', background: '#0f172a', color: '#7dd3fc', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.7rem', overflowX: 'auto' }}>
{`fetch('/cart.js')
  .then(r=>r.json())
  .then(d=>console.log(
    d.items[0].properties._customizer_data
  ))`}
          </pre>
        </div>

        <textarea
          value={json}
          onChange={e => handleChange(e.target.value)}
          placeholder={'{\n  "item_base": "The Promenade Crossbody",\n  "text": "AMY",\n  ...\n}'}
          spellCheck={false}
          style={{
            height: 280,
            background: '#1e293b', color: '#4ade80',
            border: `1px solid ${error ? '#ef4444' : '#334155'}`,
            borderRadius: 8, padding: '10px',
            fontSize: '0.7rem', fontFamily: 'ui-monospace, monospace',
            resize: 'vertical', outline: 'none', lineHeight: 1.6,
          }}
        />

        {error  && <p style={{ margin: 0, fontSize: '0.75rem', color: '#ef4444' }}>⚠ {error}</p>}
        {status && !error && <p style={{ margin: 0, fontSize: '0.75rem', color: '#16a34a' }}>✓ {status}</p>}
      </div>

      {/* Right — canvas preview */}
      <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Preview</p>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <canvas ref={canvasElRef} />
        </div>
        <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>{MINI_W} × {MINI_H} px · 4:5</p>
      </div>

    </div>
  )
}
