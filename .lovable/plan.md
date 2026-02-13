

## Update Classification Logic with New Thresholds

### What Changes
Replace the current classification rules in `classifyFaceShape` (lines 206-235 of `src/lib/faceAnalysis.ts`) with your new threshold logic. This adds a **Rectangle** shape distinction and reorders the priority to check long faces first.

### New Classification Priority

1. **Oblong/Rectangle** (checked first): `lengthToWidthRatio >= 1.3`
   - Rectangle: jaw angle < 135 (long + angular)
   - Oblong: jaw angle >= 135 (long + rounded)
2. **Oval**: ratio 1.1-1.3 + jaw angle > 135
3. **Square**: ratio < 1.3 + jaw angle < 135 + jawWidthRatio > 0.75
4. **Round**: ratio < 1.15 + jaw angle > 140
5. **Heart**: foreheadToJawRatio > 1.15
6. **Diamond**: jawWidthRatio < 0.7 + foreheadToJawRatio < 1.1

### Technical Details

**File: `src/lib/faceAnalysis.ts`**

- Replace lines 206-235 (the `if/else` chain) with the new rules
- Map the user's variable names to existing code variables:
  - `lengthWidthRatio` = `lengthToWidthRatio` (already computed as `faceLength / cheekboneWidth`)
  - `avgJawAngle` = `jawAngle` (already computed)
  - `jawWidthRatio` = `jawToCheekRatio` (already computed as `jawWidth / cheekboneWidth`)
  - `foreheadJawRatio` = `measurements.foreheadToJawRatio` (already in measurements as `foreheadWidth / jawWidth`)
- Add `'rectangle'` to the `allShapes` array and add a distance-based score for it
- Add a rectangle score formula based on length ratio near 1.5 + angular jaw

**File: `src/lib/faceShapeData.ts`**

- Add a `rectangle` entry to the face shape data so the app can display results for the new shape (name, description, characteristics, recommendations)

**File: `src/components/FaceLandmarkOverlay.tsx`** and **`src/components/FacialFeatures.tsx`**

- No changes needed -- they already display whatever shape is returned

### Key Differences from Current Logic

| Check | Current | New |
|-------|---------|-----|
| Oblong | ratio > 1.5 | ratio >= 1.3 |
| Rectangle | not supported | ratio >= 1.3 + jaw < 135 |
| Oval | fallback default | ratio 1.1-1.3 + jaw > 135 |
| Square | ratio 0.9-1.2 + jaw < 130 + jawRatio >= 0.80 | ratio < 1.3 + jaw < 135 + jawRatio > 0.75 |
| Round | ratio 0.9-1.1 + jaw > 140 | ratio < 1.15 + jaw > 140 |
| Heart | foreheadToCheek > 0.82 + jawToCheek < 0.82 + chinToJaw < 0.6 | foreheadToJawRatio > 1.15 |
| Diamond | foreheadToCheek < 0.80 + jawToCheek < 0.78 | jawRatio < 0.7 + foreheadToJawRatio < 1.1 |

