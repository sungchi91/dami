import React, { useState } from 'react';
import { PRESETS, type Preset } from './presets';

type ConfigMap = Record<string, Preset>

function isModified(current: Preset, original: Preset) {
  return (
    current.widthRatio        !== original.widthRatio  ||
    current.heightRatio       !== original.heightRatio ||
    current.offsetX           !== original.offsetX     ||
    current.offsetY           !== original.offsetY     ||
    current.physicalWidthInches !== original.physicalWidthInches
  )
}

export default function SafeZoneConfigurator() {
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0])
  const [configs, setConfigs] = useState<ConfigMap>(() =>
    Object.fromEntries(PRESETS.map(p => [p.name, { ...p }]))
  )
  const [copied,    setCopied]    = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  const config = configs[activePreset.name]

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfigs(prev => ({
      ...prev,
      [activePreset.name]: { ...prev[activePreset.name], [name]: parseFloat(value) },
    }))
  }

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = PRESETS.find(p => p.name === e.target.value)
    if (preset) setActivePreset(preset)
  }

  const getSafeZoneStyle = (): React.CSSProperties => {
    const wPct    = config.widthRatio  * 100
    const hPct    = config.heightRatio * 100
    const leftPct = 50 + config.offsetX * 100 - wPct / 2
    const topPct  = 50 + config.offsetY * 100 - hPct / 2
    return { width: `${wPct}%`, height: `${hPct}%`, left: `${leftPct}%`, top: `${topPct}%` }
  }

  const snippet = `safeZone: {
  widthRatio:  ${config.widthRatio.toFixed(2)},
  heightRatio: ${config.heightRatio.toFixed(2)},
  offsetX:     ${config.offsetX.toFixed(2)},
  offsetY:     ${config.offsetY.toFixed(2)},
},
safeZonePhysicalWidthInches: ${config.physicalWidthInches},`

  const allJson = JSON.stringify(
    Object.fromEntries(
      PRESETS.map(p => {
        const c = configs[p.name]
        return [p.name, {
          widthRatio:          c.widthRatio,
          heightRatio:         c.heightRatio,
          offsetX:             c.offsetX,
          offsetY:             c.offsetY,
          physicalWidthInches: c.physicalWidthInches,
        }]
      })
    ),
    null, 2
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleCopyAll = () => {
    navigator.clipboard.writeText(allJson).then(() => {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    })
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>
          Dial in the bounding box for each product, then use <code>/update-safezones</code> to apply.
        </p>
        <button
          onClick={handleCopyAll}
          style={{
            fontSize: '0.8rem', padding: '0.4rem 1rem', borderRadius: '0.5rem',
            border: '1px solid #7594B4',
            background: copiedAll ? '#eff6ff' : '#fff',
            color: copiedAll ? '#1d4ed8' : '#334155',
            cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
          }}
        >
          {copiedAll ? '✓ Copied All!' : 'Copy All Products'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

        {/* Controls */}
        <div style={{ flex: '1 1 320px', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <label style={labelStyle}>Product Preset</label>
            <select style={selectStyle} value={activePreset.name} onChange={handlePresetChange}>
              {PRESETS.map(p => {
                const modified = isModified(configs[p.name], p)
                return (
                  <option key={p.name} value={p.name}>
                    {modified ? '● ' : ''}{p.name}{p.bgImage ? ' 📸' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          <SliderControl label="Width Ratio"  name="widthRatio"  value={config.widthRatio}  min={0.1}  max={1.0}  step={0.01} onChange={handleSliderChange} />
          <SliderControl label="Height Ratio" name="heightRatio" value={config.heightRatio} min={0.1}  max={1.0}  step={0.01} onChange={handleSliderChange} />
          <SliderControl label="Offset X"     name="offsetX"     value={config.offsetX}     min={-0.5} max={0.5}  step={0.01} onChange={handleSliderChange} />
          <SliderControl label="Offset Y"     name="offsetY"     value={config.offsetY}     min={-0.5} max={0.5}  step={0.01} onChange={handleSliderChange} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
              <label style={labelStyle}>Physical Width (inches)</label>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>real-world embroidery zone</span>
            </div>
            <input
              type="number"
              name="physicalWidthInches"
              value={config.physicalWidthInches}
              min={0.5} max={40} step={0.25}
              onChange={handleSliderChange}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.875rem', fontFamily: 'monospace', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Current product snippet</span>
              <button onClick={handleCopy} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: copied ? '#f0fdf4' : '#fff', color: copied ? '#16a34a' : '#334155', cursor: 'pointer' }}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre style={{ background: '#0f172a', color: '#4ade80', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.75rem', overflowX: 'auto', margin: 0 }}>
              {snippet}
            </pre>
          </div>
        </div>

        {/* Canvas preview */}
        <div style={{ flex: '1 1 360px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <div style={{
            position: 'relative', width: '100%', maxWidth: 400,
            aspectRatio: '4/5', background: config.bgColor,
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)', borderRadius: '2rem', overflow: 'hidden',
          }}>
            {config.bgImage && (
              <img key={config.bgImage} src={config.bgImage} alt={config.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
            )}
            {!config.bgImage && (
              <div style={{ position: 'absolute', inset: '6%', border: '1px solid rgba(180,150,100,0.4)', borderRadius: '1.5rem', pointerEvents: 'none' }} />
            )}
            <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 1, background: 'rgba(100,116,139,0.15)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: '100%', background: 'rgba(100,116,139,0.15)', pointerEvents: 'none' }} />
            <div style={{
              position: 'absolute', border: '2px dashed #7594B4', background: 'rgba(117,148,180,0.12)',
              transition: 'all 0.15s ease-out', display: 'flex', alignItems: 'center',
              justifyContent: 'center', pointerEvents: 'none', ...getSafeZoneStyle(),
            }}>
              <span style={{ color: 'rgba(117,148,180,0.8)', fontSize: '0.7rem', fontWeight: 600, userSelect: 'none', textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}>
                Safe Zone
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }
const selectStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#fff', fontSize: '0.875rem' }

function SliderControl({ label, name, value, min, max, step, onChange }: {
  label: string; name: string; value: number; min: number; max: number; step: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <label style={labelStyle}>{label}</label>
        <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#64748b' }}>{value.toFixed(2)}</span>
      </div>
      <input type="range" name={name} min={min} max={max} step={step} value={value} onChange={onChange}
        style={{ width: '100%', accentColor: '#7594B4' }} />
    </div>
  )
}
