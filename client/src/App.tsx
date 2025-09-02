import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Calculator from "@/pages/calculator";
import History from "@/pages/history";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { MobileUtils } from "./lib/mobile";
import { OfflineManager } from "./lib/offline";
import { OfflineIndicator, PWAInstallPrompt } from "@/components/OfflineIndicator";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Calculator} />
      <Route path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // تهيئة التطبيق للجوال
    MobileUtils.initializeApp();
    
    // تسجيل Service Worker للعمل بدون إنترنت
    OfflineManager.getInstance().register();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground safe-area">
          <OfflineIndicator />
          <PWAInstallPrompt />
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
