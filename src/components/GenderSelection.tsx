import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Gender } from "@/lib/faceShapeData";

interface GenderSelectionProps {
  onSelect: (gender: Gender) => void;
}

const GenderSelection = ({ onSelect }: GenderSelectionProps) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
          Select Your Gender
        </h3>
        <p className="text-muted-foreground">
          This helps us provide more accurate analysis
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('male')}
          className={cn(
            "group relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl",
            "bg-background shadow-soft border-2 border-transparent",
            "transition-all duration-300 hover:shadow-elevated hover:border-primary",
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <User className="w-8 h-8 text-primary" />
          </div>
          <span className="text-lg font-medium text-foreground">Male</span>
        </button>

        <button
          onClick={() => onSelect('female')}
          className={cn(
            "group relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl",
            "bg-background shadow-soft border-2 border-transparent",
            "transition-all duration-300 hover:shadow-elevated hover:border-primary",
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <User className="w-8 h-8 text-primary" />
          </div>
          <span className="text-lg font-medium text-foreground">Female</span>
        </button>
      </div>
    </div>
  );
};

export default GenderSelection;
