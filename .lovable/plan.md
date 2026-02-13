

## Fix Face Measurements: Use Actual Face Outline Landmarks

### Problem
The app classifies almost every face as "oval" because it measures inner facial features (inner brow points, inner cheekbone points) instead of the actual face outline. These inner measurements are all very similar in width, producing ratios near 1.0 that always fall into the oval category.

### Root Cause
Current landmark indices measure the wrong thing:
- Forehead: points 54/284 (inner brow) -- too narrow
- Cheekbones: points 123/352 (inner cheek) -- too narrow  
- Jaw: points 58/288 (inner jaw) -- too narrow

All three are close together in width, so the ratios don't differentiate between face shapes.

### Solution
Switch to **face contour/outline** landmarks from the MediaPipe 478-point mesh that represent the true outer boundary of the face:

- **Forehead width (temple to temple)**: Landmarks 21 and 251 -- the outer temple points at forehead level
- **Cheekbone width (ear to ear)**: Landmarks 234 and 454 -- the widest points of the face at ear level
- **Jaw width (jaw angle to jaw angle)**: Landmarks 172 and 397 -- the gonial angle on the face outline contour
- **Face length**: Landmarks 10 (top of forehead) to 152 (chin) -- already correct

Additionally, display the raw measurements (in relative units) on the results page so users can see what was measured.

### Changes

**File: `src/lib/faceAnalysis.ts`**

1. Update the LANDMARKS object with correct face contour indices:
   - `foreheadLeft: 21` (was 54), `foreheadRight: 251` (was 284)
   - `cheekboneLeft: 234` (was 123), `cheekboneRight: 454` (was 352)  
   - `jawLeft: 172` (was 58), `jawRight: 397` (was 288)

2. No changes to the classification logic -- it already works correctly when given proper measurements.

**File: `src/components/FacialFeatures.tsx`**

3. Show the actual measured values alongside the descriptive text, so users can see the raw face outline measurements:
   - Face Length: X units
   - Forehead Width (temple to temple): X units
   - Cheekbone Width (ear to ear): X units
   - Jaw Width: X units
   - Length-to-Width Ratio: X

This gives transparency into what was measured and helps verify the detection is working.

### Why This Fixes It
With the face outline landmarks, a square face will show cheekbone width close to jaw width (both wide), while a heart face will show forehead much wider than jaw. Currently all measurements are nearly identical because they're all taken from inner facial features.

