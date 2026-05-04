import React, { useState, useMemo } from 'react'
import { Truck, Sparkles, Gift, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ITEM_TYPES } from '@/config/products'
import type { TextSize, TextPosition, MotifEntry } from '@/hooks/useCustomizer'
import { buildCartPayload, submitToCart } from '@/lib/cart'

// ── Thread swatches ────────────────────────────────────────────────────────────

export const threadSwatches = [
  { name: 'Ember Lane Blue', color: '#7594B4' },
  { name: 'Deep Navy',     color: '#223A59' },
  { name: 'Pale Sky',      color: '#BBD0E3' },
  { name: 'Periwinkle',    color: '#96A1C6' },
  { name: 'French Indigo', color: '#4B5B75' },
  { name: 'Thread Red',    color: '#C43634' },
  { name: 'Tomato Red',    color: '#D84836' },
  { name: 'Deep Crimson',  color: '#9A2A2B' },
  { name: 'Dusty Rose',    color: '#C68798' },
  { name: 'Petal Pink',    color: '#DFB1BE' },
  { name: 'Clover Green',  color: '#3E7756' },
  { name: 'Sage Leaf',     color: '#85A384' },
  { name: 'Forest Pine',   color: '#214D32' },
  { name: 'Golden Sun',    color: '#DBAD53' },
  { name: 'Pale Butter',   color: '#EBCDA3' },
  { name: 'Terracotta',    color: '#C46D42' },
  { name: 'Vintage Wood',  color: '#87634B' },
  { name: 'Soft Ink',      color: '#2C3338' },
  { name: 'True Black',    color: '#1A1A1A' },
  { name: 'Linen White',   color: '#FAF8F5' },
  { name: 'Crisp White',   color: '#FFFFFF' },
  { name: 'Canvas Stone',  color: '#E1DCD3' },
  { name: 'Warm Sand',     color: '#C8AD92' },
  { name: 'Silver Shell',  color: '#A6A9A7' },
  { name: 'Dove Gray',     color: '#D1D5D6' },
]

const fontStyles = [
  { id: 'edwardian',    label: 'Elegant Script'  },
  { id: 'chateauneuf',  label: 'Delicate Script' },
  { id: 'ballantines',  label: 'Bold Script'     },
  { id: 'katelyn',      label: 'Playful Script'  },
  { id: 'garamond',     label: 'Classic Serif'   },
  { id: 'block',        label: 'Modern Block'    },
]

const textSizes: { id: TextSize; label: string }[] = [
  { id: 'S', label: 'Small'  },
  { id: 'M', label: 'Medium' },
  { id: 'L', label: 'Large'  },
]

const MOTIFS = ['🦞', '🍋', '🎀', '🌷', '🤎', '🍓']

// ── Props ─────────────────────────────────────────────────────────────────────

