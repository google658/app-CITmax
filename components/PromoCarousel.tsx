
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';

export const PromoCarousel: React.FC = () => {
  const { config } = useAdmin();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const banners = config.banners || [];

  // Auto-rotate
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleImageError = (id: number) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden shadow-lg group mb-6 bg-slate-200 dark:bg-slate-800">
      <div className="w-full h-full relative">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {!imgErrors[banner.id] ? (
              <img
                src={banner.src}
                alt={banner.alt}
                className="w-full h-full object-cover"
                onError={() => handleImageError(banner.id)}
              />
            ) : (
              // Fallback 
              <div className={`w-full h-full flex flex-col items-center justify-center text-white ${banner.fallbackColor}`}>
                <h2 className="text-4xl md:text-5xl font-['Righteous'] mb-2">{banner.fallbackText}</h2>
                <p className="font-['Montserrat'] font-bold text-lg">Disponível na CITmax!</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
