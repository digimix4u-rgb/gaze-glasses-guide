
# Remove Recommended Frames Feature

## Overview
Remove the "Recommended Frames" section and all related functionality from the face shape analysis app. This includes frame recommendations, virtual try-on, and associated data/components.

## Files to Delete
| File | Purpose |
|------|---------|
| `src/components/FrameRecommendation.tsx` | Frame recommendation card component |
| `src/components/VirtualTryOn.tsx` | Virtual try-on modal with canvas overlay |
| `src/lib/glassesStyles.ts` | Glasses drawing functions for try-on |
| `public/frames/` (8 image files) | Frame example images |

## Files to Modify

### 1. `src/lib/faceShapeData.ts`
Remove the following:
- `GlassesFrame` interface
- `glassesFrames` array (8 frame objects)
- `getRecommendedFrames()` function

Keep the following (still needed for face shape analysis):
- `FaceShape` interface
- `faceShapes` array
- `getFaceShapeById()` function

### 2. `src/components/AnalysisSection.tsx`
Remove:
- Imports for `FrameRecommendation`, `VirtualTryOn`, `GlassesFrame`, `getRecommendedFrames`, `Glasses` icon
- State: `recommendedFrames`, `showTryOn`
- Logic that sets `recommendedFrames` and `showTryOn`
- "Virtual Try-On CTA" button section
- "Recommended Frames for You" grid section
- Virtual Try-On modal at bottom
- "Virtual Try-On" button in the action buttons

Keep:
- Face shape analysis functionality
- Photo upload
- Face shape card display
- Facial features display
- Key characteristics display
- "Try Another Photo" button

## Result
The app will focus purely on face shape detection and analysis, displaying:
- Detected face shape with confidence
- Face shape description and characteristics
- Facial feature measurements (forehead width, cheekbone prominence, jawline shape, face length)

The frame recommendation and virtual try-on features will be completely removed.
