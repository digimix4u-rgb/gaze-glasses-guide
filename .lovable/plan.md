

## Add Jawline Angle Detection to Face Shape Classification

### What This Changes
The app currently classifies face shapes using only width ratios (forehead vs cheekbones vs jaw). This misses a critical signal: **jawline angularity**. A square face and an oval face can have similar width ratios, but the jaw *angle* is very different -- square jaws have a sharp bend, oval jaws have a smooth curve.

This upgrade adds jawline angle measurement using three points along the jaw contour and integrates it into both the classification logic and the visual overlay.

### How Jaw Angle Calculation Works

The jaw angle is measured at the gonial angle point (where the jaw turns from the side of the face toward the chin). We use three MediaPipe landmarks per side:

- **Point A**: Cheekbone/ear area (landmark 234 or 454) -- above the jaw
- **Point B**: Jaw angle (landmark 172 or 397) -- the corner of the jaw
- **Point C**: Chin area (landmark 152) -- below the jaw

The angle at point B tells us how sharp the jaw corner is:
- Less than 130 degrees = angular/square jaw
- 130-140 degrees = moderate/defined jaw  
- Greater than 140 degrees = rounded/soft jaw

We average the left and right jaw angles for the final measurement.

### Changes

**File: `src/lib/faceAnalysis.ts`**

1. Add a `calculateAngle` helper function that computes the angle at point B given three points A, B, C using the dot product formula:
   ```
   angle = arccos((BA . BC) / (|BA| * |BC|))
   ```

2. Add jaw angle landmarks to the LANDMARKS object:
   - `jawAngleAboveLeft: 132` (point on cheek contour above left jaw angle)
   - `jawAngleAboveRight: 361` (point on cheek contour above right jaw angle)

3. Compute left and right jaw angles in `analyzeFace()` using:
   - Left: angle at landmark 172, between landmarks 132 (above) and 152 (chin)
   - Right: angle at landmark 397, between landmarks 361 (above) and 152 (chin)
   - Average both for `jawAngle`

4. Add `jawAngle` to the measurements interface and object

5. Update `classifyFaceShape` with the new jaw angle signal:
   - **Oblong**: lengthToWidthRatio > 1.5 (tightened from 1.4)
   - **Diamond**: foreheadToCheekRatio < 0.80 AND jawToCheekRatio < 0.78
   - **Heart**: foreheadToCheekRatio > 0.82 AND jawToCheekRatio < 0.82 AND chinToJawRatio < 0.6
   - **Square**: lengthToWidthRatio 0.9-1.2 AND jawAngle < 130 AND jawToCheekRatio >= 0.80
   - **Round**: lengthToWidthRatio 0.9-1.1 AND jawAngle > 140
   - **Oval**: balanced proportions, jawAngle 130-155, lengthToWidthRatio 1.2-1.5

6. Replace fake random scores with actual distance-based scoring for each shape, so the confidence percentages are meaningful rather than random.

**File: `src/components/FaceLandmarkOverlay.tsx`**

7. Add jaw angle visualization to the overlay:
   - Draw two angled lines (purple/magenta) showing the jaw angle on each side
   - Label with the measured angle in degrees
   - Add to the legend at the bottom

**File: `src/components/FacialFeatures.tsx`**

8. Add a "Jawline Angle" row to the facial features display:
   - Show the angle in degrees
   - Descriptive label: "Angular" (< 130), "Defined" (130-140), "Soft/Rounded" (> 140)
9. Add jawAngle to the Raw Measurements section

### Technical Details

**New helper function:**
```typescript
function calculateAngle(
  pointA: { x: number; y: number },
  pointB: { x: number; y: number },  // vertex
  pointC: { x: number; y: number }
): number {
  const BA = { x: pointA.x - pointB.x, y: pointA.y - pointB.y };
  const BC = { x: pointC.x - pointB.x, y: pointC.y - pointB.y };
  const dot = BA.x * BC.x + BA.y * BC.y;
  const magBA = Math.sqrt(BA.x * BA.x + BA.y * BA.y);
  const magBC = Math.sqrt(BC.x * BC.x + BC.y * BC.y);
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}
```

**Updated classification priority:**
1. Oblong (ratio > 1.5)
2. Diamond (narrow forehead + narrow jaw)
3. Heart (wide forehead + narrow jaw + pointed chin)
4. Square (short face + angular jaw < 130 + wide jaw)
5. Round (short face + soft jaw > 140)
6. Oval (everything else with balanced proportions)

**Updated measurements interface** adds:
```typescript
jawAngle: number;  // average jaw angle in degrees
```

### What You'll See
- The photo overlay will now show purple angle lines at both jaw corners with the degree measurement
- The facial features panel will display "Jawline Angle: X degrees -- Angular/Defined/Soft"
- Square faces will be correctly identified because their jaw angle will be under 130 degrees
- The raw measurements section will include the jaw angle value
