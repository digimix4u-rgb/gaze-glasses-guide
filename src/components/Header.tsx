import logo from "@/assets/oex-logo.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="OPTIC EXCLUSIVE" className="h-10 w-auto" />
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#face-shapes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Face Shapes
          </a>
          <a href="#analyze" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Analyze
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
