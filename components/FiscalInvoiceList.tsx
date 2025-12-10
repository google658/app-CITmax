
import React, { useState, useEffect } from 'react';
import { SGPContract, SGPFiscalInvoice } from '../types';
import { APIService } from '../services/apiService';
import { 
  ArrowLeft, 
  Scroll, 
  Download, 
  Loader2,
  Building2
} from 'lucide-react';

interface FiscalInvoiceListProps {
  contract: SGPContract;
  onBack: () => void;
}

export const FiscalInvoiceList: React.FC<FiscalInvoiceListProps> = ({ contract, onBack }) => {
  const [invoices, setInvoices] = useState<SGPFiscalInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFiscalInvoices();
  }, []);

  const fetchFiscalInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await APIService.getFiscalInvoices(contract.id_contrato);
      setInvoices(data);
    } catch (error) {
      console.error("Failed to load fiscal invoices", error);
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
            <h1 className="text-2xl font-bold font-['Righteous'] text-white flex items-center gap-2">
              <Scroll className="w-6 h-6 text-[#00c896]" />
              Notas Fiscais
            </h1>
            <p className="text-[#00c896] text-xs mt-1">
              Documentos fiscais do contrato #{contract.id_contrato}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#00c896] mb-2" />
            <p>Carregando notas fiscais...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white dark:bg-[#02343f] rounded-3xl shadow-sm border border-slate-200 dark:border-[#00c896]/10">
             <Scroll className="w-12 h-12 text-slate-200 dark:text-slate-600 mb-2" />
             <p className="font-semibold">Nenhuma nota fiscal encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div 
                key={invoice.numero} 
                className="w-full bg-white dark:bg-[#02343f] rounded-2xl p-5 border border-slate-100 dark:border-[#00c896]/10 shadow-sm transition-all hover:shadow-md hover:border-[#00c896]/30 group relative overflow-hidden"
              >
                 <div className="flex flex-col md:flex-row justify-between gap-4">
                    
                    <div className="flex gap-4">
                        <div className="p-3 bg-[#036271]/5 dark:bg-[#00c896]/10 rounded-2xl shrink-0 h-fit">
                            <Building2 className="w-6 h-6 text-[#036271] dark:text-[#00c896]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Emissão:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {APIService.formatDate(invoice.data_emissao)}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-[#036271] dark:text-white mb-1">
                                Nota Fiscal #{invoice.numero}
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mb-2">
                                Série {invoice.serie} • {invoice.empresa_razao_social}
                            </p>
                            <p className="text-xl font-bold text-[#00c896]">
                                {APIService.formatCurrency(invoice.valor_total)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <a 
                            href={invoice.link_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full md:w-auto px-6 py-3 bg-slate-50 dark:bg-[#01252b] hover:bg-[#036271] dark:hover:bg-[#00c896] text-[#036271] dark:text-[#00c896] hover:text-white dark:hover:text-[#036271] border border-slate-200 dark:border-[#00c896]/20 hover:border-[#036271] dark:hover:border-[#00c896] rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Visualizar PDF
                        </a>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