interface ProductInfoProps {
  showPersonalize:   boolean
  onPersonalize:     () => void
  onBack:            () => void
  embroideryText:    string
  setEmbroideryText: (v: string) => void
  textColor:         string
  setTextColor:      (v: string) => void
  fontStyle:         string
  setFontStyle:      (v: string) => void
  textSize:          TextSize
  setTextSize:       (v: TextSize) => void
  variantId:         number
  selectedItem:      number
  productPrice:      string
  textPosition:      TextPosition
  motifEntries:      MotifEntry[]
  onAddMotif:        (emoji: string) => void
  onRemoveMotif:     (id: string) => void
  maxMotifs:         number
  categoryLabel:     string
  tagline:           string
  description:       string
  founderQuote:      string
  founderName:       string
  colors:            { name: string; color: string; available?: boolean; variantId?: number; mediaId?: string; imageUrl?: string }[]
  selectedColor:     number
  onColorChange:     (mediaId: string, imageUrl: string, idx: number) => void
  feature1:          string
  feature2:          string
  feature3:          string
  customizerType?:   string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductInfo({
  showPersonalize,
  onPersonalize,
  onBack,
  embroideryText,
  setEmbroideryText,
  textColor,
  setTextColor,
  fontStyle,
  setFontStyle,
  textSize,
  setTextSize,
  variantId,
  selectedItem,
  productPrice,
  textPosition,
  motifEntries,
  onAddMotif,
  onRemoveMotif,
  maxMotifs,
  categoryLabel,
  tagline,
  description,
  founderQuote,
  founderName,
  colors,
  selectedColor,
  onColorChange,
  feature1,
  feature2,
  feature3,
  customizerType,
}: ProductInfoProps) {
  const [isSubmitting,    setIsSubmitting]    = useState(false)
  const [exceededWarning, setExceededWarning] = useState(false)

  const handleAddToBasket = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = buildCartPayload({ selectedItem, embroideryText, fontStyle, textColor, textSize, textPosition, motifEntries, customizerType })
      await submitToCart(variantId, payload)
    } catch (err) {
      console.error('Add to basket failed:', err)
      alert('Something went wrong adding to basket. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Motif availability based on layout type
  const showMotifStep = !customizerType || customizerType === 'freeform'
    || customizerType === 'crown' || customizerType === 'pedestal' || customizerType === 'sidenote'
  const effectiveMaxMotifs = customizerType === 'sidenote' ? 1 : maxMotifs

  const motifCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const entry of motifEntries) {
      counts[entry.emoji] = (counts[entry.emoji] ?? 0) + 1
    }
    return counts
  }, [motifEntries])

  const totalMotifs = motifEntries.length
  const atMax       = totalMotifs >= effectiveMaxMotifs

  const handleRemoveLastOfEmoji = (emoji: string) => {
    const last = [...motifEntries].reverse().find(e => e.emoji === emoji)
    if (last) { onRemoveMotif(last.id); setExceededWarning(false) }
  }

  const selectedThreadIndex = threadSwatches.findIndex(s => s.color === textColor)
  const threadName = threadSwatches[selectedThreadIndex < 0 ? 0 : selectedThreadIndex].name

  return (
    <div className="flex flex-col gap-6">

      {/* ── Product overview (always visible) ─────────────────────────────── */}
      {!showPersonalize && (
        <div className="flex flex-col gap-5">
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          )}

          {founderQuote && (
            <div className="bg-secondary/50 p-6 border border-border/50">
              <p className="text-foreground/80 leading-relaxed italic">&ldquo;{founderQuote}&rdquo;</p>
              {founderName && (
                <p className="font-[family-name:var(--font-cursive)] text-xl text-primary mt-3">— {founderName}</p>
              )}
            </div>
          )}

          {colors.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">
                Color: <span className="text-muted-foreground font-normal">{colors[selectedColor]?.name}</span>
              </p>
              <div className="flex gap-3 flex-wrap">
                {colors.map((c, i) => {
                  const unavailable = c.available === false
                  return (
                    <button
                      key={c.name}
                      onClick={() => { if (!unavailable) onColorChange(c.mediaId ?? '', c.imageUrl ?? '', i) }}
                      title={c.name}
                      aria-label={c.name}
                      disabled={unavailable}
                      className={`relative w-10 h-10 rounded-full transition-all duration-200 ${
                        unavailable ? 'opacity-40 cursor-not-allowed' :
                        selectedColor === i ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.color, boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Personalize CTA */}
          <Button
            onClick={onPersonalize}
            className="w-full py-6 text-base bg-primary hover:bg-primary/90 text-primary-foreground mt-1"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Personalize
          </Button>

          {/* ── Feature strip ─────────────────────────────────────────────── */}
          {(feature1 || feature2 || feature3) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
              {feature1 && <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0"><Truck className="w-4 h-4 text-primary" /></div><span>{feature1}</span></div>}
              {feature2 && <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-primary" /></div><span>{feature2}</span></div>}
              {feature3 && <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0"><Gift className="w-4 h-4 text-primary" /></div><span>{feature3}</span></div>}
            </div>
          )}
        </div>
      )}

      {/* ── Personalize steps ─────────────────────────────────────────────── */}
      {showPersonalize && (
        <div className="flex flex-col gap-6">

          {/* Back link */}
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* 01 · Thread */}
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">01</span>
              Choose a Thread
              <span className="ml-1 text-muted-foreground font-normal">—&nbsp;{threadName}</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 32px)', gap: '8px' }}>
              {threadSwatches.map((swatch) => (
                <button
                  key={swatch.name}
                  onClick={() => setTextColor(swatch.color)}
                  title={swatch.name}
                  aria-label={`Select thread: ${swatch.name}`}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${
                    textColor === swatch.color
                      ? 'ring-2 ring-[#7594B4] ring-offset-2 ring-offset-background scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: swatch.color,
                    boxShadow: textColor === swatch.color ? '0 4px 12px rgba(0,0,0,0.18)' : '0 2px 6px rgba(0,0,0,0.12)',
                    border: swatch.color === '#FAF8F5' ? '1px solid #E1DCD3' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* 02 · Text */}
          <div className="flex flex-col gap-3">
            <label htmlFor="custom-text" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">02</span>
              Add Your Text
            </label>
            <input
              id="custom-text"
              type="text"
              maxLength={40}
              value={embroideryText}
              onChange={(e) => setEmbroideryText(e.target.value)}
              placeholder="Type your text here…"
              className="w-full px-5 py-4 border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200 text-base"
            />
            <div className="flex flex-wrap gap-2">
              {fontStyles.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontStyle(f.id)}
                  className={`px-4 py-2 border text-sm transition-all duration-200 ${
                    fontStyle === f.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{embroideryText.length}/40 characters</p>
          </div>

          {/* 03 · Size */}
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">03</span>
              Text Size
            </p>
            <div className="flex gap-2">
              {textSizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setTextSize(s.id)}
                  className={`flex-1 py-3 border text-sm font-medium transition-all duration-200 ${
                    textSize === s.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 04 · Motifs (hidden for classic / statement) */}
          {showMotifStep && (
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">04</span>
              Add Motifs
              <span className="text-xs text-muted-foreground font-normal">({totalMotifs}/{effectiveMaxMotifs})</span>
            </p>

            {exceededWarning && (
              <p className="text-xs text-amber-600/80 bg-amber-50 border border-amber-200 px-3 py-2">
                Maximum motifs reached for this item
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {MOTIFS.map((emoji) => {
                const count = motifCounts[emoji] ?? 0
                return (
                  <div key={emoji} className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => { if (!atMax) { onAddMotif(emoji); setExceededWarning(false) } else setExceededWarning(true) }}
                      aria-label={`Add ${emoji}`}
                      className={`w-11 h-11 text-xl border transition-all duration-200 ${
                        count > 0 ? 'border-primary bg-primary/10' :
                        atMax ? 'border-border bg-background opacity-40 cursor-not-allowed' :
                        'border-border bg-background hover:border-primary/50 hover:scale-105'
                      }`}
                    >
                      {emoji}
                    </button>
                    {count > 0 && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleRemoveLastOfEmoji(emoji)} className="w-5 h-5 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 text-xs">−</button>
                        <span className="w-4 text-center text-xs font-medium tabular-nums">{count}</span>
                        <button onClick={() => { if (!atMax) { onAddMotif(emoji); setExceededWarning(false) } else setExceededWarning(true) }} className="w-5 h-5 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 text-xs">+</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {totalMotifs > 0 && customizerType === 'freeform' && (
              <p className="text-xs text-muted-foreground">Drag motifs on the canvas to position them · press Delete to remove</p>
            )}
          </div>
          )}

          {/* ── Add to Basket ────────────────────────────────────────────────── */}
          <div className="flex gap-4 pt-2 border-t border-border">
            <Button
              className="flex-1 py-6 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting}
              onClick={handleAddToBasket}
            >
              {isSubmitting ? 'Adding…' : 'Add to Basket'}
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}
