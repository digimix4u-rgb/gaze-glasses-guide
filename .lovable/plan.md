
## Fix Square vs Oval Misclassification

### Problem
The square shape check only triggers when `lengthToWidthRatio` is between 0.9 and 1.1. Many square faces have a ratio slightly above 1.1 (e.g., 1.15-1.25), causing them to fall through to the oval check instead. Square faces are defined by their strong, angular jawline -- not strictly equal length and width.

### Solution
Expand the square/round check range from `0.9-1.1` to `0.9-1.2`, and add an additional square detection path: if the jaw is very wide relative to cheekbones (`jawWidth >= cheekboneWidth * 0.9`), classify as square even when the length-to-width ratio is slightly higher.

### Changes

**File: `src/lib/faceAnalysis.ts`** -- Update step 4 in `classifyFaceShape`

```text
CURRENT (line 199-201):
  // 4. ROUND vs SQUARE: Face length and width are similar
  else if (lengthToWidthRatio >= 0.9 && lengthToWidthRatio <= 1.1) {
    shapeId = (jawWidth >= cheekboneWidth * 0.9) ? 'square' : 'round';
  }
  // 5. OVAL: Balanced proportions
  else if (faceLength > cheekboneWidth && foreheadWidth > jawWidth) {
    shapeId = 'oval';
  }

NEW:
  // 4. ROUND vs SQUARE: Face length and width are similar
  else if (lengthToWidthRatio >= 0.9 && lengthToWidthRatio <= 1.2) {
    if (jawWidth >= cheekboneWidth * 0.9) {
      shapeId = 'square';
    } else if (lengthToWidthRatio <= 1.1) {
      shapeId = 'round';
    } else {
      shapeId = 'oval';
    }
  }
  // 5. OVAL: Balanced proportions
  else if (faceLength > cheekboneWidth && foreheadWidth > jawWidth) {
    shapeId = 'oval';
  }
```

Key changes:
- Expand the range to 1.2 so square faces with slightly longer proportions are caught
- Within the 1.1-1.2 range, only classify as square if jaw is wide (>= 90% of cheekbone width); otherwise fall through to oval
- Round remains limited to the 0.9-1.1 range since round faces are truly equal in length and width
