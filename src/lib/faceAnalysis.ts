import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

// MediaPipe 478-point face mesh landmark indices
export const LANDMARKS = {
  // Forehead (outer brow/temple width)
  foreheadLeft: 21,
  foreheadRight: 251,

  // Cheekbones (ear to ear - widest face points)
  cheekboneLeft: 234,
  cheekboneRight: 454,

  // Jaw (gonial angle on face contour)
  jawLeft: 172,
  jawRight: 397,

  // Jaw angle measurement (points above jaw angle)
  jawAngleAboveLeft: 132,
  jawAngleAboveRight: 361,

  // Chin
  chin: 152,
  chinLeft: 149,
  chinRight: 378,

  // Nose
  noseBridge: 6,
  noseBottom: 4,
  noseLeft: 219,
  noseRight: 439,

  // Left eye
  leftEyeOuter: 33,
  leftEyeInner: 133,
  leftEyeTop: 159,
  leftEyeBottom: 145,

  // Right eye
  rightEyeOuter: 263,
  rightEyeInner: 362,
  rightEyeTop: 386,
  rightEyeBottom: 374,

  // Brow center (for forehead estimation)
  leftBrowCenter: 107,
  rightBrowCenter: 336,

  // Face oval outer points
  faceOvalTop: 10,
  faceOvalBottom: 152,
  faceOvalLeft: 234,
  faceOvalRight: 454,
};

export interface FaceLandmarks {
  keypoints: { x: number; y: number }[];
  eyeCenter: { x: number; y: number };
  eyeWidth: number;
  faceWidth: number;
  faceAngle: number;
  leftEye: { x: number; y: number; width: number; height: number };
  rightEye: { x: number; y: number; width: number; height: number };
  noseBridge: { x: number; y: number };
}

export interface FaceAnalysisResult {
  faceShapeId: string;
  confidence: number;
  allScores: { shapeId: string; score: number }[];
  measurements: {
    faceLength: number;
    faceWidth: number;
    foreheadWidth: number;
    cheekboneWidth: number;
    jawWidth: number;
    chinWidth: number;
    lengthToWidthRatio: number;
    foreheadToJawRatio: number;
    cheekboneProminence: number;
    chinToJawRatio: number;
    jawAngle: number;
  };
  landmarks: FaceLandmarks;
}

export interface FaceDetectionError {
  type: 'no-face' | 'multiple-faces' | 'poor-quality' | 'model-error';
  message: string;
}

let faceLandmarker: FaceLandmarker | null = null;
let modelsLoaded = false;
let isModelLoading = false;
let modelLoadPromise: Promise<void> | null = null;

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export async function initializeFaceDetector(
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  if (modelsLoaded) return;

  if (isModelLoading && modelLoadPromise) {
    await modelLoadPromise;
    return;
  }

  isModelLoading = true;

  modelLoadPromise = (async () => {
    try {
      onProgress?.(10, 'Loading vision runtime...');

      const vision = await FilesetResolver.forVisionTasks(WASM_CDN);

      onProgress?.(50, 'Loading face landmark model...');

      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      onProgress?.(100, 'Models ready!');
      modelsLoaded = true;
    } catch (error) {
      console.error('Failed to load MediaPipe FaceLandmarker:', error);
      // Retry with CPU delegate if GPU fails
      try {
        onProgress?.(60, 'Retrying with CPU...');
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'CPU',
          },
          runningMode: 'IMAGE',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
        onProgress?.(100, 'Models ready!');
        modelsLoaded = true;
      } catch (retryError) {
        console.error('Failed to load MediaPipe with CPU fallback:', retryError);
        throw retryError;
      }
    } finally {
      isModelLoading = false;
    }
  })();

  await modelLoadPromise;
}

export function isModelReady(): boolean {
  return modelsLoaded;
}

function calculateDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
}

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

