import React, { useState, useRef, useCallback } from 'react'
import { PRESETS, type Preset } from './presets'

// ── Types ──────────────────────────────────────────────────────────────────────

export type LayoutType = 'classic' | 'statement' | 'sidenote' | 'crown' | 'pedestal' | 'side-font' | 'side-motif' | 'classic-motif'

const STANDARD_LAYOUT_TYPES: LayoutType[] = ['classic', 'statement', 'sidenote', 'crown', 'pedestal']
const NAPKIN_EXTRA_TYPES:    LayoutType[] = ['side-font', 'side-motif', 'classic-motif']

function getLayoutTypes(productName: string): LayoutType[] {
  return productName === 'Linen Cocktail Napkin'
    ? [...STANDARD_LAYOUT_TYPES, ...NAPKIN_EXTRA_TYPES]
    : STANDARD_LAYOUT_TYPES
}

const DESCRIPTIONS: Record<LayoutType, string> = {
  classic:          'Text only · fixed center',
  statement:        'Text only · fixed spot',
  sidenote:         'Text + 1 motif · two fixed spots',
  crown:            'Text top + motif row bottom',
  pedestal:         'Motif row top + text bottom',
  'side-font':      'Text only · side placement (napkin)',
  'side-motif':     'Motif only · corner placement (napkin)',
  'classic-motif':  'Motif only · center placement (napkin)',
}

interface Pos { x: number; y: number }

interface LayoutState {
  text?:     Pos
  motif?:    Pos
  motifRow?: Pos
}

const DEFAULTS: Record<LayoutType, LayoutState> = {
  classic:          { text: { x: 0.50, y: 0.50 } },
  statement:        { text: { x: 0.50, y: 0.50 } },
  sidenote:         { text: { x: 0.35, y: 0.50 }, motif:    { x: 0.75, y: 0.50 } },
  crown:            { text: { x: 0.50, y: 0.20 }, motifRow: { x: 0.50, y: 0.80 } },
  pedestal:         { text: { x: 0.50, y: 0.80 }, motifRow: { x: 0.50, y: 0.20 } },
  'side-font':      { text: { x: 0.50, y: 0.50 } },
  'side-motif':     { motif: { x: 0.75, y: 0.75 } },
  'classic-motif':  { motif: { x: 0.50, y: 0.50 } },
}

type LayoutMap = Record<string, Partial<Record<LayoutType, LayoutState>>>
type MotifMap  = Record<string, number>

const MOTIF_GAP_MULTIPLIER  = 1.2
const MAX_TEXT_WIDTH_INCHES = 5  // matches PRODUCT_CONFIG.maxTextWidth in the customizer

// ── Coordinate helpers ─────────────────────────────────────────────────────────

function szGeom(p: Preset) {
  const w = p.widthRatio  * 100
  const h = p.heightRatio * 100
  return { l: 50 + p.offsetX * 100 - w / 2, t: 50 + p.offsetY * 100 - h / 2, w, h }
}

function canvasToSZ(cx: number, cy: number, p: Preset): Pos {
  const { l, t, w, h } = szGeom(p)
  return {
    x: Math.max(0, Math.min(1, (cx * 100 - l) / w)),
    y: Math.max(0, Math.min(1, (cy * 100 - t) / h)),
  }
}

function szToCanvas(pos: Pos, p: Preset) {
  const { l, t, w, h } = szGeom(p)
  return { left: l + pos.x * w, top: t + pos.y * h }
}

// ── Snippet builders ───────────────────────────────────────────────────────────

function fp(n: number) { return n.toFixed(2) }
function fPos(p: Pos)  { return `{ x: ${fp(p.x)}, y: ${fp(p.y)} }` }

function buildSnippet(s: LayoutState, type: LayoutType): string {
  const key = type.includes('-') ? `'${type}'` : type
  if (type === 'classic' || type === 'statement' || type === 'side-font')
    return `${key}: { text: ${fPos(s.text!)} }`
  if (type === 'sidenote')
    return `sidenote: { text: ${fPos(s.text!)}, motif: ${fPos(s.motif!)} }`
  if (type === 'side-motif' || type === 'classic-motif')
    return `${key}: { motif: ${fPos(s.motif!)} }`
  return `${key}: { text: ${fPos(s.text!)}, motifRow: { centerX: ${fp(s.motifRow!.x)}, y: ${fp(s.motifRow!.y)} } }`
}

