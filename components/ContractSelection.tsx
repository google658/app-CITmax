
import React from 'react';
import { SGPContract } from '../types';
import { MapPin, ChevronRight, Hash, LogOut, Wifi, AlertTriangle, XCircle } from 'lucide-react';
import { APIService } from '../services/apiService';
import { BrandLogo } from './BrandLogo';

interface ContractSelectionProps {
  contracts: SGPContract[];
  onSelect: (contract: SGPContract) => void;
  onLogout: () => void;
  userName?: string;
}

export const ContractSelection: React.FC<ContractSelectionProps> = ({ contracts, onSelect, onLogout, userName }) => {
  
  // Format name to "Title Case" instead of all uppercase or lowercase
  const formatName = (name?: string) => {
    if (!name) return 'Cliente';
    const words = name.toLowerCase().split(' ');
    // Filter out empty strings and capitalize first letter
    return words
      .filter(w => w.length > 0)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Determine status display props
  const getStatusInfo = (status: any) => {
    const s = String(status || '').toLowerCase();
    
    if (['a', 'ativo', '1', 'liberado', 'normal', 'true'].includes(s)) {
      return { 
        label: 'ATIVO', 
        className: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
      };
    }
    
    if (s.includes('reduzido')) {
      return { 
        label: 'REDUZIDO', 
        className: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        icon: <AlertTriangle className="w-3 h-3 mr-1" />
      };
    }

    if (s.includes('suspenso') || s.includes('bloqueado') || ['i', 'inativo', '0', 'false'].includes(s)) {
      return { 
        label: 'SUSPENSO', 
        className: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: <XCircle className="w-3 h-3 mr-1" />
      };
    }

    if (['c', 'cancelado'].includes(s)) {
      return { label: 'CANCELADO', className: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700' };
    }

    // Default Fallback
    return { label: String(status).toUpperCase(), className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#01252b] flex flex-col font-['Montserrat'] transition-colors duration-300">
      {/* Header */}
      <div className="bg-[#036271] text-white p-6 shadow-lg relative overflow-hidden shrink-0">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c896] rounded-full opacity-10 blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-3xl mx-auto flex items-center justify-between relative z-10">
          <div>
             <div className="mb-3 opacity-90">
                <BrandLogo variant="white" className="h-12" />
             </div>
            <h1 className="text-2xl font-bold font-['Righteous']">
              Olá, {formatName(userName)}
            </h1>
            <p className="text-[#00c896] text-sm mt-1">
              Encontramos {contracts.length} contrato(s). Selecione um para continuar:
            </p>
          </div>
          <button 
            onClick={onLogout}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto grid gap-4">
          {contracts.map((contract, index) => {
            const statusInfo = getStatusInfo(contract.status);
            
            return (
              <button
                key={contract.id_contrato || index}
                onClick={() => onSelect(contract)}
                className="group bg-white dark:bg-[#02343f] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-[#00c896]/20 hover:shadow-md hover:border-[#00c896] dark:hover:border-[#00c896] transition-all text-left flex items-center justify-between relative overflow-hidden w-full"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#036271] group-hover:bg-[#00c896] transition-colors"></div>
                
                <div className="space-y-3 pl-2 w-full">
                  {/* Header Line: ID and Status */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="px-3 py-1 bg-slate-100 dark:bg-[#036271]/50 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1 group-hover:bg-[#00c896]/20 group-hover:text-[#036271] dark:group-hover:text-[#00c896] transition-colors">
                      <Hash className="w-3 h-3" />
                      ID: {contract.id_contrato}
                    </div>
                    
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border flex items-center ${statusInfo.className}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Main Content: Plan and Price */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pr-0 sm:pr-8 gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-[#036271] dark:text-white group-hover:text-[#00c896] transition-colors flex items-center gap-2">
                        <Wifi className="w-5 h-5 shrink-0" />
                        {contract.plano || 'Plano Padrão'}
                      </h3>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
                        {APIService.formatCurrency(contract.valor)} <span className="text-xs font-normal">/ mês</span>
                      </p>
                    </div>
                  </div>

                  {/* Footer: Address */}
                  <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 text-sm border-t border-slate-100 dark:border-[#00c896]/10 pt-3 mt-1 w-full">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#008B87]" />
                    <span className="leading-snug text-xs sm:text-sm uppercase break-words w-full">
                      {contract.endereco}, {contract.numero}
                      {contract.bairro ? ` - ${contract.bairro}` : ''}
                      {contract.cidade ? ` - ${contract.cidade}` : ''}
                      {contract.estado ? `/${contract.estado}` : ''}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-[#036271] group-hover:bg-[#00c896] group-hover:text-[#036271] transition-all shadow-sm shrink-0 ml-4">
                  <ChevronRight className="w-6 h-6 dark:text-white" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="p-6 text-center text-slate-400 text-xs">
         CITmax Tecnologia - Conectando você ao que importa.
      </div>
    </div>
  );
};
