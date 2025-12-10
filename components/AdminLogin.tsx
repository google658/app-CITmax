
import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate Network Request
    setTimeout(() => {
        if (email === 'clebson@citmax.com.br' && password === '10203040') {
            onSuccess();
        } else {
            setError('Credenciais inválidas. Acesso negado.');
        }
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#036271] p-8 text-center relative">
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-[#00c896]" />
          </div>
          <h1 className="text-2xl font-bold text-white font-['Righteous']">Painel Admin</h1>
          <p className="text-[#00c896] text-sm">Acesso Restrito</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                {error}
            </div>
          )}

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label>
             <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00c896] transition-colors"
                  placeholder="admin@citmax.com.br"
                />
             </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label>
             <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00c896] transition-colors"
                  placeholder="••••••••"
                />
             </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#00c896] hover:bg-[#008B87] text-[#036271] font-bold rounded-xl transition-all shadow-lg shadow-[#00c896]/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar no Painel'}
          </button>
        </form>
      </div>
    </div>
  );
};
