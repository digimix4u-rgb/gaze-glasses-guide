

# Improve Face Shape Classification Accuracy

## Problem Analysis

The face shape analysis incorrectly classifies a round/oval face as "Heart" shape. Looking at the photo:
- The face has a **balanced width-to-length ratio** (characteristic of Round)
- **Full cheeks** with a **rounded jawline** (not pointed chin like Heart)
- **Forehead and jaw widths are similar** (Heart would have a much wider forehead than jaw)

The current algorithm issues:
1. **Heart shape tolerance is too loose** - accepts too wide a range of forehead-to-jaw ratios
2. **Round shape tolerance is too strict** - requires almost perfect 1:1 length-to-width ratio
3. **Missing jawline curvature analysis** - doesn't distinguish curved (round) vs pointed (heart) chins
4. **Cheekbone-to-jaw ratio not weighted properly** for Round vs Heart differentiation

## Solution

Tune the face shape classification parameters and add better differentiation logic:

### Changes to `src/lib/faceAnalysis.ts`

**1. Adjust Round Shape Parameters (make less strict)**
- Increase `lengthToWidthRatio` tolerance from 0.08 to 0.12
- This allows faces that are slightly longer than wide to still be classified as Round

**2. Adjust Heart Shape Parameters (make more strict)**
- Increase the target `foreheadToJawRatio` from 1.3 to 1.4 (requires bigger difference)
- Reduce tolerance from 0.15 to 0.12 (tighter match required)
- Require lower `jawToForeheadRatio` target of 0.7 (jaw must be notably narrower)

**3. Add Chin Pointedness Factor**
- Calculate the ratio between chin width and jaw width
- Heart shapes have a more pointed chin relative to jaw width
- Round shapes have a wider chin relative to jaw width

**4. Improve Oval vs Round Differentiation**
- Oval should require clearer length-to-width difference (1.3+)
- Round should capture faces where length roughly equals width

### Updated Classification Parameters

| Face Shape | Key Parameter Changes |
|------------|----------------------|
| Round | lengthToWidthRatio tolerance: 0.08 -> 0.15, add penalty if foreheadToJawRatio > 1.2 |
| Heart | foreheadToJawRatio target: 1.3 -> 1.4, tolerance: 0.15 -> 0.10, add chin pointedness check |
| Oval | Keep existing, but add slight penalty if face is very round |
| Square | Add jawline angular check |
| Diamond | Keep existing (cheekbone prominence is the key) |
| Oblong | Keep existing (length-to-width > 1.5 is clear) |

### New Measurement: Chin Width

Add calculation of chin width using existing landmarks (`chinLeft`, `chinRight`) to help differentiate:
- **Heart**: Narrow chin relative to jaw
- **Round**: Chin width similar to jaw width

### Technical Implementation

```typescript
// Add chin measurement
const chinWidth = calculateDistance(
  getPoint(LANDMARKS.chinLeft),
  getPoint(LANDMARKS.chinRight)
);
const chinToJawRatio = chinWidth / jawWidth;

// Updated measurements object
const measurements = {
  ...existingMeasurements,
  chinWidth,
  chinToJawRatio,
};

// Heart shape - require more extreme tapering
const heartScore = calculateWeightedShapeScore([
  { value: lengthToWidthRatio, target: 1.3, tolerance: 0.15, weight: 1.5 },
  { value: foreheadToJawRatio, target: 1.4, tolerance: 0.10, weight: 2.5 },  // Stricter
  { value: chinToJawRatio, target: 0.6, tolerance: 0.15, weight: 2.0 },      // NEW: pointed chin
  { value: jawToForeheadRatio, target: 0.7, tolerance: 0.10, weight: 2.0 },  // Stricter
]);

// Round shape - more forgiving on length ratio
const roundScore = calculateWeightedShapeScore([
  { value: lengthToWidthRatio, target: 1.05, tolerance: 0.15, weight: 2.0 }, // More tolerant
  { value: foreheadToJawRatio, target: 1.0, tolerance: 0.12, weight: 1.5 },
  { value: cheekboneProminence, target: 1.0, tolerance: 0.1, weight: 1.5 },
  { value: chinToJawRatio, target: 0.85, tolerance: 0.15, weight: 1.5 },     // NEW: fuller chin
]);
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/faceAnalysis.ts` | Add chinWidth/chinToJawRatio measurements, update scoring parameters |

## Expected Outcome

After these changes:
- Faces with **balanced proportions and rounded jawlines** will correctly classify as **Round**
- **Heart** classification will require a more dramatic forehead-to-chin taper and pointed chin
- Overall accuracy improves for distinguishing between similar face shapes

