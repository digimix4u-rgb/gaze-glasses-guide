import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

// Landmark indices for key facial points (MediaPipe Face Mesh - 468 points)
export const LANDMARKS = {
  // Forehead points
  foreheadLeft: 54,
  foreheadRight: 284,
  foreheadTop: 10,
  
  // Temple points (widest forehead)
  templeLeft: 127,
  templeRight: 356,
  
  // Cheekbone points (widest face)
  cheekboneLeft: 234,
  cheekboneRight: 454,
  
  // Jaw points
  jawLeft: 172,
  jawRight: 397,
  jawBottom: 152,
  
  // Chin
  chinTip: 152,
  chinLeft: 32,
  chinRight: 262,
  
  // Face outline for length
  faceTop: 10,
  faceBottom: 152,
  
  // Eye landmarks for glasses positioning
  leftEyeOuter: 33,
  leftEyeInner: 133,
  leftEyeTop: 159,
  leftEyeBottom: 145,
  rightEyeOuter: 263,
  rightEyeInner: 362,
  rightEyeTop: 386,
  rightEyeBottom: 374,
  
  // Nose bridge
  noseBridgeTop: 6,
  noseBridgeMid: 4,
  noseBottom: 1,
};

export interface FaceLandmarks {
  keypoints: { x: number; y: number; z?: number }[];
  // Computed positions for glasses overlay
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
    lengthToWidthRatio: number;
    foreheadToJawRatio: number;
    cheekboneProminence: number;
  };
  landmarks: FaceLandmarks;
}

export interface FaceDetectionError {
  type: 'no-face' | 'multiple-faces' | 'poor-quality' | 'model-error';
  message: string;
}

let detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
let isModelLoading = false;
let modelLoadPromise: Promise<void> | null = null;

export async function initializeFaceDetector(
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  if (detector) return;
  
  if (isModelLoading && modelLoadPromise) {
    await modelLoadPromise;
    return;
  }
  
  isModelLoading = true;
  
  modelLoadPromise = (async () => {
    try {
      onProgress?.(10, 'Setting up TensorFlow.js...');
      
      // Set backend
      await tf.ready();
      onProgress?.(30, 'Loading AI model...');
      
      // Create detector with MediaPipe Face Mesh
      detector = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          refineLandmarks: true,
          maxFaces: 1,
        }
      );
      
      onProgress?.(100, 'AI model ready!');
    } catch (error) {
      console.error('Failed to load face detection model:', error);
      throw error;
    } finally {
      isModelLoading = false;
    }
  })();
  
  await modelLoadPromise;
}

export function isModelReady(): boolean {
  return detector !== null;
}

function calculateDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
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
  } = measurements;
  
  // Additional derived ratios for better differentiation
  const jawToForeheadRatio = jawWidth / foreheadWidth;
  const cheekboneToForeheadRatio = cheekboneWidth / foreheadWidth;
  const cheekboneToJawRatio = cheekboneWidth / jawWidth;
  
  // Score each face shape based on measurements with weighted factors
  const scores: { shapeId: string; score: number }[] = [];
  
  // Oval: Length 1.3-1.5x width, balanced proportions, gentle tapering
  // Key characteristics: Face is longer than wide, forehead slightly wider than jaw
  const ovalScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.4, tolerance: 0.15, weight: 2.0 },
    { value: foreheadToJawRatio, target: 1.1, tolerance: 0.15, weight: 1.5 },
    { value: cheekboneProminence, target: 1.05, tolerance: 0.1, weight: 1.0 },
    { value: cheekboneToForeheadRatio, target: 1.0, tolerance: 0.1, weight: 1.0 },
  ]);
  scores.push({ shapeId: 'oval', score: ovalScore });
  
  // Round: Length ≈ width, soft angles, full cheeks
  // Key characteristics: Face length almost equals width, curved jawline
  const roundScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.0, tolerance: 0.08, weight: 2.5 },
    { value: foreheadToJawRatio, target: 1.0, tolerance: 0.1, weight: 1.5 },
    { value: cheekboneProminence, target: 1.0, tolerance: 0.08, weight: 1.5 },
    { value: cheekboneToJawRatio, target: 1.0, tolerance: 0.1, weight: 1.0 },
  ]);
  scores.push({ shapeId: 'round', score: roundScore });
  
  // Square: Length ≈ width, strong angular jaw, similar forehead and jaw width
  // Key characteristics: Prominent jaw, face width at forehead, cheekbones, and jaw are similar
  const squareScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.05, tolerance: 0.1, weight: 2.0 },
    { value: foreheadToJawRatio, target: 0.95, tolerance: 0.08, weight: 2.0 },
    { value: cheekboneProminence, target: 1.0, tolerance: 0.1, weight: 1.0 },
    { value: jawToForeheadRatio, target: 1.05, tolerance: 0.1, weight: 1.5 },
  ]);
  scores.push({ shapeId: 'square', score: squareScore });
  
  // Heart: Wide forehead, narrow pointed jaw/chin
  // Key characteristics: Forehead is widest, jaw is noticeably narrower
  const heartScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.3, tolerance: 0.15, weight: 1.5 },
    { value: foreheadToJawRatio, target: 1.3, tolerance: 0.15, weight: 2.5 },
    { value: cheekboneToForeheadRatio, target: 0.95, tolerance: 0.1, weight: 1.5 },
    { value: jawToForeheadRatio, target: 0.75, tolerance: 0.15, weight: 2.0 },
  ]);
  scores.push({ shapeId: 'heart', score: heartScore });
  
  // Oblong/Rectangle: Face significantly longer than wide, straight sides
  // Key characteristics: Length is 1.5x+ width, forehead/cheekbones/jaw are similar
  const oblongScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.6, tolerance: 0.15, weight: 3.0 },
    { value: foreheadToJawRatio, target: 1.0, tolerance: 0.1, weight: 1.5 },
    { value: cheekboneProminence, target: 0.98, tolerance: 0.1, weight: 1.0 },
    { value: cheekboneToForeheadRatio, target: 1.0, tolerance: 0.1, weight: 1.0 },
  ]);
  scores.push({ shapeId: 'oblong', score: oblongScore });
  
  // Diamond: Prominent cheekbones, narrow forehead AND jaw
  // Key characteristics: Cheekbones are the widest point, both forehead and jaw are narrower
  const diamondScore = calculateWeightedShapeScore([
    { value: lengthToWidthRatio, target: 1.35, tolerance: 0.15, weight: 1.5 },
    { value: cheekboneProminence, target: 1.2, tolerance: 0.1, weight: 3.0 },
    { value: cheekboneToForeheadRatio, target: 1.15, tolerance: 0.12, weight: 2.0 },
    { value: cheekboneToJawRatio, target: 1.2, tolerance: 0.12, weight: 2.0 },
  ]);
  scores.push({ shapeId: 'diamond', score: diamondScore });
  
  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  
  // Normalize scores to percentages with enhanced confidence calculation
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const normalizedScores = scores.map(s => ({
    shapeId: s.shapeId,
    score: Math.round((s.score / totalScore) * 100)
  }));
  
  // Calculate confidence based on how much the top score exceeds the second
  const topScore = normalizedScores[0].score;
  const secondScore = normalizedScores[1]?.score || 0;
  const scoreDifference = topScore - secondScore;
  
  // Boost confidence if there's clear differentiation
  const confidenceBoost = Math.min(scoreDifference * 0.5, 10);
  const adjustedConfidence = Math.min(topScore + confidenceBoost, 95);
  
  return {
    shapeId: normalizedScores[0].shapeId,
    confidence: Math.round(adjustedConfidence),
    allScores: normalizedScores
  };
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
    // Gaussian scoring with weighted importance
    const deviation = Math.abs(param.value - param.target) / param.tolerance;
    const score = Math.exp(-Math.pow(deviation, 2));
    totalScore += score * param.weight;
    totalWeight += param.weight;
  }
  
  return totalScore / totalWeight;
}

