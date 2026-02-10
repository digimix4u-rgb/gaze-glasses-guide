import { useState, useEffect } from "react";
import { Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isInstalled) return null;

  if (isIOS) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowIOSInstructions(!showIOSInstructions)}
          className="text-white hover:bg-white/20 gap-1.5 text-xs"
        >
          <Share className="h-3.5 w-3.5" />
          Install
        </Button>
        {showIOSInstructions && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-background p-3 text-foreground text-xs shadow-lg border z-50">
            <p className="font-semibold mb-1">Install on iOS:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Tap the Share button <Share className="inline h-3 w-3" /></li>
              <li>Scroll down & tap "Add to Home Screen"</li>
              <li>Tap "Add"</li>
            </ol>
          </div>
        )}
      </div>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleInstallClick}
      className="text-white hover:bg-white/20 gap-1.5 text-xs"
    >
      <Download className="h-3.5 w-3.5" />
      Install App
    </Button>
  );
};

export default PWAInstallButton;
