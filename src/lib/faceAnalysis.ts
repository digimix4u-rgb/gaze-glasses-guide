import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

// MediaPipe 478-point face mesh landmark indices
export const LANDMARKS = {
  // Forehead (outer brow/temple width)
  foreheadLeft: 103,
  foreheadRight: 332,

  // Cheekbones (zygomatic prominence)
  cheekboneLeft: 123,
  cheekboneRight: 352,

  // Jaw (gonial angle)
  jawLeft: 58,
  jawRight: 288,

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

interface ShapeParameter {
  value: number;
  target: number;
  tolerance: number;
  weight: number;
}

function calculateWeightedShapeScore(params: ShapeParameter[]): number {
  let totalScore = 0;
  let totalWeight = 0;

  for (const param of params) {
    const deviation = Math.abs(param.value - param.target) / param.tolerance;
    const score = Math.exp(-Math.pow(deviation, 2));
    totalScore += score * param.weight;
    totalWeight += param.weight;
  }

  return totalScore / totalWeight;
}

function classifyFaceShape(measurements: FaceAnalysisResult['measurements']): {
  shapeId: string;
  confidence: number;
  allScores: { shapeId: string; score: number }[];
} {
  const {
    lengthToWidthRatio,
    foreheadToJawRatio,
    cheekboneProminence,
    foreheadWidth,
    cheekboneWidth,
    jawWidth,
    chinToJawRatio,
  } = measurements;

  const jawToForeheadRatio = jawWidth / foreheadWidth;
  const cheekboneToForeheadRatio = cheekboneWidth / foreheadWidth;
  const foreheadToFaceWidth = foreheadWidth / cheekboneWidth;
  const jawToFaceWidth = jawWidth / cheekboneWidth;

  const scores: { shapeId: string; score: number }[] = [];

  // Oval
  const ovalScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.35, tolerance: 0.12, weight: 2.0 },
    { value: foreheadToJawRatio, target: 1.15, tolerance: 0.12, weight: 1.5 },
    { value: cheekboneProminence, target: 1.02, tolerance: 0.1, weight: 1.0 },
    { value: cheekboneToForeheadRatio, target: 0.98, tolerance: 0.1, weight: 1.0 },
  ]);
  scores.push({ shapeId: 'oval', score: ovalScore });

  // Round
  const roundScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.0, tolerance: 0.12, weight: 2.5 },
    { value: foreheadToJawRatio, target: 1.0, tolerance: 0.1, weight: 1.5 },
    { value: cheekboneProminence, target: 1.05, tolerance: 0.1, weight: 2.0 },
    { value: chinToJawRatio, target: 0.85, tolerance: 0.15, weight: 1.5 },
  ]);
  scores.push({ shapeId: 'round', score: roundScore });

  // Square
  const squareScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.0, tolerance: 0.1, weight: 2.0 },
    { value: foreheadToJawRatio, target: 1.0, tolerance: 0.05, weight: 2.5 },
    { value: cheekboneProminence, target: 1.0, tolerance: 0.08, weight: 2.0 },
    { value: jawToForeheadRatio, target: 1.0, tolerance: 0.08, weight: 2.0 },
  ]);
  scores.push({ shapeId: 'square', score: squareScore });

  // Heart
  const heartScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.3, tolerance: 0.15, weight: 1.5 },
    { value: foreheadToJawRatio, target: 1.4, tolerance: 0.10, weight: 2.5 },
    { value: cheekboneProminence, target: 1.1, tolerance: 0.12, weight: 2.0 },
    { value: jawToForeheadRatio, target: 0.7, tolerance: 0.10, weight: 2.0 },
    { value: chinToJawRatio, target: 0.6, tolerance: 0.15, weight: 2.0 },
  ]);
  scores.push({ shapeId: 'heart', score: heartScore });

  // Oblong
  const oblongScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.5, tolerance: 0.12, weight: 3.0 },
    { value: foreheadToJawRatio, target: 1.0, tolerance: 0.08, weight: 2.0 },
    { value: cheekboneProminence, target: 1.0, tolerance: 0.08, weight: 1.5 },
    { value: cheekboneToForeheadRatio, target: 1.0, tolerance: 0.08, weight: 1.5 },
  ]);
  scores.push({ shapeId: 'oblong', score: oblongScore });

  // Diamond
  const diamondScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.35, tolerance: 0.15, weight: 1.5 },
    { value: cheekboneProminence, target: 1.15, tolerance: 0.1, weight: 3.0 },
    { value: foreheadToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.5 },
    { value: jawToFaceWidth, target: 0.85, tolerance: 0.1, weight: 2.5 },
  ]);
  scores.push({ shapeId: 'diamond', score: diamondScore });

  scores.sort((a, b) => b.score - a.score);

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const normalizedScores = scores.map(s => ({
    shapeId: s.shapeId,
    score: Math.round((s.score / totalScore) * 100)
  }));

  const topScore = normalizedScores[0].score;
  const secondScore = normalizedScores[1]?.score || 0;
  const scoreDifference = topScore - secondScore;

  const confidenceBoost = Math.min(scoreDifference * 0.5, 10);
  const adjustedConfidence = Math.min(topScore + confidenceBoost, 95);

  return {
    shapeId: normalizedScores[0].shapeId,
    confidence: Math.round(adjustedConfidence),
    allScores: normalizedScores
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

  // Forehead width: points 70 and 300
  const foreheadLeft = getPoint(LANDMARKS.foreheadLeft);
  const foreheadRight = getPoint(LANDMARKS.foreheadRight);
  const foreheadWidth = calculateDistance(foreheadLeft, foreheadRight);

  // Cheekbone width: points 234 and 454
  const cheekboneLeft = getPoint(LANDMARKS.cheekboneLeft);
  const cheekboneRight = getPoint(LANDMARKS.cheekboneRight);
  const cheekboneWidth = calculateDistance(cheekboneLeft, cheekboneRight);

  // Jaw width: points 172 and 397
  const jawLeft = getPoint(LANDMARKS.jawLeft);
  const jawRight = getPoint(LANDMARKS.jawRight);
  const jawWidth = calculateDistance(jawLeft, jawRight);

  // Chin width: points 175 and 396
  const chinLeft = getPoint(LANDMARKS.chinLeft);
  const chinRight = getPoint(LANDMARKS.chinRight);
  const chinWidth = calculateDistance(chinLeft, chinRight);

  // Face length: top of face (point 10) to chin (point 152)
  const faceTop = getPoint(LANDMARKS.faceOvalTop);
  const chin = getPoint(LANDMARKS.chin);
  const faceLength = calculateDistance(faceTop, chin);

  const faceWidth = Math.max(foreheadWidth, cheekboneWidth, jawWidth);
  const chinToJawRatio = chinWidth / jawWidth;

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
  };

  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log('[FaceAnalysis] Measurements:', {
      foreheadWidth: foreheadWidth.toFixed(1),
      cheekboneWidth: cheekboneWidth.toFixed(1),
      jawWidth: jawWidth.toFixed(1),
      chinWidth: chinWidth.toFixed(1),
      faceLength: faceLength.toFixed(1),
      lengthToWidthRatio: measurements.lengthToWidthRatio.toFixed(3),
      foreheadToJawRatio: measurements.foreheadToJawRatio.toFixed(3),
      cheekboneProminence: measurements.cheekboneProminence.toFixed(3),
      chinToJawRatio: measurements.chinToJawRatio.toFixed(3),
    });
  }

  const faceLandmarks = extractFaceLandmarks(landmarks, imageWidth, imageHeight);
  const classification = classifyFaceShape(measurements);

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