function classifyFaceShape(measurements: FaceAnalysisResult['measurements']): {
  shapeId: string;
  confidence: number;
  allScores: { shapeId: string; score: number }[];
} {
  const {
    faceLength,
    foreheadWidth,
    cheekboneWidth,
    jawWidth,
    jawAngle,
  } = measurements;

  const lengthToWidthRatio = faceLength / cheekboneWidth;
  const foreheadToCheekRatio = foreheadWidth / cheekboneWidth;
  const jawToCheekRatio = jawWidth / cheekboneWidth;

  const foreheadToJawRatio = measurements.foreheadToJawRatio;
  let shapeId: string;

  // 1. OBLONG/RECTANGLE: Long face (checked first)
  if (lengthToWidthRatio >= 1.23) {
    if (jawAngle < 133) {
      shapeId = 'rectangle';
    } else {
      shapeId = 'oblong';
    }
  }
  // 2. HEART: Wide forehead AND narrow jaw AND not too long
  else if (foreheadToJawRatio > 1.2 && jawToCheekRatio < 0.75 && lengthToWidthRatio < 1.23) {
    shapeId = 'heart';
  }
  // 3. DIAMOND: Narrow forehead and jaw, wide cheeks
  else if (jawToCheekRatio < 0.72 && foreheadToJawRatio < 1.08) {
    shapeId = 'diamond';
  }
  // 4. SQUARE: Angular jaw, similar widths
  else if (jawAngle < 133 && jawToCheekRatio > 0.78) {
    shapeId = 'square';
  }
  // 5. ROUND: Very short, very rounded
  else if (lengthToWidthRatio < 1.15 && jawAngle > 143) {
    shapeId = 'round';
  }
  // 6. OVAL: Balanced, rounded jaw, medium length
  else if (jawAngle >= 133 && lengthToWidthRatio >= 1.1 && lengthToWidthRatio < 1.23) {
    shapeId = 'oval';
  }
  // Fallback
  else {
    shapeId = jawAngle < 133 ? 'square' : 'oval';
  }

  // Distance-based scoring for each shape
  const allShapes = ['oval', 'round', 'square', 'heart', 'oblong', 'diamond', 'rectangle'];
  
  const rawScores: Record<string, number> = {};
  
  // Oblong: long face + rounded jaw
  rawScores['oblong'] = Math.max(0, (1 - Math.abs(lengthToWidthRatio - 1.4) / 0.4) + (jawAngle >= 133 ? 1 : 0)) / 2;
  
  // Rectangle: long face + angular jaw
  rawScores['rectangle'] = Math.max(0, (1 - Math.abs(lengthToWidthRatio - 1.4) / 0.4) + (jawAngle < 133 ? 1 : 0)) / 2;
  
  // Diamond: narrow forehead + narrow jaw relative to cheekbones
  rawScores['diamond'] = Math.max(0, (1 - jawToCheekRatio / 0.72) + (foreheadToJawRatio < 1.08 ? 1 : 0)) / 2;
  
  // Heart: wide forehead relative to jaw + narrow jaw
  rawScores['heart'] = Math.max(0, (foreheadToJawRatio - 1.0) / 0.3 + (jawToCheekRatio < 0.75 ? 0.5 : 0)) / 1.5;
  
  // Square: angular jaw + wide jaw
  rawScores['square'] = Math.max(0, (1 - Math.abs(lengthToWidthRatio - 1.1) / 0.3) + (jawAngle < 133 ? 1 : 0) + (jawToCheekRatio > 0.78 ? 1 : 0)) / 3;
  
  // Round: short ratio + very soft jaw
  rawScores['round'] = Math.max(0, (1 - Math.abs(lengthToWidthRatio - 1.0) / 0.2) + (jawAngle > 143 ? 1 : 0)) / 2;
  
  // Oval: medium ratio + soft jaw
  rawScores['oval'] = Math.max(0, (1 - Math.abs(lengthToWidthRatio - 1.16) / 0.2) + (jawAngle >= 133 ? 1 : 0)) / 2;
  
  // Boost the winner
  rawScores[shapeId] = Math.max(rawScores[shapeId], 0.5);

  const total = Object.values(rawScores).reduce((sum, v) => sum + v, 0);
  const scores = allShapes.map(id => ({
    shapeId: id,
    score: Math.round((rawScores[id] / total) * 100),
  }));
  scores.sort((a, b) => b.score - a.score);

  return {
    shapeId,
    confidence: scores[0].score,
    allScores: scores,
  };
}

