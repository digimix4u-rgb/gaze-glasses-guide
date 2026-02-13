

## Replace Classification Logic with User-Provided Algorithm

### Problem
The current classification logic has gone through multiple iterations of fixes for heart/diamond/oblong misclassification, resulting in complex, interleaved conditions. The user has provided a cleaner, more straightforward algorithm that should be used instead.

### Solution
Replace the classification logic in `classifyFaceShape` (lines 183-223) with the user's provided algorithm, adapted to the existing code structure. The new logic has no triangular shape (which we don't support), and follows a clearer priority order:

1. **Oblong** -- `lengthToWidthRatio > 1.4`
2. **Diamond** -- Cheekbones wider than both forehead and jaw, with both forehead and jaw below 85% of cheekbone width
3. **Heart** -- Forehead is widest (or equal to cheekbones) and wider than jaw
4. **Round vs Square** -- `lengthToWidthRatio` between 0.9 and 1.1; square if jaw is near cheekbone width
5. **Oval** -- Face longer than wide, forehead wider than jaw (fallback)

### Technical Details

**File: `src/lib/faceAnalysis.ts`** -- lines 183-223

Remove unused variables (`isLengthSignificant`, `isRoundOrSquare`, `widths`, `largestWidth`, `chinToJawRatio` destructuring) and replace the classification block:

```typescript
const lengthToWidthRatio = faceLength / cheekboneWidth;

let shapeId: string;

// 1. OBLONG: Face is noticeably longer than it is wide
if (lengthToWidthRatio > 1.4) {
  shapeId = 'oblong';
}
// 2. DIAMOND: Cheekbones significantly wider than both forehead and jaw
else if (cheekboneWidth > foreheadWidth && cheekboneWidth > jawWidth
  && foreheadWidth < cheekboneWidth * 0.85 && jawWidth < cheekboneWidth * 0.85) {
  shapeId = 'diamond';
}
// 3. HEART: Forehead is widest part and wider than jaw
else if (foreheadWidth >= cheekboneWidth && foreheadWidth > jawWidth) {
  shapeId = 'heart';
}
// 4. ROUND vs SQUARE: Face length and width are similar
else if (lengthToWidthRatio >= 0.9 && lengthToWidthRatio <= 1.1) {
  shapeId = (jawWidth >= cheekboneWidth * 0.9) ? 'square' : 'round';
}
// 5. OVAL: Balanced proportions
else if (faceLength > cheekboneWidth && foreheadWidth > jawWidth) {
  shapeId = 'oval';
}
// Final fallback
else {
  shapeId = 'oval';
}
```

Also clean up the destructuring at line 175-181 to remove `chinToJawRatio` since it's no longer used in classification logic (it's still computed in measurements for display).

