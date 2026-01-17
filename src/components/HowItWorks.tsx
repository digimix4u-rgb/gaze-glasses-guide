import { Upload, Scan, Glasses } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Photo",
    description: "Take a front-facing photo or upload an existing one. Ensure good lighting and a neutral expression."
  },
  {
    icon: Scan,
    title: "AI Analysis",
    description: "Our intelligent system analyzes your facial features to determine your unique face shape."
  },
  {
    icon: Glasses,
    title: "Get Recommendations",
    description: "Receive personalized frame suggestions tailored to complement and enhance your features."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to finding your perfect frames
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-background shadow-soft hover:shadow-elevated transition-all duration-300 group"
            >
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full gradient-warm flex items-center justify-center text-primary-foreground font-bold text-lg shadow-soft">
                {index + 1}
              </div>
              
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              
              <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
