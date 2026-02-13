

# Migrate Face Detection to @mediapipe/tasks-vision

## Overview
Replace the current `face-api.js` library with Google's `@mediapipe/tasks-vision` FaceLandmarker for face detection and landmark extraction. This is Google's latest, actively maintained solution with better accuracy, faster inference via WebAssembly/WebGL, and 478-point face mesh landmarks (vs. 68 points from face-api.js).

## Why @mediapipe/tasks-vision
- Actively maintained by Google (face-api.js is unmaintained)
- 478 landmark points provide far more precise facial measurements
- Uses optimized WASM/WebGL runtime for better performance
- Smaller model files with CDN-hosted WASM binaries
- Better cross-browser compatibility

## Changes

### 1. Swap Dependencies
- **Remove**: `face-api.js`
- **Add**: `@mediapipe/tasks-vision`
- **Remove** (already unused): `@mediapipe/face_mesh`, `@tensorflow-models/face-landmarks-detection`, `@tensorflow/tfjs`

### 2. Rewrite `src/lib/faceAnalysis.ts`
This is the only file that imports `face-api.js`, so the migration is contained.

**Initialization:**
- Use `FilesetResolver.forVisionTasks()` to load WASM files from CDN
- Use `FaceLandmarker.createFromModelPath()` with the official face landmarker model from Google's storage
- Configure for IMAGE mode with 1 face

**Landmark Mapping:**
The 478-point MediaPipe mesh uses different indices than the 68-point model. Key mappings:

| Measurement | face-api.js (68pt) | MediaPipe (478pt) |
|---|---|---|
| Forehead width | Points 17, 26 (brow outer) | Points 70, 300 (forehead) |
| Cheekbone width | Points 1, 15 (upper jaw) | Points 234, 454 (cheekbones) |
| Jaw width | Points 4, 12 (mid jaw) | Points 172, 397 (jaw) |
| Chin | Point 8 | Point 152 |
| Chin width | Points 6, 10 | Points 175, 396 |
| Nose bridge | Point 27 | Point 6 |
| Eye landmarks | Points 36-47 | Points 33, 133, 159, 145, 263, 362, 386, 374 |

**All existing interfaces stay the same** (`FaceAnalysisResult`, `FaceLandmarks`, `FaceDetectionError`, measurements object) -- only the internal implementation changes.

**Classification logic** (`classifyFaceShape`, `calculateWeightedShapeScore`) remains completely unchanged since it operates on computed ratios, not raw landmarks.

### 3. Update `src/hooks/useFaceDetection.ts`
No structural changes needed. The hook already calls `initializeFaceDetector()`, `analyzeFace()`, and `isModelReady()` -- these function signatures stay the same.

### 4. Update `vite.config.ts` Service Worker Caching
Update the CDN caching pattern to also cover MediaPipe WASM files:
- Add a runtime caching rule for `storage.googleapis.com` (model files)
- Keep the existing `cdn.jsdelivr.net` rule (now for WASM runtime files)

### 5. Remove Unused Dependencies
Clean up packages no longer needed:
- `face-api.js`
- `@mediapipe/face_mesh` (old MediaPipe, already unused)
- `@tensorflow-models/face-landmarks-detection` (unused)
- `@tensorflow/tfjs` (unused)

## Files Modified

| File | Action |
|---|---|
| `src/lib/faceAnalysis.ts` | Rewrite -- swap face-api.js for @mediapipe/tasks-vision |
| `vite.config.ts` | Update -- add caching rule for googleapis.com |
| `package.json` | Update -- swap dependencies |

## What Stays the Same
- All TypeScript interfaces and types
- The weighted Gaussian scoring / classification algorithm
- All UI components (AnalysisSection, PhotoUpload, FacialFeatures, etc.)
- The `useFaceDetection` hook API
- PWA functionality and service worker

## Technical Details

### Initialization Code (new)
```text
FilesetResolver.forVisionTasks(CDN_WASM_URL)
  -> FaceLandmarker.createFromModelPath(fileset, MODEL_URL)
  -> configured for IMAGE mode, 1 face, outputFaceBlendshapes disabled
```

### Detection Code (new)
```text
faceLandmarker.detect(imageElement)
  -> result.faceLandmarks[0]  (478 NormalizedLandmark points)
  -> extract measurements using mapped indices
  -> pass to classifyFaceShape() (unchanged)
```

### Landmark coordinates
MediaPipe returns normalized coordinates (0-1), so they need to be scaled by image width/height before distance calculations. This will be handled in the extraction function.

