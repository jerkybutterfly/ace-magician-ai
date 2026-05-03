import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Settings, Sparkles, Activity, CheckCircle2, XCircle } from "lucide-react";

const AGENT_URL = "http://127.0.0.1:8484";

export default function VoicePage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${AGENT_URL}/voice/status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleVoice = async () => {
    setLoading(true);
    const action = status?.running ? "stop" : "start";
    try {
      const res = await fetch(`${AGENT_URL}/voice/${action}`, { method: "POST" });
      if (res.ok) {
        toast({
          title: `Voice Assistant ${action === "start" ? "Started" : "Stopped"}`,
          description: action === "start" ? "Listening for wake word..." : "Microphone disabled.",
        });
        fetchStatus();
      }
    } catch (e) {
      toast({
        title: "Error",
        description: `Failed to ${action} voice service.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <div className="mb-8 border-b border-border/50 pb-4">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Mic className="w-8 h-8" /> Voice & Wake Word
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure hands-free interaction with the agent using wake word detection and local STT.
        </p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          {/* Control Panel */}
          <div className="p-6 border border-border/50 rounded-2xl bg-card shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Assistant Control
                </h2>
                <Badge variant={status?.running ? "default" : "secondary"} className={status?.running ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
                  {status?.running ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                  <p className="text-sm text-muted-foreground mb-1">Wake Word</p>
                  <p className="text-lg font-mono font-bold text-primary">"{status?.wake_word || "pesto"}"</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Settings className="w-4 h-4" />
                  <span>Always-listening mode requires a local microphone.</span>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              onClick={toggleVoice} 
              disabled={loading}
              className={`w-full py-8 text-xl font-bold gap-3 rounded-xl transition-all shadow-xl ${status?.running ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
            >
              {status?.running ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              {status?.running ? "Disable Always-Listening" : "Enable Always-Listening"}
            </Button>
          </div>

          {/* Model Status */}
          <div className="p-6 border border-border/50 rounded-2xl bg-card shadow-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Engine Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${status?.openwakeword ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    <Mic className={`w-5 h-5 ${status?.openwakeword ? "text-green-400" : "text-red-400"}`} />
                  </div>
                  <div>
                    <p className="font-bold">openWakeWord</p>
                    <p className="text-xs text-muted-foreground">High-accuracy wake word</p>
                  </div>
                </div>
                {status?.openwakeword ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${status?.whisper ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    <Sparkles className={`w-5 h-5 ${status?.whisper ? "text-green-400" : "text-red-400"}`} />
                  </div>
                  <div>
                    <p className="font-bold">Faster Whisper</p>
                    <p className="text-xs text-muted-foreground">Optimized local STT (tiny.en)</p>
                  </div>
                </div>
                {status?.whisper ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm italic text-primary/80">
                  "Once enabled, you can say the wake word followed by your command. The agent will beep when it hears you."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
