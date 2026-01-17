import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X, Loader2, ImagePlus } from "lucide-react";
import CameraCapture from "./CameraCapture";

interface PhotoUploadProps {
  onPhotoSelect: (file: File) => void;
  isAnalyzing: boolean;
}

const PhotoUpload = ({ onPhotoSelect, isAnalyzing }: PhotoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onPhotoSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleCameraCapture = (file: File) => {
    handleFile(file);
    setShowCamera(false);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden shadow-elevated">
          <img
            src={preview}
            alt="Preview"
            className="w-full aspect-square object-cover"
          />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-foreground/80 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-primary-foreground animate-spin" />
              <p className="text-primary-foreground font-medium">Analyzing your face shape...</p>
            </div>
          )}
          {!isAnalyzing && (
            <button
              onClick={clearPreview}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/90 flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Camera Option */}
          <button
            onClick={() => setShowCamera(true)}
            className="w-full aspect-video rounded-2xl bg-gradient-to-br from-primary to-accent flex flex-col items-center justify-center gap-4 text-primary-foreground shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">Take a Photo</p>
              <p className="text-sm text-primary-foreground/80">Use your camera for best results</p>
            </div>
          </button>

          {/* Upload Option */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center gap-4 cursor-pointer ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ImagePlus className="w-7 h-7 text-primary" />
            </div>
            
            <div>
              <p className="text-foreground font-medium mb-1">
                Upload a Photo
              </p>
              <p className="text-sm text-muted-foreground">
                Drop an image here or click to browse
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            For best results, use a front-facing photo with good lighting
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
