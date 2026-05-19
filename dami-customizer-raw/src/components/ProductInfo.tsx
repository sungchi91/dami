import React, { useState, useMemo } from 'react'
import { Truck, Sparkles, Gift, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ITEM_TYPES } from '@/config/products'
import type { TextSize, TextPosition, MotifEntry } from '@/hooks/useCustomizer'
import { buildCartPayload, submitToCart } from '@/lib/cart'

// ── Thread swatches ────────────────────────────────────────────────────────────

export const threadSwatches = [
  { name: 'Forest Pine',     color: '#183823' },
  { name: 'Deep Navy',       color: '#1B2F4A' },
  { name: 'Vintage Wood',    color: '#5C2B1E' },
  { name: 'Bordeaux',        color: '#9A1019' },
  { name: 'Ember Lane Blue', color: '#476E87' },
  { name: 'Pale Sky',        color: '#C5DCEC' },
  { name: 'Linen White',     color: '#F5EDD8' },
  { name: 'Canvas Stone',    color: '#EBEBDA' },
  { name: 'Thread Red',      color: '#B80606' },
  { name: 'True Black',      color: '#1A1A1A' },
]

const fontStyles = [
  { id: 'edwardian',    label: 'Elegant Script'  },
  { id: 'chateauneuf',  label: 'Delicate Script' },
  { id: 'ballantines',  label: 'Bold Script'     },
  { id: 'katelyn',      label: 'Playful Script'  },
  { id: 'garamond',     label: 'Classic Serif'   },
  { id: 'block',        label: 'Modern Block'    },
]

const TEXT_SIZE_MIN  = 0.5
const TEXT_SIZE_MAX  = 2.5
const TEXT_SIZE_STEP = 0.25

const FONT_SIZE_FLOOR: Record<string, number> = {}

const CDN = 'https://cdn.shopify.com/s/files/1/0990/0326/9486/files/'
const CB  = '?v=20260517'

function parseSz(s: string): number { return parseFloat(s.replace('p', '.')) }
// Each motif has a single PNG file named with its MIN size suffix; we re-scale on canvas for larger sizes.
function motifUrl(motif: { baseName: string; sizes: string[] }): string {
  return `${CDN}${motif.baseName}_${motif.sizes[0]}.png${CB}`
}

type MotifDef = { label: string; baseName: string; sizes: string[] }

