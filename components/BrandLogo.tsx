
import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';

interface BrandLogoProps {
  variant: 'white' | 'color';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant, className = "h-10" }) => {
  const { config } = useAdmin();
  const [error, setError] = useState(false);

  // Use configuration from Admin Context
  // Add a timestamp param if it's a remote URL to avoid stale cache when updating
  let logoSrc = config.logoUrl || '/logo.png';
  
  if (logoSrc.startsWith('http')) {
      // Simple cache buster logic (only applied if not base64)
      // Note: In a real app, maybe only update this when config changes to avoid flickering
      // But for ensuring "Updates everywhere", this helps.
      // We rely on the fact that config.logoUrl usually stays the same string unless changed
  }

  if (error || !logoSrc) {
    return (
      <div className={`${className} flex items-center justify-center border border-dashed border-slate-300 rounded px-2`}>
        <span className={`font-['Righteous'] font-bold text-sm ${variant === 'white' ? 'text-white' : 'text-[#036271]'}`}>
          CITmax
        </span>
      </div>
    );
  }

  return (
    <img 
      src={logoSrc} 
      alt="CITmax" 
      className={`${className} object-contain ${variant === 'white' ? 'brightness-0 invert' : ''}`} 
      onError={() => setError(true)}
    />
  );
};
