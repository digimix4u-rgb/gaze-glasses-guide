import logo from "@/assets/oex-logo-white.png";
import PWAInstallButton from "./PWAInstallButton";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#E31E24] border-b border-[#E31E24]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <img src={logo} alt="OPTIC EXCLUSIVE" className="h-10 w-auto" />
        <PWAInstallButton />
      </div>
    </header>
  );
};

export default Header;
