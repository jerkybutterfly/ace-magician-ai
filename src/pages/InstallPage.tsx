import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Download, Share, MoreVertical } from "lucide-react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function InstallPage() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <Smartphone className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Install Pesto AI on your phone</h1>
      </div>

      {installed ? (
        <Card className="p-6 border-primary/50">
          <p className="text-lg">✓ App is installed. Launch it from your home screen.</p>
        </Card>
      ) : deferred ? (
        <Card className="p-6 space-y-3">
          <p>Your browser supports one-tap install.</p>
          <Button onClick={install} size="lg" className="gap-2">
            <Download className="w-4 h-4" /> Install now
          </Button>
        </Card>
      ) : null}

      <Card className="p-6 space-y-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MoreVertical className="w-5 h-5" /> Android (Chrome / Edge)
        </h2>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Open this site in Chrome on your phone.</li>
          <li>Tap the <strong>⋮</strong> menu (top right).</li>
          <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
          <li>Confirm — the app icon appears on your home screen.</li>
        </ol>
      </Card>

      <Card className="p-6 space-y-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Share className="w-5 h-5" /> iPhone / iPad (Safari)
        </h2>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Open this site in <strong>Safari</strong> (not Chrome).</li>
          <li>Tap the <strong>Share</strong> button.</li>
          <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong>.</li>
        </ol>
      </Card>

      <Card className="p-6 space-y-2 border-yellow-500/30 bg-yellow-500/5">
        <h3 className="font-semibold">⚠ After installing</h3>
        <p className="text-sm text-muted-foreground">
          The app talks to Ollama and the Python agent on your PC. On your phone they aren't at <code>localhost</code>.
          Go to <strong>Settings</strong> in the app and change the URLs to your PC's LAN IP, e.g.
          <code className="block mt-1">http://192.168.1.50:11434</code>
          <code className="block">http://192.168.1.50:8484</code>
          Also bind Ollama to all interfaces on the PC: <code>OLLAMA_HOST=0.0.0.0:11434</code>
        </p>
      </Card>
    </div>
  );
}
