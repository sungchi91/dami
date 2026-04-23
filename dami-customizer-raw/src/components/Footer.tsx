import { Instagram, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h2 className="font-[family-name:var(--font-cursive)] text-4xl text-foreground">
              d'ami
            </h2>
            <p className="text-muted-foreground mt-4 max-w-sm leading-relaxed">
              Bespoke embroidery inspired by the quiet beauty of the French countryside.
              Each piece is a love letter written in thread.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Contact us via email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm tracking-widest uppercase text-foreground mb-4">
              Explore
            </h3>
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Shop All</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Bespoke Orders</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Our Story</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Journal</a>
            </nav>
          </div>

          {/* Care & Info */}
          <div>
            <h3 className="text-sm tracking-widest uppercase text-foreground mb-4">
              Care & Info
            </h3>
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Shipping</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Care Guide</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </nav>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-border mt-12 pt-12">
          <div className="max-w-md mx-auto text-center">
            <p className="font-[family-name:var(--font-cursive)] text-2xl text-accent mb-2">
              join our journal
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              Seasonal inspiration, studio stories, and first access to new collections.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 d'ami. Handcrafted with love in Provence.
          </p>
        </div>
      </div>
    </footer>
  )
}
