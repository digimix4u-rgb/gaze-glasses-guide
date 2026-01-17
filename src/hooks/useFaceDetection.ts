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

  const loadModel = useCallback(async () => {
    if (modelReadyRef.current || state.isModelLoading) return;
    
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
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: { 
          type: 'model-error', 
          message: 'Failed to load AI model. Please refresh and try again.' 
        }
      }));
    } finally {
      setState(prev => ({ ...prev, isModelLoading: false }));
    }
  }, [state.isModelLoading]);

  const analyze = useCallback(async (
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<FaceAnalysisResult | null> => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null, result: null }));
    
    try {
      // Ensure model is loaded
      if (!modelReadyRef.current) {
        await loadModel();
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
