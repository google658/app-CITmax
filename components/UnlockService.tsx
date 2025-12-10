
import React, { useState } from 'react';
import { SGPContract, SGPUnlockResponse } from '../types';
import { APIService } from '../services/apiService';
import { 
  ArrowLeft, 
  Unlock, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface UnlockServiceProps {
  contract: SGPContract;
  userCpfCnpj: string;
  userPassword?: string;
  onBack: () => void;
}

export const UnlockService: React.FC<UnlockServiceProps> = ({ contract, userCpfCnpj, userPassword, onBack }) => {
  const [step, setStep] = useState<'intro' | 'loading' | 'success' | 'error'>('intro');
  const [result, setResult] = useState<SGPUnlockResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlock = async () => {
    if (!userPassword) return;
    
    setStep('loading');
    try {
      const response = await APIService.unlockService(userCpfCnpj, userPassword, contract.id_contrato);
      setResult(response);
      
      if (response.liberado || response.status === 1) {
        setStep('success');
      } else {
        setStep('error');
        setErrorMsg(response.msg || 'Não foi possível realizar a liberação no momento.');
      }
    } catch (err: any) {
      setStep('error');
      setErrorMsg(err.message || 'Erro de conexão ao tentar liberar o serviço.');
    }
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
              <Unlock className="w-6 h-6 text-[#00c896]" />
              Liberação por Confiança
            </h1>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-xl mx-auto w-full p-6 flex flex-col items-center justify-center">
        
        {step === 'intro' && (
          <div className="bg-white dark:bg-[#02343f] p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-[#00c896]/10 text-center space-y-6 w-full animate-in fade-in zoom-in duration-300 transition-colors">
             <div className="w-20 h-20 bg-[#00c896]/10 dark:bg-[#00c896]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-10 h-10 text-[#00c896]" />
             </div>
             
             <h2 className="text-2xl font-bold text-[#036271] dark:text-white">Precisa de mais prazo?</h2>
             
             <p className="text-slate-600 dark:text-slate-400">
               Se o seu serviço está bloqueado ou com velocidade reduzida devido ao pagamento, você pode utilizar a 
               <strong> Liberação por Confiança</strong>.
             </p>

             <div className="bg-slate-50 dark:bg-[#01252b] p-5 rounded-2xl text-left space-y-4 border border-slate-200 dark:border-[#00c896]/20">
                <div className="flex items-start gap-3">
                   <Clock className="w-5 h-5 text-[#008B87] dark:text-[#00c896] shrink-0 mt-0.5" />
                   <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Liberação por 3 Dias</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">O serviço será reativado temporariamente para dar tempo de compensar o pagamento.</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                   <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Uma vez por mês</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Este recurso só pode ser utilizado 1 vez a cada ciclo de faturamento.</p>
                   </div>
                </div>
             </div>

             <button 
               onClick={handleUnlock}
               className="w-full py-4 bg-[#00c896] hover:bg-[#008B87] text-[#036271] font-bold rounded-xl shadow-lg shadow-[#00c896]/20 transition-all transform active:scale-95 text-lg"
             >
               Solicitar Desbloqueio
             </button>
             
             <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium">
               Cancelar e Voltar
             </button>
          </div>
        )}

        {step === 'loading' && (
           <div className="text-center space-y-4">
              <Loader2 className="w-16 h-16 text-[#00c896] animate-spin mx-auto" />
              <h3 className="text-xl font-bold text-[#036271] dark:text-white">Processando solicitação...</h3>
              <p className="text-slate-500 dark:text-slate-400">Aguarde um momento enquanto contatamos a central.</p>
           </div>
        )}

        {step === 'success' && (
           <div className="bg-white dark:bg-[#02343f] p-8 rounded-3xl shadow-lg border-t-8 border-green-500 text-center space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 transition-colors">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                 <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              
              <div>
                 <h2 className="text-2xl font-bold text-[#036271] dark:text-white">Serviço Liberado!</h2>
                 <p className="text-green-600 dark:text-green-400 font-medium mt-1">Sua internet deve voltar em alguns instantes.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#01252b] p-4 rounded-xl text-left text-sm border border-slate-200 dark:border-white/10">
                 <p className="text-slate-500 dark:text-slate-400 mb-1">Protocolo:</p>
                 <p className="font-mono font-bold text-slate-800 dark:text-white tracking-wider text-lg">{result?.protocolo}</p>
                 
                 <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                    <p className="text-slate-500 dark:text-slate-400 mb-1">Mensagem da Central:</p>
                    <p className="text-slate-700 dark:text-slate-300 italic">"{result?.msg}"</p>
                 </div>
              </div>

              <button 
                onClick={onBack}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
              >
                Voltar ao Início
              </button>
           </div>
        )}

        {step === 'error' && (
           <div className="bg-white dark:bg-[#02343f] p-8 rounded-3xl shadow-lg border-t-8 border-red-500 text-center space-y-6 w-full animate-in shake transition-colors">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                 <XCircle className="w-10 h-10 text-red-500" />
              </div>
              
              <div>
                 <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Não foi possível liberar</h2>
                 <p className="text-slate-500 dark:text-slate-400 mt-2">A solicitação foi recusada pelo sistema.</p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl text-left border border-red-100 dark:border-red-900/30">
                 <p className="text-red-800 dark:text-red-300 text-sm font-medium flex gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    {errorMsg}
                 </p>
              </div>

              <button 
                onClick={onBack}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
              >
                Voltar
              </button>
           </div>
        )}

      </main>
    </div>
  );
};
