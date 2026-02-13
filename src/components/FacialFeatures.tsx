import { FaceAnalysisResult } from "@/lib/faceAnalysis";
import { Ruler, CircleDot, Square, ArrowUpDown, Triangle } from "lucide-react";

interface FacialFeaturesProps {
  measurements: FaceAnalysisResult['measurements'];
}

const FacialFeatures = ({ measurements }: FacialFeaturesProps) => {
  const {
    faceLength,
    lengthToWidthRatio,
    foreheadToJawRatio,
    cheekboneProminence,
    foreheadWidth,
    cheekboneWidth,
    jawWidth,
    jawAngle,
  } = measurements;

  const getForeheadDescription = () => {
    if (foreheadWidth > cheekboneWidth * 1.05) return "Wide";
    if (foreheadWidth < cheekboneWidth * 0.9) return "Narrow";
    return "Balanced";
  };

  const getCheekboneDescription = () => {
    if (cheekboneProminence > 1.1) return "Prominent";
    if (cheekboneProminence > 1.02) return "Defined";
    if (cheekboneProminence < 0.95) return "Subtle";
    return "Balanced";
  };

  const getJawlineDescription = () => {
    const jawToForehead = jawWidth / foreheadWidth;
    if (jawToForehead > 1.05) return "Strong & Wide";
    if (jawToForehead > 0.95) return "Angular";
    if (jawToForehead > 0.85) return "Tapered";
    if (jawToForehead > 0.7) return "Narrow";
    return "Pointed";
  };

  const getFaceLengthDescription = () => {
    if (lengthToWidthRatio > 1.5) return "Elongated";
    if (lengthToWidthRatio > 1.35) return "Long";
    if (lengthToWidthRatio > 1.15) return "Balanced";
    if (lengthToWidthRatio > 1.0) return "Short";
    return "Very Short";
  };

  const getProportionsDescription = () => {
    if (lengthToWidthRatio > 1.5) return "Face is significantly longer than wide";
    if (lengthToWidthRatio > 1.3) return "Face is moderately longer than wide";
    if (lengthToWidthRatio > 1.1) return "Face length and width are well-balanced";
    return "Face width and length are nearly equal";
  };

  const getJawAngleDescription = () => {
    if (jawAngle < 130) return "Angular";
    if (jawAngle <= 140) return "Defined";
    return "Soft/Rounded";
  };

  const getJawAngleDetail = () => {
    if (jawAngle < 130) return "Sharp jaw corners indicate a square or angular jawline";
    if (jawAngle <= 140) return "Moderately defined jaw with some angularity";
    return "Smooth, rounded jaw contour typical of oval or round faces";
  };

  const features = [
    {
      icon: Ruler,
      label: "Forehead Width",
      value: getForeheadDescription(),
      detail: foreheadToJawRatio > 1.15 
        ? "Wider than your jawline" 
        : foreheadToJawRatio < 0.9 
        ? "Narrower than your jawline" 
        : "Similar width to jawline",
    },
    {
      icon: CircleDot,
      label: "Cheekbone Prominence",
      value: getCheekboneDescription(),
      detail: cheekboneProminence > 1.1 
        ? "Cheekbones are your widest feature" 
        : cheekboneProminence > 1.0 
        ? "Cheekbones are moderately defined" 
        : "Cheekbones blend smoothly with face",
    },
    {
      icon: Square,
      label: "Jawline Shape",
      value: getJawlineDescription(),
      detail: jawWidth / foreheadWidth > 0.95 
        ? "Strong, defined jawline" 
        : jawWidth / foreheadWidth > 0.8 
        ? "Gently tapering toward chin" 
        : "Narrow, pointed chin area",
    },
    {
      icon: Triangle,
      label: "Jawline Angle",
      value: `${jawAngle.toFixed(0)}° — ${getJawAngleDescription()}`,
      detail: getJawAngleDetail(),
    },
    {
      icon: ArrowUpDown,
      label: "Face Length",
      value: getFaceLengthDescription(),
      detail: getProportionsDescription(),
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-background shadow-soft">
      <h4 className="text-lg font-serif font-semibold text-foreground mb-4">
        Your Facial Features
      </h4>
      <div className="grid gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {feature.label}
                </span>
                <span className="text-sm font-semibold text-primary">
                  {feature.value}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {feature.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-xl bg-muted/20 border border-border/30">
        <h5 className="text-sm font-medium text-muted-foreground mb-2">Raw Measurements</h5>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span>Face Length: <strong className="text-foreground">{faceLength.toFixed(0)}</strong></span>
          <span>Forehead (temple-temple): <strong className="text-foreground">{foreheadWidth.toFixed(0)}</strong></span>
          <span>Cheekbones (ear-ear): <strong className="text-foreground">{cheekboneWidth.toFixed(0)}</strong></span>
          <span>Jaw Width: <strong className="text-foreground">{jawWidth.toFixed(0)}</strong></span>
          <span>Length:Width Ratio: <strong className="text-foreground">{lengthToWidthRatio.toFixed(2)}</strong></span>
          <span>Forehead:Jaw Ratio: <strong className="text-foreground">{foreheadToJawRatio.toFixed(2)}</strong></span>
          <span>Jaw Angle: <strong className="text-foreground">{jawAngle.toFixed(1)}°</strong></span>
        </div>
      </div>
    </div>
  );
};

export default FacialFeatures;
