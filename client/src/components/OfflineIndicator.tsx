import React from 'react';
import { useOnlineStatus } from '@/lib/offline';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (isOnline && !wasOffline) {
    return null; // لا نظهر شيئاً إذا كان متصلاً ولم ينقطع من قبل
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <Alert className={`${isOnline ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'} transition-all duration-300`}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-500" />
          )}
          <AlertDescription className={`${isOnline ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'} font-medium`}>
            {isOnline ? 
              'تم استعادة الاتصال بالإنترنت' : 
              'يعمل التطبيق في وضع عدم الاتصال'}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Alert className="bg-primary/10 border-primary/20">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary-foreground">
          <div className="flex items-center justify-between gap-4">
            <span>تثبيت التطبيق على الجهاز للوصول السريع؟</span>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
              >
                تثبيت
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1 border border-primary/20 text-primary rounded text-sm hover:bg-primary/10 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}