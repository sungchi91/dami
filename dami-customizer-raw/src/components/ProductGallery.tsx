import { useState } from 'react'
import { CanvasEditor, type CanvasEditorProps } from './CanvasEditor'

const FALLBACK_IMAGES = [
  { src: '/images/embroidery-main.jpg',      alt: 'Lavender Fields embroidery hoop with delicate floral pattern' },
  { src: '/images/embroidery-detail.jpg',    alt: 'Close-up of intricate embroidery stitches' },
  { src: '/images/embroidery-lifestyle.jpg', alt: 'Embroidered piece displayed in a French countryside bedroom' },
  { src: '/images/embroidery-materials.jpg', alt: 'Premium silk threads and materials used in creation' },
]

function readProductImages() {
  const el = document.getElementById('dami-customizer')
  const srcs = el?.dataset.images?.split(',').filter(Boolean) ?? []
  const alts = el?.dataset.alts?.split(',').filter(Boolean) ?? []
  if (srcs.length === 0) return FALLBACK_IMAGES
  return srcs.map((src, i) => ({ src, alt: alts[i] ?? '' }))
}

interface ProductGalleryProps {
  activeTab:   'photos' | 'personalize'
  canvasProps: CanvasEditorProps
}

export function ProductGallery({ activeTab, canvasProps }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const images = readProductImages()

  return (
    <div className="relative flex flex-col gap-5">

      {activeTab === 'photos' ? (
        <>
          {/* ── Main image with config-driven safe-zone overlay ────────── */}
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] rounded-tl-[4rem] rounded-br-[4rem] shadow-xl bg-secondary">
              <img
                src={images[activeIndex].src}
                alt={images[activeIndex].alt}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
              />

            </div>

            {/* Decorative background shapes */}
            <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-primary/10 rounded-[2rem] -z-10" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/10 rounded-full -z-10" />
          </div>

          {/* ── Thumbnail row ──────────────────────────────────────────── */}
          <div className="flex gap-3 justify-center">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`relative w-16 h-16 md:w-20 md:h-20 shrink-0 overflow-hidden transition-all duration-300 ${
                  index === 0 ? 'rounded-tl-2xl rounded-br-xl rounded-tr-lg rounded-bl-lg' :
                  index === 1 ? 'rounded-full' :
                  index === 2 ? 'rounded-tr-2xl rounded-bl-xl rounded-tl-lg rounded-br-lg' :
                  'rounded-2xl'
                } ${
                  activeIndex === index
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 shadow-md'
                    : 'opacity-55 hover:opacity-90 hover:scale-105'
                }`}
                aria-label={`View image ${index + 1}: ${image.alt}`}
              >
                <img src={image.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </>
      ) : (
        /* ── Fabric.js canvas editor ──────────────────────────────────── */
        <CanvasEditor {...canvasProps} />
      )}

      {/* Always-visible handwritten accent */}
      <p className="font-[family-name:var(--font-cursive)] text-2xl text-primary/80 text-center -rotate-2">
        crafted with love
      </p>
    </div>
  )
}
