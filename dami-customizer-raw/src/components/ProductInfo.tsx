import React, { useState, useEffect, useMemo } from 'react'
import { Heart, Truck, Sparkles, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ITEM_TYPES } from '@/config/products'
import type { TextSize, TextPosition, MotifEntry } from '@/hooks/useCustomizer'
import { buildCartPayload, submitToCart } from '@/lib/cart'

// ── Thread swatches ────────────────────────────────────────────────────────────

// 25 thread swatches — 4 collections, 25 colors
export const threadSwatches = [
  // 01 · The Heritage Blues
  { name: "d'ami Blue",    color: '#7594B4' },
  { name: 'Deep Navy',     color: '#223A59' },
  { name: 'Pale Sky',      color: '#BBD0E3' },
  { name: 'Periwinkle',    color: '#96A1C6' },
  { name: 'French Indigo', color: '#4B5B75' },
  // 02 · The Romantics
  { name: 'Thread Red',    color: '#C43634' },
  { name: 'Tomato Red',    color: '#D84836' },
  { name: 'Deep Crimson',  color: '#9A2A2B' },
  { name: 'Dusty Rose',    color: '#C68798' },
  { name: 'Petal Pink',    color: '#DFB1BE' },
  // 03 · The Earth & Flora
  { name: 'Clover Green',  color: '#3E7756' },
  { name: 'Sage Leaf',     color: '#85A384' },
  { name: 'Forest Pine',   color: '#214D32' },
  { name: 'Golden Sun',    color: '#DBAD53' },
  { name: 'Pale Butter',   color: '#EBCDA3' },
  { name: 'Terracotta',    color: '#C46D42' },
  { name: 'Vintage Wood',  color: '#87634B' },
  // 04 · The Canvas Neutrals
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
  { id: 'cursive', label: 'Cursive Script' },
  { id: 'serif',   label: 'Classic Serif'  },
  { id: 'block',   label: 'Fine Block'     },
]

const textSizes: { id: TextSize; label: string }[] = [
  { id: 'S', label: 'Small'  },
  { id: 'M', label: 'Medium' },
  { id: 'L', label: 'Large'  },
]

// ── Props ─────────────────────────────────────────────────────────────────────

const MOTIFS = ['🦞', '🍋', '🎀', '🌷', '🤎', '🍓']

