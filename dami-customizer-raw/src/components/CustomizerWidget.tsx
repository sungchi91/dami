import { useState, useEffect, useCallback } from 'react'
import { createPortal }                     from 'react-dom'
import { CanvasEditor }        from './CanvasEditor'
import { FixedCanvasEditor }   from './FixedCanvasEditor'
import { ProductInfo }         from './ProductInfo'
import { useCustomizer }       from '@/hooks/useCustomizer'
import { ITEM_TYPES, resolveItemType } from '@/config/products'

const CDN_BASE = 'https://cdn.shopify.com/s/files/1/0990/0326/9486/files/'

type CdnEntry = { slug: string; ext: 'jpg' | 'png' }
const CDN_CANVAS_MAP: Record<string, Record<string, CdnEntry>> = {
  grand: {
    navy:    { slug: 'large-navy',    ext: 'jpg' },
    natural: { slug: 'large-natural', ext: 'png' },
    tan:     { slug: 'large-tan',     ext: 'png' },
    green:   { slug: 'large-green',   ext: 'png' },
    red:     { slug: 'large-red',     ext: 'png' },
    brown:   { slug: 'large-brown',   ext: 'png' },
  },
  signature: {
    navy:    { slug: 'med-navy',    ext: 'jpg' },
    natural: { slug: 'med-natural', ext: 'png' },
    tan:     { slug: 'med-tan',     ext: 'png' },
    green:   { slug: 'med-green',   ext: 'png' },
    red:     { slug: 'med-red',     ext: 'png' },
    brown:   { slug: 'med-brown',   ext: 'png' },
    petrol:  { slug: 'med-teal',    ext: 'png' },
  },
  petite: {
    navy:    { slug: 'mini-navy',    ext: 'png' },
    natural: { slug: 'mini-natural', ext: 'png' },
    tan:     { slug: 'mini-tan',     ext: 'png' },
    green:   { slug: 'mini-green',   ext: 'png' },
    red:     { slug: 'mini-red',     ext: 'png' },
    brown:   { slug: 'mini-brown',   ext: 'png' },
    petrol:  { slug: 'mini-teal',    ext: 'png' },
    pink:    { slug: 'mini-pink',    ext: 'png' },
  },
}

function getProductKey(title: string): string | null {
  const t = title.toLowerCase()
  if (t.includes('grand'))     return 'grand'
  if (t.includes('signature')) return 'signature'
  if (t.includes('petit'))     return 'petite'
  return null
}

function getCDNCanvasImage(productTitle: string, colorName: string): string | null {
  const productKey = getProductKey(productTitle)
  if (!productKey) return null
  const lower = colorName.toLowerCase()
  const colorMap = CDN_CANVAS_MAP[productKey]
  const key = Object.keys(colorMap).find(k => lower.includes(k))
  if (!key) return null
  const entry = colorMap[key]
  return `${CDN_BASE}${entry.slug}-front.${entry.ext}`
}

const COLOR_NAME_HEX: Record<string, string> = {
  'navy':          '#223A59',
  'navy blue':     '#223A59',
  'natural':       '#F0EBE0',
  'cream':         '#F5F2EE',
  'black':         '#1A1A1A',
  'white':         '#FFFFFF',
  'ivory':         '#FAF8F5',
  'tan':           '#C8AD92',
  'camel':         '#C8AD92',
  'brown':         '#87634B',
  'olive':         '#85A384',
  'sage':          '#85A384',
  'forest':        '#214D32',
  'green':         '#3E7756',
  'red':           '#C43634',
  'burgundy':      '#9A2A2B',
  'blush':         '#DFB1BE',
  'pink':          '#C68798',
  'blue':          '#7594B4',
  'petrol':        '#2E5266',
  'slate':         '#5A6168',
  'grey':          '#A6A9A7',
  'gray':          '#A6A9A7',
  'charcoal':      '#2C3338',
  'sand':          '#C8AD92',
  'stone':         '#E1DCD3',
  'terracotta':    '#C46D42',
  'mustard':       '#DBAD53',
  'yellow':        '#DBAD53',
  'powder pink':   '#E8D6CA',
}

function colorNameToHex(name: string): string {
  return COLOR_NAME_HEX[name.toLowerCase()] ?? '#C8AD92'
}

function readDataset() {
  const el = document.getElementById('ember-lane-customizer')
  const d  = el?.dataset ?? {}
  const title = d.productTitle ?? ''
  const resolved = resolveItemType(title)
  const idx      = ITEM_TYPES.indexOf(resolved)
  return {
    selectedItem:  idx >= 0 ? idx : 0,
    variantId:     d.currentVariantId ? parseInt(d.currentVariantId, 10) : 0,
    productPrice:  d.productPrice   ?? '',
    canvasImage:   d.canvasImage    ?? '',
    canvasBgColor: d.canvasBgColor  ?? '',
    coverMediaId:   d.coverMediaId    ?? '',
    customizerType: d.customizerType  ?? 'freeform',
    maxMotifs:      d.maxMotifs ? parseInt(d.maxMotifs, 10) : 3,
    categoryLabel: d.categoryLabel  ?? '',
    tagline:       d.tagline        ?? '',
    description:   d.description    ?? '',
    founderQuote:  d.founderQuote   ?? '',
    founderName:   d.founderName    ?? '',
    feature1:      d['feature-1']   ?? '',
    feature2:      d['feature-2']   ?? '',
    feature3:      d['feature-3']   ?? '',
    colors: (() => {
try {
        const parsed = JSON.parse(d.colors ?? '[]')
        if (!Array.isArray(parsed)) return []
        return parsed.map((c: { name: string; color?: string; available?: boolean; variantId?: number; mediaId?: string; imageUrl?: string }) => ({
          ...c,
          color: c.color || colorNameToHex(c.name ?? ''),
          canvasImageUrl: getCDNCanvasImage(title, c.name ?? '') ?? undefined,
        })) as { name: string; color: string; available?: boolean; variantId?: number; mediaId?: string; imageUrl?: string; canvasImageUrl?: string }[]
      } catch { return [] }
    })(),
  }
}

