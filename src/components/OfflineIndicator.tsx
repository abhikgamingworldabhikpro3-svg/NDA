import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-6 z-50 flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-lg animate-bounce border border-amber-400">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>Offline Mode — Cached data is being used.</span>
    </div>
  );
};
export default OfflineIndicator;
