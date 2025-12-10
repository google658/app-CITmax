
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, X, Hexagon } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { ChatMessage, SGPContract } from '../types';
import { APIService } from '../services/apiService';

interface ChatSupportProps {
  isOpen: boolean;
  onClose: () => void;
  contract: SGPContract;
  userCpfCnpj: string;
  userPassword?: string;
}

export const ChatSupport: React.FC<ChatSupportProps> = ({ isOpen, onClose, contract, userCpfCnpj, userPassword }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [aiContext, setAiContext] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const geminiService = useRef(new GeminiService());

  // Initialize Chat with Context
  useEffect(() => {
    if (isOpen && isInitializing) {
      initializeChatContext();
    }
  }, [isOpen]);

  const initializeChatContext = async () => {
    try {
      // 1. Fetch Financial Status
      let financialInfo = "Situação Financeira: Não verificado (Senha não fornecida).";
      if (userPassword) {
        try {
            const invoices = await APIService.getInvoices(userCpfCnpj, userPassword, contract.id_contrato);
            const openInvoices = invoices.filter(i => {
                const sit = (i.situacao || '').toLowerCase();
                return !sit.includes('pago') && !sit.includes('liquidado') && !i.data_pagamento;
            });
            
            if (openInvoices.length > 0) {
                const nearest = openInvoices[0];
                const isLate = new Date(nearest.vencimento) < new Date();
                financialInfo = `Situação Financeira: O cliente possui ${openInvoices.length} fatura(s) em aberto.\nA mais antiga venceu em ${APIService.formatDate(nearest.vencimento)} no valor de ${APIService.formatCurrency(nearest.valor)}.\nStatus Geral: ${isLate ? 'INADIMPLENTE/EM ATRASO' : 'EM DIA (A vencer)'}.`;
            } else {
                financialInfo = "Situação Financeira: O cliente está rigorosamente em dia. Nenhuma fatura pendente de pagamento.";
            }
        } catch (e) {
            financialInfo = "Situação Financeira: Erro ao consultar faturas.";
        }
      }

      // 2. Fetch Technical Status
      let techInfo = "Status da Conexão: Não verificado.";
      if (userPassword) {
        try {
            const connections = await APIService.getConnectionDiagnostics(userCpfCnpj, userPassword, contract.id_contrato);
            // Smart Match Logic
            const activeConn = connections.find(c => c.online) || (connections.length > 0 ? connections[0] : undefined);

            if (activeConn) {
                techInfo = `
=== DIAGNÓSTICO TÉCNICO ===
Status Atual: ${activeConn.online ? 'ONLINE (Conectado)' : 'OFFLINE (Sem conexão no momento)'}
IP Atual: ${activeConn.ip || 'Sem IP'}
MAC Address: ${activeConn.mac || 'N/A'}
Login PPPoE: ${activeConn.pppoe_login}
Início da Sessão: ${new Date(activeConn.acctstarttime).toLocaleString('pt-BR')}
Consumo na Sessão: Down ${APIService.bytesToGB(activeConn.acctoutputoctets)} / Up ${APIService.bytesToGB(activeConn.acctinputoctets)}
                `;
            } else {
                techInfo = "Status da Conexão: Nenhuma conexão ativa encontrada recentemente.";
            }
        } catch (e) {
            techInfo = "Status da Conexão: Erro ao buscar diagnóstico técnico.";
        }
      }

      // 3. Determine Contract Health Message
      const statusLower = (contract.status || '').toLowerCase();
      let contractStatusMsg = `Status do Contrato: ${contract.status}`;
      
      if (statusLower.includes('reduzido')) {
          contractStatusMsg = "ALERTA: O contrato está em velocidade REDUZIDA por atraso no pagamento. A internet funciona mas está propositalmente lenta. O cliente precisa pagar a fatura ou usar o Desbloqueio de Confiança.";
      } else if (statusLower.includes('suspenso') || statusLower.includes('bloqueado')) {
          contractStatusMsg = "ALERTA CRÍTICO: O contrato está SUSPENSO por inadimplência. A internet NÃO vai funcionar até que o pagamento seja realizado e compensado (ou via desbloqueio de confiança).";
      }

      // 4. Build Rich Context String
      const context = `
=== DADOS DO SISTEMA ===
Data e Hora Atual do Suporte: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}

=== DADOS DO CLIENTE ===
Nome: ${contract.razao_social}
Contrato ID: ${contract.id_contrato}
Plano Contratado: ${contract.plano}
${contractStatusMsg}
Endereço de Instalação: ${contract.endereco}, ${contract.numero} - ${contract.bairro}, ${contract.cidade}/${contract.estado}

=== FINANCEIRO ===
${financialInfo}

${techInfo}

INSTRUÇÕES ESPECÍFICAS:
- Se status for REDUZIDO ou SUSPENSO, explique que o problema é financeiro, não técnico. Indique o pagamento ou Desbloqueio de Confiança.
- Se o cliente estiver OFFLINE, sugira verificar cabos e reiniciar a ONU.
- Se o cliente quiser abrir chamado, pergunte o telefone e tente usar a ferramenta disponível.
- Use a data e hora atual para contextualizar (ex: "Bom dia", "Boa tarde").
      `;

      setAiContext(context);
      
      // Set initial greeting
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: `Olá, ${contract.razao_social.split(' ')[0]}! Sou o assistente virtual da CITmax.
Analisei sua conexão e situação financeira. Como posso ajudar você hoje?`,
          timestamp: new Date()
        }
      ]);

    } catch (e) {
      console.error("Error init chat context", e);
      // Fallback
      setMessages([{
          id: 'welcome',
          role: 'model',
          text: `Olá! Sou a IA da CITmax. Como posso ajudar?`,
          timestamp: new Date()
      }]);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass history AND the Rich Context to the service
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      // Pass credentials to allow tool usage (Open Ticket)
      const credentials = {
          cpfCnpj: userCpfCnpj,
          password: userPassword,
          contractId: contract.id_contrato
      };

      const responseText = await geminiService.current.sendMessage(history, userMsg.text, aiContext, credentials);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#036271]/60 backdrop-blur-sm p-0 sm:p-4 font-['Montserrat']">
      <div className="bg-slate-50 w-full sm:max-w-lg h-[90vh] sm:h-[650px] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 ring-1 ring-white/10">
        
        {/* Header */}
        <div className="bg-[#036271] p-5 flex items-center justify-between shrink-0 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00c896] rounded-full opacity-10 blur-xl"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10">
              <Bot className="w-6 h-6 text-[#00c896]" />
            </div>
            <div>
              <h3 className="font-bold text-white font-['Righteous'] text-lg">CITmax Help</h3>
              <p className="text-[#00c896] text-xs flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 bg-[#00c896] rounded-full animate-pulse shadow-[0_0_8px_#00c896]"></span>
                IA Conectada
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors relative z-10">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {isInitializing ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-slate-50">
                <Loader2 className="w-10 h-10 text-[#00c896] animate-spin" />
                <p className="text-slate-500 text-sm font-medium">Analisando contrato e conexão...</p>
            </div>
        ) : (
            <>
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50">
                {messages.map((msg) => (
                    <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                        msg.role === 'user' ? 'bg-[#036271] border-[#036271]' : 'bg-white border-slate-100'
                    }`}>
                        {msg.role === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                        ) : (
                        <Hexagon className="w-5 h-5 text-[#00c896]" />
                        )}
                    </div>
                    
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                        msg.role === 'user' 
                        ? 'bg-[#036271] text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                        {msg.text}
                    </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-100">
                        <Hexagon className="w-5 h-5 text-[#00c896] animate-pulse" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                        <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-[#00c896] rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-[#00c896] rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-[#00c896] rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <div className="flex gap-3">
                    <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Digite sua dúvida aqui..."
                    className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#00c896] focus:border-[#00c896] outline-none text-slate-700 transition-all placeholder:text-slate-400"
                    />
                    <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-3.5 bg-[#00c896] hover:bg-[#008B87] text-[#036271] rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#00c896]/20"
                    >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    </button>
                </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};
