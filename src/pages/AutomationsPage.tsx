import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Zap, FolderOpen, Activity, Plus } from "lucide-react";

export default function AutomationsPage() {
  const { toast } = useToast();
  const [triggers, setTriggers] = useState<any[]>([]);
  const [folderPath, setFolderPath] = useState("");
  const [message, setMessage] = useState("");

  const fetchTriggers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8484/automations");
      if (res.ok) {
        const data = await res.json();
        setTriggers(data.triggers || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTriggers();
    const interval = setInterval(fetchTriggers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    if (!folderPath || !message) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:8484/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_path: folderPath, action: "notify", message })
      });
      if (res.ok) {
        toast({ title: "Automation Created", description: `Watching ${folderPath}` });
        setFolderPath("");
        setMessage("");
        fetchTriggers();
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to create automation.", variant: "destructive" });
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AppSidebar 
        conversations={[]} 
        currentConvoId={null} 
        onNewChat={() => {}} 
        onSelectConvo={() => {}} 
        onDeleteConvo={() => {}} 
      />
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="mb-8 border-b border-border/50 pb-4">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Zap className="w-8 h-8" /> Event-Driven Automations
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure background watchers that react to system events independently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-border/50 rounded-xl bg-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Create New Trigger
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Folder to Watch</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. C:\Downloads" 
                    value={folderPath} 
                    onChange={e => setFolderPath(e.target.value)}
                    className="font-mono bg-background"
                  />
                  <Button variant="outline" size="icon"><FolderOpen className="w-4 h-4" /></Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Action</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="notify">Send UI Notification</option>
                  <option value="llm" disabled>Analyze with LLM (Coming Soon)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notification Message</label>
                <Input 
                  placeholder="e.g. A new file arrived!" 
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  className="bg-background"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">Enable Automation</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Active Watchers
            </h2>
            {triggers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
                No active automations.
              </div>
            ) : (
              triggers.map((t, idx) => (
                <div key={idx} className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex items-start justify-between">
                  <div>
                    <div className="font-bold text-primary mb-1">Watch: {t.folder_path}</div>
                    <div className="text-sm text-muted-foreground">Action: {t.action}</div>
                    <div className="text-sm">Msg: "{t.message}"</div>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse mt-1" title="Active"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
