import { useEffect, useRef } from "react";
import { FaceLandmarks, FaceAnalysisResult, LANDMARKS } from "@/lib/faceAnalysis";

interface FaceLandmarkOverlayProps {
  photoFile: File;
  landmarks: FaceLandmarks;
  measurements: FaceAnalysisResult["measurements"];
}

const LINES = [
  {
    label: "Forehead",
    color: "#22c55e",
    leftIdx: LANDMARKS.foreheadLeft,
    rightIdx: LANDMARKS.foreheadRight,
    key: "foreheadWidth" as const,
  },
  {
    label: "Cheekbone",
    color: "#3b82f6",
    leftIdx: LANDMARKS.cheekboneLeft,
    rightIdx: LANDMARKS.cheekboneRight,
    key: "cheekboneWidth" as const,
  },
  {
    label: "Jaw",
    color: "#ef4444",
    leftIdx: LANDMARKS.jawLeft,
    rightIdx: LANDMARKS.jawRight,
    key: "jawWidth" as const,
  },
  {
    label: "Length",
    color: "#eab308",
    leftIdx: LANDMARKS.faceOvalTop,
    rightIdx: LANDMARKS.chin,
    key: "faceLength" as const,
  },
];

const FaceLandmarkOverlay = ({ photoFile, landmarks, measurements }: FaceLandmarkOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const url = URL.createObjectURL(photoFile);

    img.onload = () => {
      const containerWidth = container.clientWidth;
      const scale = containerWidth / img.naturalWidth;
      const displayHeight = img.naturalHeight * scale;

      canvas.width = containerWidth;
      canvas.height = displayHeight;

      ctx.drawImage(img, 0, 0, containerWidth, displayHeight);

      const kp = landmarks.keypoints;

      // Draw width/length measurement lines
      for (const line of LINES) {
        const p1 = kp[line.leftIdx];
        const p2 = kp[line.rightIdx];
        if (!p1 || !p2) continue;

        const x1 = p1.x * scale;
        const y1 = p1.y * scale;
        const x2 = p2.x * scale;
        const y2 = p2.y * scale;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        for (const [px, py] of [[x1, y1], [x2, y2]]) {
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = line.color;
          ctx.fill();
        }

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const value = measurements[line.key];
        const text = `${line.label}: ${value.toFixed(0)}px`;

        ctx.font = "bold 11px sans-serif";
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(midX - textWidth / 2 - 4, midY - 8, textWidth + 8, 16);
        ctx.fillStyle = line.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, midX, midY);
      }

      // Draw jaw angle lines (purple/magenta)
      const jawAngleColor = "#a855f7";
      const jawAnglePairs = [
        { above: LANDMARKS.jawAngleAboveLeft, vertex: LANDMARKS.jawLeft, below: LANDMARKS.chin },
        { above: LANDMARKS.jawAngleAboveRight, vertex: LANDMARKS.jawRight, below: LANDMARKS.chin },
      ];

      for (const pair of jawAnglePairs) {
        const pA = kp[pair.above];
        const pB = kp[pair.vertex];
        const pC = kp[pair.below];
        if (!pA || !pB || !pC) continue;

        const ax = pA.x * scale, ay = pA.y * scale;
        const bx = pB.x * scale, by = pB.y * scale;
        const cx = pC.x * scale, cy = pC.y * scale;

        // Draw two lines forming the angle
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = jawAngleColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dots on the three points
        for (const [px, py] of [[ax, ay], [bx, by], [cx, cy]]) {
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = jawAngleColor;
          ctx.fill();
        }

        // Label with angle value
        const angleText = `${measurements.jawAngle.toFixed(0)}°`;
        ctx.font = "bold 11px sans-serif";
        const tw = ctx.measureText(angleText).width;
        const labelX = bx + (pair.vertex === LANDMARKS.jawLeft ? -tw - 10 : 10);
        const labelY = by;
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(labelX - 4, labelY - 8, tw + 8, 16);
        ctx.fillStyle = jawAngleColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(angleText, labelX + tw / 2, labelY);
      }

      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [photoFile, landmarks, measurements]);

  return (
    <div ref={containerRef} className="w-full rounded-2xl overflow-hidden bg-background shadow-soft">
      <canvas ref={canvasRef} className="w-full h-auto block" />
      <div className="p-3 flex flex-wrap gap-3 text-xs">
        {LINES.map((l) => (
          <div key={l.key} className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: l.color }} />
            <span className="text-muted-foreground">{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: "#a855f7" }} />
          <span className="text-muted-foreground">Jaw Angle</span>
        </div>
      </div>
    </div>
  );
};

export default FaceLandmarkOverlay;
