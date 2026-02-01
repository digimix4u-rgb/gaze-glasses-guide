import logo from "@/assets/oex-logo-white.png";

const Footer = () => {
  return (
    <footer className="py-12 bg-[#303030] text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="flex items-center gap-2">
            <img src={logo} alt="OPTIC EXCLUSIVE" className="h-10 w-auto" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            <div>
              <h4 className="font-semibold text-white mb-3">Postal Address</h4>
              <address className="text-sm text-white/70 not-italic leading-relaxed">
                Optic Exclusive<br />
                Oshakati<br />
                Box 80067<br />
                Oshakati
              </address>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Physical Address</h4>
              <address className="text-sm text-white/70 not-italic leading-relaxed">
                Optic Exclusive<br />
                Game Center<br />
                Oshakati
              </address>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
