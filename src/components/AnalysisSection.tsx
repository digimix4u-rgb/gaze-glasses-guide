import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PhotoUpload from "./PhotoUpload";
import FaceShapeCard from "./FaceShapeCard";
import FacialFeatures from "./FacialFeatures";
import GenderSelection from "./GenderSelection";
import { faceShapes, getFaceShapeById, FaceShape, Gender } from "@/lib/faceShapeData";
import { FaceAnalysisResult } from "@/lib/faceAnalysis";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { RefreshCw, Sparkles, AlertCircle, Loader2, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const AnalysisSection = () => {
  const [gender, setGender] = useState<Gender | null>(null);
  const [detectedShape, setDetectedShape] = useState<FaceShape | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [confidence, setConfidence] = useState<number>(0);
  const [secondaryMatches, setSecondaryMatches] = useState<{ shapeId: string; score: number }[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [faceMeasurements, setFaceMeasurements] = useState<FaceAnalysisResult['measurements'] | null>(null);
  
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const {
    isModelLoading,
    isAnalyzing,
    loadingProgress,
    loadingMessage,
    error,
    loadModel,
    analyze,
    reset: resetDetection,
  } = useFaceDetection();

  // Preload model when component mounts
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file);
    setHasPhoto(true);
    setDetectedShape(null);
    setConfidence(0);
    setSecondaryMatches([]);
    setFaceMeasurements(null);
    resetDetection();
  };

  const analyzePhoto = async () => {
    if (!photoFile) return;
    
    // Create image element from file
    const img = new Image();
    const imageUrl = URL.createObjectURL(photoFile);
    
    img.onload = async () => {
      imageRef.current = img;
      
      const result = await analyze(img);
      
      if (result) {
        const shape = getFaceShapeById(result.faceShapeId);
        if (shape) {
          setDetectedShape(shape);
          setConfidence(result.confidence);
          // Get top 2 secondary matches
          setSecondaryMatches(result.allScores.slice(1, 3));
          // Store measurements for facial features display
          setFaceMeasurements(result.measurements);
        }
      }
      
      URL.revokeObjectURL(imageUrl);
    };
    
    img.src = imageUrl;
  };

  const resetAnalysis = () => {
    setGender(null);
    setDetectedShape(null);
    setHasPhoto(false);
    setConfidence(0);
    setSecondaryMatches([]);
    setPhotoFile(null);
    setFaceMeasurements(null);
    resetDetection();
  };

  const isProcessing = isModelLoading || isAnalyzing;

  return (
    <section id="analyze" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI Analysis</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Discover Your Face Shape
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a front-facing photo and let our AI determine your face shape
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {!gender ? (
            <GenderSelection onSelect={setGender} />
          ) : !detectedShape ? (
            <div className="flex flex-col items-center gap-8">
              <PhotoUpload onPhotoSelect={handlePhotoSelect} isAnalyzing={isProcessing} />
              
              {/* Model Loading State */}
              {isModelLoading && (
                <div className="w-full max-w-md p-6 rounded-2xl bg-background shadow-soft">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-5 h-5 text-primary animate-pulse" />
                    <span className="font-medium text-foreground">{loadingMessage}</span>
                  </div>
                  <Progress value={loadingProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    First-time setup • This only happens once
                  </p>
                </div>
              )}
              
              {/* Error State */}
              {error && (
                <div className="w-full max-w-md p-6 rounded-2xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Analysis Failed</p>
                      <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
                      {error.type === 'no-face' && (
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                          <li>• Ensure your face is clearly visible</li>
                          <li>• Use good lighting</li>
                          <li>• Face the camera directly</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Analyze Button */}
              {hasPhoto && !isProcessing && !error && (
                <Button variant="hero" size="lg" onClick={analyzePhoto}>
                  <Sparkles className="w-5 h-5" />
                  Analyze My Face Shape
                </Button>
              )}
              
              {/* Analyzing State */}
              {isAnalyzing && (
                <div className="flex items-center gap-3 text-primary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Analyzing facial features...</span>
                </div>
              )}
              
              {/* Retry Button on Error */}
              {error && hasPhoto && (
                <div className="flex gap-4">
                  <Button variant="outline" onClick={resetAnalysis}>
                    <RefreshCw className="w-4 h-4" />
                    Try Different Photo
                  </Button>
                  <Button variant="hero" onClick={analyzePhoto}>
                    <Sparkles className="w-4 h-4" />
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-12 animate-fade-in">
              <div className="text-center">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                  Your Face Shape: {detectedShape.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="secondary" className="capitalize">{gender}</Badge>
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {confidence}% confidence
                  </div>
                </div>
                {secondaryMatches.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Also similar to:{" "}
                    {secondaryMatches.map((match, i) => (
                      <span key={match.shapeId}>
                        {faceShapes.find(s => s.id === match.shapeId)?.name} ({match.score}%)
                        {i < secondaryMatches.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                )}
                <p className="text-muted-foreground max-w-xl mx-auto mt-4">
                  {detectedShape.description}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-serif font-semibold text-foreground mb-4">
                      Your Analysis
                    </h4>
                    <FaceShapeCard shape={detectedShape} isSelected />
                  </div>
                </div>

                <div className="space-y-6">
                  {faceMeasurements && (
                    <FacialFeatures measurements={faceMeasurements} />
                  )}
                  
                  <div>
                    <h4 className="text-lg font-serif font-semibold text-foreground mb-4">
                      Key Characteristics
                    </h4>
                    <div className="p-6 rounded-2xl bg-background shadow-soft">
                      <ul className="space-y-3">
                        {detectedShape.characteristics.map((char, i) => (
                          <li key={i} className="flex items-start gap-3 text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" size="lg" onClick={resetAnalysis}>
                  <RefreshCw className="w-5 h-5" />
                  Try Another Photo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnalysisSection;
