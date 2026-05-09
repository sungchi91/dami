# Project Rules
- **Stack:** React, Tailwind CSS, Fabric.js.
- **Goal:** We are building a Shopify customizer that gets injected into the Dawn theme.
- **Styling:** Use the provided Tailwind classes from v0. Do not invent new UI components without asking.
- **Coordinates:** Always pass relative percentages (0.0 to 1.0) for canvas elements, NEVER absolute pixels.

# Deployment
- After every `npm run build`, the bundle is automatically copied to `../shop-dami/assets/customizer-bundle.js` via the `postbuild` script in `package.json`.
- Never manually copy the bundle — always build via `npm run build`.