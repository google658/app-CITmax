
import React, { useState } from 'react';
import { SGPInvoice } from '../types';
import { APIService } from '../services/apiService';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  CheckCircle, 
  Calendar, 
  DollarSign,
  QrCode,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface InvoiceDetailProps {
  invoice: SGPInvoice;
  onBack: () => void;
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, onBack }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const isPaid = (invoice.situacao?.toLowerCase() || '').includes('pago') || !!invoice.data_pagamento;
  const isLate = !isPaid && new Date(invoice.vencimento) < new Date();
  
  // Logic to determine values
  const originalValue = Number(invoice.valor || 0);
  const correctedValue = Number(invoice.valor_corrigido || 0);
  
  // Show corrected if it exists, is different from original, and invoice is NOT paid (paid usually shows formatted original or paid amount)
  const hasCorrection = !isPaid && correctedValue > 0 && Math.abs(correctedValue - originalValue) > 0.01;

  const displayValue = hasCorrection ? correctedValue : originalValue;

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
          <h1 className="text-xl font-bold font-['Righteous'] text-white">
            Detalhes da Fatura
          </h1>
        </div>
      </div>

      <main className="flex-1 max-w-xl mx-auto w-full p-4 md:p-6 space-y-6">
        
        {/* Status Card */}
        <div className="bg-white dark:bg-[#02343f] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-[#00c896]/10 text-center relative overflow-hidden transition-colors">
           <div className={`absolute top-0 left-0 w-full h-1.5 ${
             isPaid ? 'bg-green-500' : isLate ? 'bg-red-500' : 'bg-[#00c896]'
           }`}></div>
           
           <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
              isPaid 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                : isLate 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                  : 'bg-[#00c896]/10 text-[#036271] dark:text-[#00c896]'
           }`}>
             {invoice.situacao || (isPaid ? 'Pago' : 'Aberto')}
           </span>

           <h2 className="text-4xl font-bold text-[#036271] dark:text-white mb-1">
             {APIService.formatCurrency(displayValue)}
           </h2>
           <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-4">
             {hasCorrection ? 'Valor Atualizado' : 'Valor Total'}
           </p>

           {hasCorrection && (
             <div className="flex flex-col items-center justify-center gap-2 mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#01252b] border border-slate-100 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400">
                   <span>Valor Original:</span>
                   <span className="font-semibold text-slate-700 dark:text-slate-300 decoration-slate-400">
                     {APIService.formatCurrency(originalValue)}
                   </span>
                </div>
                <div className="text-xs text-[#008B87] dark:text-[#00c896]">
                   (Inclui juros e correções)
                </div>
             </div>
           )}

           <div className="mt-2 flex items-center justify-center gap-6 text-sm border-t border-slate-50 dark:border-white/10 pt-4">
              <div className="text-center">
                 <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-bold mb-1">Vencimento</p>
                 <p className={`font-bold text-lg ${isLate && !isPaid ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {APIService.formatDate(invoice.vencimento)}
                 </p>
              </div>
              {isPaid && invoice.data_pagamento && (
                <div className="text-center">
                    <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-bold mb-1">Pago em</p>
                    <p className="font-bold text-lg text-green-600 dark:text-green-400">
                        {APIService.formatDate(invoice.data_pagamento)}
                    </p>
                </div>
              )}
           </div>
        </div>

        {/* Actions for OPEN invoices */}
        {!isPaid && (
          <>
            {/* Pix Section */}
            {invoice.codigo_pix && (
              <div className="bg-white dark:bg-[#02343f] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-[#00c896]/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#00c896]/10 rounded-lg">
                    <QrCode className="w-6 h-6 text-[#00c896]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#036271] dark:text-white">Pagamento via Pix</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Copie o código abaixo e cole no seu banco</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-[#01252b] p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 mb-3 relative group">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all line-clamp-2">
                    {invoice.codigo_pix}
                  </p>
                </div>

                <button 
                  onClick={() => handleCopy(invoice.codigo_pix!, 'pix')}
                  className="w-full py-3 bg-[#00c896] hover:bg-[#008B87] text-[#036271] rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00c896]/20"
                >
                  {copiedField === 'pix' ? (
                    <> <CheckCircle className="w-5 h-5" /> Copiado! </>
                  ) : (
                    <> <Copy className="w-5 h-5" /> Copiar Código Pix </>
                  )}
                </button>
              </div>
            )}

            {/* Barcode Section */}
            {invoice.linha_digitavel && (
              <div className="bg-white dark:bg-[#02343f] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-[#00c896]/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <FileText className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 dark:text-white">Código de Barras</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Utilize para pagar via boleto bancário</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleCopy(invoice.linha_digitavel!, 'barcode')}
                  className="w-full py-3 border-2 border-slate-200 dark:border-slate-700 hover:border-[#00c896] dark:hover:border-[#00c896] hover:text-[#00c896] dark:hover:text-[#00c896] text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {copiedField === 'barcode' ? (
                    <> <CheckCircle className="w-5 h-5" /> Copiado! </>
                  ) : (
                    <> <Copy className="w-5 h-5" /> Copiar Código </>
                  )}
                </button>
              </div>
            )}

            {/* PDF Button */}
            {invoice.link_boleto && (
               <a 
                 href={invoice.link_boleto}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="block w-full bg-white dark:bg-[#02343f] border border-slate-200 dark:border-[#00c896]/30 text-[#036271] dark:text-[#00c896] hover:bg-slate-50 dark:hover:bg-[#036271]/20 py-4 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 shadow-sm"
               >
                 <Download className="w-5 h-5" />
                 Baixar Boleto (PDF)
               </a>
            )}
          </>
        )}

        {/* Actions for PAID invoices */}
        {isPaid && invoice.link_recibo && (
           <a 
             href={invoice.link_recibo}
             target="_blank"
             rel="noopener noreferrer"
             className="block w-full bg-white dark:bg-[#02343f] border border-[#00c896] text-[#00c896] hover:bg-green-50 dark:hover:bg-green-900/10 py-4 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 shadow-sm"
           >
             <FileText className="w-5 h-5" />
             Visualizar Recibo
           </a>
        )}
        
        {isPaid && !invoice.link_recibo && invoice.link_boleto && (
           <a 
             href={invoice.link_boleto}
             target="_blank"
             rel="noopener noreferrer"
             className="block w-full bg-white dark:bg-[#02343f] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 py-4 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 shadow-sm"
           >
             <Download className="w-5 h-5" />
             Baixar Fatura Original
           </a>
        )}

        <div className="text-center pt-4">
           <p className="text-xs text-slate-400 dark:text-slate-500">
             Caso tenha dúvidas sobre esta cobrança, entre em contato com o suporte.
           </p>
        </div>

      </main>
    </div>
  );
};
