import { useState }              from 'react'
import { ProductGallery }        from './components/ProductGallery'
import { ProductInfo }           from './components/ProductInfo'
import { ProductStory }          from './components/ProductStory'
import { useCustomizer }         from './hooks/useCustomizer'
import { ITEM_TYPES }            from './config/products'

function readDataset() {
  const el = document.getElementById('dami-customizer')
  const d  = el?.dataset ?? {}
  const title = d.productTitle ?? ''
  const idx   = ITEM_TYPES.findIndex(t => t.toLowerCase() === title.toLowerCase())
  return {
    selectedItem:    idx >= 0 ? idx : 0,
    variantId:       d.currentVariantId ? parseInt(d.currentVariantId, 10) : 0,
    productPrice:    d.productPrice    ?? '',
    canvasImage:     d.canvasImage     ?? '',
    categoryLabel:   d.categoryLabel   ?? '',
    tagline:         d.tagline         ?? '',
    description:     d.description     ?? '',
    founderQuote:    d.founderQuote     ?? '',
    founderName:     d.founderName     ?? '',
    dimensions:      d.dimensions      ?? '',
    care:            d.care            ?? '',
    shippingMessage: d.shippingMessage ?? '',
    feature1:        d['feature-1']     ?? '',
    feature2:        d['feature-2']     ?? '',
    feature3:        d['feature-3']     ?? '',
    colors: (() => {
      try { return JSON.parse(d.colors ?? '[]') as { name: string; color: string; available?: boolean }[] }
      catch { return [] }
    })(),
    canvasBgColor: d.canvasBgColor ?? '',
    maxMotifs:     d.maxMotifs ? parseInt(d.maxMotifs, 10) : 0,
  }
}

// Read once at module load — prevents re-reads on every React re-render
const shopifyData = readDataset()

export default function App() {
  const {
    variantId, selectedItem, productPrice, canvasImage,
    categoryLabel, tagline, description,
    founderQuote, founderName, dimensions, care,
    shippingMessage, feature1, feature2, feature3,
    colors, canvasBgColor, maxMotifs,
  } = shopifyData

  const {
    embroideryText,    setEmbroideryText,
    textColor,         setTextColor,
    fontStyle,         setFontStyle,
    textSize,          setTextSize,
    textPosition,      onPositionChange,
    motifEntries,      addMotif,
    removeMotif,       updateMotifPosition,
  } = useCustomizer()

  const [activeTab, setActiveTab] = useState<'photos' | 'personalize'>('photos')

  return (
    <div className="bg-background font-sans antialiased py-12 px-6 max-w-[var(--page-width,1200px)] mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        <div className="min-w-0 w-full lg:w-1/2 overflow-hidden">
          <ProductGallery
            activeTab={activeTab}
            canvasProps={{
              embroideryText,
              textColor,
              fontStyle,
              textSize,
              selectedItem,
              canvasImage:           canvasImage || undefined,
              canvasBgColor:         canvasBgColor || undefined,
              onPositionChange,
              motifEntries,
              onMotifPositionChange: updateMotifPosition,
              onRemoveMotif:         removeMotif,
            }}
          />
        </div>

        <div className="min-w-0 w-full lg:w-1/2 lg:sticky lg:top-28">
          <ProductInfo
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            embroideryText={embroideryText}
            setEmbroideryText={setEmbroideryText}
            textColor={textColor}
            setTextColor={setTextColor}
            fontStyle={fontStyle}
            setFontStyle={setFontStyle}
            textSize={textSize}
            setTextSize={setTextSize}
            variantId={variantId}
            selectedItem={selectedItem}
            productPrice={productPrice}
            textPosition={textPosition}
            motifEntries={motifEntries}
            onAddMotif={addMotif}
            onRemoveMotif={removeMotif}
            categoryLabel={categoryLabel}
            tagline={tagline}
            description={description}
            founderQuote={founderQuote}
            founderName={founderName}
            dimensions={dimensions}
            care={care}
            shippingMessage={shippingMessage}
            feature1={feature1}
            feature2={feature2}
            feature3={feature3}
            colors={colors}
            maxMotifs={maxMotifs}
          />
        </div>
      </div>

      <ProductStory />
    </div>
  )
}
