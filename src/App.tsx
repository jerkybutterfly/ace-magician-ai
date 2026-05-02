import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { startNotificationPoller } from "@/lib/notifications";
import { startPhoneRunner } from "@/lib/phone-runner";
import { startBriefingScheduler } from "@/lib/briefing";
import { warmOllamaModel } from "@/lib/smart-router";
import { fetchModels } from "@/lib/ollama";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    if (localStorage.getItem('hacker-theme') === 'yes') {
      document.documentElement.classList.add('hacker');
    }
    startNotificationPoller();
    startPhoneRunner();
    startBriefingScheduler();
    // Pre-warm the most recently used Ollama model so first reply is instant
    fetchModels()
      .then((models) => {
        if (models.length > 0) warmOllamaModel(models[0].name);
      })
      .catch(() => {/* Ollama offline — skip warmup */});
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/files" element={<Index />} />
              <Route path="/skills" element={<Index />} />
              <Route path="/speckit" element={<Index />} />
              <Route path="/cron" element={<Index />} />
              <Route path="/settings" element={<Index />} />
              <Route path="/memory" element={<Index />} />
              <Route path="/local-models" element={<Index />} />
              <Route path="/permissions" element={<Index />} />
              <Route path="/phone" element={<Index />} />
              <Route path="/briefing" element={<Index />} />
              <Route path="/network" element={<Index />} />
              <Route path="/mqtt" element={<Index />} />
              <Route path="/documents" element={<Index />} />
              <Route path="/recon" element={<Index />} />
              <Route path="/audit" element={<Index />} />
              <Route path="/forensics" element={<Index />} />
              <Route path="/labmode" element={<Index />} />
              <Route path="/computer-use" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
