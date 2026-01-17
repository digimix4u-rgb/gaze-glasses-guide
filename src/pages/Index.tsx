import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FaceShapesGuide from "@/components/FaceShapesGuide";
import AnalysisSection from "@/components/AnalysisSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <FaceShapesGuide />
        <AnalysisSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
