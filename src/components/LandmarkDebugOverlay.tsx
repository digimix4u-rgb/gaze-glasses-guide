import { useEffect, useRef } from "react";
import { LANDMARKS } from "@/lib/faceAnalysis";
import type { FaceAnalysisResult } from "@/lib/faceAnalysis";

interface LandmarkDebugOverlayProps {
  photoFile: File;
  measurements: FaceAnalysisResult["measurements"];
  landmarks: FaceAnalysisResult["landmarks"];
}

const MEASUREMENT_POINTS = [
  { label: "Forehead L", index: LANDMARKS.foreheadLeft, color: "#FF6B6B" },
  { label: "Forehead R", index: LANDMARKS.foreheadRight, color: "#FF6B6B" },
  { label: "Cheekbone L", index: LANDMARKS.cheekboneLeft, color: "#4ECDC4" },
  { label: "Cheekbone R", index: LANDMARKS.cheekboneRight, color: "#4ECDC4" },
  { label: "Jaw L", index: LANDMARKS.jawLeft, color: "#FFE66D" },
  { label: "Jaw R", index: LANDMARKS.jawRight, color: "#FFE66D" },
  { label: "Chin L", index: LANDMARKS.chinLeft, color: "#A78BFA" },
  { label: "Chin R", index: LANDMARKS.chinRight, color: "#A78BFA" },
  { label: "Chin", index: LANDMARKS.chin, color: "#A78BFA" },
  { label: "Top", index: LANDMARKS.faceOvalTop, color: "#F97316" },
];

const MEASUREMENT_LINES: { from: number; to: number; color: string; label: string }[] = [
  { from: LANDMARKS.foreheadLeft, to: LANDMARKS.foreheadRight, color: "#FF6B6B", label: "Forehead" },
  { from: LANDMARKS.cheekboneLeft, to: LANDMARKS.cheekboneRight, color: "#4ECDC4", label: "Cheekbone" },
  { from: LANDMARKS.jawLeft, to: LANDMARKS.jawRight, color: "#FFE66D", label: "Jaw" },
  { from: LANDMARKS.chinLeft, to: LANDMARKS.chinRight, color: "#A78BFA", label: "Chin" },
  { from: LANDMARKS.faceOvalTop, to: LANDMARKS.chin, color: "#F97316", label: "Length" },
];

const LandmarkDebugOverlay = ({ photoFile, measurements, landmarks }: LandmarkDebugOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks.keypoints.length) return;

    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas to image dimensions
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw measurement lines
      for (const line of MEASUREMENT_LINES) {
        const from = landmarks.keypoints[line.from];
        const to = landmarks.keypoints[line.to];
        if (!from || !to) continue;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label at midpoint
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = "black";
        ctx.fillRect(midX - 2, midY - 14, ctx.measureText(line.label).width + 8, 20);
        ctx.fillStyle = line.color;
        ctx.fillText(line.label, midX + 2, midY);
      }

      // Draw measurement points
      for (const point of MEASUREMENT_POINTS) {
        const kp = landmarks.keypoints[point.index];
        if (!kp) continue;

        // Dot
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = "bold 12px sans-serif";
        const textWidth = ctx.measureText(point.label).width;
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(kp.x + 8, kp.y - 8, textWidth + 6, 16);
        ctx.fillStyle = point.color;
        ctx.fillText(point.label, kp.x + 11, kp.y + 4);
      }

      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(photoFile);
  }, [photoFile, landmarks]);

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-serif font-semibold text-foreground">
        Debug: Landmark Overlay
      </h4>
      <div className="rounded-2xl overflow-hidden shadow-soft bg-background">
        <canvas ref={canvasRef} className="w-full h-auto" />
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-sm">
        {[
          { color: "#FF6B6B", label: "Forehead" },
          { color: "#4ECDC4", label: "Cheekbone" },
          { color: "#FFE66D", label: "Jaw" },
          { color: "#A78BFA", label: "Chin" },
          { color: "#F97316", label: "Face Length" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      {/* Raw measurements */}
      <div className="p-4 rounded-xl bg-muted/50 text-xs font-mono space-y-1">
        <p>Forehead: {measurements.foreheadWidth.toFixed(1)}px</p>
        <p>Cheekbone: {measurements.cheekboneWidth.toFixed(1)}px</p>
        <p>Jaw: {measurements.jawWidth.toFixed(1)}px</p>
        <p>Chin: {measurements.chinWidth.toFixed(1)}px</p>
        <p>Length: {measurements.faceLength.toFixed(1)}px</p>
        <p className="pt-1 border-t border-border">L/W Ratio: {measurements.lengthToWidthRatio.toFixed(3)}</p>
        <p>Forehead/Jaw: {measurements.foreheadToJawRatio.toFixed(3)}</p>
        <p>Cheekbone Prominence: {measurements.cheekboneProminence.toFixed(3)}</p>
        <p>Chin/Jaw: {measurements.chinToJawRatio.toFixed(3)}</p>
      </div>
    </div>
  );
};

export default LandmarkDebugOverlay;
