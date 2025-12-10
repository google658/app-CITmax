
import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';

interface WebViewContainerProps {
  url: string;
  title: string;
  onBack: () => void;
}

export const WebViewContainer: React.FC<WebViewContainerProps> = ({ url, title, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0); // Used to force reload iframe

  const handleReload = () => {
    setIsLoading(true);
    setKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#01252b] font-['Montserrat'] transition-colors duration-300">
      {/* Header */}
      <div className="bg-[#036271] p-4 shadow-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold font-['Righteous'] text-white leading-tight">
              {title}
            </h1>
            <p className="text-[#00c896] text-xs">Navegador Interno</p>
          </div>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={handleReload}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Recarregar"
            >
                <RefreshCw className="w-5 h-5" />
            </button>
            <button 
                onClick={handleOpenExternal}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Abrir no Navegador"
            >
                <ExternalLink className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative w-full h-full bg-white dark:bg-slate-900">
        {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 z-10">
                <Loader2 className="w-8 h-8 text-[#00c896] animate-spin mb-2" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Carregando conteúdo...</p>
            </div>
        )}
        <iframe 
            key={key}
            src={url}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            title={title}
            // Permissions for common features
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone; geolocation"
        />
      </div>
    </div>
  );
};
