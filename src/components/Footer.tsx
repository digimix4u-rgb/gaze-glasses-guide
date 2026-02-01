import { Heart } from "lucide-react";
import logo from "@/assets/oex-logo.png";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="OPTIC EXCLUSIVE" className="h-10 w-auto brightness-0 invert" />
          </div>
          
          <p className="text-sm text-background/60 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> for finding your perfect frames
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-background/60 hover:text-background transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-background/60 hover:text-background transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-background/60 hover:text-background transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
