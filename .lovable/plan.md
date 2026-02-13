

# Fix Face Shape Detection — Always Classifying as Diamond

## Problem
The MediaPipe 478-point landmark indices currently used for forehead width (70, 300) and jaw width (172, 397) correspond to narrow inner regions of the face. Meanwhile, cheekbone width uses points 234 and 454, which are the widest face points near the ears. This makes cheekbones always appear dramatically wider than forehead and jaw, which is the exact definition of a diamond face shape -- so every face gets classified as diamond.

## Solution
Update the landmark indices in `src/lib/faceAnalysis.ts` to use points that measure comparable facial widths at each level:

| Measurement | Current (wrong) | Corrected | Why |
|---|---|---|---|
| Forehead width | 70, 300 (inner forehead) | 103, 332 (outer brow/temple) | Measures the actual width of the forehead at the temple line |
| Cheekbone width | 234, 454 (OK but very wide) | 123, 352 (cheekbone prominence) | Measures the zygomatic bone width, not the ear-to-ear distance |
| Jaw width | 172, 397 (too narrow/high) | 58, 288 (jaw angle) | Measures at the actual gonial angle of the jaw |
| Chin width | 175, 396 | তা 149, 378 (lower chin sides) | Better chin width measurement |

## Additional Tuning
- Add console logging of measurements (in development only) so we can verify the ratios are producing varied results across different face types
- Slightly adjust the classification tolerances if needed after testing

## About Human.js
Human.js (`@vladmandic/human`) is a different face detection library. Since `@mediapipe/tasks-vision` is already installed, loading correctly, and detecting faces successfully (the detection works -- it's only the landmark-to-shape mapping that's wrong), switching libraries would be unnecessary. The fix is simply correcting which landmark points we measure.

## File Changes

| File | Change |
|---|---|
| `src/lib/faceAnalysis.ts` | Update LANDMARKS object with corrected indices; add debug logging for measurement ratios |

## What Stays the Same
- The classification algorithm (Gaussian scoring) is correct and unchanged
- All UI components unchanged
- The useFaceDetection hook unchanged
- PWA configuration unchanged
