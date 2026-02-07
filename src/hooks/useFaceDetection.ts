import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  initializeFaceDetector, 
  analyzeFace, 
  isModelReady,
  disposeModel,
  FaceAnalysisResult,
  FaceDetectionError
} from '@/lib/faceAnalysis';

interface UseFaceDetectionState {
  isModelLoading: boolean;
  isAnalyzing: boolean;
  loadingProgress: number;
  loadingMessage: string;
  error: FaceDetectionError | null;
  result: FaceAnalysisResult | null;
}

export function useFaceDetection() {
  const [state, setState] = useState<UseFaceDetectionState>({
    isModelLoading: false,
    isAnalyzing: false,
    loadingProgress: 0,
    loadingMessage: '',
    error: null,
    result: null,
  });
  
  const modelReadyRef = useRef(isModelReady());

  const loadModel = useCallback(async (): Promise<boolean> => {
    if (modelReadyRef.current) return true;
    if (state.isModelLoading) {
      // Wait for existing load to complete
      return new Promise((resolve) => {
        const checkReady = setInterval(() => {
          if (modelReadyRef.current) {
            clearInterval(checkReady);
            resolve(true);
          }
        }, 100);
        // Timeout after 30 seconds
        setTimeout(() => {
          clearInterval(checkReady);
          resolve(modelReadyRef.current);
        }, 30000);
      });
    }
    
    setState(prev => ({ 
      ...prev, 
      isModelLoading: true, 
      error: null,
      loadingProgress: 0,
      loadingMessage: 'Initializing...'
    }));
    
    try {
      await initializeFaceDetector((progress, message) => {
        setState(prev => ({ 
          ...prev, 
          loadingProgress: progress,
          loadingMessage: message
        }));
      });
      modelReadyRef.current = true;
      return true;
    } catch (error) {
      console.error('Failed to load face detection model:', error);
      setState(prev => ({ 
        ...prev, 
        error: { 
          type: 'model-error', 
          message: 'Failed to load AI model. Please refresh and try again.' 
        }
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, isModelLoading: false }));
    }
  }, [state.isModelLoading]);

  const analyze = useCallback(async (
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<FaceAnalysisResult | null> => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null, result: null }));
    
    try {
      // Ensure model is loaded and wait for it
      if (!modelReadyRef.current) {
        const modelLoaded = await loadModel();
        if (!modelLoaded) {
          setState(prev => ({ 
            ...prev, 
            error: { 
              type: 'model-error', 
              message: 'Face detection model not initialized. Please refresh and try again.' 
            },
            isAnalyzing: false 
          }));
          return null;
        }
      }
      
      const result = await analyzeFace(imageElement);
      setState(prev => ({ ...prev, result, isAnalyzing: false }));
      return result;
    } catch (error) {
      const detectionError = error as FaceDetectionError;
      setState(prev => ({ 
        ...prev, 
        error: detectionError,
        isAnalyzing: false 
      }));
      return null;
    }
  }, [loadModel]);

  const reset = useCallback(() => {
    setState({
      isModelLoading: false,
      isAnalyzing: false,
      loadingProgress: 0,
      loadingMessage: '',
      error: null,
      result: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't dispose model on unmount to keep it cached
    };
  }, []);

  return {
    ...state,
    isModelReady: modelReadyRef.current,
    loadModel,
    analyze,
    reset,
  };
}
