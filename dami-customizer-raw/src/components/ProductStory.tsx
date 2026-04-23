export function ProductStory() {
  return (
    <section className="py-16 md:py-24 overflow-hidden border-t border-border mt-8">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-[family-name:var(--font-cursive)] text-3xl text-accent mb-2">
            the art of patience
          </p>
          <h3 className="text-3xl md:text-4xl font-light text-foreground">
            A Story Woven in Thread
          </h3>
        </div>

        {/* Image + copy layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', alignItems: 'center', marginBottom: '3rem' }}>
          {/* Left image */}
          <div className="flex flex-col gap-2">
            <div className="relative overflow-hidden rounded-[2rem] rounded-tl-[3rem] shadow-lg" style={{ aspectRatio: '3/4' }}>
              <img
                src="https://cdn.shopify.com/s/files/1/0990/0326/9486/files/embroidery-detail.jpg?v=1776583684"
                alt="Detailed embroidery stitches"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <p className="font-[family-name:var(--font-cursive)] text-lg text-accent -rotate-3 pl-2">
              every stitch tells a story
            </p>
          </div>

          {/* Center copy */}
          <div className="flex flex-col gap-5 text-center py-6">
            <div className="w-px h-10 bg-border mx-auto" />
            <p className="text-foreground/80 leading-relaxed">
              Each piece begins with a sketch in our sunlit atelier in Provence.
              We select threads from century-old French mills, each shade chosen
              to capture the essence of our countryside inspiration.
            </p>
            <div className="w-px h-10 bg-border mx-auto" />
            <p className="text-foreground/80 leading-relaxed">
              The embroidery itself takes between two and four weeks,
              depending on the complexity of the design. We believe
              in the beauty of slow creation.
            </p>
            <div className="w-px h-10 bg-border mx-auto" />
          </div>

          {/* Right image */}
          <div className="flex flex-col gap-2">
            <div className="relative overflow-hidden rounded-[2rem] rounded-br-[3rem] shadow-lg" style={{ aspectRatio: '3/4' }}>
              <img
                src="https://cdn.shopify.com/s/files/1/0990/0326/9486/files/embroidery-materials.jpg?v=1776583684"
                alt="Premium embroidery materials"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <p className="font-[family-name:var(--font-cursive)] text-lg text-accent rotate-2 text-right pr-2">
              heritage materials
            </p>
          </div>
        </div>

        {/* Process steps */}
        <div
          className="mt-16"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}
        >
          {[
            { step: '01', title: 'Consultation', desc: 'Share your vision and inspiration' },
            { step: '02', title: 'Design',       desc: 'We sketch your bespoke pattern'   },
            { step: '03', title: 'Creation',     desc: 'Weeks of careful stitching'       },
            { step: '04', title: 'Delivery',     desc: 'Wrapped in French tissue paper'   },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <span className="font-[family-name:var(--font-cursive)] text-4xl text-primary/40">
                {item.step}
              </span>
              <h4 className="text-base font-medium text-foreground mt-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
