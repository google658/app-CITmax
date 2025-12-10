
import React, { useState, useEffect } from 'react';
import { SGPContract, SGPInvoice } from '../types';
import { APIService } from '../services/apiService';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  Copy, 
  CreditCard, 
  Loader2,
  Calendar,
  DollarSign,
  ChevronRight
} from 'lucide-react';

interface InvoiceListProps {
  contract: SGPContract;
  userCpfCnpj: string;
  userPassword?: string;
  onBack: () => void;
  onSelectInvoice: (invoice: SGPInvoice) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ contract, userCpfCnpj, userPassword, onBack, onSelectInvoice }) => {
  const [invoices, setInvoices] = useState<SGPInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    if (!userPassword) return;
    setIsLoading(true);
    try {
      const data = await APIService.getInvoices(userCpfCnpj, userPassword, contract.id_contrato);
      setInvoices(data);
    } catch (error) {
      console.error("Failed to load invoices", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPaid = (invoice: SGPInvoice) => {
    const sit = invoice.situacao?.toLowerCase() || '';
    return sit.includes('pago') || sit.includes('liquidado') || !!invoice.data_pagamento;
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
            <h1 className="text-2xl font-bold font-['Righteous'] text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#00c896]" />
              Minhas Faturas
            </h1>
            <p className="text-[#00c896] text-xs mt-1">
              Histórico financeiro do contrato #{contract.id_contrato}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#00c896] mb-2" />
            <p>Carregando histórico...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white dark:bg-[#02343f] rounded-3xl shadow-sm border border-slate-200 dark:border-[#00c896]/10">
             <CheckCircle className="w-12 h-12 text-slate-200 dark:text-slate-600 mb-2" />
             <p className="font-semibold">Nenhuma fatura encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => {
              const paid = isPaid(invoice);
              const isOpen = !paid;
              const isLate = isOpen && new Date(invoice.vencimento) < new Date();
              
              return (
                <button 
                  key={invoice.id} 
                  onClick={() => onSelectInvoice(invoice)}
                  className={`w-full text-left bg-white dark:bg-[#02343f] rounded-2xl p-5 border transition-all hover:shadow-md hover:border-[#00c896]/30 group relative overflow-hidden ${
                    isLate ? 'border-red-200 dark:border-red-900/50 shadow-sm' : 'border-slate-100 dark:border-[#00c896]/10 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    
                    {/* Info */}
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl shrink-0 transition-colors ${
                        paid ? 'bg-green-50 dark:bg-green-900/20' : isLate ? 'bg-red-50 dark:bg-red-900/20' : 'bg-[#036271]/5 dark:bg-[#00c896]/10'
                      }`}>
                        <Calendar className={`w-6 h-6 ${
                           paid ? 'text-green-700 dark:text-green-400' : isLate ? 'text-red-700 dark:text-red-400' : 'text-[#036271] dark:text-[#00c896]'
                        }`} />
                      </div>
                      
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Vencimento:</span>
                           <span className={`font-bold ${isLate ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                             {APIService.formatDate(invoice.vencimento)}
                           </span>
                           {isLate && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold uppercase">Atrasado</span>}
                           {paid && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-bold uppercase">Pago</span>}
                         </div>
                         
                         <div className="flex items-center gap-2">
                           <span className="text-xl font-bold text-[#036271] dark:text-white">
                             {APIService.formatCurrency(invoice.valor)}
                           </span>
                         </div>
                         
                         {invoice.descricao && (
                           <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{invoice.descricao}</p>
                         )}
                      </div>
                    </div>

                    {/* Arrow CTA */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#008B87] dark:text-[#00c896] group-hover:text-[#00c896] transition-colors pl-4 md:pl-0 border-t md:border-t-0 border-slate-50 dark:border-slate-800 pt-3 md:pt-0">
                       Ver Detalhes
                       <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
