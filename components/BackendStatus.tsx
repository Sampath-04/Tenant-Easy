'use client';

import { useState, useEffect } from 'react';
import { checkBackendHealth, config } from '../lib/config';

export function BackendStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const health = await checkBackendHealth();
      setIsConnected(health);
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check connection on mount
    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!config.isDevelopment) {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-lg ${
        isConnected === null 
          ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          : isConnected 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        {isChecking ? (
          <>
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>Checking...</span>
          </>
        ) : (
          <>
            <div className={`w-3 h-3 rounded-full ${
              isConnected === null 
                ? 'bg-gray-400'
                : isConnected 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
            }`}></div>
            <span>
              {isConnected === null 
                ? 'Backend Unknown'
                : isConnected 
                  ? 'Backend Connected' 
                  : 'Backend Offline'
              }
            </span>
          </>
        )}
      </div>
      
      <div className="mt-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
        {config.api.baseUrl}
      </div>
    </div>
  );
}
