

## Fix Classification Logic for Outline Landmarks

### Problem
The landmark update correctly measures the face outline, but the classification logic still uses absolute comparisons (e.g., "is forehead wider than cheekbones?"). Since cheekbones are measured ear-to-ear, they will **always** be the widest measurement on any face. This makes it impossible for the heart check to pass and causes nearly everything to fall through to oval.

### Solution
Rewrite the classification to use **relative ratios** between the three widths, with thresholds calibrated for outline measurements.

The key ratios:
- **forehead-to-cheekbone ratio** (how wide temples are relative to ears)
- **jaw-to-cheekbone ratio** (how wide jaw angles are relative to ears)
- **length-to-width ratio** (face length vs widest point)

Typical ranges with outline landmarks:
- Forehead is usually 70-95% of cheekbone width
- Jaw is usually 60-90% of cheekbone width

### Classification Rules

**File: `src/lib/faceAnalysis.ts`** -- Replace `classifyFaceShape` logic (lines 175-216)

```typescript
const {
  faceLength,
  foreheadWidth,
  cheekboneWidth,
  jawWidth,
} = measurements;

const lengthToWidthRatio = faceLength / cheekboneWidth;
const foreheadToCheekRatio = foreheadWidth / cheekboneWidth;
const jawToCheekRatio = jawWidth / cheekboneWidth;

let shapeId: string;

// 1. OBLONG: Face is noticeably longer than it is wide
if (lengthToWidthRatio > 1.4) {
  shapeId = 'oblong';
}
// 2. DIAMOND: Both forehead and jaw are narrow relative to cheekbones
else if (foreheadToCheekRatio < 0.80 && jawToCheekRatio < 0.75) {
  shapeId = 'diamond';
}
// 3. HEART: Forehead is relatively wide, jaw is narrow
else if (foreheadToCheekRatio > 0.85 && jawToCheekRatio < 0.75) {
  shapeId = 'heart';
}
// 4. ROUND vs SQUARE: Face length and width are similar
else if (lengthToWidthRatio >= 0.9 && lengthToWidthRatio <= 1.2) {
  if (jawToCheekRatio >= 0.85) {
    shapeId = 'square';
  } else if (lengthToWidthRatio <= 1.1) {
    shapeId = 'round';
  } else {
    shapeId = 'oval';
  }
}
// 5. OVAL: Balanced proportions (default)
else if (faceLength > cheekboneWidth && foreheadToCheekRatio > jawToCheekRatio) {
  shapeId = 'oval';
}
// Final fallback
else {
  shapeId = 'oval';
}
```

### Why This Works
Instead of checking "is forehead wider than cheekbones?" (always false with ear-to-ear), we check "how close is the forehead to the cheekbone width?" A heart-shaped face has temples nearly as wide as the ears but a much narrower jaw. A diamond has both forehead and jaw narrow relative to ears. A square has a jaw nearly as wide as the ears.

### Debug Logging
Add the new ratios to the console debug output so we can verify the measurements are producing correct differentiations.

No changes needed to the landmarks or to `FacialFeatures.tsx`.