function extractFaceLandmarks(
  landmarks: { x: number; y: number; z: number }[],
  imageWidth: number,
  imageHeight: number
): FaceLandmarks {
  // Scale normalized coordinates to pixel coordinates
  const getPoint = (index: number) => ({
    x: landmarks[index].x * imageWidth,
    y: landmarks[index].y * imageHeight,
  });

  const leftEyeOuter = getPoint(LANDMARKS.leftEyeOuter);
  const leftEyeInner = getPoint(LANDMARKS.leftEyeInner);
  const leftEyeTop = getPoint(LANDMARKS.leftEyeTop);
  const leftEyeBottom = getPoint(LANDMARKS.leftEyeBottom);

  const rightEyeOuter = getPoint(LANDMARKS.rightEyeOuter);
  const rightEyeInner = getPoint(LANDMARKS.rightEyeInner);
  const rightEyeTop = getPoint(LANDMARKS.rightEyeTop);
  const rightEyeBottom = getPoint(LANDMARKS.rightEyeBottom);

  const noseBridge = getPoint(LANDMARKS.noseBridge);

  const leftEyeWidth = calculateDistance(leftEyeOuter, leftEyeInner);
  const leftEyeHeight = calculateDistance(leftEyeTop, leftEyeBottom);
  const leftEyeCenter = {
    x: (leftEyeOuter.x + leftEyeInner.x) / 2,
    y: (leftEyeTop.y + leftEyeBottom.y) / 2,
  };

  const rightEyeWidth = calculateDistance(rightEyeOuter, rightEyeInner);
  const rightEyeHeight = calculateDistance(rightEyeTop, rightEyeBottom);
  const rightEyeCenter = {
    x: (rightEyeOuter.x + rightEyeInner.x) / 2,
    y: (rightEyeTop.y + rightEyeBottom.y) / 2,
  };

  const eyeCenter = {
    x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
    y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
  };

  const eyeWidth = calculateDistance(leftEyeOuter, rightEyeOuter);

  const faceLeft = getPoint(LANDMARKS.faceOvalLeft);
  const faceRight = getPoint(LANDMARKS.faceOvalRight);
  const faceWidth = calculateDistance(faceLeft, faceRight);

  const faceAngle = Math.atan2(
    rightEyeCenter.y - leftEyeCenter.y,
    rightEyeCenter.x - leftEyeCenter.x
  );

  // Convert all 478 landmarks to keypoints array
  const keypoints = landmarks.map(l => ({
    x: l.x * imageWidth,
    y: l.y * imageHeight,
  }));

  return {
    keypoints,
    eyeCenter,
    eyeWidth,
    faceWidth,
    faceAngle,
    leftEye: {
      x: leftEyeCenter.x,
      y: leftEyeCenter.y,
      width: leftEyeWidth,
      height: leftEyeHeight,
    },
    rightEye: {
      x: rightEyeCenter.x,
      y: rightEyeCenter.y,
      width: rightEyeWidth,
      height: rightEyeHeight,
    },
    noseBridge,
  };
}

function getImageDimensions(
  element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): { width: number; height: number } {
  if (element instanceof HTMLVideoElement) {
    return { width: element.videoWidth, height: element.videoHeight };
  }
  if (element instanceof HTMLCanvasElement) {
    return { width: element.width, height: element.height };
  }
  return { width: element.naturalWidth, height: element.naturalHeight };
}