function buildAllSnippet(layouts: LayoutMap, motifMap: MotifMap): string {
  const lines: string[] = []
  for (const p of PRESETS) {
    const pl   = layouts[p.name]
    const mi   = motifMap[p.name] ?? 1.0
    const types = getLayoutTypes(p.name)
    lines.push(`  '${p.name}': {`)
    if (mi !== 1.0) lines.push(`    motifInches: ${fp(mi)},`)
    for (const t of types) {
      const s = pl?.[t]
      if (s) lines.push(`    ${buildSnippet(s, t)},`)
    }
    lines.push(`  },`)
  }
  return `// Paste into fixed-layouts.ts\nexport const FIXED_LAYOUTS: Record<string, ProductFixedLayouts> = {\n${lines.join('\n')}\n}`
}

// ── Seeded positions (keep in sync with fixed-layouts.ts) ─────────────────────

const SEEDED_MOTIF_INCHES: Record<string, number> = {
  'Grand Tote':            1.50,
  'Signature Tote':        1.25,
  'Waffle Pouch':          1.00,
  'Grand Waffle Pouch':    1.00,
  'Linen Cocktail Napkin': 1.00,
}

const SEEDED_LAYOUTS: Record<string, Partial<Record<LayoutType, LayoutState>>> = {
  'Grand Tote': {
    classic:   { text: { x: 0.53, y: 0.16 } },
    statement: { text: { x: 0.53, y: 0.65 } },
    sidenote:  { text: { x: 0.52, y: 0.19 }, motif:    { x: 0.83, y: 0.80 } },
    crown:     { text: { x: 0.52, y: 0.26 }, motifRow: { x: 0.52, y: 0.13 } },
    pedestal:  { text: { x: 0.52, y: 0.09 }, motifRow: { x: 0.52, y: 0.24 } },
  },
  'Signature Tote': {
    classic:   { text: { x: 0.50, y: 0.18 } },
    statement: { text: { x: 0.51, y: 0.59 } },
    sidenote:  { text: { x: 0.49, y: 0.18 }, motif:    { x: 0.83, y: 0.85 } },
    crown:     { text: { x: 0.51, y: 0.26 }, motifRow: { x: 0.51, y: 0.15 } },
    pedestal:  { text: { x: 0.50, y: 0.11 }, motifRow: { x: 0.50, y: 0.25 } },
  },
  'Petite Tote': {
    classic:   { text: { x: 0.52, y: 0.19 } },
    statement: { text: { x: 0.53, y: 0.54 } },
    sidenote:  { text: { x: 0.53, y: 0.17 }, motif:    { x: 0.90, y: 0.86 } },
    crown:     { text: { x: 0.53, y: 0.21 }, motifRow: { x: 0.53, y: 0.12 } },
    pedestal:  { text: { x: 0.52, y: 0.11 }, motifRow: { x: 0.52, y: 0.24 } },
  },
  'Petite Crossbody': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.35, y: 0.50 }, motif:    { x: 0.75, y: 0.50 } },
    crown:     { text: { x: 0.50, y: 0.20 }, motifRow: { x: 0.50, y: 0.80 } },
    pedestal:  { text: { x: 0.50, y: 0.80 }, motifRow: { x: 0.50, y: 0.20 } },
  },
  'Waffle Pouch': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.52, y: 0.50 }, motif:    { x: 0.87, y: 0.82 } },
    crown:     { text: { x: 0.52, y: 0.54 }, motifRow: { x: 0.52, y: 0.31 } },
    pedestal:  { text: { x: 0.52, y: 0.33 }, motifRow: { x: 0.52, y: 0.67 } },
  },
  'Grand Waffle Pouch': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.51, y: 0.48 }, motif:    { x: 0.90, y: 0.84 } },
    crown:     { text: { x: 0.50, y: 0.53 }, motifRow: { x: 0.50, y: 0.34 } },
    pedestal:  { text: { x: 0.52, y: 0.37 }, motifRow: { x: 0.52, y: 0.60 } },
  },
  'Seersucker Pouch': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.35, y: 0.50 }, motif:    { x: 0.75, y: 0.50 } },
    crown:     { text: { x: 0.50, y: 0.20 }, motifRow: { x: 0.50, y: 0.80 } },
    pedestal:  { text: { x: 0.50, y: 0.80 }, motifRow: { x: 0.50, y: 0.20 } },
  },
  'Linen Cocktail Napkin': {
    classic:          { text: { x: 0.50, y: 0.50 } },
    statement:        { text: { x: 0.50, y: 0.50 } },
    sidenote:         { text: { x: 0.35, y: 0.50 }, motif: { x: 0.75, y: 0.50 } },
    crown:            { text: { x: 0.50, y: 0.20 }, motifRow: { x: 0.50, y: 0.80 } },
    pedestal:         { text: { x: 0.50, y: 0.80 }, motifRow: { x: 0.50, y: 0.20 } },
    'side-font':      { text: { x: 0.91, y: 0.86 } },
    'side-motif':     { motif: { x: 0.81, y: 0.82 } },
    'classic-motif':  { motif: { x: 0.52, y: 0.50 } },
  },
  'The Oxford': {
    classic:   { text: { x: 0.50, y: 0.50 } },
    statement: { text: { x: 0.50, y: 0.50 } },
    sidenote:  { text: { x: 0.35, y: 0.50 }, motif:    { x: 0.75, y: 0.50 } },
    crown:     { text: { x: 0.50, y: 0.20 }, motifRow: { x: 0.50, y: 0.80 } },
    pedestal:  { text: { x: 0.50, y: 0.80 }, motifRow: { x: 0.50, y: 0.20 } },
  },
}