const MOTIF_GROUPS: { group: string; motifs: MotifDef[] }[] = [
  { group: 'Drinks', motifs: [
    { label: 'Aperol Spritz',    baseName: 'motif_aperolSpritz',    sizes: ['1p57','1p97'] },
    { label: 'Champagne',        baseName: 'motif_champagne',        sizes: ['1p5','2','2p5'] },
    { label: 'Espresso Martini', baseName: 'motif_espressoMartini',  sizes: ['1p57','1p97'] },
    { label: 'Gin & Tonic',      baseName: 'motif_ginAndTonic',      sizes: ['1p57','1p97'] },
    { label: 'Martini',          baseName: 'motif_martini',          sizes: ['1p5','2','2p5'] },
    { label: 'Spicy Marg',       baseName: 'motif_spicyMarg',        sizes: ['1'] },
    { label: 'Tequila',          baseName: 'motif_tequila',          sizes: ['1'] },
  ]},
  { group: 'Food', motifs: [
    { label: 'Crab',             baseName: 'motif_crab',             sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Hamburger',        baseName: 'motif_hamburger',        sizes: ['1','1p5','2'] },
    { label: 'Hot Dog',          baseName: 'motif_hotDog',           sizes: ['1','1p5','2'] },
    { label: 'Lemons',           baseName: 'motif_lemons',           sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Lobster',          baseName: 'motif_lobster',          sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Olive Branch',     baseName: 'motif_oliveBranch',      sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Olive Oil',        baseName: 'motif_oliveOil',         sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Olive Pick',       baseName: 'motif_olivePick',        sizes: ['1','1p5','2'] },
    { label: 'Oysters',          baseName: 'motif_oysters',          sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Pizza',            baseName: 'motif_pizza',            sizes: ['1','1p5','2'] },
    { label: 'Sardines',         baseName: 'motif_sardines',         sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Taco',             baseName: 'motif_taco',             sizes: ['1','1p5','2'] },
    { label: 'Tomatoes',         baseName: 'motif_tomatoes',         sizes: ['1','1p5','2','2p5','3'] },
  ]},
  { group: 'Beauty', motifs: [
    { label: 'Brush',            baseName: 'motif_brush',            sizes: ['1p4','1p6','2'] },
    { label: 'Cream',            baseName: 'motif_cream',            sizes: ['1','1p2','1p6'] },
    { label: 'Eye Shadow',       baseName: 'motif_eyeShadow',        sizes: ['1p2','1p4','1p8'] },
    { label: 'Eyelash Curler',   baseName: 'motif_eyelashCurler',    sizes: ['1p2','1p4','1p8'] },
    { label: 'Face Mask',        baseName: 'motif_faceMask',         sizes: ['1p4','1p6','2'] },
    { label: 'Facial Massager',  baseName: 'motif_facialMassager',   sizes: ['1p4','1p6','2'] },
    { label: 'Gua Sha',          baseName: 'motif_guaSha',           sizes: ['1','1p2','1p6'] },
    { label: 'Hand Cream',       baseName: 'motif_handCream',        sizes: ['1p4','1p6','2'] },
    { label: 'Lip Gloss',        baseName: 'motif_lipGloss',         sizes: ['1p4','1p6','2'] },
    { label: 'Lips',             baseName: 'motif_lips',             sizes: ['1','1p2','1p6'] },
    { label: 'Lipstick',         baseName: 'motif_lipstick',         sizes: ['1p2','1p4','1p8'] },
    { label: 'Mirror',           baseName: 'motif_mirror',           sizes: ['1p2','1p4','1p8'] },
    { label: 'Perfume',          baseName: 'motif_perfume',          sizes: ['1p2','1p4','1p8'] },
    { label: 'Perfume (Clean)',  baseName: 'motif_perfumeClean',     sizes: ['1p2','1p4','1p8'] },
    { label: 'Red Lipstick',     baseName: 'motif_redLipstick',      sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Serum',            baseName: 'motif_serum',            sizes: ['1p4','1p6','2'] },
    { label: 'Vintage Perfume',  baseName: 'motif_vintagePerfume',   sizes: ['1','1p5','2','2p5','3'] },
  ]},
  { group: 'Fashion', motifs: [
    { label: 'Bow',              baseName: 'motif_bow',              sizes: ['0p94','1p1','1p46','1p73','1p97','2p32','2p72','3p27','3p9'] },
    { label: 'Flat Hair Clip',   baseName: 'motif_flatHairClip',     sizes: ['1p4','1p6','2'] },
    { label: 'Hair Clip',        baseName: 'motif_hairClip',         sizes: ['1p2','1p4','1p8'] },
    { label: 'Hair Comb',        baseName: 'motif_hairComb',         sizes: ['1p2','1p4','1p8'] },
    { label: 'Handbag',          baseName: 'motif_handbag',          sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Heel',             baseName: 'motif_heel',             sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Scarf',            baseName: 'motif_scarf',            sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Scrunchie',        baseName: 'motif_scrunchie',        sizes: ['1p2','1p4','1p8'] },
    { label: 'Sunglasses',       baseName: 'motif_sunglasses',       sizes: ['1','1p5','2','2p5','3'] },
  ]},
  { group: 'Golf', motifs: [
    { label: 'Golf Cart',        baseName: 'motif_golfCart',         sizes: ['1','1p5','2','2p5'] },
    { label: 'Golf Club Bag',    baseName: 'motif_golfClubBag',      sizes: ['1','1p5','2','2p5'] },
    { label: 'Golf Flag',        baseName: 'motif_golfFlag',         sizes: ['1','1p5','2','2p5'] },
  ]},
  { group: 'NYC', motifs: [
    { label: 'NYC Apple',        baseName: 'motif_nycApple',         sizes: ['1p25','1p75','2p25'] },
    { label: 'NYC Crown',        baseName: 'motif_nycCrown',         sizes: ['1','1p5','2'] },
    { label: 'NYC Empire',       baseName: 'motif_nycEmpire',        sizes: ['1p5','2','2p5'] },
    { label: 'NYC Taxi',         baseName: 'motif_nycTaxi',          sizes: ['1p5','2','2p5'] },
  ]},
  { group: 'Lifestyle', motifs: [
    { label: 'Cigarette',        baseName: 'motif_cigarette',        sizes: ['1','1p5','2','2p5','3'] },
    { label: 'Heart',            baseName: 'motif_heart',            sizes: ['0p8','1','1p4'] },
    { label: 'Palm Tree',        baseName: 'motif_palmTree',         sizes: ['1','2'] },
    { label: 'Pomeranian',       baseName: 'motif_pomeranian',       sizes: ['2p2','2p8','3p8'] },
  ]},
]

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
  onAddMotif:           (url: string, label: string, baseName: string, widthInches: number) => void
  onRemoveMotif:        (id: string) => void
  onUpdateMotifsByBaseName: (baseName: string, newUrl: string, newWidthInches: number) => void
  maxMotifs:         number
  categoryLabel:     string
  tagline:           string
  description:       string
  founderQuote:      string
  founderName:       string
  colors:            { name: string; color: string; available?: boolean; variantId?: number; variantsByCount?: Record<string, { id: number; price: string }>; mediaId?: string; imageUrl?: string }[]
  selectedColor:     number
  onColorChange:     (mediaId: string, imageUrl: string, idx: number) => void
  motifCountOptions:    string[]
  selectedMotifCount:   string
  onMotifCountChange:   (v: string) => void
  feature1:          string
  feature2:          string
  feature3:          string
  dimension:         string
  care:              string
  customizerType?:   string
  available?:        boolean
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
  onUpdateMotifsByBaseName,
  maxMotifs,
  categoryLabel,
  tagline,
  description,
  founderQuote,
  founderName,
  colors,
  selectedColor,
  onColorChange,
  motifCountOptions,
  selectedMotifCount,
  onMotifCountChange,
  feature1,
  feature2,
  feature3,
  dimension,
  care,
  customizerType,
  available = true,
}: ProductInfoProps) {
  const [isSubmitting,    setIsSubmitting]    = useState(false)
  const [exceededWarning, setExceededWarning] = useState(false)
  const [quantity,        setQuantity]        = useState(1)
  const [motifSizeIdx,    setMotifSizeIdx]    = useState<Record<string, number>>({})

  const handleAddToBasket = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = buildCartPayload({ selectedItem, embroideryText, fontStyle, textColor, textSize, textPosition, motifEntries, customizerType })
      await submitToCart(variantId, payload, quantity, customizerType)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Add to basket failed:', err)
      alert(`Something went wrong adding to basket: ${msg}`)
      setIsSubmitting(false)
    }
  }

  // Motif availability based on layout type
  const isMotifOnly   = customizerType === 'side-motif' || customizerType === 'classic-motif'
  const showTextStep  = !isMotifOnly
  const showMotifStep = !customizerType || customizerType === 'freeform'
    || customizerType === 'crown' || customizerType === 'pedestal' || customizerType === 'sidenote'
    || customizerType === 'side-motif' || customizerType === 'classic-motif'

  const hasInput = (showTextStep && embroideryText.trim().length > 0)
    || (showMotifStep && motifEntries.length > 0)
  const layoutMax = (customizerType === 'sidenote' || customizerType === 'side-motif' || customizerType === 'classic-motif') ? 1 : maxMotifs
  const countMax  = selectedMotifCount ? parseInt(selectedMotifCount, 10) : Infinity
  const effectiveMaxMotifs = Math.min(layoutMax, isFinite(countMax) ? countMax : layoutMax)

  const motifCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const entry of motifEntries) {
      counts[entry.baseName] = (counts[entry.baseName] ?? 0) + 1
    }
    return counts
  }, [motifEntries])

  const totalMotifs = motifEntries.length
  const atMax       = totalMotifs >= effectiveMaxMotifs

  const handleRemoveLastOfBaseName = (baseName: string) => {
    const last = [...motifEntries].reverse().find(e => e.baseName === baseName)
    if (last) { onRemoveMotif(last.id); setExceededWarning(false) }
  }

  const handleSizeChange = (motif: MotifDef, delta: number) => {
    const cur = motifSizeIdx[motif.baseName] ?? 0
    const next = Math.max(0, Math.min(motif.sizes.length - 1, cur + delta))
    if (next === cur) return
    setMotifSizeIdx(prev => ({ ...prev, [motif.baseName]: next }))
    onUpdateMotifsByBaseName(motif.baseName, motifUrl(motif), parseSz(motif.sizes[next]))
  }

  const selectedThreadIndex = threadSwatches.findIndex(s => s.color === textColor)
  const threadName = threadSwatches[selectedThreadIndex < 0 ? 0 : selectedThreadIndex].name

  return (
    <div className="flex flex-col gap-6">

      {/* ── Product overview (always visible) ─────────────────────────────── */}
      {!showPersonalize && (
        <div className="flex flex-col gap-5">
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{description.trim()}</p>
          )}
          {dimension && (
            <p className="text-sm text-muted-foreground">{dimension}</p>
          )}
          {care && (
            <p className="text-sm text-muted-foreground">{care}</p>
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

          {motifCountOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">
                Number of Motifs: <span className="text-muted-foreground font-normal">{selectedMotifCount}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {motifCountOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => onMotifCountChange(opt)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedMotifCount === opt
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 scale-110'
                        : 'bg-secondary text-foreground hover:bg-secondary/70 hover:scale-105'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
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

          <div className="flex flex-col gap-3 text-sm text-muted-foreground border-t border-border pt-4">
            <div className="flex gap-3">
              <span className="font-medium text-foreground shrink-0 w-32">Production Time</span>
              <span>Ships within 5–7 business days.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-medium text-foreground shrink-0 w-32">Return</span>
              <span>All items are made to order and final sale. No returns or exchanges.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-medium text-foreground shrink-0 w-32">Disclaimer</span>
              <span className="leading-relaxed">
                Mockups are approximate. Minor variations may occur in the final embroidered result.
                <br /><br />
                Font rendering varies by device and browser. The stitched result follows the font name and reference images shown in the Custom Font section.
                <br /><br />
                Thread color selections are final once the order is placed. Light thread colors on light backgrounds may result in low contrast, particularly on fine-line or detailed designs. For best visibility, choose a darker thread color.
                {(ITEM_TYPES[selectedItem] ?? '').toLowerCase().includes('tote') && (
                  <><br /><br />Embroidery placed on the front pocket will close the pocket opening.</>
                )}
              </span>
            </div>
          </div>
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
          {!isMotifOnly && <div className="flex flex-col gap-3">
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
                    border: ['#F5EDD8', '#EBEBDA', '#C5DCEC', '#FFFFFF'].includes(swatch.color) ? '1px solid #ccc' : 'none',
                  }}
                />
              ))}
            </div>
          </div>}

          {/* 02 · Text */}
          {showTextStep && <div className="flex flex-col gap-3">
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
                  onClick={() => { setFontStyle(f.id); const floor = FONT_SIZE_FLOOR[f.id] ?? TEXT_SIZE_MIN; if (textSize < floor) setTextSize(floor) }}
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
          </div>}

          {/* 03 · Size */}
          {showTextStep && <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">03</span>
              Text Size
            </p>
            <div className="flex items-center gap-2">
              {(() => {
                const effectiveMin = Math.max(TEXT_SIZE_MIN, FONT_SIZE_FLOOR[fontStyle] ?? 0)
                return (<>
                  <button
                    onClick={() => setTextSize(Math.max(effectiveMin, parseFloat((textSize - TEXT_SIZE_STEP).toFixed(2))))}
                    disabled={textSize <= effectiveMin}
                    className="flex-1 py-3 border text-sm font-medium transition-all duration-200 hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <button
                    onClick={() => setTextSize(Math.min(TEXT_SIZE_MAX, parseFloat((textSize + TEXT_SIZE_STEP).toFixed(2))))}
                    disabled={textSize >= TEXT_SIZE_MAX}
                    className="flex-1 py-3 border text-sm font-medium transition-all duration-200 hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </>)
              })()}
            </div>
          </div>}

          {/* Motifs */}
          {showMotifStep && (
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="font-[family-name:var(--font-cursive)] text-lg text-primary leading-none">{isMotifOnly ? '01' : '04'}</span>
              Add Motifs
              <span className="text-xs text-muted-foreground font-normal">({totalMotifs}/{effectiveMaxMotifs})</span>
            </p>

            {exceededWarning && (
              <p className="text-xs text-amber-600/80 bg-amber-50 border border-amber-200 px-3 py-2">
                Maximum motifs reached for this item
              </p>
            )}

            <div className="flex flex-col gap-4">
              {MOTIF_GROUPS.map(({ group, motifs }) => (
                <div key={group}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">{group}</p>
                  <div className="flex flex-wrap gap-3">
                    {motifs.map((motif) => {
                      const count    = motifCounts[motif.baseName] ?? 0
                      const sizeIdx  = motifSizeIdx[motif.baseName] ?? 0
                      const curUrl   = motifUrl(motif)
                      const curWidth = parseSz(motif.sizes[sizeIdx])
                      return (
                        <div key={motif.baseName} className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => { if (!atMax) { onAddMotif(curUrl, motif.label, motif.baseName, curWidth); setExceededWarning(false) } else setExceededWarning(true) }}
                            aria-label={`Add ${motif.label}`}
                            className={`w-16 h-16 border transition-all duration-200 flex items-center justify-center p-1 ${
                              count > 0 ? 'border-primary bg-primary/10' :
                              atMax ? 'border-border bg-background opacity-40 cursor-not-allowed' :
                              'border-border bg-background hover:border-primary/50 hover:scale-105'
                            }`}
                          >
                            <img src={curUrl} alt={motif.label} className="w-full h-full object-contain" />
                          </button>
                          <span className="text-xs text-muted-foreground text-center leading-tight max-w-[4rem]">{motif.label}</span>
                          {count > 0 && (
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleRemoveLastOfBaseName(motif.baseName)} className="w-5 h-5 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 text-xs">−</button>
                                <span className="w-4 text-center text-xs font-medium tabular-nums">{count}</span>
                                <button onClick={() => { if (!atMax) { onAddMotif(curUrl, motif.label, motif.baseName, curWidth); setExceededWarning(false) } else setExceededWarning(true) }} className="w-5 h-5 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 text-xs">+</button>
                              </div>
                              {motif.sizes.length > 1 && (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleSizeChange(motif, -1)} disabled={sizeIdx === 0} className="w-5 h-5 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 text-xs disabled:opacity-30">‹</button>
                                  <span className="w-4 text-center" style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>size</span>
                                  <button onClick={() => handleSizeChange(motif, 1)} disabled={sizeIdx === motif.sizes.length - 1} className="w-5 h-5 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 text-xs disabled:opacity-30">›</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {totalMotifs > 0 && customizerType === 'freeform' && (
              <p className="text-xs text-muted-foreground">Drag motifs on the canvas to position them · press Delete to remove</p>
            )}
          </div>
          )}

          {/* ── Quantity ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Quantity</p>
            <div className="flex items-center w-fit border border-border">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="px-4 py-2 text-sm text-center min-w-[2.5rem]">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-primary/50"
              >
                +
              </button>
            </div>
          </div>

          {/* ── Add to Basket ────────────────────────────────────────────────── */}
          <div className="flex gap-4 pt-2 border-t border-border">
            {available ? (
              <Button
                className="flex-1 py-6 text-base bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
                disabled={isSubmitting || !hasInput}
                onClick={handleAddToBasket}
              >
                {isSubmitting ? 'Adding…' : 'Add to Basket'}
              </Button>
            ) : (
              <Button
                className="flex-1 py-6 text-base"
                disabled
              >
                Sold Out
              </Button>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