export async function analyzeFace(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<FaceAnalysisResult> {
  if (!modelsLoaded || !faceLandmarker) {
    throw { type: 'model-error', message: 'Face detection model not initialized' } as FaceDetectionError;
  }

  const { width: imageWidth, height: imageHeight } = getImageDimensions(imageElement);

  const result = faceLandmarker.detect(imageElement);

  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    throw {
      type: 'no-face',
      message: 'No face detected. Please ensure your face is clearly visible and well-lit.',
    } as FaceDetectionError;
  }

  const landmarks = result.faceLandmarks[0];

  // Scale helper
  const getPoint = (index: number) => ({
    x: landmarks[index].x * imageWidth,
    y: landmarks[index].y * imageHeight,
  });

  // Forehead width: points 103 and 332 (outer brow/temple)
  const foreheadLeft = getPoint(LANDMARKS.foreheadLeft);
  const foreheadRight = getPoint(LANDMARKS.foreheadRight);
  const foreheadWidth = calculateDistance(foreheadLeft, foreheadRight);

  // Cheekbone width: points 123 and 352 (cheekbone prominence)
  const cheekboneLeft = getPoint(LANDMARKS.cheekboneLeft);
  const cheekboneRight = getPoint(LANDMARKS.cheekboneRight);
  const cheekboneWidth = calculateDistance(cheekboneLeft, cheekboneRight);

  // Jaw width: points 58 and 288 (jaw angle)
  const jawLeft = getPoint(LANDMARKS.jawLeft);
  const jawRight = getPoint(LANDMARKS.jawRight);
  const jawWidth = calculateDistance(jawLeft, jawRight);

  // Chin width: points 149 and 378 (lower chin sides)
  const chinLeft = getPoint(LANDMARKS.chinLeft);
  const chinRight = getPoint(LANDMARKS.chinRight);
  const chinWidth = calculateDistance(chinLeft, chinRight);

  // Face length: top of face (point 10) to chin (point 152)
  const faceTop = getPoint(LANDMARKS.faceOvalTop);
  const chin = getPoint(LANDMARKS.chin);
  const faceLength = calculateDistance(faceTop, chin);

  const faceWidth = Math.max(foreheadWidth, cheekboneWidth, jawWidth);
  const chinToJawRatio = chinWidth / jawWidth;

  // Calculate jaw angles
  const jawAngleAboveLeft = getPoint(LANDMARKS.jawAngleAboveLeft);
  const jawAngleAboveRight = getPoint(LANDMARKS.jawAngleAboveRight);
  const leftJawAngle = calculateAngle(jawAngleAboveLeft, jawLeft, chin);
  const rightJawAngle = calculateAngle(jawAngleAboveRight, jawRight, chin);
  const jawAngle = (leftJawAngle + rightJawAngle) / 2;

  const measurements = {
    faceLength,
    faceWidth,
    foreheadWidth,
    cheekboneWidth,
    jawWidth,
    chinWidth,
    lengthToWidthRatio: faceLength / faceWidth,
    foreheadToJawRatio: foreheadWidth / jawWidth,
    cheekboneProminence: cheekboneWidth / ((foreheadWidth + jawWidth) / 2),
    chinToJawRatio,
    jawAngle,
  };

  // Debug logging in development
  if (import.meta.env.DEV) {
    console.group('[FaceAnalysis] Face Detection Results');
    console.log('Raw Measurements (pixels):', {
      foreheadWidth: foreheadWidth.toFixed(1),
      cheekboneWidth: cheekboneWidth.toFixed(1),
      jawWidth: jawWidth.toFixed(1),
      chinWidth: chinWidth.toFixed(1),
      faceLength: faceLength.toFixed(1),
      faceWidth: faceWidth.toFixed(1),
      jawAngle: jawAngle.toFixed(1),
    });
    console.log('Key Ratios:', {
      lengthToWidthRatio: measurements.lengthToWidthRatio.toFixed(3),
      foreheadToJawRatio: measurements.foreheadToJawRatio.toFixed(3),
      cheekboneProminence: measurements.cheekboneProminence.toFixed(3),
      chinToJawRatio: measurements.chinToJawRatio.toFixed(3),
    });
    console.log('Classification Ratios:', {
      foreheadToCheekRatio: (foreheadWidth / cheekboneWidth).toFixed(3),
      jawToCheekRatio: (jawWidth / cheekboneWidth).toFixed(3),
      lengthToWidthRatio: (faceLength / cheekboneWidth).toFixed(3),
      jawAngle: jawAngle.toFixed(1),
    });
  }

  const faceLandmarks = extractFaceLandmarks(landmarks, imageWidth, imageHeight);
  const classification = classifyFaceShape(measurements);

  // Log classification results in development
  if (import.meta.env.DEV) {
    console.log('Shape Scores:', classification.allScores);
    console.log('Final Classification:', {
      shape: classification.shapeId,
      confidence: `${classification.confidence}%`
    });
    console.groupEnd();
  }

  return {
    faceShapeId: classification.shapeId,
    confidence: classification.confidence,
    allScores: classification.allScores,
    measurements,
    landmarks: faceLandmarks,
  };
}

export async function detectFaceLandmarks(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<FaceLandmarks | null> {
  if (!modelsLoaded || !faceLandmarker) {
    return null;
  }

  const result = faceLandmarker.detect(imageElement);

  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    return null;
  }

  const { width, height } = getImageDimensions(imageElement);
  return extractFaceLandmarks(result.faceLandmarks[0], width, height);
}

export function disposeModel(): void {
  if (faceLandmarker) {
    faceLandmarker.close();
    faceLandmarker = null;
  }
  modelsLoaded = false;
}
