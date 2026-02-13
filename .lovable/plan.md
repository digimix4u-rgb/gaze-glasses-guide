

## Fix Heart vs Oblong Classification Priority

### Problem
The face has a `lengthToWidthRatio` of **1.296** and a `foreheadToJawRatio` of **1.056**. The oblong check (`faceLength > cheekboneWidth * 1.25`) fires first, so the face never reaches the heart detection logic. Heart-shaped faces are naturally elongated, making them vulnerable to being misclassified as oblong.

### Solution
Reorder the classification logic so that **heart shape is checked before oblong**, and raise the oblong threshold slightly. A face should only be oblong if it's elongated AND doesn't have a significantly wider forehead relative to jaw.

### Changes

**File: `src/lib/faceAnalysis.ts`** -- Update the `classifyFaceShape` function

Reorder and adjust the classification conditions:

```text
OLD ORDER:
1. Oblong (lengthToWidth > 1.25)
2. Heart (forehead > jaw * 1.15)
3. Heart secondary (cheekbones widest but forehead close)
4. Diamond / Round
5. Square / Round
6. Oval

NEW ORDER:
1. Heart (forehead > jaw * 1.15) -- check first regardless of length
2. Heart secondary (cheekbones widest, forehead near cheekbone width, forehead > jaw)
3. Oblong (lengthToWidth > 1.3 AND not heart-like proportions)
4. Diamond / Round
5. Square / Round
6. Oval
```

Key changes:
- Move heart checks before oblong so elongated heart shapes are caught
- Raise oblong threshold from 1.25 to 1.3 to reduce false positives
- Add a guard on oblong: only classify as oblong if `foreheadToJawRatio < 1.1` (if forehead is notably wider than jaw, it's more likely heart than oblong)

