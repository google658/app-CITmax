
import React, { useState, useEffect } from 'react';
import { SGPContract, SGPRadiusResult } from '../types';
import { APIService } from '../services/apiService';
import { 
  ArrowLeft, 
  Wifi, 
  WifiOff,
  Activity, 
  Loader2, 
  Clock, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Hash,
  Globe,
  AlertTriangle
} from 'lucide-react';

interface ConnectionHistoryProps {
  contract: SGPContract;
  userCpfCnpj: string;
  userPassword?: string;
  onBack: () => void;
}

export const ConnectionHistory: React.FC<ConnectionHistoryProps> = ({ contract, userCpfCnpj, userPassword, onBack }) => {
  const [data, setData] = useState<SGPRadiusResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiagnostics();
  }, [contract.id_contrato, userCpfCnpj]);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all connections for this CPF
      const results = await APIService.getConnectionDiagnostics(userCpfCnpj, userPassword, contract.id_contrato);
      
      console.log("All Connections Found:", results);

      if (results.length === 0) {
        setError("Nenhuma sessão de conexão encontrada para este CPF.");
        setData(null);
        return;
      }

      // --- LOGIC TO MATCH CONNECTION TO CURRENT CONTRACT ---
      // The API returns a list of connections for the CPF, but without explicit 'id_contrato'.
      // However, it returns 'plano' and 'endereco_logradouro'. We can try to match these.

      let targetConnection: SGPRadiusResult | undefined;

      // 1. Try Match by Plan Name (Exact or Partial)
      if (contract.plano) {
          const contractPlan = contract.plano.toLowerCase().trim();
          targetConnection = results.find(r => 
              r.plano && r.plano.toLowerCase().trim() === contractPlan
          );
      }

      // 2. If no match by Plan, try to match by Address Keyword (e.g. Street name)
      if (!targetConnection && contract.endereco) {
           const streetKeyword = contract.endereco.split(' ')[0].toLowerCase();
           if (streetKeyword.length > 3) {
                targetConnection = results.find(r => 
                    r.endereco_logradouro && r.endereco_logradouro.toLowerCase().includes(streetKeyword)
                );
           }
      }

      // 3. Fallback: Find the one that is currently ONLINE
      if (!targetConnection) {
         targetConnection = results.find(r => r.online);
      }

      // 4. Fallback: Just take the first one found
      if (!targetConnection && results.length > 0) {
          targetConnection = results[0];
      }

      setData(targetConnection || null);

    } catch (err: any) {
      console.error("Failed to load connection diagnostics", err);
      if (err.message && err.message.includes('Failed to fetch')) {
        setError("Erro de Rede (CORS): O navegador bloqueou a conexão direta com a API da Central. Tente usar o App Nativo ou verifique as permissões.");
      } else {
        setError(err.message || "Falha ao buscar diagnóstico.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#01252b] flex flex-col font-['Montserrat'] transition-colors duration-300">
      {/* Header */}
      <div className="bg-[#036271] p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-['Righteous'] text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-[#00c896]" />
              Minha Conexão
            </h1>
            <p className="text-[#00c896] text-xs mt-1">Contrato #{contract.id_contrato}</p>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-6">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#00c896] mb-2" />
            <p>Analisando conexão...</p>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center h-auto text-slate-400 bg-white dark:bg-[#02343f] rounded-3xl shadow-sm border border-red-200 dark:border-red-900/30 text-center p-6">
             <AlertTriangle className="w-12 h-12 text-red-400 mb-2 mx-auto" />
             <p className="font-semibold text-slate-600 dark:text-slate-300 text-lg mb-2">Ops!</p>
             <p className="text-sm text-red-500 max-w-md">{error}</p>
             <button 
                onClick={fetchDiagnostics}
                className="mt-4 px-4 py-2 bg-[#036271] text-white rounded-lg text-sm font-bold"
             >
                Tentar Novamente
             </button>
           </div>
        ) : !data ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white dark:bg-[#02343f] rounded-3xl shadow-sm border border-slate-200 dark:border-[#00c896]/10 text-center p-6">
             <WifiOff className="w-12 h-12 text-slate-200 dark:text-slate-600 mb-2 mx-auto" />
             <p className="font-semibold text-slate-600 dark:text-slate-300">Nenhuma conexão ativa encontrada.</p>
             <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">Verifique se o seu equipamento está ligado.</p>
           </div>
        ) : (
          <>
            {/* Status Card */}
            <div className="bg-white dark:bg-[#02343f] rounded-3xl p-6 shadow-md border-l-8 overflow-hidden relative transition-colors"
                 style={{ borderLeftColor: data.online ? '#00c896' : '#ef4444' }}>
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm ${
                                data.online 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                                {data.online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                                {data.online ? 'Online' : 'Offline'}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-mono bg-slate-100 dark:bg-black/20 px-2 py-1.5 rounded border border-slate-200 dark:border-white/5">
                                Login: {data.pppoe_login}
                            </span>
                        </div>
                        
                        <h2 className="text-xl md:text-2xl font-bold text-[#036271] dark:text-white mb-4 leading-tight">
                            {data.plano || contract.plano || 'Plano de Internet'}
                        </h2>

                        <div className="flex flex-wrap gap-4 text-sm bg-slate-50 dark:bg-[#036271]/20 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Globe className="w-4 h-4 text-[#00c896]" />
                                <span className="font-medium">IP:</span> 
                                <span className="font-mono">{data.ip || 'Não atribuído'}</span>
                            </div>
                            <div className="w-px h-4 bg-slate-300 dark:bg-white/10 hidden sm:block"></div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Hash className="w-4 h-4 text-[#00c896]" />
                                <span className="font-medium">MAC:</span> 
                                <span className="font-mono text-xs">{data.mac || '---'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Session Stats */}
            <div className="bg-white dark:bg-[#02343f] rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-[#036271] dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#00c896]" />
                        Sessão Atual
                    </h3>
                    <div className="text-xs text-slate-400">
                        Sessão ID: {data.acctsessionid?.slice(0, 8)}...
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-sm ${
                                data.online ? 'bg-green-500 animate-pulse' : 'bg-red-400'
                            }`}></div>
                            <div>
                                <p className="font-bold text-slate-700 dark:text-white text-sm">
                                    Iniciada em: {new Date(data.acctstarttime).toLocaleString('pt-BR')}
                                </p>
                                
                                {data.acctstoptime ? (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Terminou em: {new Date(data.acctstoptime).toLocaleString('pt-BR')}
                                    </p>
                                ) : (
                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
                                        Conexão ativa no momento
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                            <div className="text-center min-w-[70px]">
                                <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-0.5 font-bold uppercase tracking-wider text-[10px]">
                                    <ArrowDownCircle className="w-3 h-3" />
                                    Baixou
                                </div>
                                <span className="text-slate-700 dark:text-slate-200 font-mono font-bold text-lg">
                                    {APIService.bytesToGB(data.acctoutputoctets)}
                                </span>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                            <div className="text-center min-w-[70px]">
                                <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-0.5 font-bold uppercase tracking-wider text-[10px]">
                                    <ArrowUpCircle className="w-3 h-3" />
                                    Enviou
                                </div>
                                <span className="text-slate-700 dark:text-slate-200 font-mono font-bold text-lg">
                                    {APIService.bytesToGB(data.acctinputoctets)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
