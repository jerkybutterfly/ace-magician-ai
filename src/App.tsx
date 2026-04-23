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

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    startNotificationPoller();
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
