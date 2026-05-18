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

type MotifDef = { label: string; url: string; widthInches: number }

const MOTIF_GROUPS: { group: string; motifs: MotifDef[] }[] = [
  { group: 'Drinks', motifs: [
    { label: 'Aperol Spritz',    url: CDN + 'motif_aperolSpritz_1p57.png'   + CB, widthInches: 1.57 },
    { label: 'Champagne',        url: CDN + 'motif_champagne_1p5.png'        + CB, widthInches: 1.5  },
    { label: 'Espresso Martini', url: CDN + 'motif_espressoMartini_1p57.png' + CB, widthInches: 1.57 },
    { label: 'Gin & Tonic',      url: CDN + 'motif_ginAndTonic_1p57.png'     + CB, widthInches: 1.57 },
    { label: 'Martini',          url: CDN + 'motif_martini_1p5.png'          + CB, widthInches: 1.5  },
    { label: 'Spicy Marg',       url: CDN + 'motif_spicyMarg_1.png'          + CB, widthInches: 1.0  },
    { label: 'Tequila',          url: CDN + 'motif_tequila_1.png'            + CB, widthInches: 1.0  },
  ]},
  { group: 'Food', motifs: [
    { label: 'Crab',             url: CDN + 'motif_crab_1.png'               + CB, widthInches: 1.0  },
    { label: 'Hamburger',        url: CDN + 'motif_hamburger_1.png'          + CB, widthInches: 1.0  },
    { label: 'Hot Dog',          url: CDN + 'motif_hotDog_1.png'             + CB, widthInches: 1.0  },
    { label: 'Lemons',           url: CDN + 'motif_lemons_1.png'             + CB, widthInches: 1.0  },
    { label: 'Lobster',          url: CDN + 'motif_lobster_1.png'            + CB, widthInches: 1.0  },
    { label: 'Olive Branch',     url: CDN + 'motif_oliveBranch_1.png'        + CB, widthInches: 1.0  },
    { label: 'Olive Oil',        url: CDN + 'motif_oliveOil_1.png'           + CB, widthInches: 1.0  },
    { label: 'Olive Pick',       url: CDN + 'motif_olivePick_1.png'          + CB, widthInches: 1.0  },
    { label: 'Oysters',          url: CDN + 'motif_oysters_1.png'            + CB, widthInches: 1.0  },
    { label: 'Pizza',            url: CDN + 'motif_pizza_1.png'              + CB, widthInches: 1.0  },
    { label: 'Sardines',         url: CDN + 'motif_sardines_1.png'           + CB, widthInches: 1.0  },
    { label: 'Taco',             url: CDN + 'motif_taco_1.png'               + CB, widthInches: 1.0  },
    { label: 'Tomatoes',         url: CDN + 'motif_tomatoes_1.png'           + CB, widthInches: 1.0  },
  ]},
  { group: 'Beauty', motifs: [
    { label: 'Brush',            url: CDN + 'motif_brush_1p4.png'            + CB, widthInches: 1.4  },
    { label: 'Cream',            url: CDN + 'motif_cream_1.png'              + CB, widthInches: 1.0  },
    { label: 'Eye Shadow',       url: CDN + 'motif_eyeShadow_1p2.png'        + CB, widthInches: 1.2  },
    { label: 'Eyelash Curler',   url: CDN + 'motif_eyelashCurler_1p2.png'    + CB, widthInches: 1.2  },
    { label: 'Face Mask',        url: CDN + 'motif_faceMask_1p4.png'         + CB, widthInches: 1.4  },
    { label: 'Facial Massager',  url: CDN + 'motif_facialMassager_1p4.png'   + CB, widthInches: 1.4  },
    { label: 'Gua Sha',          url: CDN + 'motif_guaSha_1.png'             + CB, widthInches: 1.0  },
    { label: 'Hand Cream',       url: CDN + 'motif_handCream_1p4.png'        + CB, widthInches: 1.4  },
    { label: 'Lip Gloss',        url: CDN + 'motif_lipGloss_1p4.png'         + CB, widthInches: 1.4  },
    { label: 'Lips',             url: CDN + 'motif_lips_1.png'               + CB, widthInches: 1.0  },
    { label: 'Lipstick',         url: CDN + 'motif_lipstick_1p2.png'         + CB, widthInches: 1.2  },
    { label: 'Mirror',           url: CDN + 'motif_mirror_1p2.png'           + CB, widthInches: 1.2  },
    { label: 'Perfume',          url: CDN + 'motif_perfume_1p2.png'          + CB, widthInches: 1.2  },
    { label: 'Perfume (Clean)',  url: CDN + 'motif_perfumeClean_1p2.png'     + CB, widthInches: 1.2  },
    { label: 'Red Lipstick',     url: CDN + 'motif_redLipstick_1.png'        + CB, widthInches: 1.0  },
    { label: 'Serum',            url: CDN + 'motif_serum_1p4.png'            + CB, widthInches: 1.4  },
    { label: 'Vintage Perfume',  url: CDN + 'motif_vintagePerfume_1.png'     + CB, widthInches: 1.0  },
  ]},
  { group: 'Fashion', motifs: [
    { label: 'Bow',              url: CDN + 'motif_bow_0p94.png'             + CB, widthInches: 0.94 },
    { label: 'Flat Hair Clip',   url: CDN + 'motif_flatHairClip_1p4.png'     + CB, widthInches: 1.4  },
    { label: 'Hair Clip',        url: CDN + 'motif_hairClip_1p2.png'         + CB, widthInches: 1.2  },
    { label: 'Hair Comb',        url: CDN + 'motif_hairComb_1p2.png'         + CB, widthInches: 1.2  },
    { label: 'Handbag',          url: CDN + 'motif_handbag_1.png'            + CB, widthInches: 1.0  },
    { label: 'Heel',             url: CDN + 'motif_heel_1.png'               + CB, widthInches: 1.0  },
    { label: 'Scarf',            url: CDN + 'motif_scarf_1.png'              + CB, widthInches: 1.0  },
    { label: 'Scrunchie',        url: CDN + 'motif_scrunchie_1p2.png'        + CB, widthInches: 1.2  },
    { label: 'Sunglasses',       url: CDN + 'motif_sunglasses_1.png'         + CB, widthInches: 1.0  },
  ]},
  { group: 'Golf', motifs: [
    { label: 'Golf Cart',        url: CDN + 'motif_golfCart_1.png'           + CB, widthInches: 1.0  },
    { label: 'Golf Club Bag',    url: CDN + 'motif_golfClubBag_1.png'        + CB, widthInches: 1.0  },
    { label: 'Golf Flag',        url: CDN + 'motif_golfFlag_1.png'           + CB, widthInches: 1.0  },
  ]},
  { group: 'NYC', motifs: [
    { label: 'NYC Apple',        url: CDN + 'motif_nycApple_1p25.png'        + CB, widthInches: 1.25 },
    { label: 'NYC Crown',        url: CDN + 'motif_nycCrown_1.png'           + CB, widthInches: 1.0  },
    { label: 'NYC Empire',       url: CDN + 'motif_nycEmpire_1p5.png'        + CB, widthInches: 1.5  },
    { label: 'NYC Taxi',         url: CDN + 'motif_nycTaxi_1p5.png'          + CB, widthInches: 1.5  },
  ]},
  { group: 'Lifestyle', motifs: [
    { label: 'Cigarette',        url: CDN + 'motif_cigarette_1.png'          + CB, widthInches: 1.0  },
    { label: 'Heart',            url: CDN + 'motif_heart_0p8.png'            + CB, widthInches: 0.8  },
    { label: 'Palm Tree',        url: CDN + 'motif_palmTree_1.png'           + CB, widthInches: 1.0  },
    { label: 'Pomeranian',       url: CDN + 'motif_pomeranian_2p2.png'       + CB, widthInches: 2.2  },
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
  onAddMotif:        (url: string, label: string, widthInches: number) => void
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
  dimension,
  care,
  customizerType,
  available = true,
}: ProductInfoProps) {
  const [isSubmitting,    setIsSubmitting]    = useState(false)
  const [exceededWarning, setExceededWarning] = useState(false)
  const [quantity,        setQuantity]        = useState(1)

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
  const effectiveMaxMotifs = (customizerType === 'sidenote' || customizerType === 'side-motif' || customizerType === 'classic-motif') ? 1 : maxMotifs

  const motifCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const entry of motifEntries) {
      counts[entry.url] = (counts[entry.url] ?? 0) + 1
    }
    return counts
  }, [motifEntries])

  const totalMotifs = motifEntries.length
  const atMax       = totalMotifs >= effectiveMaxMotifs

  const handleRemoveLastOfUrl = (url: string) => {
    const last = [...motifEntries].reverse().find(e => e.url === url)
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
                      const count = motifCounts[motif.url] ?? 0
                      return (
                        <div key={motif.url} className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => { if (!atMax) { onAddMotif(motif.url, motif.label, motif.widthInches); setExceededWarning(false) } else setExceededWarning(true) }}
                            aria-label={`Add ${motif.label}`}
                            className={`w-16 h-16 border transition-all duration-200 flex items-center justify-center p-1 ${
                              count > 0 ? 'border-primary bg-primary/10' :
                              atMax ? 'border-border bg-background opacity-40 cursor-not-allowed' :
                              'border-border bg-background hover:border-primary/50 hover:scale-105'
                            }`}
                          >
                            <img src={motif.url} alt={motif.label} className="w-full h-full object-contain" />
                          </button>
                          <span className="text-xs text-muted-foreground text-center leading-tight max-w-[4rem]">{motif.label}</span>
                          {count > 0 && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleRemoveLastOfUrl(motif.url)} className="w-5 h-5 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 text-xs">−</button>
                              <span className="w-4 text-center text-xs font-medium tabular-nums">{count}</span>
                              <button onClick={() => { if (!atMax) { onAddMotif(motif.url, motif.label, motif.widthInches); setExceededWarning(false) } else setExceededWarning(true) }} className="w-5 h-5 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 text-xs">+</button>
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
