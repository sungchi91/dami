import { ArrowRight } from "lucide-react"

const recommendations = [
  {
    name: "Morning Roses",
    collection: "Garden Collection",
    price: 185,
    image: "/images/embroidery-main.jpg",
  },
  {
    name: "Wildflower Meadow",
    collection: "Provence Collection",
    price: 225,
    image: "/images/embroidery-lifestyle.jpg",
  },
  {
    name: "Olive Branch",
    collection: "Heritage Collection",
    price: 165,
    image: "/images/embroidery-detail.jpg",
  },
]

export function ProductRecommendations() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="font-[family-name:var(--font-cursive)] text-2xl text-accent mb-1">
              you may also love
            </p>
            <h3 className="text-3xl font-light text-foreground">
              More Stories to Discover
            </h3>
          </div>
          <button className="flex items-center gap-2 text-sm tracking-widest uppercase text-primary hover:text-primary/80 transition-colors group">
            View All Pieces
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Product grid with organic shapes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendations.map((product, index) => (
            <article
              key={product.name}
              className="group cursor-pointer"
            >
              <div className={`relative aspect-[4/5] overflow-hidden shadow-md transition-all duration-500 group-hover:shadow-xl ${
                index === 0 ? "rounded-[2rem] rounded-tr-[4rem]" :
                index === 1 ? "rounded-[3rem]" :
                "rounded-[2rem] rounded-bl-[4rem]"
              }`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-500" />
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs tracking-widest uppercase text-muted-foreground">
                  {product.collection}
                </p>
                <h4 className="text-xl font-light text-foreground mt-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                <p className="font-[family-name:var(--font-cursive)] text-lg text-accent mt-1">
                  €{product.price}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
