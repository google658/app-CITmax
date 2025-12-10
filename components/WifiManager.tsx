
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wifi, Signal, Zap, Loader2, QrCode, RefreshCw, CheckCircle, Smartphone, ExternalLink, Gauge, MapPin } from 'lucide-react';
import { APIService } from '../services/apiService';

interface WifiManagerProps {
  onBack: () => void;
  onOpenWebView?: (url: string, title: string) => void;
}

export const WifiManager: React.FC<WifiManagerProps> = ({ onBack, onOpenWebView }) => {
  const [tab, setTab] = useState<'diagnostic' | 'qrcode'>('diagnostic');
  
  // Diagnostic State
  const [isTesting, setIsTesting] = useState(false);
  const [latency, setLatency] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [networkType, setNetworkType] = useState<string>('Desconhecido');
  const [serverName, setServerName] = useState('CITmax (Localizando...)');
  
  // QR Code State
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState('WPA');
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    // Detect Network Type if available via navigator
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
        setNetworkType(conn.effectiveType || conn.type || 'Wifi/4G');
    }
    
    // Auto-start test
    runSpeedTest();
  }, []);

  const runSpeedTest = async () => {
    setIsTesting(true);
    setLatency(0);
    setDownloadSpeed(0);
    
    // Simulate steps for visual effect before real result
    setTimeout(async () => {
        try {
            const result = await APIService.measureConnectionQuality();
            setLatency(result.latency);
            setDownloadSpeed(result.downloadSpeedMbps);
            setServerName(result.server);
        } catch (e) {
            console.error(e);
        } finally {
            setIsTesting(false);
        }
    }, 1000);
  };

  const generateQRCode = () => {
    if (!ssid) return;
    
    // Escape special characters for the WIFI string schema: \ ; , : "
    const escapeChar = (str: string) => str.replace(/([\\;,":])/g, '\\$1');

    const cleanSsid = escapeChar(ssid);
    const cleanPass = escapeChar(password);

    // WIFI Schema: WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<PASSWORD>;;
    // Using standard format order: S (SSID) -> T (Type) -> P (Password)
    const qrString = `WIFI:S:${cleanSsid};T:${encryption};P:${cleanPass};;`;

    // Replaced Google Charts (deprecated) with QuickChart.io (reliable)
    setQrUrl(`https://quickchart.io/qr?text=${encodeURIComponent(qrString)}&size=400&margin=2&ecLevel=M&light=ffffff&dark=000000`);
  };

  const handleOpenOfficialSpeedtest = () => {
      const url = 'https://citbandalarga.speedtestcustom.com/';
      
      // FIX: Force open in new tab/window ('_blank') instead of iframe/WebView.
      // Ookla Speedtest Custom typically blocks embedding in iframes (X-Frame-Options: SAMEORIGIN),
      // which causes a blank screen. Opening externally ensures it works on all devices.
      window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#01252b] flex flex-col font-['Montserrat'] transition-colors duration-300">
      {/* Header */}
      <div className="bg-[#036271] p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-['Righteous'] text-white flex items-center gap-2">
              <Wifi className="w-6 h-6 text-[#00c896]" />
              Wi-Fi Manager
            </h1>
            <p className="text-[#00c896] text-xs">Diagnóstico e Ferramentas</p>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-xl mx-auto w-full p-4 md:p-6 space-y-6">
        
        {/* Tabs */}
        <div className="flex bg-white dark:bg-[#02343f] p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-[#00c896]/20">
            <button 
                onClick={() => setTab('diagnostic')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    tab === 'diagnostic' 
                    ? 'bg-[#00c896] text-[#036271]' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
            >
                <Signal className="w-4 h-4" /> Diagnóstico
            </button>
            <button 
                onClick={() => setTab('qrcode')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    tab === 'qrcode' 
                    ? 'bg-[#00c896] text-[#036271]' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
            >
                <QrCode className="w-4 h-4" /> Compartilhar Wi-Fi
            </button>
        </div>

        {tab === 'diagnostic' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                
                {/* Speed Gauge (Estimated) */}
                <div className="bg-white dark:bg-[#02343f] p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-black/20 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400">
                            <Smartphone className="w-3 h-3" />
                            {networkType.toUpperCase()}
                        </div>
                    </div>

                    <div className="w-40 h-40 rounded-full border-[12px] border-slate-100 dark:border-[#036271] border-t-[#00c896] border-r-[#00c896] border-l-[#00c896] mx-auto flex items-center justify-center relative mb-4">
                        {isTesting ? (
                            <Loader2 className="w-12 h-12 text-[#00c896] animate-spin" />
                        ) : (
                            <div className="text-center">
                                <span className="text-4xl font-bold text-[#036271] dark:text-white block">{downloadSpeed > 0 ? downloadSpeed : '--'}</span>
                                <span className="text-xs text-slate-400 font-bold uppercase">Mbps (Est.)</span>
                            </div>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-[#036271] dark:text-white">Estimativa de Conexão</h3>
                    <div className="flex items-center justify-center gap-1 mt-1 mb-6">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500 font-medium">Testando com: {serverName}</span>
                    </div>
                    
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                        {isTesting ? 'Testando sua rede...' : latency > 0 ? `Latência Atual: ${latency}ms` : 'Toque para testar'}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-[#036271]/30 p-3 rounded-xl">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Latência (Ping)</p>
                            <div className="flex items-center justify-center gap-2">
                                <Zap className="w-4 h-4 text-orange-500" />
                                <span className="font-bold text-slate-700 dark:text-white">{latency > 0 ? latency + 'ms' : '--'}</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-[#036271]/30 p-3 rounded-xl">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Status</p>
                            <div className="flex items-center justify-center gap-2">
                                <CheckCircle className={`w-4 h-4 ${latency > 0 && latency < 100 ? 'text-green-500' : 'text-slate-400'}`} />
                                <span className="font-bold text-slate-700 dark:text-white">
                                    {latency === 0 ? '--' : latency < 100 ? 'Ótimo' : 'Regular'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={runSpeedTest}
                        disabled={isTesting}
                        className="mt-6 w-full py-3 bg-[#036271] hover:bg-[#024d59] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {isTesting ? 'Testando...' : <><RefreshCw className="w-4 h-4" /> Testar Novamente</>}
                    </button>
                </div>

                {/* Official Speedtest Card */}
                <div 
                  onClick={handleOpenOfficialSpeedtest}
                  className="bg-gradient-to-br from-[#00c896] to-[#036271] p-6 rounded-3xl shadow-lg cursor-pointer transform transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/3"></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Gauge className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white text-lg">Speedtest Oficial CITmax</h3>
                            <p className="text-white/80 text-sm">Realize um teste de velocidade completo e preciso (Ookla).</p>
                        </div>
                        <div className="bg-white text-[#036271] p-2 rounded-full shadow-md group-hover:bg-[#036271] group-hover:text-white transition-colors">
                             <ExternalLink className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#00c896]/10 p-4 rounded-xl border border-[#00c896]/20">
                    <p className="text-xs text-[#036271] dark:text-[#00c896] text-center">
                        <strong>Nota:</strong> O medidor acima é uma estimativa rápida. Para resultados oficiais e certificação de banda, utilize o botão do Speedtest Oficial.
                    </p>
                </div>
            </div>
        )}

        {tab === 'qrcode' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                <div className="bg-white dark:bg-[#02343f] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10">
                    <h3 className="font-bold text-[#036271] dark:text-white mb-4">Gerar QR Code</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        Crie um código para facilitar a conexão de visitas à sua rede Wi-Fi.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Nome da Rede (SSID)</label>
                            <input 
                                type="text" 
                                value={ssid}
                                onChange={(e) => setSsid(e.target.value)}
                                className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#01252b] border border-slate-200 dark:border-[#00c896]/20 rounded-xl outline-none focus:border-[#00c896] dark:text-white transition-colors"
                                placeholder="Minha Casa 5G"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Senha</label>
                            <input 
                                type="text" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#01252b] border border-slate-200 dark:border-[#00c896]/20 rounded-xl outline-none focus:border-[#00c896] dark:text-white transition-colors"
                                placeholder="Senha do Wi-Fi"
                            />
                        </div>
                        
                        <button 
                            onClick={generateQRCode}
                            disabled={!ssid}
                            className="w-full py-3 bg-[#00c896] hover:bg-[#008B87] text-[#036271] font-bold rounded-xl transition-all shadow-md shadow-[#00c896]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Gerar Código
                        </button>
                    </div>

                    {qrUrl && (
                        <div className="mt-8 flex flex-col items-center animate-in zoom-in duration-300">
                            <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-[#036271]">
                                <img 
                                  src={qrUrl} 
                                  alt="Wi-Fi QR Code" 
                                  className="w-48 h-48"
                                  onError={(e) => {
                                      // Fallback on error if image fails to load
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      alert('Erro ao carregar QR Code. Tente novamente.');
                                  }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-4 text-center">Mostre este código para conectar automaticamente.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
};
