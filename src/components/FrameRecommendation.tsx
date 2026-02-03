import { GlassesFrame } from "@/lib/faceShapeData";
import { Glasses } from "lucide-react";

interface FrameRecommendationProps {
  frame: GlassesFrame;
}

const FrameRecommendation = ({ frame }: FrameRecommendationProps) => {
  return (
    <div className="p-6 rounded-2xl bg-card shadow-soft hover:shadow-elevated transition-all duration-300 group">
      <div className="aspect-[4/3] rounded-xl bg-muted flex items-center justify-center mb-4 overflow-hidden">
        {frame.imageUrl ? (
          <img 
            src={frame.imageUrl} 
            alt={frame.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <Glasses className="w-20 h-20 text-primary/30 group-hover:scale-110 transition-transform duration-300" />
        )}
      </div>
      
      <h4 className="font-serif text-lg font-semibold text-foreground mb-1">
        {frame.name}
      </h4>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{frame.style}</span>
        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
          {frame.color}
        </span>
      </div>
    </div>
  );
};

export default FrameRecommendation;
