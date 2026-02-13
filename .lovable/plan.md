

## Fix Heart vs Diamond Misclassification

### Problem
The heart shape check requires `foreheadWidth > jawWidth * 1.15`, but for this face the ratio is likely just below that threshold. It falls through to the diamond check (cheekbones are widest), resulting in a "diamond" classification instead of "heart."

Heart and diamond shapes both have wide cheekbones, but the key differentiator is:
- **Heart**: Wide forehead + narrow/pointed chin
- **Diamond**: Narrow forehead AND narrow jaw relative to cheekbones

### Solution
Two changes in `src/lib/faceAnalysis.ts`, in the `classifyFaceShape` function:

1. **Lower the heart forehead-to-jaw threshold** from `1.15` to `1.10` -- many heart shapes have a moderately (not dramatically) wider forehead than jaw.

2. **Add chin narrowness as a heart indicator** -- if the chin-to-jaw ratio is low (pointed chin), that strongly suggests heart shape even when forehead-to-jaw ratio is borderline. Add an alternative heart condition: `foreheadWidth > jawWidth * 1.05 AND chinToJawRatio < 0.7`.

3. **Tighten diamond detection** -- diamond should only match when the forehead is genuinely narrow relative to cheekbones (not just slightly narrower). Add a guard: only classify as diamond if `foreheadWidth < cheekboneWidth * 0.88`.

### Technical Details

**File: `src/lib/faceAnalysis.ts`** (lines 196-203)

```text
CURRENT:
  if (foreheadWidth > jawWidth * 1.15 && (largestWidth === 'forehead' || foreheadWidth >= cheekboneWidth * 0.92)) {
    shapeId = 'heart';
  } else if (...oblong...) {
  } else if (largestWidth === 'cheekbones' && cheekboneWidth > foreheadWidth && cheekboneWidth > jawWidth) {
    shapeId = (faceLength > cheekboneWidth) ? 'diamond' : 'round';

NEW:
  if (foreheadWidth > jawWidth * 1.10 && (largestWidth === 'forehead' || foreheadWidth >= cheekboneWidth * 0.92)) {
    shapeId = 'heart';
  } else if (foreheadWidth > jawWidth * 1.05 && chinToJawRatio < 0.7) {
    // Pointed chin with moderately wider forehead = heart
    shapeId = 'heart';
  } else if (...oblong...) {
  } else if (largestWidth === 'cheekbones' && cheekboneWidth > foreheadWidth && cheekboneWidth > jawWidth) {
    // Only diamond if forehead is genuinely narrow relative to cheekbones
    if (foreheadWidth < cheekboneWidth * 0.88) {
      shapeId = (faceLength > cheekboneWidth) ? 'diamond' : 'round';
    } else {
      // Forehead is close to cheekbone width -- likely oval or heart, not diamond
      shapeId = (faceLength > cheekboneWidth) ? 'oval' : 'round';
    }
  }
```

This adds chin pointedness as a heart-shape signal and prevents faces with wide foreheads from falling into diamond classification.
