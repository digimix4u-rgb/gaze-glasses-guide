import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, SwitchCamera, X, Check } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to access camera. Please ensure you've granted camera permissions.");
      setIsLoading(false);
    }
  }, [stream]);

  const switchCamera = () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    startCamera(newFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror the image for front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageData);
    
    // Stop the stream after capture
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const confirmPhoto = () => {
    if (!capturedImage) return;

    // Convert base64 to file
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        onCapture(file);
      });
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  // Start camera on mount
  useState(() => {
    startCamera(facingMode);
  });

  return (
    <div className="fixed inset-0 z-50 bg-foreground flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center text-background hover:bg-background/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-background font-medium">Take Photo</span>
        {!capturedImage && (
          <button
            onClick={switchCamera}
            className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center text-background hover:bg-background/30 transition-colors"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        )}
        {capturedImage && <div className="w-10" />}
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center">
              <Camera className="w-16 h-16 text-background/50 mx-auto mb-4" />
              <p className="text-background/80">{error}</p>
              <Button
                variant="outline"
                className="mt-4 border-background/50 text-background hover:bg-background/20"
                onClick={() => startCamera(facingMode)}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${
                facingMode === "user" ? "scale-x-[-1]" : ""
              }`}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground">
                <div className="w-12 h-12 border-4 border-background/30 border-t-background rounded-full animate-spin" />
              </div>
            )}
          </>
        )}

        {/* Face guide overlay */}
        {!capturedImage && !error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[75vw] max-w-sm h-[55vh] max-h-[500px] border-2 border-dashed border-background/50 rounded-[40%] flex items-end justify-center pb-4">
              <span className="text-background/70 text-sm">Position face here</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 pb-10 flex items-center justify-center gap-8">
        {capturedImage ? (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={retakePhoto}
              className="border-background/50 text-background hover:bg-background/20"
            >
              Retake
            </Button>
            <Button
              variant="hero"
              size="lg"
              onClick={confirmPhoto}
              className="gap-2"
            >
              <Check className="w-5 h-5" />
              Use Photo
            </Button>
          </>
        ) : (
          <button
            onClick={capturePhoto}
            disabled={isLoading || !!error}
            className="w-20 h-20 rounded-full border-4 border-background flex items-center justify-center disabled:opacity-50 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="w-16 h-16 rounded-full bg-background" />
          </button>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
