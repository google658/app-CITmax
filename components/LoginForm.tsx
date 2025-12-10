
import React, { useState } from 'react';
import { APIService } from '../services/apiService';
import { SGPContract } from '../types';
import { Loader2, AlertCircle, ArrowRight, Settings } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface LoginFormProps {
  onLoginSuccess: (contracts: SGPContract[], cpfCnpj: string, password?: string) => void;
  onAdminClick?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onAdminClick }) => {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfCnpj || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const contracts = await APIService.login(cpfCnpj, password);
      
      if (!contracts || contracts.length === 0) {
        throw new Error('Nenhum contrato encontrado para este usuário.');
      }
      
      // Pass password so it can be used for subsequent API calls (Invoices)
      onLoginSuccess(contracts, cpfCnpj, password);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Erro de conexão. O servidor pode estar bloqueando o acesso via navegador (CORS) ou está indisponível.');
      } else {
        setError(err.message || 'Falha ao realizar login. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#036271] relative overflow-hidden">
      {/* Decorative Background Elements based on Grid/Circuit concept */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#00c896] opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#008B87] opacity-20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
        <div className="bg-[#036271] p-10 text-center border-b border-[#008B87]/30 relative flex flex-col items-center justify-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00c896] to-[#008B87]"></div>
          
          <div className="mb-4 transform hover:scale-105 transition-transform duration-500">
             <BrandLogo variant="white" className="h-20" />
          </div>
          
          <p className="text-[#00c896] font-medium text-sm tracking-wide uppercase mt-2">Central do Assinante</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#036271] mb-2">
                CPF ou CNPJ
              </label>
              <input
                type="text"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00c896] focus:border-[#00c896] outline-none transition-all bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#036271] mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#00c896] focus:border-[#00c896] outline-none transition-all bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00c896] hover:bg-[#008B87] text-[#036271] font-bold text-lg py-4 px-4 rounded-xl transition-all shadow-lg shadow-[#00c896]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  Acessar
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <a 
              href="https://citrn.sgp.net.br/accounts/central/recuperar_senha/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-[#036271] hover:text-[#00c896] font-semibold transition-colors"
            >
              Esqueci minha senha
            </a>
            
            {onAdminClick && (
              <button 
                onClick={onAdminClick}
                className="text-xs text-slate-300 hover:text-slate-400 transition-colors flex items-center justify-center gap-1 mx-auto pt-2"
              >
                <Settings className="w-3 h-3" /> Painel Admin
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center z-10">
        <p className="text-white/80 text-sm font-medium">Conecte-se com o mundo através da CITmax.</p>
        <p className="text-white/40 text-xs mt-2">© 2024 CITmax Tecnologia</p>
      </div>
    </div>
  );
};
