import * as faceapi from 'face-api.js';

// Face-api.js landmark indices for 68-point model
export const LANDMARKS = {
  // Jaw outline (0-16)
  jawLeft: 0,
  jawRight: 16,
  chin: 8,
  
  // Left eyebrow (17-21)
  leftBrowOuter: 17,
  leftBrowInner: 21,
  
  // Right eyebrow (22-26)
  rightBrowOuter: 26,
  rightBrowInner: 22,
  
  // Nose (27-35)
  noseBridge: 27,
  noseBottom: 30,
  noseLeft: 31,
  noseRight: 35,
  
  // Left eye (36-41)
  leftEyeOuter: 36,
  leftEyeInner: 39,
  leftEyeTop: 37,
  leftEyeBottom: 41,
  
  // Right eye (42-47)
  rightEyeOuter: 45,
  rightEyeInner: 42,
  rightEyeTop: 43,
  rightEyeBottom: 47,
  
  // Outer lip (48-59)
  // Inner lip (60-67)
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

let modelsLoaded = false;
let isModelLoading = false;
let modelLoadPromise: Promise<void> | null = null;

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

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
      onProgress?.(10, 'Loading face detection model...');
      
      // Load TinyFaceDetector for fast face detection
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      onProgress?.(50, 'Loading landmark detection...');
      
      // Load 68-point landmark model
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      onProgress?.(100, 'Models ready!');
      
      modelsLoaded = true;
    } catch (error) {
      console.error('Failed to load face-api.js models:', error);
      throw error;
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
  
  // Oval: "Slightly longer than wide, gently rounded jawline, forehead broader than chin"
  const ovalScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.35, tolerance: 0.12, weight: 2.0 },
    { value: foreheadToJawRatio, target: 1.15, tolerance: 0.12, weight: 1.5 },
    { value: cheekboneProminence, target: 1.02, tolerance: 0.1, weight: 1.0 },
    { value: cheekboneToForeheadRatio, target: 0.98, tolerance: 0.1, weight: 1.0 },
  ]);
  scores.push({ shapeId: 'oval', score: ovalScore });
  
  // Round: "Equal width and length, cheeks typically widest, minimal jaw angles"
  const roundScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.0, tolerance: 0.12, weight: 2.5 },
    { value: foreheadToJawRatio, target: 1.0, tolerance: 0.1, weight: 1.5 },
    { value: cheekboneProminence, target: 1.05, tolerance: 0.1, weight: 2.0 },
    { value: chinToJawRatio, target: 0.85, tolerance: 0.15, weight: 1.5 },
  ]);
  scores.push({ shapeId: 'round', score: roundScore });
  
  // Square: "Forehead, cheekbones, and jaw about the same width, strong defined jawline"
  const squareScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.0, tolerance: 0.1, weight: 2.0 },
    { value: foreheadToJawRatio, target: 1.0, tolerance: 0.05, weight: 2.5 },
    { value: cheekboneProminence, target: 1.0, tolerance: 0.08, weight: 2.0 },
    { value: jawToForeheadRatio, target: 1.0, tolerance: 0.08, weight: 2.0 },
  ]);
  scores.push({ shapeId: 'square', score: squareScore });
  
  // Heart: "Wider forehead, narrow pointed chin, prominent cheekbones"
  const heartScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.3, tolerance: 0.15, weight: 1.5 },
    { value: foreheadToJawRatio, target: 1.4, tolerance: 0.10, weight: 2.5 },
    { value: cheekboneProminence, target: 1.1, tolerance: 0.12, weight: 2.0 },
    { value: jawToForeheadRatio, target: 0.7, tolerance: 0.10, weight: 2.0 },
    { value: chinToJawRatio, target: 0.6, tolerance: 0.15, weight: 2.0 },
  ]);
  scores.push({ shapeId: 'heart', score: heartScore });
  
  // Oblong: "Longer than wide, straight cheek line, forehead/cheeks/jaw close in width"
  const oblongScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.5, tolerance: 0.12, weight: 3.0 },
    { value: foreheadToJawRatio, target: 1.0, tolerance: 0.08, weight: 2.0 },
    { value: cheekboneProminence, target: 1.0, tolerance: 0.08, weight: 1.5 },
    { value: cheekboneToForeheadRatio, target: 1.0, tolerance: 0.08, weight: 1.5 },
  ]);
  scores.push({ shapeId: 'oblong', score: oblongScore });
  
  // Diamond: "Narrow forehead AND chin, cheekbones widest"
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

