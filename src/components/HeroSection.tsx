import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles } from "lucide-react";

const HeroSection = () => {
  const scrollToAnalyze = () => {
    document.getElementById("analyze")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex items-center justify-center pt-16 gradient-subtle">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Face Analysis</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 animate-fade-in-up text-balance leading-tight">
            Find Your Perfect
            <span className="block text-primary">Frame Match</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up opacity-0 [animation-delay:200ms] text-balance">
            Discover the ideal glasses for your unique face shape. Our intelligent analysis 
            provides personalized recommendations to help you look and feel your best.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0 [animation-delay:400ms]">
            <Button variant="hero" size="lg" onClick={scrollToAnalyze}>
              Analyze Your Face Shape
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById("face-shapes")?.scrollIntoView({ behavior: "smooth" })}>
              Learn About Face Shapes
            </Button>
          </div>
          
          <div className="mt-20 animate-float">
            <ArrowDown className="w-6 h-6 text-muted-foreground mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
