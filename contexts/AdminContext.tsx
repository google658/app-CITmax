
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, BannerConfig, Notification } from '../types';
import { ConfigService } from '../services/configService';

interface AdminContextType {
  config: AppConfig;
  isLoading: boolean;
  updateLogo: (url: string) => Promise<void>;
  updateIcon: (url: string) => Promise<void>;
  addBanner: (banner: BannerConfig) => Promise<void>;
  removeBanner: (id: number) => Promise<void>;
  sendNotification: (title: string, message: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const DEFAULT_BANNERS: BannerConfig[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop', 
    alt: 'Música e Entretenimento',
    fallbackColor: 'bg-gradient-to-r from-purple-900 to-indigo-800', 
    fallbackText: 'STREAMING'
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?q=80&w=2070&auto=format&fit=crop', 
    alt: 'Internet Ultra Rápida',
    fallbackColor: 'bg-gradient-to-r from-pink-600 to-purple-600', 
    fallbackText: 'FIBRA ÓPTICA'
  }
];

const DEFAULT_CONFIG: AppConfig = {
  logoUrl: '', // Empty defaults to fallback text
  iconUrl: '', // Empty defaults to standard
  banners: DEFAULT_BANNERS,
  notifications: []
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const savedConfig = await ConfigService.loadConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // Update Favicon Effect
  useEffect(() => {
    if (config.iconUrl) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (link) {
        link.href = config.iconUrl;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = config.iconUrl;
        document.head.appendChild(newLink);
      }
    }
  }, [config.iconUrl]);

  const saveToStorage = async (newConfig: AppConfig) => {
    setConfig(newConfig);
    await ConfigService.saveConfig(newConfig);
  };

  const updateLogo = async (url: string) => {
    const newConfig = { ...config, logoUrl: url };
    await saveToStorage(newConfig);
  };

  const updateIcon = async (url: string) => {
    const newConfig = { ...config, iconUrl: url };
    await saveToStorage(newConfig);
  };

  const addBanner = async (banner: BannerConfig) => {
    const newConfig = { ...config, banners: [...config.banners, banner] };
    await saveToStorage(newConfig);
  };

  const removeBanner = async (id: number) => {
    const newConfig = { ...config, banners: config.banners.filter(b => b.id !== id) };
    await saveToStorage(newConfig);
  };

  const sendNotification = async (title: string, message: string) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      title,
      message,
      date: new Date().toISOString(),
      sent: true
    };
    const newConfig = { ...config, notifications: [newNotif, ...config.notifications] };
    await saveToStorage(newConfig);
    
    // Simulate Push (Local Browser)
    if ('Notification' in window) {
       if (Notification.permission === 'granted') {
           new Notification(title, { body: message, icon: config.iconUrl });
       } else if (Notification.permission !== 'denied') {
           Notification.requestPermission().then(permission => {
             if (permission === 'granted') {
               new Notification(title, { body: message, icon: config.iconUrl });
             }
           });
       }
    }
  };

  const resetToDefaults = async () => {
    if (confirm('Tem certeza? Isso apagará todas as customizações.')) {
        await saveToStorage(DEFAULT_CONFIG);
        window.location.reload();
    }
  };

  return (
    <AdminContext.Provider value={{ 
      config, 
      isLoading, 
      updateLogo, 
      updateIcon, 
      addBanner, 
      removeBanner, 
      sendNotification, 
      resetToDefaults 
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
