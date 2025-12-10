
import React, { useState, useEffect } from 'react';
import { SGPContract, SGPInvoice } from '../types';
import { APIService } from '../services/apiService';
import { ChatSupport } from './ChatSupport';
import { useTheme } from '../ThemeContext';
import { BrandLogo } from './BrandLogo';
import { PromoCarousel } from './PromoCarousel';
import { 
  LogOut, 
  MapPin, 
  FileText, 
  HelpCircle,
  Menu,
  Hexagon,
  Copy,
  CheckCircle,
  Loader2,
  ChevronRight,
  AlertTriangle,
  QrCode,
  Scroll,
  Smartphone,
  ExternalLink,
  MessageSquare,
  Activity,
  Unlock,
  Sun,
  Moon,
  Monitor,
  Wifi,
  Radio,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  contract: SGPContract;
  onLogout: () => void;
  userCpfCnpj: string;
  userPassword?: string;
  onChangeContract?: () => void;
  onViewInvoices: () => void;
  onSelectInvoice: (invoice: SGPInvoice) => void;
  onViewFiscalInvoices: () => void;
  onOpenWebView: (url: string, title: string) => void;
  onViewTraffic: () => void;
  onViewUnlock: () => void;
  onViewConnection: () => void;
  onViewWifiManager: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  contract, 
  onLogout, 
  userCpfCnpj, 
  userPassword, 
  onChangeContract,
  onViewInvoices,
  onSelectInvoice,
  onViewFiscalInvoices,
  onOpenWebView,
  onViewTraffic,
  onViewUnlock,
  onViewConnection,
  onViewWifiManager
}) => {
  const { theme, setTheme } = useTheme();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Invoice State
  const [openInvoice, setOpenInvoice] = useState<SGPInvoice | null>(null);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // Status Check
  const statusLower = (contract.status || '').toLowerCase();
  const isReduced = statusLower.includes('reduzido');
  const isSuspended = statusLower.includes('suspenso') || statusLower.includes('bloqueado');

  useEffect(() => {
    fetchOpenInvoice();
  }, [contract.id_contrato]);

  const fetchOpenInvoice = async () => {
    if (!userPassword) return;
    
    setIsLoadingInvoices(true);
    try {
      const data = await APIService.getInvoices(userCpfCnpj, userPassword, contract.id_contrato);
      // Filter for the first open invoice
      const openInvoices = data
        .filter(inv => {
             const sit = inv.situacao?.toLowerCase() || '';
             const isPaid = sit.includes('pago') || sit.includes('liquidado') || inv.data_pagamento;
             const isCancelled = sit.includes('cancelado');
             return !isPaid && !isCancelled;
        })
        .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());

      if (openInvoices.length > 0) {
        setOpenInvoice(openInvoices[0]); // Get the earliest due date that is open
      } else {
        setOpenInvoice(null);
      }
    } catch (error) {
      console.error("Failed to load invoices", error);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const handleCopyCode = (code: string, id: string | number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAppsPortal = () => {
    onOpenWebView('https://www.portaldoassinante.com/citmax/login', 'Apps e Conteúdo');
  };

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('auto');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-5 h-5" />;
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#01252b] flex flex-col font-['Montserrat'] transition-colors duration-300">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#036271] text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-2">
            <BrandLogo variant="white" className="h-8" />
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="w-6 h-6 text-[#00c896]" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-[#036271]/90 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white dark:bg-[#02343f] w-3/4 h-full p-6 shadow-2xl flex flex-col rounded-r-2xl border-r border-[#00c896]/20" onClick={e => e.stopPropagation()}>
            <div className="mb-8 border-b border-slate-100 dark:border-[#00c896]/20 pb-4">
              <div className="mb-4">
                <BrandLogo variant={theme === 'dark' ? 'white' : 'color'} className="h-10" />
              </div>
              <p className="text-slate-500 dark:text-slate-300 text-sm truncate font-medium">{contract.razao_social}</p>
            </div>
            <nav className="space-y-4 flex-1 overflow-y-auto">
              <button onClick={toggleTheme} className="w-full flex items-center gap-3 p-4 bg-slate-100 dark:bg-[#01252b] text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-colors">
                 {getThemeIcon()}
                 <span className="capitalize">Tema: {theme === 'auto' ? 'Automático' : theme === 'light' ? 'Claro' : 'Escuro'}</span>
              </button>

              <button 
                onClick={handleOpenAppsPortal}
                className="w-full flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
              >
                <Smartphone className="w-5 h-5" /> Apps e Conteúdo
              </button>

              <button 
                onClick={onViewInvoices}
                className="w-full flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#036271]/30 text-[#036271] dark:text-[#00c896] rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-[#036271]/50 transition-colors"
              >
                <FileText className="w-5 h-5" /> Minhas Faturas
              </button>

              <button 
                onClick={onViewConnection}
                className="w-full flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#036271]/30 text-[#036271] dark:text-[#00c896] rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-[#036271]/50 transition-colors"
              >
                <Wifi className="w-5 h-5" /> Minha Conexão
              </button>

              <button 
                onClick={onViewWifiManager}
                className="w-full flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#036271]/30 text-[#036271] dark:text-[#00c896] rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-[#036271]/50 transition-colors"
              >
                <Radio className="w-5 h-5" /> Wifi Manager
              </button>

              <button 
                onClick={onViewUnlock}
                className="w-full flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#036271]/30 text-[#036271] dark:text-[#00c896] rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-[#036271]/50 transition-colors"
              >
                <Unlock className="w-5 h-5" /> Desbloqueio Confiança
              </button>

              <button 
                onClick={onViewFiscalInvoices}
                className="w-full flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#036271]/30 text-[#036271] dark:text-[#00c896] rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-[#036271]/50 transition-colors"
              >
                <Scroll className="w-5 h-5" /> Notas Fiscais
              </button>

              <button 
                onClick={onViewTraffic}
                className="w-full flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#036271]/30 text-[#036271] dark:text-[#00c896] rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-[#036271]/50 transition-colors"
              >
                <Activity className="w-5 h-5" /> Extrato de Uso
              </button>

              <button 
                onClick={() => { setIsChatOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-4 bg-[#00c896]/10 dark:bg-[#00c896]/20 text-[#036271] dark:text-[#00c896] rounded-xl font-bold hover:bg-[#00c896]/20 dark:hover:bg-[#00c896]/30 transition-colors"
              >
                <HelpCircle className="w-5 h-5" /> Suporte IA
              </button>
              
              <div className="border-t border-slate-100 dark:border-[#00c896]/20 my-4 pt-4 space-y-4">
                {onChangeContract && (
                    <button 
                    onClick={onChangeContract}
                    className="w-full flex items-center gap-3 px-4 text-slate-500 dark:text-slate-400 font-medium hover:text-[#036271] dark:hover:text-[#00c896]"
                    >
                    Trocar Contrato
                    </button>
                )}

                <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 text-red-600 dark:text-red-400 font-medium hover:text-red-700"
                >
                    <LogOut className="w-5 h-5" /> Sair
                </button>
              </div>
            </nav>
            <div className="text-xs text-slate-400 text-center pt-4">
              CITmax App v1.3
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation (Desktop) */}
      <header className="hidden lg:block bg-white dark:bg-[#02343f] border-b border-slate-200 dark:border-[#00c896]/20 sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {/* Uses Color logo for light mode, White logo for dark mode */}
             <BrandLogo variant={theme === 'dark' ? 'white' : 'color'} className="h-10" />
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-sm font-bold text-[#036271] dark:text-white">{contract.razao_social}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-end gap-1">
                Contrato <span className="bg-slate-100 dark:bg-[#036271] px-1.5 rounded text-slate-600 dark:text-white">#{contract.id_contrato}</span>
              </p>
            </div>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-[#00c896]/30"></div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="p-2.5 text-[#036271] dark:text-[#00c896] hover:bg-slate-100 dark:hover:bg-[#036271] rounded-xl transition-colors"
                title="Mudar Tema"
              >
                {getThemeIcon()}
              </button>

              {onChangeContract && (
                <button 
                  onClick={onChangeContract}
                  className="px-4 py-2.5 text-[#036271] dark:text-white hover:bg-[#00c896]/10 dark:hover:bg-[#036271] rounded-xl transition-colors text-sm font-semibold"
                >
                  Trocar Contrato
                </button>
              )}

              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-[#036271] p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
           {/* Decorative circles */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00c896] rounded-full opacity-20 blur-2xl"></div>
           <div className="absolute bottom-0 left-20 w-32 h-32 bg-[#008B87] rounded-full opacity-20 blur-2xl"></div>

           <div className="relative z-10">
              <h2 className="text-2xl lg:text-3xl font-['Righteous'] text-white">
                Olá, {contract.razao_social.split(' ')[0]}
              </h2>
              <p className="text-[#00c896] mt-2 font-medium">Sua conexão com o mundo está ativa e operando.</p>
              <div className="flex items-center gap-2 mt-4 text-white/80 text-sm">
                  <MapPin className="w-4 h-4 text-[#00c896]" />
                  <span className="truncate max-w-xs">{contract.endereco}, {contract.numero}</span>
              </div>
           </div>
           
           <div className="relative z-10 hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
              <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ${
                  isSuspended ? 'bg-red-500 text-red-500' : isReduced ? 'bg-orange-500 text-orange-500' : 'bg-[#00c896] text-[#00c896]'
              }`}></div>
              <span className="text-white font-semibold text-sm">
                  {isSuspended ? 'Suspenso' : isReduced ? 'Velocidade Reduzida' : 'Conectado'}
              </span>
           </div>
        </div>

        {/* STATUS ALERT BANNER (Reduced or Suspended) */}
        {(isReduced || isSuspended) && (
            <div className={`rounded-3xl p-6 shadow-md border-l-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-4 ${
                isSuspended 
                ? 'bg-red-50 dark:bg-red-900/10 border-red-500' 
                : 'bg-orange-50 dark:bg-orange-900/10 border-orange-500'
            }`}>
                <div className="flex gap-4">
                    <div className={`p-3 rounded-full shrink-0 ${
                        isSuspended ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${
                            isSuspended ? 'text-red-700 dark:text-red-400' : 'text-orange-700 dark:text-orange-400'
                        }`}>
                            {isSuspended ? 'Sua conexão está bloqueada' : 'Sua conexão está lenta (Reduzida)'}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                            {isSuspended 
                             ? 'Identificamos pendências financeiras antigas. Regularize para desbloquear.' 
                             : 'Identificamos faturas em atraso. Realize o pagamento ou use o Desbloqueio de Confiança.'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={onViewUnlock}
                        className={`px-4 py-3 rounded-xl font-bold text-sm w-full md:w-auto flex items-center justify-center gap-2 transition-colors ${
                            isSuspended
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                    >
                        <Unlock className="w-4 h-4" /> Desbloqueio de Confiança
                    </button>
                </div>
            </div>
        )}

        {/* Highlighted Invoice Section (Next Bill) */}
        <div className="mb-4">
           {isLoadingInvoices ? (
              <div className="bg-white dark:bg-[#02343f] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 flex items-center justify-center h-40">
                <div className="flex flex-col items-center text-slate-400 dark:text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#00c896] mb-2" />
                  <p className="text-sm">Buscando informações financeiras...</p>
                </div>
              </div>
           ) : openInvoice ? (
              <div className="bg-white dark:bg-[#02343f] rounded-3xl shadow-md border-l-8 border-l-[#00c896] border-y border-r border-slate-100 dark:border-[#00c896]/10 overflow-hidden relative transition-colors">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2 text-[#036271] dark:text-[#00c896] font-bold uppercase text-xs tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-[#00c896]" />
                      Fatura em Aberto
                    </div>
                    <h3 className="text-3xl font-bold text-[#036271] dark:text-white">
                      {APIService.formatCurrency(openInvoice.valor)}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                       Vence em: <span className="text-slate-800 dark:text-slate-200 font-bold">{APIService.formatDate(openInvoice.vencimento)}</span>
                       {new Date(openInvoice.vencimento) < new Date() && (
                         <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Atrasado</span>
                       )}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
                    {(openInvoice.codigo_pix || openInvoice.linha_digitavel) && (
                        <button 
                        onClick={() => handleCopyCode(openInvoice.codigo_pix || openInvoice.linha_digitavel!, openInvoice.id)}
                        className="px-6 py-3.5 rounded-xl border-2 border-slate-100 dark:border-[#00c896]/30 hover:border-[#00c896] dark:hover:border-[#00c896] hover:text-[#00c896] text-slate-600 dark:text-slate-300 font-bold transition-all flex items-center justify-center gap-2"
                        >
                          {copiedId === openInvoice.id ? (
                            <> <CheckCircle className="w-5 h-5" /> Copiado! </>
                          ) : openInvoice.codigo_pix ? (
                            <> <QrCode className="w-5 h-5" /> Copiar Pix </>
                          ) : (
                            <> <Copy className="w-5 h-5" /> Copiar Código </>
                          )}
                        </button>
                    )}
                    
                    <button 
                      onClick={() => onSelectInvoice(openInvoice)}
                      className="bg-[#00c896] hover:bg-[#008B87] text-[#036271] hover:text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00c896]/20"
                    >
                      PAGAR AGORA
                    </button>
                  </div>

                  {/* Decorative background logo */}
                  <Hexagon className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-50 dark:text-[#036271] opacity-50 z-0" />
                </div>
              </div>
           ) : (
              <div className="bg-white dark:bg-[#02343f] p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full">
                       <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#036271] dark:text-white">Tudo em dia!</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Você não possui faturas pendentes no momento.</p>
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* Promotional Carousel */}
        <PromoCarousel />

        {/* Quick Access Grid */}
        <div>
            <h3 className="text-lg font-bold text-[#036271] dark:text-white mb-4 font-['Righteous'] px-1">Acesso Rápido</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Apps Button */}
                <button 
                    onClick={handleOpenAppsPortal}
                    className="bg-white dark:bg-[#02343f] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 hover:border-purple-200 dark:hover:border-purple-500/50 hover:shadow-md transition-all group text-left relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3">
                        <ExternalLink className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-purple-400" />
                    </div>
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                        <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg group-hover:text-purple-700 dark:group-hover:text-purple-300">Apps e Conteúdo</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gerenciar aplicativos</p>
                </button>

                {/* Invoices Button */}
                <button 
                    onClick={onViewInvoices}
                    className="bg-white dark:bg-[#02343f] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 hover:border-[#00c896] hover:shadow-md transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg group-hover:text-[#036271] dark:group-hover:text-[#00c896]">Minhas Faturas</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Histórico completo</p>
                </button>

                {/* Connection Button */}
                <button 
                    onClick={onViewConnection}
                    className="bg-white dark:bg-[#02343f] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 hover:border-[#00c896] hover:shadow-md transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                        <Wifi className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg group-hover:text-[#036271] dark:group-hover:text-[#00c896]">Minha Conexão</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Diagnóstico e Logs</p>
                </button>

                {/* Wifi Manager Button */}
                <button 
                    onClick={onViewWifiManager}
                    className="bg-white dark:bg-[#02343f] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 hover:border-[#00c896] hover:shadow-md transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                        <Radio className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg group-hover:text-[#036271] dark:group-hover:text-[#00c896]">Wi-Fi Manager</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Scanner e Speedtest</p>
                </button>

                {/* Unlock Button */}
                <button 
                    onClick={onViewUnlock}
                    className="bg-white dark:bg-[#02343f] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 hover:border-[#00c896] hover:shadow-md transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                        <Unlock className="w-6 h-6 text-orange-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg group-hover:text-[#036271] dark:group-hover:text-[#00c896]">Desbloqueio</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Liberação por confiança</p>
                </button>

                {/* Traffic Button */}
                <button 
                    onClick={onViewTraffic}
                    className="bg-white dark:bg-[#02343f] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 hover:border-[#00c896] hover:shadow-md transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30 transition-colors">
                        <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg group-hover:text-[#036271] dark:group-hover:text-[#00c896]">Extrato de Uso</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Consumo mensal</p>
                </button>

                {/* Support Button */}
                <button 
                    onClick={() => setIsChatOpen(true)}
                    className="bg-white dark:bg-[#02343f] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 hover:border-[#00c896] hover:shadow-md transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-[#00c896]/10 dark:bg-[#00c896]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#00c896]/20 dark:group-hover:bg-[#00c896]/30 transition-colors">
                        <MessageSquare className="w-6 h-6 text-[#00c896]" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg group-hover:text-[#036271] dark:group-hover:text-[#00c896]">Suporte Técnico</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Falar com Assistente IA</p>
                </button>
            </div>
        </div>

      </main>

      <ChatSupport 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        contract={contract}
        userCpfCnpj={userCpfCnpj}
        userPassword={userPassword}
      />
    </div>
  );
};