const shopifyData = readDataset()

export default function CustomizerWidget() {
  const {
    selectedItem, variantId, productPrice, canvasImage,
    canvasBgColor, customizerType, maxMotifs, categoryLabel, tagline,
    description, founderQuote, founderName, colors,
    feature1, feature2, feature3,
  } = shopifyData

  const {
    coverMediaId,
    embroideryText,  setEmbroideryText,
    textColor,       setTextColor,
    fontStyle,       setFontStyle,
    textSize,        setTextSize,
    textPosition,    onPositionChange,
    motifEntries,    addMotif,
    removeMotif,     updateMotifPosition,
  } = useCustomizer()

  const [showPersonalize, setShowPersonalize] = useState(false)
  const [hasPersonalized, setHasPersonalized] = useState(false)
  const [selectedColor,   setSelectedColor]   = useState(0)

  // Canvas prefers CDN mockup image, then variant image, then product cover
  const activeCanvasImage  = colors[selectedColor]?.canvasImageUrl || colors[selectedColor]?.imageUrl || canvasImage || undefined
  const activeVariantId    = colors[selectedColor]?.variantId ?? variantId

  const handleColorChange = useCallback((mediaId: string, imageUrl: string, colorIdx: number) => {
    setSelectedColor(colorIdx)
    const gallery = document.querySelector('media-gallery') as (HTMLElement & { setActiveMedia?: (id: string, prepend: boolean) => void }) | null
    if (!gallery) return

    // Try native gallery swap first (works when variant images are in the slider)
    const mediaEl = mediaId ? gallery.querySelector(`[data-media-id="${mediaId}"]`) : null
    if (mediaEl) {
      gallery.setActiveMedia?.(mediaId, false)
      return
    }

    // Variant images hidden from gallery — swap the active slide's img src directly
    if (imageUrl) {
      const activeImg = gallery.querySelector('.product__media-item.is-active img') as HTMLImageElement | null
      if (activeImg) {
        activeImg.src = imageUrl
        activeImg.srcset = ''
      }
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Direct DOM toggle happens synchronously so Fabric.js gets real canvas dimensions.
  const handlePersonalize = useCallback(() => {
    const photosPanel  = document.getElementById('ember-lane-photos-panel')
    const canvasPortal = document.getElementById('ember-lane-canvas-portal')
    if (photosPanel)  photosPanel.style.display  = 'none'
    if (canvasPortal) canvasPortal.style.display = 'block'
    setHasPersonalized(true)
    setShowPersonalize(true)
  }, [])

  const handleBack = useCallback(() => {
    const photosPanel  = document.getElementById('ember-lane-photos-panel')
    const canvasPortal = document.getElementById('ember-lane-canvas-portal')
    if (photosPanel)  photosPanel.style.display  = ''
    if (canvasPortal) canvasPortal.style.display = 'none'
    setShowPersonalize(false)
  }, [])

  const canvasPortalEl = document.getElementById('ember-lane-canvas-portal')

  return (
    <>
      <ProductInfo
        showPersonalize={showPersonalize}
        onPersonalize={handlePersonalize}
        onBack={handleBack}
        embroideryText={embroideryText}
        setEmbroideryText={setEmbroideryText}
        textColor={textColor}
        setTextColor={setTextColor}
        fontStyle={fontStyle}
        setFontStyle={setFontStyle}
        textSize={textSize}
        setTextSize={setTextSize}
        variantId={activeVariantId}
        selectedItem={selectedItem}
        productPrice={productPrice}
        textPosition={textPosition}
        motifEntries={motifEntries}
        onAddMotif={addMotif}
        onRemoveMotif={removeMotif}
        maxMotifs={maxMotifs}
        categoryLabel={categoryLabel}
        tagline={tagline}
        description={description}
        founderQuote={founderQuote}
        founderName={founderName}
        colors={colors}
        selectedColor={selectedColor}
        onColorChange={handleColorChange}
        feature1={feature1}
        feature2={feature2}
        feature3={feature3}
        customizerType={customizerType}
      />

      {hasPersonalized && canvasPortalEl && createPortal(
        <div className="ember-lane-customizer-scope">
          {customizerType === 'freeform' ? (
            <CanvasEditor
              embroideryText={embroideryText}
              textColor={textColor}
              fontStyle={fontStyle}
              textSize={textSize}
              selectedItem={selectedItem}
              canvasImage={activeCanvasImage}
              canvasBgColor={canvasBgColor || undefined}
              onPositionChange={onPositionChange}
              motifEntries={motifEntries}
              onMotifPositionChange={updateMotifPosition}
              onRemoveMotif={removeMotif}
            />
          ) : (
            <FixedCanvasEditor
              embroideryText={embroideryText}
              textColor={textColor}
              fontStyle={fontStyle}
              textSize={textSize}
              selectedItem={selectedItem}
              canvasImage={activeCanvasImage}
              canvasBgColor={canvasBgColor || undefined}
              motifEntries={motifEntries}
              customizerType={customizerType}
            />
          )}
        </div>,
        canvasPortalEl
      )}
    </>
  )
}
