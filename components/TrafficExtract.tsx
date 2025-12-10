
import React, { useState, useEffect } from 'react';
import { SGPContract, SGPTrafficResponse } from '../types';
import { APIService } from '../services/apiService';
import { 
  ArrowLeft, 
  Activity, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Loader2,
  Calendar,
  Monitor,
  Wifi,
  Filter
} from 'lucide-react';

interface TrafficExtractProps {
  contract: SGPContract;
  userCpfCnpj: string;
  userPassword?: string;
  onBack: () => void;
}

export const TrafficExtract: React.FC<TrafficExtractProps> = ({ contract, userCpfCnpj, userPassword, onBack }) => {
  const [trafficData, setTrafficData] = useState<SGPTrafficResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Date State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchTraffic();
  }, [selectedMonth, selectedYear]);

  const fetchTraffic = async () => {
    if (!userPassword) return;
    setIsLoading(true);
    try {
      const data = await APIService.getTrafficExtract(
        userCpfCnpj, 
        userPassword, 
        contract.id_contrato,
        selectedMonth,
        selectedYear
      );
      setTrafficData(data);
    } catch (error) {
      console.error("Failed to load traffic data", error);
      setTrafficData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals manually from list to ensure accuracy or use API total
  const getTotalDownload = () => trafficData?.list.reduce((acc, curr) => acc + curr.download, 0) || 0;
  const getTotalUpload = () => trafficData?.list.reduce((acc, curr) => acc + curr.upload, 0) || 0;

  // Aggregate data by day for the chart
  const getDailyUsage = () => {
    if (!trafficData?.list) return [];
    
    const dailyMap = new Map<string, number>();
    
    trafficData.list.forEach(session => {
        // Assuming session.data is YYYY-MM-DD
        const day = session.data.split('-')[2]; // Get DD
        const total = session.download + session.upload;
        
        if (dailyMap.has(day)) {
            dailyMap.set(day, dailyMap.get(day)! + total);
        } else {
            dailyMap.set(day, total);
        }
    });

    return Array.from(dailyMap.entries())
        .map(([day, bytes]) => ({ day, bytes }))
        .sort((a, b) => parseInt(a.day) - parseInt(b.day));
  };

  const dailyData = getDailyUsage();
  const maxDailyBytes = Math.max(...dailyData.map(d => d.bytes), 1); // Avoid div by zero

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const years = [2023, 2024, 2025, 2026];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#01252b] flex flex-col font-['Montserrat'] transition-colors duration-300">
      {/* Header */}
      <div className="bg-[#036271] p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button 
                onClick={onBack}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
                <h1 className="text-2xl font-bold font-['Righteous'] text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-[#00c896]" />
                Extrato de Uso
                </h1>
            </div>
          </div>

          {/* Date Filter Bar */}
          <div className="flex gap-2 items-center bg-[#005260] p-2 rounded-xl border border-[#00c896]/20 max-w-sm">
             <Filter className="w-4 h-4 text-[#00c896] ml-2" />
             <select 
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(Number(e.target.value))}
               className="bg-transparent text-white text-sm font-semibold outline-none cursor-pointer flex-1"
             >
                {months.map(m => (
                    <option key={m.value} value={m.value} className="text-slate-800">{m.label}</option>
                ))}
             </select>
             <div className="w-px h-4 bg-white/20"></div>
             <select 
               value={selectedYear}
               onChange={(e) => setSelectedYear(Number(e.target.value))}
               className="bg-transparent text-white text-sm font-semibold outline-none cursor-pointer"
             >
                {years.map(y => (
                    <option key={y} value={y} className="text-slate-800">{y}</option>
                ))}
             </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-6">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#00c896] mb-2" />
            <p>Calculando tráfego...</p>
          </div>
        ) : !trafficData ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white dark:bg-[#02343f] rounded-3xl shadow-sm border border-slate-200 dark:border-[#00c896]/10">
             <Wifi className="w-12 h-12 text-slate-200 dark:text-slate-600 mb-2" />
             <p className="font-semibold">Nenhum dado encontrado para este período.</p>
             <p className="text-xs mt-1">Tente selecionar outro mês.</p>
           </div>
        ) : (
          <>
            {/* Cards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#02343f] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
                            <ArrowDownCircle className="w-4 h-4 text-green-500" />
                            Download
                        </p>
                        <h2 className="text-2xl font-bold text-[#036271] dark:text-white">
                            {APIService.bytesToGB(getTotalDownload())}
                        </h2>
                    </div>
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <ArrowDownCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#02343f] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
                            <ArrowUpCircle className="w-4 h-4 text-blue-500" />
                            Upload
                        </p>
                        <h2 className="text-2xl font-bold text-[#036271] dark:text-white">
                            {APIService.bytesToGB(getTotalUpload())}
                        </h2>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <ArrowUpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </div>

            {/* Daily Chart */}
            {dailyData.length > 0 && (
                <div className="bg-white dark:bg-[#02343f] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10">
                    <h3 className="font-bold text-[#036271] dark:text-white mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#00c896]" />
                        Consumo Diário (GB)
                    </h3>
                    
                    <div className="flex items-end gap-2 h-40 w-full overflow-x-auto pb-2">
                        {dailyData.map((d) => {
                            const heightPercent = (d.bytes / maxDailyBytes) * 100;
                            const gbValue = parseFloat(APIService.bytesToGB(d.bytes).split(' ')[0].replace(',', '.'));
                            return (
                                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 min-w-[20px] group">
                                    <div className="relative w-full flex justify-center h-full items-end">
                                        <div 
                                            style={{ height: `${heightPercent}%` }} 
                                            className="w-full max-w-[30px] bg-[#00c896] rounded-t-md opacity-70 group-hover:opacity-100 transition-all relative"
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                                {gbValue.toFixed(1)} GB
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Detail List */}
            <div className="bg-white dark:bg-[#02343f] rounded-3xl shadow-sm border border-slate-100 dark:border-[#00c896]/10 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-[#036271] dark:text-white flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-[#00c896]" />
                        Histórico de Conexões
                    </h3>
                </div>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {trafficData.list.map((session, idx) => (
                        <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-[#036271]/20 transition-colors">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                                    {APIService.formatDate(session.dataini)}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    IP: {session.ip} • Duração: {(parseFloat(session.tempo) / 3600).toFixed(1)}h
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 uppercase">Download</p>
                                    <p className="font-bold text-[#036271] dark:text-[#00c896]">{APIService.bytesToGB(session.download)}</p>
                                </div>
                                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 uppercase">Upload</p>
                                    <p className="font-bold text-[#036271] dark:text-[#00c896]">{APIService.bytesToGB(session.upload)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
