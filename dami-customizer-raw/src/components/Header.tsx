import { useState } from "react"
import { Menu, X, ShoppingBag, Search, Heart } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Left navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#" className="text-sm tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors">
              Shop
            </a>
            <a href="#" className="text-sm tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors">
              Bespoke
            </a>
            <a href="#" className="text-sm tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors">
              Our Story
            </a>
          </nav>

          {/* Logo */}
          <a href="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="font-[family-name:var(--font-cursive)] text-3xl md:text-4xl text-foreground">
              d'ami
            </h1>
          </a>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <button className="hidden md:block p-2" aria-label="Search">
              <Search className="w-5 h-5 text-foreground/80 hover:text-foreground transition-colors" />
            </button>
            <button className="hidden md:block p-2" aria-label="Wishlist">
              <Heart className="w-5 h-5 text-foreground/80 hover:text-foreground transition-colors" />
            </button>
            <button className="p-2 relative" aria-label="Shopping bag">
              <ShoppingBag className="w-5 h-5 text-foreground/80 hover:text-foreground transition-colors" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] rounded-full flex items-center justify-center">
                2
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <nav className="lg:hidden pt-6 pb-4 border-t border-border mt-4">
            <div className="flex flex-col gap-4">
              <a href="#" className="text-sm tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors">
                Shop
              </a>
              <a href="#" className="text-sm tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors">
                Bespoke
              </a>
              <a href="#" className="text-sm tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors">
                Our Story
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
