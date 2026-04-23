Update `src/config/products.ts` with new safe zone values.

The user will paste a JSON object exported from the Safe Zone Configurator tool. It looks like:

```json
{
  "The Grand Market Tote": { "widthRatio": 0.78, "heightRatio": 0.33, "offsetX": -0.02, "offsetY": 0.10, "physicalWidthInches": 25 },
  ...
}
```

For each product in the JSON:
1. Update the `safeZone` object (`widthRatio`, `heightRatio`, `offsetX`, `offsetY`) in `PRODUCT_CONFIG`
2. Update `safeZonePhysicalWidthInches`
3. Preserve all other file content exactly — imports, interfaces, comments, helpers, product order

After updating, run `npm run build` to confirm TypeScript compiles cleanly.
