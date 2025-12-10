
import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { ConfigService } from '../services/configService';
import { 
  LogOut, 
  Image as ImageIcon, 
  Bell, 
  Settings, 
  Plus, 
  Trash2, 
  Upload, 
  Smartphone,
  CheckCircle,
  Link as LinkIcon,
  Loader2,
  Globe,
  HardDrive
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const { config, updateLogo, updateIcon, addBanner, removeBanner, sendNotification, resetToDefaults } = useAdmin();
  const [activeTab, setActiveTab] = useState<'branding' | 'banners' | 'push'>('branding');
  const [isSaving, setIsSaving] = useState(false);
  const [serverStatus, setServerStatus] = useState<'local' | 'cloud'>('cloud'); // Assume cloud first

  // States for URL inputs
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [bannerUrlInput, setBannerUrlInput] = useState('');

  // Push State
  const [pushTitle, setPushTitle] = useState('');
  const [pushMsg, setPushMsg] = useState('');

  // Helper to Upload File to Server
  const handleFileProcess = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => Promise<void>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert("A imagem é muito grande (>5MB).");
            return;
        }
        setIsSaving(true);
        try {
            // Upload to server instead of base64
            const url = await ConfigService.uploadImage(file);
            await callback(url);
            
            // Check if URL is base64 (fallback) or http (server)
            if (url.startsWith('data:')) {
                setServerStatus('local');
                alert('Aviso: O servidor de upload não respondeu. A imagem foi salva localmente no código (Base64). Configure o arquivo upload.php para persistência real.');
            } else {
                setServerStatus('cloud');
            }
        } catch (error) {
            alert("Erro ao processar imagem.");
        } finally {
            setIsSaving(false);
        }
    }
  };

  const handleUrlUpdate = async (type: 'logo' | 'icon') => {
      if (!logoUrlInput) return;
      setIsSaving(true);
      if (type === 'logo') await updateLogo(logoUrlInput);
      if (type === 'icon') await updateIcon(logoUrlInput);
      setLogoUrlInput('');
      setIsSaving(false);
  };

  const handleAddBannerUrl = async () => {
      if (!bannerUrlInput) return;
      setIsSaving(true);
      await addBanner({
          id: Date.now(),
          src: bannerUrlInput,
          alt: 'Banner Promocional',
          fallbackColor: 'bg-slate-800',
          fallbackText: 'NOVO'
      });
      setBannerUrlInput('');
      setIsSaving(false);
  };

  const handleAddBannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileProcess(e, async (url) => {
          await addBanner({
              id: Date.now(),
              src: url,
              alt: 'Banner Promocional',
              fallbackColor: 'bg-slate-800',
              fallbackText: 'NOVO'
          });
      });
  };

  const handleSendPush = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!pushTitle || !pushMsg) return;
      setIsSaving(true);
      await sendNotification(pushTitle, pushMsg);
      setPushTitle('');
      setPushMsg('');
      setIsSaving(false);
      alert('Notificação enviada com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Montserrat']">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00c896] rounded-lg">
                <Settings className="w-5 h-5 text-[#036271]" />
            </div>
            <div>
                <h1 className="font-bold text-lg">Painel Administrativo</h1>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-400">CITmax Config</p>
                    {isSaving && <span className="text-xs text-yellow-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Salvando na Nuvem...</span>}
                </div>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs bg-white/10 px-3 py-1 rounded-full">
                {serverStatus === 'cloud' ? <Globe className="w-3 h-3 text-green-400"/> : <HardDrive className="w-3 h-3 text-orange-400"/>}
                <span className="text-white/80">{serverStatus === 'cloud' ? 'Modo Online' : 'Modo Local'}</span>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-bold">
                <LogOut className="w-4 h-4" /> Sair
            </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex flex-col gap-2">
            <button 
                onClick={() => setActiveTab('branding')}
                className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-all ${activeTab === 'branding' ? 'bg-[#036271] text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            >
                <Smartphone className="w-5 h-5" /> Identidade Visual
            </button>
            <button 
                onClick={() => setActiveTab('banners')}
                className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-all ${activeTab === 'banners' ? 'bg-[#036271] text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            >
                <ImageIcon className="w-5 h-5" /> Banners App
            </button>
            <button 
                onClick={() => setActiveTab('push')}
                className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-all ${activeTab === 'push' ? 'bg-[#036271] text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            >
                <Bell className="w-5 h-5" /> Notificações Push
            </button>

            <div className="mt-auto pt-8">
                <button onClick={resetToDefaults} className="w-full py-2 text-xs text-slate-400 hover:text-red-500 underline">
                    Restaurar Padrões de Fábrica
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2 px-2">
                   Alterações salvas globalmente se a API estiver configurada.
                </p>
            </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            
            {/* BRANDING TAB */}
            {activeTab === 'branding' && (
                <div className="space-y-8 animate-in fade-in">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Identidade Visual</h2>
                        <p className="text-slate-500">Altere o logotipo e ícone. As imagens serão salvas no servidor.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Logo Upload */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center text-center">
                            <h3 className="font-bold text-slate-700 mb-4">Logotipo Principal</h3>
                            <div className="h-24 flex items-center justify-center mb-4 bg-white p-4 rounded-lg shadow-sm w-full relative">
                                <BrandLogo variant="color" className="h-full max-h-16" />
                            </div>
                            
                            <div className="w-full space-y-3">
                                <label className="cursor-pointer w-full bg-[#036271] hover:bg-[#024d59] text-white px-4 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                                    <Upload className="w-4 h-4" /> Upload Imagem
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileProcess(e, updateLogo)} />
                                </label>
                                
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Ou URL: https://site.com/logo.png" 
                                        value={logoUrlInput}
                                        onChange={e => setLogoUrlInput(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm border rounded-lg"
                                    />
                                    <button onClick={() => handleUrlUpdate('logo')} className="bg-slate-200 p-2 rounded-lg hover:bg-slate-300"><LinkIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                        </div>

                        {/* Icon Upload */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center text-center">
                            <h3 className="font-bold text-slate-700 mb-4">Ícone do App (Favicon)</h3>
                            <div className="w-24 h-24 mb-4 bg-white p-2 rounded-2xl shadow-sm flex items-center justify-center">
                                {config.iconUrl ? (
                                    <img src={config.iconUrl} alt="App Icon" className="w-16 h-16 object-contain" />
                                ) : (
                                    <span className="text-xs text-slate-300">Padrão</span>
                                )}
                            </div>
                            <label className="cursor-pointer bg-[#036271] hover:bg-[#024d59] text-white px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors w-full justify-center">
                                <Upload className="w-4 h-4" /> Upload Ícone
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileProcess(e, updateIcon)} />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* BANNERS TAB */}
            {activeTab === 'banners' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Banners Promocionais</h2>
                            <p className="text-slate-500">Gerencie o carrossel. Imagens são salvas na pasta pública.</p>
                        </div>
                    </div>

                    {/* Add Banner Area */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
                        <label className="cursor-pointer bg-[#00c896] hover:bg-[#00a87e] text-[#036271] px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap">
                            <Plus className="w-5 h-5" /> Upload Arquivo
                            <input type="file" accept="image/*" className="hidden" onChange={handleAddBannerFile} />
                        </label>
                        <span className="text-slate-400 text-sm font-bold">OU</span>
                        <div className="flex-1 flex gap-2 w-full">
                            <input 
                                type="text" 
                                placeholder="Cole a URL da imagem..." 
                                value={bannerUrlInput}
                                onChange={e => setBannerUrlInput(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-xl border border-slate-300"
                            />
                            <button onClick={handleAddBannerUrl} className="bg-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-300">
                                Adicionar
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {config.banners.map((banner) => (
                            <div key={banner.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-32 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                    <img src={banner.src} alt="Banner" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-slate-700">Banner #{banner.id}</p>
                                    <p className="text-xs text-slate-400 font-mono break-all line-clamp-1">{banner.src}</p>
                                </div>
                                <button 
                                    onClick={() => removeBanner(banner.id)}
                                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                                    title="Remover Banner"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PUSH TAB */}
            {activeTab === 'push' && (
                <div className="space-y-8 animate-in fade-in">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Enviar Notificação Push</h2>
                        <p className="text-slate-500">Envie alertas para todos os dispositivos conectados.</p>
                    </div>

                    <form onSubmit={handleSendPush} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 max-w-lg shadow-inner">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label>
                            <input 
                                type="text" 
                                value={pushTitle}
                                onChange={e => setPushTitle(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:border-[#00c896]"
                                placeholder="Ex: Manutenção Programada"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mensagem</label>
                            <textarea 
                                value={pushMsg}
                                onChange={e => setPushMsg(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:border-[#00c896] h-24 resize-none"
                                placeholder="Ex: Estamos realizando melhorias na rede de fibra óptica."
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-3 bg-[#036271] hover:bg-[#024d59] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#036271]/20 disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Bell className="w-5 h-5" />}
                            Enviar Disparo
                        </button>
                    </form>
                </div>
            )}

        </main>
      </div>
    </div>
  );
};
