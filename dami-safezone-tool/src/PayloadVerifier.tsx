import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas, FabricImage, FabricText, Rect } from 'fabric'
import { PRESETS } from './presets'

const MINI_W = 560
const MINI_H = 700  // 4:5

const THREAD_COLORS: Record<string, string> = {
  'Black':             '#000000',
  'Navy':              '#02283A',
  'Cream':             '#FFFFFF',
  'Umber':             '#827C55',
  'Pecan':             '#AA8C66',
  'Beige':             '#C3C3A7',
  'Mahogany':          '#5C2B1E',
  'Fawn':              '#CCB499',
  'Sunflower':         '#FFC72E',
  'Mustard':           '#CDCF3A',
  'Canary Yellow':     '#F9EE1F',
  'Linen':             '#FFFFF0',
  'Olive Green':       '#2D4828',
  'Enchanting Forest': '#183823',
  'Green':             '#167645',
  'Ocean Blue':        '#476E87',
  'Baby Blue':         '#86B3CF',
  'Pale Sky':          '#9FB5D6',
  'Blue Ink':          '#0B1B6D',
  'Winterberry':       '#811825',
  'Riored':            '#9A1019',
  'Pale Pink':         '#FFCCD5',
  'Country Red':       '#B80605',
  'Poinsettia':        '#CC0000',
}

const FONT_CSS: Record<string, string> = {
  'Bold Script':    'Ballantines, "Brush Script MT", cursive',
  'Playful Script': 'Katelyn, Caveat, cursive',
  'Elegant Script': 'Edwardian, "Brush Script MT", cursive',
  'Delicate Script':'Chateauneuf, Caveat, cursive',
  'Classic Serif':  'Garamond, "Cormorant Garamond", Georgia, serif',
  'Modern Block':   'Block, "Helvetica Neue", Helvetica, Arial, sans-serif',
}

// Must match FONT_SCALE_MULTIPLIERS in CanvasEditor / FixedCanvasEditor × 1.7 global
const FONT_SIZE_MULTIPLIERS: Record<string, number> = {
  'Elegant Script':  1.2 * 1.7,
  'Delicate Script': 1.2 * 1.7,
  'Bold Script':     1.4 * 1.7,
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
  text_align?:                'center' | 'right'
  text_max_width_inches?:     number
  motif_physical_size_inches: number
  motifs: { icon: string; url?: string; x_percent: number; y_percent: number; width_inches?: number }[]
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

    const lower  = data.item_base.toLowerCase()
    const preset = PRESETS.find(p =>
      lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lower)
    )
    if (!preset) {
      setError(`Unknown item_base: "${data.item_base}" — valid names: ${PRESETS.map(p => p.name).join(', ')}`)
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
    const multiplier = FONT_SIZE_MULTIPLIERS[data.font] ?? 1.7
    const targetPx   = data.physical_height_inches * multiplier * ppi
    const baseFont   = Math.round(MINI_W * 0.075)
    const fontFamily = FONT_CSS[data.font] ?? FONT_CSS['Bold Script']
    const textAlign  = data.text_align ?? 'center'
    const originX    = textAlign === 'right' ? 'right' : 'center'
    await document.fonts.load(`${baseFont}px ${fontFamily.split(',')[0].trim()}`)
    const textObj    = new FabricText(data.text || '—', {
      left: px, top: py, originX, originY: 'center',
      textAlign,
      fontSize: baseFont,
      fontFamily: fontFamily,
      fill: THREAD_COLORS[data.thread_color] ?? data.thread_color,
      selectable: false, evented: false,
    })
    const textScale = targetPx / (textObj.height || baseFont)
    textObj.set({ scaleX: textScale, scaleY: textScale })
    fc.add(textObj)

    if (data.motifs?.length > 0) {
      const motifPPI = computePPI(sz.width, preset.physicalWidthInches)
      for (const motif of data.motifs) {
        const sizeInches  = motif.width_inches ?? data.motif_physical_size_inches
        const motifTargetPx = sizeInches * motifPPI
        const mx = motif.x_percent * MINI_W
        const my = motif.y_percent * MINI_H
        if (motif.url) {
          const img = await FabricImage.fromURL(motif.url, { crossOrigin: 'anonymous' })
          const naturalSize = Math.max(img.width ?? 1, img.height ?? 1)
          img.set({
            left: mx, top: my, originX: 'center', originY: 'center',
            scaleX: motifTargetPx / naturalSize, scaleY: motifTargetPx / naturalSize,
            selectable: false, evented: false,
          })
          fc.add(img)
        } else {
          const motifBase = Math.round(MINI_W * 0.18)
          const obj = new FabricText(motif.icon, {
            left: mx, top: my, originX: 'center', originY: 'center',
            fontSize: motifBase, selectable: false, evented: false,
          })
          obj.set({ scaleX: motifTargetPx / (obj.height || motifBase), scaleY: motifTargetPx / (obj.height || motifBase) })
          fc.add(obj)
        }
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
          placeholder={'{\n  "item_base": "Petite Crossbody",\n  "text": "AMY",\n  ...\n}'}
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
      <div style={{ flex: '1 1 580px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Preview</p>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <canvas ref={canvasElRef} />
        </div>
        <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>{MINI_W} × {MINI_H} px · 4:5</p>
      </div>

    </div>
  )
}