interface ProductInfoProps {
  activeTab:         'photos' | 'personalize'
  setActiveTab:      (v: 'photos' | 'personalize') => void
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
  // Shopify-passed fields (fall back to PRODUCT_CONFIG if empty)
  categoryLabel:   string
  tagline:         string
  description:     string
  founderQuote:    string
  founderName:     string
  dimensions:      string
  care:            string
  shippingMessage: string
  feature1:        string
  feature2:        string
  feature3:        string
  colors:          { name: string; color: string; available?: boolean }[]
  maxMotifs:       number
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductInfo({
  activeTab,
  setActiveTab,
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
  categoryLabel,
  tagline,
  description,
  founderQuote,
  founderName,
  dimensions,
  care,
  shippingMessage,
  feature1,
  feature2,
  feature3,
  colors,
  maxMotifs,
}: ProductInfoProps) {
  const [isWishlisted,  setIsWishlisted]  = useState(false)
  const [selectedColor, setSelectedColor] = useState(0)
  const [isSubmitting,  setIsSubmitting]  = useState(false)

  const handleAddToBasket = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = buildCartPayload({ selectedItem, embroideryText, fontStyle, textColor, textSize, textPosition, motifEntries })
      await submitToCart(variantId, payload)
    } catch (err) {
      console.error('Add to basket failed:', err)
      alert('Something went wrong adding to basket. Please try again.')
      setIsSubmitting(false)
    }
  }

  const itemName = ITEM_TYPES[selectedItem] ?? ITEM_TYPES[0]

  const displayColors          = colors.length > 0 ? colors : [{ name: 'MISSING-COLORS', color: '#ff0000' }]
  const displayCategoryLabel   = categoryLabel   || 'MISSING-CATEGORY-LABEL'
  const displayTagline         = tagline         || 'MISSING-TAGLINE'
  const displayDescription     = description     || 'MISSING-DESCRIPTION'
  const displayFounderQuote    = founderQuote    || 'MISSING-FOUNDER-QUOTE'
  const displayFounderName     = founderName     || 'MISSING-FOUNDER-NAME'
  const displayDimensions      = dimensions      || 'MISSING-DIMENSIONS'
  const displayCare            = care            || 'MISSING-CARE'
  const displayShippingMessage = shippingMessage || 'MISSING-SHIPPING-MESSAGE'
  const displayFeature1        = feature1        || 'MISSING-FEATURE-1'
  const displayFeature2        = feature2        || 'MISSING-FEATURE-2'
  const displayFeature3        = feature3        || 'MISSING-FEATURE-3'

  const motifCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const entry of motifEntries) {
      counts[entry.emoji] = (counts[entry.emoji] ?? 0) + 1
    }
    return counts
  }, [motifEntries])

  const totalMotifs = motifEntries.length
  const atMax       = totalMotifs >= maxMotifs

  const handleRemoveLastOfEmoji = (emoji: string) => {
    const last = [...motifEntries].reverse().find(e => e.emoji === emoji)
    if (last) onRemoveMotif(last.id)
  }

  // Reset product color when item changes
  useEffect(() => { setSelectedColor(0) }, [selectedItem])

  const selectedThreadIndex = threadSwatches.findIndex(s => s.color === textColor)
  const threadName = threadSwatches[selectedThreadIndex < 0 ? 0 : selectedThreadIndex].name

  return (
    <div className="flex flex-col gap-6">

      {/* ── Always-visible: title + price ─────────────────────────────────── */}
      <div>
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
          {displayCategoryLabel}
        </p>
        <h2 className="text-4xl md:text-5xl font-light text-foreground leading-tight text-balance">
          {itemName}
        </h2>
        <p className="font-[family-name:var(--font-cursive)] text-2xl text-accent mt-1 rotate-1">
          {displayTagline}
        </p>
        <div className="flex items-baseline gap-4 mt-3">
          <p className="text-2xl font-light text-foreground">{productPrice}</p>
          <span className="text-sm text-muted-foreground">{displayShippingMessage}</span>
        </div>
      </div>

      {/* ── Tab switcher ──────────────────────────────────────────────────── */}
      <div className="flex border-b border-border">
        {(['photos', 'personalize'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs tracking-widest uppercase transition-colors duration-200 ${
              activeTab === tab
                ? 'border-b-2 border-primary text-primary -mb-px font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'photos' ? 'Photos' : 'Personalize'}
          </button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      {activeTab === 'photos' ? (

        /* Photos: description, dimensions, care + shipping + story + thread + size */
        <div className="flex flex-col gap-5">

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{displayDescription}</p>

          {/* Founder story snippet */}
          {displayFounderQuote && (
            <div className="bg-secondary/50 rounded-3xl p-6 border border-border/50">
              <p className="text-foreground/80 leading-relaxed italic">
                &ldquo;{displayFounderQuote}&rdquo;
              </p>
              <p className="font-[family-name:var(--font-cursive)] text-xl text-primary mt-3">
                — {displayFounderName}
              </p>
            </div>
          )}

          {/* Product color */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">
              Color: <span className="text-muted-foreground font-normal">{displayColors[selectedColor]?.name}</span>
            </p>
            <div className="flex gap-3">
              {displayColors.map((c, i) => {
                const unavailable = c.available === false
                return (
                  <button
                    key={c.name}
                    onClick={() => { if (!unavailable) setSelectedColor(i) }}
                    title={unavailable ? `${c.name} — out of stock` : c.name}
                    aria-label={unavailable ? `${c.name} — out of stock` : `Select color: ${c.name}`}
                    disabled={unavailable}
                    className={`relative w-10 h-10 rounded-full transition-all duration-200 ${
                      unavailable
                        ? 'opacity-40 cursor-not-allowed'
                        : selectedColor === i
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                          : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: c.color,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                      border: c.color === '#FFFFFF' || c.color === '#F5F2EE' ? '1px solid #E1DCD3' : 'none',
                    }}
                  >
                    {unavailable && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="block w-[130%] h-px bg-foreground/40 rotate-45" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dimensions */}
          {displayDimensions && (
            <div className="flex flex-col gap-1">
              <p className="text-xs tracking-widest uppercase text-muted-foreground">Dimensions</p>
              <p className="text-sm text-foreground">{displayDimensions}</p>
            </div>
          )}

          {/* Care */}
          {displayCare && (
            <div className="flex flex-col gap-1">
              <p className="text-xs tracking-widest uppercase text-muted-foreground">Care</p>
              <p className="text-sm text-foreground">{displayCare}</p>
            </div>
          )}
        </div>

      ) : (

        /* Personalize: steps 01–04 */
        <div className="flex flex-col gap-6">

          {/* ── Step 01: Thread Colour ──────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">01</span>
              Choose a Thread
              <span className="ml-1 text-muted-foreground font-normal">—&nbsp;{threadName}</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1.625rem)', gap: '0.375rem' }}>
              {threadSwatches.map((swatch) => (
                <button
                  key={swatch.name}
                  onClick={() => setTextColor(swatch.color)}
                  title={swatch.name}
                  aria-label={`Select thread color: ${swatch.name}`}
                  className={`w-[1.625rem] h-[1.625rem] rounded-full transition-all duration-200 ${
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

          {/* ── Step 02: Text & Font ────────────────────────────────────── */}
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
              className="w-full px-5 py-4 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200 text-base"
            />
            <div className="flex flex-wrap gap-2">
              {fontStyles.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontStyle(f.id)}
                  className={`px-4 py-2 rounded-xl border text-sm transition-all duration-200 ${
                    fontStyle === f.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {embroideryText.length}/40 characters
            </p>
          </div>

          {/* ── Step 03: Size ───────────────────────────────────────────── */}
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
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
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

          {/* ── Step 04: Motifs ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">04</span>
              Add Motifs
              <span className="text-xs text-muted-foreground font-normal">
                ({totalMotifs}/{maxMotifs})
              </span>
            </p>

            {atMax && (
              <p className="text-xs text-amber-600/80 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                Maximum motifs reached for this item
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {MOTIFS.map((emoji) => {
                const count = motifCounts[emoji] ?? 0
                return (
                  <div key={emoji} className="flex flex-col items-center gap-1.5">
                    {/* Emoji button — adds one instance */}
                    <button
                      onClick={() => { if (!atMax) onAddMotif(emoji) }}
                      aria-label={`Add ${emoji} motif`}
                      disabled={atMax}
                      className={`w-11 h-11 text-xl rounded-2xl border transition-all duration-200 ${
                        count > 0
                          ? 'border-primary bg-primary/10'
                          : atMax
                            ? 'border-border bg-background opacity-40 cursor-not-allowed'
                            : 'border-border bg-background hover:border-primary/50 hover:scale-105'
                      }`}
                    >
                      {emoji}
                    </button>

                    {/* Quantity control — visible only when count > 0 */}
                    {count > 0 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRemoveLastOfEmoji(emoji)}
                          aria-label={`Remove one ${emoji}`}
                          className="w-5 h-5 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground text-xs transition-all duration-150"
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-xs font-medium text-foreground tabular-nums">
                          {count}
                        </span>
                        <button
                          onClick={() => { if (!atMax) onAddMotif(emoji) }}
                          disabled={atMax}
                          aria-label={`Add one more ${emoji}`}
                          className="w-5 h-5 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground text-xs transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {totalMotifs > 0 && (
              <p className="text-xs text-muted-foreground">
                Drag motifs on the canvas to position them · press Delete to remove the selected one
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Always-visible: Add to Basket + Wishlist ──────────────────────── */}
      <div className="flex gap-4 pt-2 border-t border-border">
        <Button
          className="flex-1 py-6 text-base rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
          disabled={isSubmitting}
          onClick={handleAddToBasket}
        >
          {isSubmitting ? 'Adding…' : 'Add to Basket'}
        </Button>
        <Button
          variant="outline"
          className={`px-6 py-6 rounded-2xl border-border hover:border-primary/50 transition-colors duration-200 ${
            isWishlisted ? 'text-accent border-accent/30' : ''
          }`}
          onClick={() => setIsWishlisted(!isWishlisted)}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* ── Feature strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-primary" />
          </div>
          <span>{displayFeature1}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span>{displayFeature2}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4 text-primary" />
          </div>
          <span>{displayFeature3}</span>
        </div>
      </div>
    </div>
  )
}