function extractFaceLandmarks(landmarks: faceapi.FaceLandmarks68): FaceLandmarks {
  const positions = landmarks.positions;
  
  const getPoint = (index: number) => ({
    x: positions[index].x,
    y: positions[index].y
  });
  
  // Get eye landmarks
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
    y: (leftEyeTop.y + leftEyeBottom.y) / 2
  };
  
  const rightEyeWidth = calculateDistance(rightEyeOuter, rightEyeInner);
  const rightEyeHeight = calculateDistance(rightEyeTop, rightEyeBottom);
  const rightEyeCenter = {
    x: (rightEyeOuter.x + rightEyeInner.x) / 2,
    y: (rightEyeTop.y + rightEyeBottom.y) / 2
  };
  
  const eyeCenter = {
    x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
    y: (leftEyeCenter.y + rightEyeCenter.y) / 2
  };
  
  const eyeWidth = calculateDistance(leftEyeOuter, rightEyeOuter);
  
  // Face width at jaw
  const jawLeft = getPoint(LANDMARKS.jawLeft);
  const jawRight = getPoint(LANDMARKS.jawRight);
  const faceWidth = calculateDistance(jawLeft, jawRight);
  
  const faceAngle = Math.atan2(
    rightEyeCenter.y - leftEyeCenter.y,
    rightEyeCenter.x - leftEyeCenter.x
  );
  
  return {
    keypoints: positions.map(p => ({ x: p.x, y: p.y })),
    eyeCenter,
    eyeWidth,
    faceWidth,
    faceAngle,
    leftEye: {
      x: leftEyeCenter.x,
      y: leftEyeCenter.y,
      width: leftEyeWidth,
      height: leftEyeHeight
    },
    rightEye: {
      x: rightEyeCenter.x,
      y: rightEyeCenter.y,
      width: rightEyeWidth,
      height: rightEyeHeight
    },
    noseBridge
  };
}

export async function analyzeFace(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<FaceAnalysisResult> {
  if (!modelsLoaded) {
    throw { type: 'model-error', message: 'Face detection model not initialized' } as FaceDetectionError;
  }
  
  // Detect face with landmarks using face-api.js
  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();
  
  if (!detection) {
    throw { 
      type: 'no-face', 
      message: 'No face detected. Please ensure your face is clearly visible and well-lit.' 
    } as FaceDetectionError;
  }
  
  const landmarks68 = detection.landmarks;
  const positions = landmarks68.positions;
  
  const getPoint = (index: number) => ({
    x: positions[index].x,
    y: positions[index].y
  });
  
  // Calculate key measurements using 68-point landmarks
  // Forehead width: distance between outer eyebrow points
  const foreheadLeft = getPoint(17);  // Left eyebrow outer
  const foreheadRight = getPoint(26); // Right eyebrow outer
  const foreheadWidth = calculateDistance(foreheadLeft, foreheadRight);
  
  // Cheekbone width: points 1 and 15 on jaw outline (upper jaw)
  const cheekboneLeft = getPoint(1);
  const cheekboneRight = getPoint(15);
  const cheekboneWidth = calculateDistance(cheekboneLeft, cheekboneRight);
  
  // Jaw width: points 4 and 12 on jaw outline
  const jawLeft = getPoint(4);
  const jawRight = getPoint(12);
  const jawWidth = calculateDistance(jawLeft, jawRight);
  
  // Chin width: points 6 and 10 on jaw outline
  const chinLeft = getPoint(6);
  const chinRight = getPoint(10);
  const chinWidth = calculateDistance(chinLeft, chinRight);
  
  // Face length: from forehead (using nose bridge top estimate) to chin
  const noseBridgeTop = getPoint(27);
  const chin = getPoint(8);
  // Estimate forehead top as mirror of nose bridge above brow line
  const browCenter = {
    x: (getPoint(19).x + getPoint(24).x) / 2,
    y: (getPoint(19).y + getPoint(24).y) / 2
  };
  const browToNose = noseBridgeTop.y - browCenter.y;
  const estimatedForeheadTop = {
    x: browCenter.x,
    y: browCenter.y - browToNose * 1.5
  };
  const faceLength = calculateDistance(estimatedForeheadTop, chin);
  
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
    chinToJawRatio
  };
  
  const faceLandmarks = extractFaceLandmarks(landmarks68);
  const classification = classifyFaceShape(measurements);
  
  return {
    faceShapeId: classification.shapeId,
    confidence: classification.confidence,
    allScores: classification.allScores,
    measurements,
    landmarks: faceLandmarks
  };
}

export async function detectFaceLandmarks(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<FaceLandmarks | null> {
  if (!modelsLoaded) {
    return null;
  }
  
  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();
  
  if (!detection) {
    return null;
  }
  
  return extractFaceLandmarks(detection.landmarks);
}

export function disposeModel(): void {
  // face-api.js doesn't require explicit disposal
  modelsLoaded = false;
}
