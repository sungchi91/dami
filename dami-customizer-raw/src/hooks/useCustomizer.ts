import { useState, useCallback } from 'react'

/** Relative position within the safe zone (0.0 = top/left, 1.0 = bottom/right). */
export interface TextPosition {
  x: number
  y: number
}

/** Text size in embroidery inches (e.g. 0.5 = half inch). */
export type TextSize = number

export interface MotifEntry {
  id:          string
  url:         string
  label:       string
  baseName:    string
  widthInches: number
  position:    TextPosition
}

export interface CustomizerState {
  embroideryText:        string
  setEmbroideryText:     (v: string) => void
  dateText:              string
  setDateText:           (v: string) => void
  textColor:             string
  setTextColor:          (v: string) => void
  fontStyle:             string
  setFontStyle:          (v: string) => void
  textSize:              TextSize
  setTextSize:           (v: TextSize) => void
  textPosition:          TextPosition
  onPositionChange:      (pos: TextPosition) => void
  motifEntries:          MotifEntry[]
  addMotif:              (url: string, label: string, baseName: string, widthInches: number) => void
  removeMotif:           (id: string) => void
  updateMotifPosition:   (id: string, pos: TextPosition) => void
  updateMotifsByBaseName:(baseName: string, newUrl: string, newWidthInches: number) => void
  placeOnBack:           boolean
  setPlaceOnBack:        (v: boolean) => void
}

export function useCustomizer(): CustomizerState {
  const [embroideryText, setEmbroideryText] = useState('')
  const [dateText,       setDateText]       = useState('')
  const [textColor,      setTextColor]      = useState('#476E87') // Ocean Blue
  const [fontStyle,      setFontStyle]      = useState('ballantines')
  const [textSize,       setTextSize]       = useState<TextSize>(0.5)
  const [textPosition,   setTextPosition]   = useState<TextPosition>({ x: 0.5, y: 0.5 })
  const [motifEntries,   setMotifEntries]   = useState<MotifEntry[]>([])
  const [placeOnBack,    setPlaceOnBack]    = useState<boolean>(false)

  const onPositionChange = useCallback((pos: TextPosition) => setTextPosition(pos), [])

  const addMotif = useCallback((url: string, label: string, baseName: string, widthInches: number) => {
    setMotifEntries(prev => {
      // Stagger each new motif diagonally so they're never invisibly stacked.
      const step   = 0.035
      const offset = prev.length * step
      const x = Math.min(0.85, Math.max(0.15, 0.5 + offset))
      const y = Math.min(0.85, Math.max(0.15, 0.5 + offset))
      return [...prev, { id: crypto.randomUUID(), url, label, baseName, widthInches, position: { x, y } }]
    })
  }, [])

  const updateMotifsByBaseName = useCallback((baseName: string, newUrl: string, newWidthInches: number) => {
    setMotifEntries(prev => prev.map(e =>
      e.baseName === baseName ? { ...e, url: newUrl, widthInches: newWidthInches } : e
    ))
  }, [])

  const removeMotif = useCallback((id: string) => {
    setMotifEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  const updateMotifPosition = useCallback((id: string, pos: TextPosition) => {
    setMotifEntries(prev => prev.map(e => e.id === id ? { ...e, position: pos } : e))
  }, [])

  return {
    embroideryText,    setEmbroideryText,
    dateText,          setDateText,
    textColor,         setTextColor,
    fontStyle,         setFontStyle,
    textSize,          setTextSize,
    textPosition,      onPositionChange,
    motifEntries,      addMotif,
    removeMotif,       updateMotifPosition,
    updateMotifsByBaseName,
    placeOnBack,       setPlaceOnBack,
  }
}
