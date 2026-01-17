import { FaceShape } from "@/lib/faceShapeData";
import { Check, X } from "lucide-react";

interface FaceShapeCardProps {
  shape: FaceShape;
  isSelected?: boolean;
  onClick?: () => void;
}

const FaceShapeCard = ({ shape, isSelected, onClick }: FaceShapeCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
        isSelected
          ? "bg-primary text-primary-foreground shadow-glow scale-[1.02]"
          : "bg-background shadow-soft hover:shadow-elevated"
      }`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-16 h-20 rounded-full border-2 flex items-center justify-center ${
            isSelected ? "border-primary-foreground/50" : "border-primary/30"
          }`}
          style={{
            borderRadius: shape.id === "round" ? "50%" :
                         shape.id === "square" ? "20%" :
                         shape.id === "oval" ? "50% / 60%" :
                         shape.id === "heart" ? "50% 50% 50% 50% / 40% 40% 60% 60%" :
                         shape.id === "oblong" ? "40% / 50%" :
                         "50% 10% / 35%"
          }}
        />
        <div>
          <h3 className={`text-xl font-serif font-semibold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
            {shape.name}
          </h3>
          <p className={`text-sm ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
            Face Shape
          </p>
        </div>
      </div>
      
      <p className={`text-sm mb-4 ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
        {shape.description}
      </p>
      
      <div className="space-y-3">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            Best Frames
          </p>
          <div className="flex flex-wrap gap-2">
            {shape.recommendations.slice(0, 3).map((rec, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Check className="w-3 h-3" />
                {rec}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            Avoid
          </p>
          <div className="flex flex-wrap gap-2">
            {shape.avoidStyles.slice(0, 2).map((avoid, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  isSelected
                    ? "bg-primary-foreground/10 text-primary-foreground/80"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <X className="w-3 h-3" />
                {avoid}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceShapeCard;
