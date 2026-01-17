import { faceShapes } from "@/lib/faceShapeData";
import FaceShapeCard from "./FaceShapeCard";

const FaceShapesGuide = () => {
  return (
    <section id="face-shapes" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Face Shape Guide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Understanding your face shape is key to finding frames that flatter your features
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {faceShapes.map((shape) => (
            <FaceShapeCard key={shape.id} shape={shape} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaceShapesGuide;
