import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { GlassesFrame } from "@/lib/faceShapeData";
import { FaceLandmarks } from "@/lib/faceAnalysis";
import { glassesStyles, getGlassesStyleById } from "@/lib/glassesStyles";
import { ChevronLeft, ChevronRight, Camera, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VirtualTryOnProps {
  photoFile: File;
  landmarks: FaceLandmarks;
  recommendedFrames: GlassesFrame[];
  onClose: () => void;
}

const VirtualTryOn = ({ photoFile, landmarks, recommendedFrames, onClose }: VirtualTryOnProps) => {
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedFrame = recommendedFrames[selectedFrameIndex];
  const glassesStyle = selectedFrame ? getGlassesStyleById(selectedFrame.id) : glassesStyles[0];

  // Load the photo
  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(photoFile);
    
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [photoFile]);

  // Draw the overlay
  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const style = glassesStyle;
    
    if (!canvas || !img || !style || !landmarks) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw the image
    ctx.drawImage(img, 0, 0);
    
    // Calculate glasses dimensions based on face landmarks
    const glassesWidth = landmarks.eyeWidth * 1.8;
    const glassesHeight = glassesWidth * 0.45;
    
    // Position glasses at eye level, slightly above the nose bridge
    const centerX = landmarks.eyeCenter.x;
    const centerY = landmarks.eyeCenter.y;
    
    // Apply rotation based on face angle
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(landmarks.faceAngle);
    ctx.translate(-centerX, -centerY);
    
    // Draw the glasses frame
    style.drawFrame(
      ctx,
      centerX,
      centerY,
      glassesWidth,
      glassesHeight,
      style.frameColor,
      '#888888',
      style.lensOpacity
    );
    
    ctx.restore();
  }, [landmarks, glassesStyle]);

  useEffect(() => {
    if (imageLoaded) {
      drawOverlay();
    }
  }, [imageLoaded, drawOverlay, selectedFrameIndex]);

  const handlePrevFrame = () => {
    setSelectedFrameIndex((prev) => 
      prev === 0 ? recommendedFrames.length - 1 : prev - 1
    );
  };

  const handleNextFrame = () => {
    setSelectedFrameIndex((prev) => 
      prev === recommendedFrames.length - 1 ? 0 : prev + 1
    );
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `virtual-try-on-${selectedFrame?.name || 'glasses'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-serif font-bold text-foreground">
          Virtual Try-On
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas area */}
        <div 
          ref={containerRef}
          className="flex-1 flex items-center justify-center p-4 bg-muted/30"
        >
          <div className="relative max-w-full max-h-full">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[60vh] lg:max-h-[70vh] object-contain rounded-2xl shadow-elevated"
            />
          </div>
        </div>
        
        {/* Frame selector */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card p-4 flex flex-col">
          <h3 className="font-serif font-semibold text-foreground mb-4">
            Select Frame Style
          </h3>
          
          {/* Current frame info */}
          {selectedFrame && (
            <div className="p-4 rounded-xl bg-primary/10 mb-4">
              <h4 className="font-semibold text-foreground">{selectedFrame.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedFrame.style} • {selectedFrame.color}
              </p>
            </div>
          )}
          
          {/* Frame navigation */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button variant="outline" size="icon" onClick={handlePrevFrame}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedFrameIndex + 1} / {recommendedFrames.length}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextFrame}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Frame thumbnails */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {recommendedFrames.map((frame, index) => {
                const style = getGlassesStyleById(frame.id);
                return (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrameIndex(index)}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all",
                      index === selectedFrameIndex
                        ? "border-primary bg-primary/10"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <div 
                      className="w-full aspect-[2/1] rounded-lg mb-2 flex items-center justify-center"
                      style={{ backgroundColor: style?.frameColor + '20' }}
                    >
                      <div 
                        className="w-12 h-4 rounded-full"
                        style={{ backgroundColor: style?.frameColor }}
                      />
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">
                      {frame.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <Button 
              variant="hero" 
              className="w-full" 
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Download Photo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