// ── Init ───────────────────────────────────────────────────────────────────────

function initLayouts(): LayoutMap {
  return Object.fromEntries(
    PRESETS.map(p => [
      p.name,
      Object.fromEntries(
        getLayoutTypes(p.name).map(t => [
          t,
          SEEDED_LAYOUTS[p.name]?.[t] ?? JSON.parse(JSON.stringify(DEFAULTS[t])),
        ])
      ),
    ])
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function FixedLayoutConfigurator() {
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0])
  const [layoutType,   setLayoutType]   = useState<LayoutType>('classic')
  const [layouts,      setLayouts]      = useState<LayoutMap>(initLayouts)
  const [motifMap,     setMotifMap]     = useState<MotifMap>(() =>
    Object.fromEntries(PRESETS.map(p => [p.name, SEEDED_MOTIF_INCHES[p.name] ?? 1.0]))
  )
  const [copied,    setCopied]    = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  const canvasRef   = useRef<HTMLDivElement>(null)
  const draggingRef = useRef<'text' | 'motif' | 'motifRow' | null>(null)

  const availableTypes = getLayoutTypes(activePreset.name)

  // When product changes, clamp layoutType to the available set
  const handlePresetChange = (name: string) => {
    const preset = PRESETS.find(p => p.name === name)!
    setActivePreset(preset)
    if (!getLayoutTypes(preset.name).includes(layoutType)) setLayoutType('classic')
  }

  const current: LayoutState =
    layouts[activePreset.name]?.[layoutType] ?? JSON.parse(JSON.stringify(DEFAULTS[layoutType]))

  const isMotifOnly = layoutType === 'side-motif' || layoutType === 'classic-motif'
  const hasMotif    = layoutType === 'sidenote' || isMotifOnly
  const hasMotifRow = layoutType === 'crown' || layoutType === 'pedestal'

  const updatePos = useCallback((handle: 'text' | 'motif' | 'motifRow', pos: Pos) => {
    setLayouts(prev => {
      const existing: LayoutState = prev[activePreset.name]?.[layoutType]
        ?? JSON.parse(JSON.stringify(DEFAULTS[layoutType]))
      return {
        ...prev,
        [activePreset.name]: {
          ...prev[activePreset.name],
          [layoutType]: {
            ...existing,
            ...(handle === 'text'     ? { text:     pos } : {}),
            ...(handle === 'motif'    ? { motif:    pos } : {}),
            ...(handle === 'motifRow' ? { motifRow: pos } : {}),
          },
        },
      }
    })
  }, [activePreset.name, layoutType])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !canvasRef.current) return
    const r  = canvasRef.current.getBoundingClientRect()
    const cx = (e.clientX - r.left) / r.width
    const cy = (e.clientY - r.top)  / r.height
    updatePos(draggingRef.current, canvasToSZ(cx, cy, activePreset))
  }, [activePreset, updatePos])

  const stopDrag = useCallback(() => { draggingRef.current = null }, [])

  const textCanvasPos     = current.text    ? szToCanvas(current.text,    activePreset) : null
  const motifCanvasPos    = current.motif   ? szToCanvas(current.motif,   activePreset) : null
  const motifRowCanvasPos = current.motifRow ? szToCanvas(current.motifRow, activePreset) : null

  const motifInches  = motifMap[activePreset.name] ?? 1.0
  const ppi          = activePreset.widthRatio / activePreset.physicalWidthInches
  const motifSizePct = motifInches * ppi * 100 * 0.5
  const textSizePct  = 1.0         * ppi * 100 * 0.5
  const szGap        = MOTIF_GAP_MULTIPLIER * (motifInches / activePreset.physicalWidthInches)

  const snippet    = buildSnippet(current, layoutType)
  const allSnippet = buildAllSnippet(layouts, motifMap)

  const { l: szL, t: szT, w: szW, h: szH } = szGeom(activePreset)

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>
          Drag handles within the safe zone to set fixed embroidery positions.
        </p>
        <button onClick={() => {
          navigator.clipboard.writeText(allSnippet).then(() => {
            setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000)
          })
        }} style={outlineBtn(copiedAll)}>
          {copiedAll ? '✓ Copied!' : 'Copy All Products'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

        {/* ── Controls ── */}
        <div style={{ flex: '1 1 300px', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <label style={labelStyle}>Product</label>
            <select style={selectStyle} value={activePreset.name}
              onChange={e => handlePresetChange(e.target.value)}>
              {PRESETS.map(p => <option key={p.name}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Layout Type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {availableTypes.map(t => (
                <button key={t} onClick={() => setLayoutType(t)} style={{
                  padding: '0.45rem 0.75rem', borderRadius: '0.5rem', border: '1px solid',
                  textAlign: 'left', cursor: 'pointer',
                  borderColor: layoutType === t ? '#7594B4' : '#e2e8f0',
                  background:  layoutType === t ? '#eff6ff' : '#fff',
                  color:       layoutType === t ? '#1e40af' : '#475569',
                }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{t}</span>
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                    {DESCRIPTIONS[t]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Motif size */}
          {(layoutType === 'sidenote' || layoutType === 'crown' || layoutType === 'pedestal' || isMotifOnly) && (
            <div>
              <label style={labelStyle}>Motif size (inches)</label>
              <input
                type="number" min="0.25" max="4" step="0.25"
                value={motifInches}
                onChange={e => setMotifMap(prev => ({ ...prev, [activePreset.name]: parseFloat(e.target.value) || 1.0 }))}
                style={{ ...selectStyle, width: '6rem' }}
              />
            </div>
          )}

          {/* Legend */}
          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {!isMotifOnly && layoutType !== 'side-font' && <Dot color="#7594B4" label="Text — drag handle · dashed circle = S-size height" />}
            {layoutType === 'side-font' && <Dot color="#7594B4" label={`Text right anchor — text right-aligns to handle, max ${MAX_TEXT_WIDTH_INCHES}″ wide growing left`} />}
            {(hasMotif || isMotifOnly) && <Dot color="#10b981" label="Motif — drag handle · dashed circle = physical motif size" />}
            {hasMotifRow && <Dot color="#10b981" label="Motif row center — drag · circles = auto-spaced at physical size" />}
          </div>

          {/* Snippet */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Config snippet</span>
              <button onClick={() => {
                navigator.clipboard.writeText(snippet).then(() => {
                  setCopied(true); setTimeout(() => setCopied(false), 2000)
                })
              }} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: copied ? '#f0fdf4' : '#fff', color: copied ? '#16a34a' : '#334155', cursor: 'pointer' }}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre style={{ background: '#0f172a', color: '#4ade80', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.72rem', overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {snippet}
            </pre>
          </div>
        </div>

        {/* ── Canvas ── */}
        <div style={{ flex: '1 1 360px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <div
            ref={canvasRef}
            onMouseMove={onMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            style={{
              position: 'relative', width: '100%', maxWidth: 400,
              aspectRatio: '4/5', background: activePreset.bgColor,
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)', borderRadius: '2rem', overflow: 'hidden',
              userSelect: 'none',
            }}
          >
            {activePreset.bgImage && (
              <img src={activePreset.bgImage} alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
            )}
            {!activePreset.bgImage && (
              <div style={{ position: 'absolute', inset: '6%', border: '1px solid rgba(180,150,100,0.4)', borderRadius: '1.5rem', pointerEvents: 'none' }} />
            )}
            {/* Crosshairs */}
            <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 1, background: 'rgba(100,116,139,0.12)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: '100%', background: 'rgba(100,116,139,0.12)', pointerEvents: 'none' }} />
            {/* Safe zone */}
            <div style={{
              position: 'absolute',
              left: `${szL}%`, top: `${szT}%`, width: `${szW}%`, height: `${szH}%`,
              border: '2px dashed rgba(117,148,180,0.55)', background: 'rgba(117,148,180,0.06)',
              pointerEvents: 'none',
            }} />

            {/* Ghost text indicator */}
            {!isMotifOnly && textCanvasPos && current.text && layoutType !== 'side-font' && (
              <div style={{
                position: 'absolute',
                left: `${textCanvasPos.left}%`, top: `${textCanvasPos.top}%`,
                transform: 'translate(-50%, -50%)',
                width: `${textSizePct}%`, aspectRatio: '1',
                borderRadius: '50%',
                border: '2px dashed rgba(117,148,180,0.55)',
                pointerEvents: 'none',
              }} />
            )}

            {/* Right-anchored max-width box (side-font) */}
            {layoutType === 'side-font' && textCanvasPos && current.text && (() => {
              const maxFractionSZ = MAX_TEXT_WIDTH_INCHES / activePreset.physicalWidthInches
              const leftSZ        = current.text.x - maxFractionSZ
              const leftCanvas    = szToCanvas({ x: leftSZ, y: current.text.y }, activePreset)
              const boxWidthPct   = textCanvasPos.left - leftCanvas.left
              const boxHeightPct  = textSizePct
              return (
                <>
                  {/* 5-inch box extending leftward from the right anchor */}
                  <div style={{
                    position: 'absolute',
                    left: `${leftCanvas.left}%`, top: `${textCanvasPos.top}%`,
                    transform: 'translate(0, -50%)',
                    width: `${boxWidthPct}%`, height: `${boxHeightPct}%`,
                    border: '2px dashed rgba(117,148,180,0.55)',
                    background: 'rgba(117,148,180,0.04)',
                    pointerEvents: 'none',
                  }} />
                  {/* Right-anchor tick — solid line at the handle position */}
                  <div style={{
                    position: 'absolute',
                    left: `${textCanvasPos.left}%`, top: `${textCanvasPos.top}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 3, height: `${boxHeightPct * 1.4}%`,
                    background: '#7594B4',
                    pointerEvents: 'none',
                  }} />
                </>
              )
            })()}

            {/* Ghost motif circles (crown / pedestal) */}
            {current.motifRow && (() => {
              const cx = current.motifRow.x
              const ry = current.motifRow.y
              return ([-1, 0, 1] as const).map(offset => {
                const ghostX    = cx + offset * szGap
                const canvasPos = szToCanvas({ x: ghostX, y: ry }, activePreset)
                return (
                  <div key={offset} style={{
                    position: 'absolute',
                    left: `${canvasPos.left}%`, top: `${canvasPos.top}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${motifSizePct}%`, aspectRatio: '1',
                    borderRadius: '50%',
                    border: '2px dashed rgba(16,185,129,0.55)',
                    pointerEvents: 'none',
                  }} />
                )
              })
            })()}

            {/* Ghost motif circle (sidenote / side-motif / classic-motif) */}
            {current.motif && motifCanvasPos && (
              <div style={{
                position: 'absolute',
                left: `${motifCanvasPos.left}%`, top: `${motifCanvasPos.top}%`,
                transform: 'translate(-50%, -50%)',
                width: `${motifSizePct}%`, aspectRatio: '1',
                borderRadius: '50%',
                border: '2px dashed rgba(16,185,129,0.55)',
                pointerEvents: 'none',
              }} />
            )}

            {/* Handles */}
            {!isMotifOnly && textCanvasPos && (
              <DragHandle label="T" color="#7594B4" pos={textCanvasPos}
                onDown={() => { draggingRef.current = 'text' }} />
            )}
            {motifCanvasPos && (
              <DragHandle label="M" color="#10b981" pos={motifCanvasPos}
                onDown={() => { draggingRef.current = 'motif' }} />
            )}
            {motifRowCanvasPos && (
              <DragHandle label="M" color="#10b981" pos={motifRowCanvasPos}
                onDown={() => { draggingRef.current = 'motifRow' }} />
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DragHandle({ label, color, pos, onDown }: {
  label: string; color: string
  pos:   { left: number; top: number }
  onDown: () => void
}) {
  return (
    <div
      onMouseDown={e => { e.preventDefault(); onDown() }}
      style={{
        position: 'absolute',
        left: `${pos.left}%`, top: `${pos.top}%`,
        transform: 'translate(-50%, -50%)',
        width: 16, height: 16, borderRadius: '50%',
        background: color, border: '1.5px solid #fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '0.5rem', fontWeight: 700,
        cursor: 'grab', zIndex: 10,
      }}
    >
      {label}
    </div>
  )
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span>{label}</span>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem',
}
const selectStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1',
  borderRadius: '0.5rem', background: '#fff', fontSize: '0.875rem',
}
const outlineBtn = (active: boolean): React.CSSProperties => ({
  fontSize: '0.8rem', padding: '0.4rem 1rem', borderRadius: '0.5rem',
  border: '1px solid #7594B4',
  background: active ? '#eff6ff' : '#fff',
  color: active ? '#1d4ed8' : '#334155',
  cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
})