function extractFaceLandmarks(keypoints: { x: number; y: number; z?: number }[]): FaceLandmarks {
  const getPoint = (index: number) => ({
    x: keypoints[index].x,
    y: keypoints[index].y
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
  
  const noseBridge = getPoint(LANDMARKS.noseBridgeTop);
  
  // Calculate eye dimensions
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
  
  // Calculate overall eye center (for glasses positioning)
  const eyeCenter = {
    x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
    y: (leftEyeCenter.y + rightEyeCenter.y) / 2
  };
  
  // Distance between outer eye corners (for glasses width)
  const eyeWidth = calculateDistance(leftEyeOuter, rightEyeOuter);
  
  // Face width at temples
  const templeLeft = getPoint(LANDMARKS.templeLeft);
  const templeRight = getPoint(LANDMARKS.templeRight);
  const faceWidth = calculateDistance(templeLeft, templeRight);
  
  // Calculate face angle (rotation)
  const faceAngle = Math.atan2(
    rightEyeCenter.y - leftEyeCenter.y,
    rightEyeCenter.x - leftEyeCenter.x
  );
  
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
  if (!detector) {
    throw { type: 'model-error', message: 'Face detection model not initialized' } as FaceDetectionError;
  }
  
  // Detect faces
  const faces = await detector.estimateFaces(imageElement, {
    flipHorizontal: false,
  });
  
  if (faces.length === 0) {
    throw { 
      type: 'no-face', 
      message: 'No face detected. Please ensure your face is clearly visible and well-lit.' 
    } as FaceDetectionError;
  }
  
  if (faces.length > 1) {
    throw { 
      type: 'multiple-faces', 
      message: 'Multiple faces detected. Please use a photo with only one person.' 
    } as FaceDetectionError;
  }
  
  const face = faces[0];
  const keypoints = face.keypoints;
  
  // Extract key landmark positions
  const getPoint = (index: number) => ({
    x: keypoints[index].x,
    y: keypoints[index].y
  });
  
  // Calculate measurements
  const templeLeft = getPoint(LANDMARKS.templeLeft);
  const templeRight = getPoint(LANDMARKS.templeRight);
  const cheekboneLeft = getPoint(LANDMARKS.cheekboneLeft);
  const cheekboneRight = getPoint(LANDMARKS.cheekboneRight);
  const jawLeft = getPoint(LANDMARKS.jawLeft);
  const jawRight = getPoint(LANDMARKS.jawRight);
  const faceTop = getPoint(LANDMARKS.faceTop);
  const faceBottom = getPoint(LANDMARKS.faceBottom);
  
  const foreheadWidth = calculateDistance(templeLeft, templeRight);
  const cheekboneWidth = calculateDistance(cheekboneLeft, cheekboneRight);
  const jawWidth = calculateDistance(jawLeft, jawRight);
  const faceLength = calculateDistance(faceTop, faceBottom);
  const faceWidth = Math.max(foreheadWidth, cheekboneWidth, jawWidth);
  
  const measurements = {
    faceLength,
    faceWidth,
    foreheadWidth,
    cheekboneWidth,
    jawWidth,
    lengthToWidthRatio: faceLength / faceWidth,
    foreheadToJawRatio: foreheadWidth / jawWidth,
    cheekboneProminence: cheekboneWidth / ((foreheadWidth + jawWidth) / 2)
  };
  
  // Extract landmarks for glasses overlay
  const landmarks = extractFaceLandmarks(keypoints);
  
  // Classify face shape
  const classification = classifyFaceShape(measurements);
  
  return {
    faceShapeId: classification.shapeId,
    confidence: classification.confidence,
    allScores: classification.allScores,
    measurements,
    landmarks
  };
}

export async function detectFaceLandmarks(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<FaceLandmarks | null> {
  if (!detector) {
    return null;
  }
  
  const faces = await detector.estimateFaces(imageElement, {
    flipHorizontal: false,
  });
  
  if (faces.length === 0) {
    return null;
  }
  
  return extractFaceLandmarks(faces[0].keypoints);
}

export function disposeModel(): void {
  if (detector) {
    detector.dispose();
    detector = null;
  }
}
