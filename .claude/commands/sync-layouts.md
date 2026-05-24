# Sync Fixed Layouts

Sync `SEEDED_LAYOUTS` and `SEEDED_MOTIF_INCHES` in `dami-safezone-tool/src/FixedLayoutConfigurator.tsx` to match the current values in `dami-customizer-raw/src/config/fixed-layouts.ts`.

## Steps

1. Read `dami-customizer-raw/src/config/fixed-layouts.ts` — extract `FIXED_LAYOUTS` and `motifInches` per product.
2. Read `dami-safezone-tool/src/FixedLayoutConfigurator.tsx` — locate `SEEDED_MOTIF_INCHES` and `SEEDED_LAYOUTS`.
3. Update `SEEDED_MOTIF_INCHES` to match all products that have a `motifInches` value in `fixed-layouts.ts`.
4. Update `SEEDED_LAYOUTS` to match every product and layout type in `fixed-layouts.ts`. Note the format difference: `fixed-layouts.ts` uses `motifRow: { centerX, y }` but the configurator uses `motifRow: { x, y }` — map `centerX` → `x`.
5. Do NOT change anything else in `FixedLayoutConfigurator.tsx`.
6. After editing, confirm the sync is complete by listing the differences that were updated.
