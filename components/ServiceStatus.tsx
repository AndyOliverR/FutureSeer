"use client";

import { useState, useEffect } from 'react';
import { devLog } from '@/lib/devLogger';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'loading' | 'working' | 'error' | 'disabled';
  message: string;
  details?: string;
}

export function ServiceStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'OpenAI', status: 'loading', message: 'Checking...' },
    { name: 'AstroApp', status: 'loading', message: 'Checking...' },
    { name: 'Firebase', status: 'loading', message: 'Checking...' }
  ]);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenClosed, setHasBeenClosed] = useState(false);

  useEffect(() => {
    const checkServices = async () => {
      try {
        const response = await fetch('/api/diagnose');
        if (response.ok) {
          const data = await response.json();
          
          const newServices: ServiceStatus[] = [
            {
              name: 'OpenAI',
              status: data.services.openai?.status === '✅ Working' ? 'working' : 'error',
              message: data.services.openai?.status === '✅ Working' ? 'AI predictions working' : 'AI service unavailable',
              details: data.services.openai?.error || data.services.openai?.model
            },
            {
              name: 'AstroApp',
              status: data.services.astroapp?.status === '✅ Working' ? 'working' : 'error',
              message: data.services.astroapp?.status === '✅ Working' ? 'Astrological data available' : 'Using fallback data',
              details: data.services.astroapp?.error || data.services.astroapp?.type
            },
            {
              name: 'Firebase',
              status: data.services.firebase?.status?.includes('✅') ? 'working' : 'error',
              message: data.services.firebase?.status?.includes('✅') ? 'Data saving enabled' : 'Local mode only',
              details: data.services.firebase?.error || data.services.firebase?.note
            }
          ];
          
          setServices(newServices);
          
          // Only auto-show if there are critical errors AND user hasn't closed it before
          const hasCriticalErrors = newServices.some(s => 
            s.status === 'error' && 
            !s.message.includes('Local mode only') && 
            !s.message.includes('fallback')
          );
          if (hasCriticalErrors && !hasBeenClosed) {
            setIsVisible(true);
          }
        }
      } catch (error) {
        devLog.error('Error checking services:', error, 'ServiceStatus');
        setServices([
          { name: 'OpenAI', status: 'error', message: 'Check failed' },
          { name: 'AstroApp', status: 'error', message: 'Check failed' },
          { name: 'Firebase', status: 'error', message: 'Check failed' }
        ]);
        
        // Only auto-show if user hasn't closed it before
        if (!hasBeenClosed) {
          setIsVisible(true);
        }
      }
    };

    // Check services after a delay to avoid blocking initial load
    const timer = setTimeout(checkServices, 2000);
    return () => clearTimeout(timer);
  }, [hasBeenClosed]);

  const handleClose = () => {
    setIsVisible(false);
    setHasBeenClosed(true);
  };

  const handleOpen = () => {
    setIsVisible(true);
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'loading':
        return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'working':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'loading':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  // Show status indicator if there are critical errors and panel is not visible
  const hasCriticalErrors = services.some(s => 
    s.status === 'error' && 
    !s.message.includes('Local mode only') && 
    !s.message.includes('fallback')
  );
  
  if (!isVisible) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-4 right-4 p-2 bg-slate-800/80 text-amber-300 rounded-full hover:bg-slate-700/80 transition-colors z-50 button-glow"
        title="Show service status"
      >
        {hasCriticalErrors ? (
          <XCircle className="w-5 h-5" />
        ) : (
          <CheckCircle className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900/95 backdrop-blur-md border border-amber-400/30 rounded-xl p-4 shadow-xl z-50 max-w-sm status-glow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-amber-200 font-serif text-sm">Service Status</h3>
        <button
          onClick={handleClose}
          className="text-slate-400 hover:text-amber-300 transition-colors button-glow p-1 rounded"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        {services.map((service) => (
          <div
            key={service.name}
            className={`flex items-center justify-between p-2 rounded-lg border ${getStatusColor(service.status)} card-glow`}
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(service.status)}
              <span className="text-slate-200 text-sm font-medium">{service.name}</span>
            </div>
            <div className="text-right">
              <div className="text-slate-300 text-xs">{service.message}</div>
              {service.details && (
                <div className="text-slate-400 text-xs mt-1">{service.details}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {hasCriticalErrors && (
        <div className="mt-3 p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg card-glow">
          <p className="text-amber-200 text-xs">
            Some services are unavailable. The app will work with fallback data.
          </p>
        </div>
      )}
    </div>
  );
} 