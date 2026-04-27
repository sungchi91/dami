import { useState, useCallback } from 'react'

/** Relative position within the safe zone (0.0 = top/left, 1.0 = bottom/right). */
export interface TextPosition {
  x: number
  y: number
}

export type TextSize = 'S' | 'M' | 'L'

export interface MotifEntry {
  id:       string
  emoji:    string
  position: TextPosition
}

export interface CustomizerState {
  embroideryText:        string
  setEmbroideryText:     (v: string) => void
  textColor:             string
  setTextColor:          (v: string) => void
  fontStyle:             string
  setFontStyle:          (v: string) => void
  textSize:              TextSize
  setTextSize:           (v: TextSize) => void
  textPosition:          TextPosition
  onPositionChange:      (pos: TextPosition) => void
  motifEntries:          MotifEntry[]
  addMotif:              (emoji: string) => void
  removeMotif:           (id: string) => void
  updateMotifPosition:   (id: string, pos: TextPosition) => void
}

export function useCustomizer(): CustomizerState {
  const [embroideryText, setEmbroideryText] = useState('')
  const [textColor,      setTextColor]      = useState('#7594B4') // Ember Lane Blue
  const [fontStyle,      setFontStyle]      = useState('cursive')
  const [textSize,       setTextSize]       = useState<TextSize>('M')
  const [textPosition,   setTextPosition]   = useState<TextPosition>({ x: 0.5, y: 0.5 })
  const [motifEntries,   setMotifEntries]   = useState<MotifEntry[]>([])

  const onPositionChange = useCallback((pos: TextPosition) => setTextPosition(pos), [])

  const addMotif = useCallback((emoji: string) => {
    setMotifEntries(prev => {
      // Stagger each new motif diagonally so they're never invisibly stacked.
      // step ≈ 0.035 safe-zone fractions ≈ 15px on a ~430px safe zone.
      const step   = 0.035
      const offset = prev.length * step
      const x = Math.min(0.85, Math.max(0.15, 0.5 + offset))
      const y = Math.min(0.85, Math.max(0.15, 0.5 + offset))
      return [...prev, { id: crypto.randomUUID(), emoji, position: { x, y } }]
    })
  }, [])

  const removeMotif = useCallback((id: string) => {
    setMotifEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  const updateMotifPosition = useCallback((id: string, pos: TextPosition) => {
    setMotifEntries(prev => prev.map(e => e.id === id ? { ...e, position: pos } : e))
  }, [])

  return {
    embroideryText,    setEmbroideryText,
    textColor,         setTextColor,
    fontStyle,         setFontStyle,
    textSize,          setTextSize,
    textPosition,      onPositionChange,
    motifEntries,      addMotif,
    removeMotif,       updateMotifPosition,
  }
}
