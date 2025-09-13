import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import QuestionLibrary from "./pages/QuestionLibrary";
import Questionnaires from "./pages/Questionnaires";
import Headers from "./pages/Headers";
import Footers from "./pages/Footers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="library" element={<QuestionLibrary />} />
            <Route path="questionnaires" element={<Questionnaires />} />
            <Route path="headers" element={<Headers />} />
            <Route path="footers" element={<Footers />} />
            <Route path="clients" element={<div className="p-6">Clients - Coming Soon</div>} />
            <Route path="analytics" element={<div className="p-6">Analytics - Coming Soon</div>} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
