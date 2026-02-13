

## Add Landmark Visualization + Fix Heart Classification

### Overview
Two changes: (1) Create a visual overlay component that draws the measurement lines directly on the uploaded photo so you can see exactly what the AI is measuring, and (2) investigate and fix why hearts are still classified as oval.

### 1. New Component: `FaceLandmarkOverlay`

Create `src/components/FaceLandmarkOverlay.tsx` -- a canvas-based component that draws on top of the uploaded photo:

- Takes the photo file, landmarks, and measurements as props
- Draws the image on a canvas, then overlays colored measurement lines:
  - **Green line**: Forehead width (temple to temple, landmarks 21-251)
  - **Blue line**: Cheekbone width (ear to ear, landmarks 234-454)
  - **Red line**: Jaw width (jaw angle to jaw angle, landmarks 172-397)
  - **Yellow line**: Face length (top of head to chin, landmarks 10-152)
- Labels each line with its pixel value
- Dots on each landmark point used for measurement

This gives full transparency into what the AI is detecting.

### 2. Display in Results

Update `src/components/AnalysisSection.tsx` to show the landmark overlay in the results view:

- Store the photo URL so it persists to the results screen
- Add the `FaceLandmarkOverlay` component in the left column of the results grid, above or alongside the face shape card
- Shows the photo with measurement lines drawn on it

### 3. Fix Heart Classification Threshold

The current heart rule requires `jawToCheekRatio < 0.75`, which is very strict. With ear-to-ear cheekbone measurements, the jaw-to-cheek ratio for heart faces is often around 0.75-0.82 (the jaw is narrower but not drastically so). 

Update in `src/lib/faceAnalysis.ts`:
- Relax the jaw threshold for heart from `< 0.75` to `< 0.82`
- Add a chin-to-jaw ratio check: heart faces have a pointed chin (`chinToJawRatio < 0.6`)
- Adjust diamond threshold similarly to `< 0.78` to keep it distinct from heart

Updated heart rule:
```
// HEART: Forehead relatively wide + jaw tapers + pointed chin
else if (foreheadToCheekRatio > 0.82 && jawToCheekRatio < 0.82 && chinToJawRatio < 0.6) {
  shapeId = 'heart';
}
```

### Technical Details

**New file: `src/components/FaceLandmarkOverlay.tsx`**
- Uses HTML Canvas API to draw the image and overlay lines
- Scales canvas to fit container while maintaining aspect ratio
- Draws 4 colored measurement lines with endpoint dots and text labels
- Props: `photoFile: File`, `landmarks: FaceLandmarks`, `measurements: FaceAnalysisResult['measurements']`

**Modified: `src/components/AnalysisSection.tsx`**
- Keep `photoFile` URL available in results view (don't revoke URL until reset)
- Import and render `FaceLandmarkOverlay` in the results grid

**Modified: `src/lib/faceAnalysis.ts`**
- Pass `chinToJawRatio` into classification function
- Relax heart jaw threshold from 0.75 to 0.82
- Add chin pointedness check for heart detection
- Adjust diamond to use `< 0.78` for jaw ratio

