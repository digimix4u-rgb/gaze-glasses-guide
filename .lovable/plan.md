

# Align Face Shape Detection with Reference Definitions

## Overview
Update the face shape classification algorithm to more precisely match the official face shape definitions you provided. This will improve accuracy by aligning the detection parameters with the documented characteristics.

## Key Changes Based on Reference Definitions

### 1. Oval Face
**Reference**: "Slightly longer than wide, gently rounded jawline, forehead broader than chin"
- Adjust length-to-width ratio target to 1.35 (slightly longer)
- Emphasize forehead-to-chin relationship more

### 2. Round Face  
**Reference**: "Equal width and length, cheeks typically widest, minimal jaw angles"
- Add check for cheekbones being the widest point
- Ensure length-to-width stays close to 1.0

### 3. Square Face
**Reference**: "Forehead, cheekbones, and jaw about the same width, strong defined jawline"
- Add stricter check that all three widths are similar
- This differentiates from Round (which has cheeks widest)

### 4. Heart Face (Most Important Fix)
**Reference**: "Wider forehead, narrow pointed chin, prominent cheekbones"
- Keep strict forehead-to-jaw ratio requirement
- Emphasize that cheekbones are "prominent" (often second widest after forehead)
- Pointed chin is critical - maintain strict chinToJawRatio check

### 5. Diamond Face
**Reference**: "Narrow forehead AND chin, cheekbones widest"
- Add explicit check that BOTH forehead and jaw are narrower than cheekbones
- Current algorithm checks this but could weight it higher

### 6. Oblong Face
**Reference**: "Longer than wide, straight cheek line, similar forehead and jaw width"
- Increase length-to-width target slightly
- Add check for straight proportions (forehead roughly equals jaw)

## Algorithm Improvements

### Update `src/lib/faceAnalysis.ts`

Refine the scoring parameters:

| Shape | Parameter | Current | New | Reason |
|-------|-----------|---------|-----|--------|
| Oval | lengthToWidthRatio target | 1.4 | 1.35 | "Slightly longer" per reference |
| Round | Add cheekboneProminence check | 1.0 | 1.05 | "Cheeks typically widest" |
| Square | foreheadToJawRatio tolerance | 0.08 | 0.05 | "Same width" requires stricter match |
| Heart | cheekboneProminence weight | 1.5 | 2.0 | "Prominent cheekbones" per reference |
| Diamond | foreheadToFaceWidth ratio | (missing) | add | "Narrow forehead" is key characteristic |
| Oblong | lengthToWidthRatio target | 1.6 | 1.5 | Better distinguish from very long faces |

### Also Update `src/lib/faceShapeData.ts`

Update the descriptions and characteristics to match your reference definitions exactly:

**Oval**:
- Description: "Considered the most balanced shape, an oval face is slightly longer than it is wide. It has a gently rounded jawline and forehead that's a little broader than the chin."

**Round**:
- Description: "Round faces are soft and full, with equal width and length. The cheeks are typically the widest part, and the jawline has minimal angles, giving a youthful, approachable look."

**Square**:
- Description: "Square faces have a strong, defined jawline with a forehead, cheekbones, and jaw that are about the same width. This shape often gives off a bold, confident impression."

**Heart**:
- Description: "A heart-shaped face has a wider forehead and a narrow, pointed chin. The cheekbones are often prominent, creating a soft yet striking look."

**Diamond**:
- Description: "Diamond faces are characterized by a narrow forehead and chin, with the cheekbones being the widest point. This face shape often appears sharp and sculpted."

**Oblong**:
- Description: "This face is longer than it is wide, with a straight cheek line. The forehead, cheeks, and jaw are close in width, but the overall face length gives it an elegant, elongated appearance."

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/faceAnalysis.ts` | Refine classification parameters to match reference definitions |
| `src/lib/faceShapeData.ts` | Update descriptions to match your exact reference text |

## Expected Outcome
- Face shape detection will align with the official definitions you provided
- More accurate differentiation between similar shapes (Round vs Oval, Heart vs Diamond)
- User-facing descriptions match industry-standard definitions

