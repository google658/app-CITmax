
import React, { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import { AdminProvider } from './contexts/AdminContext';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { ContractSelection } from './components/ContractSelection';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceDetail } from './components/InvoiceDetail';
import { FiscalInvoiceList } from './components/FiscalInvoiceList';
import { TrafficExtract } from './components/TrafficExtract';
import { ConnectionHistory } from './components/ConnectionHistory';
import { UnlockService } from './components/UnlockService';
import { WebViewContainer } from './components/WebViewContainer';
import { WifiManager } from './components/WifiManager';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { AppView, SGPContract, UserSession, SGPInvoice } from './types';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedContract, setSelectedContract] = useState<SGPContract | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | number | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<SGPInvoice | null>(null);
  const [webViewConfig, setWebViewConfig] = useState<{url: string, title: string} | null>(null);

  const handleLoginSuccess = (contracts: SGPContract[], cpfCnpj: string, password?: string) => {
    const newSession = {
      contracts,
      cpfCnpj,
      password 
    };
    setSession(newSession);

    if (contracts.length === 1) {
      handleContractSelect(contracts[0]);
    } else {
      setCurrentView(AppView.CONTRACT_SELECTION);
    }
  };

  const handleContractSelect = (contract: SGPContract) => {
    setSelectedContractId(contract.id_contrato);
    setSelectedContract(contract);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleChangeContract = () => {
    setSelectedContract(null);
    setSelectedContractId(null);
    setCurrentView(AppView.CONTRACT_SELECTION);
  };

  const handleLogout = () => {
    setSession(null);
    setSelectedContract(null);
    setSelectedContractId(null);
    setCurrentView(AppView.LOGIN);
  };

  const handleSelectInvoice = (invoice: SGPInvoice) => {
    setSelectedInvoice(invoice);
    setCurrentView(AppView.INVOICE_DETAIL);
  };

  const handleOpenWebView = (url: string, title: string) => {
    setWebViewConfig({ url, title });
    setCurrentView(AppView.WEBVIEW);
  };

  return (
    <div className="font-sans h-full bg-slate-50 dark:bg-[#01252b] transition-colors duration-300">
      
      {/* AUTH ROUTES */}
      {currentView === AppView.LOGIN && (
        <LoginForm 
          onLoginSuccess={handleLoginSuccess} 
          onAdminClick={() => setCurrentView(AppView.ADMIN_LOGIN)}
        />
      )}

      {currentView === AppView.ADMIN_LOGIN && (
        <AdminLogin 
          onSuccess={() => setCurrentView(AppView.ADMIN_PANEL)}
          onBack={() => setCurrentView(AppView.LOGIN)}
        />
      )}

      {currentView === AppView.ADMIN_PANEL && (
        <AdminPanel 
          onLogout={() => setCurrentView(AppView.LOGIN)}
        />
      )}

      {/* CLIENT APP ROUTES */}
      {currentView === AppView.CONTRACT_SELECTION && session && (
        <ContractSelection 
          contracts={session.contracts} 
          onSelect={handleContractSelect}
          onLogout={handleLogout}
          userName={session.contracts[0]?.razao_social}
        />
      )}
      
      {currentView === AppView.DASHBOARD && session && selectedContract && (
        <Dashboard 
          contract={selectedContract}
          userCpfCnpj={session.cpfCnpj}
          userPassword={session.password || ''}
          onLogout={handleLogout} 
          onChangeContract={session.contracts.length > 1 ? handleChangeContract : undefined}
          onViewInvoices={() => setCurrentView(AppView.INVOICES)}
          onSelectInvoice={handleSelectInvoice}
          onViewFiscalInvoices={() => setCurrentView(AppView.FISCAL_INVOICES)}
          onOpenWebView={handleOpenWebView}
          onViewTraffic={() => setCurrentView(AppView.TRAFFIC_EXTRACT)}
          onViewUnlock={() => setCurrentView(AppView.UNLOCK_SERVICE)}
          onViewConnection={() => setCurrentView(AppView.CONNECTION_HISTORY)}
          onViewWifiManager={() => setCurrentView(AppView.WIFI_MANAGER)}
        />
      )}

      {currentView === AppView.INVOICES && session && selectedContract && (
        <InvoiceList
          contract={selectedContract}
          userCpfCnpj={session.cpfCnpj}
          userPassword={session.password || ''}
          onBack={() => setCurrentView(AppView.DASHBOARD)}
          onSelectInvoice={handleSelectInvoice}
        />
      )}

      {currentView === AppView.INVOICE_DETAIL && selectedInvoice && (
        <InvoiceDetail 
          invoice={selectedInvoice}
          onBack={() => setCurrentView(AppView.INVOICES)}
        />
      )}

      {currentView === AppView.FISCAL_INVOICES && session && selectedContract && (
        <FiscalInvoiceList
          contract={selectedContract}
          onBack={() => setCurrentView(AppView.DASHBOARD)}
        />
      )}

      {currentView === AppView.TRAFFIC_EXTRACT && session && selectedContract && (
        <TrafficExtract
          contract={selectedContract}
          userCpfCnpj={session.cpfCnpj}
          userPassword={session.password || ''}
          onBack={() => setCurrentView(AppView.DASHBOARD)}
        />
      )}

      {currentView === AppView.CONNECTION_HISTORY && session && selectedContract && (
        <ConnectionHistory
          contract={selectedContract}
          userCpfCnpj={session.cpfCnpj}
          userPassword={session.password}
          onBack={() => setCurrentView(AppView.DASHBOARD)}
        />
      )}

      {currentView === AppView.WIFI_MANAGER && session && selectedContract && (
        <WifiManager
          onBack={() => setCurrentView(AppView.DASHBOARD)}
          onOpenWebView={handleOpenWebView}
        />
      )}

      {currentView === AppView.UNLOCK_SERVICE && session && selectedContract && (
        <UnlockService
          contract={selectedContract}
          userCpfCnpj={session.cpfCnpj}
          userPassword={session.password || ''}
          onBack={() => setCurrentView(AppView.DASHBOARD)}
        />
      )}

      {currentView === AppView.WEBVIEW && webViewConfig && (
        <WebViewContainer
          url={webViewConfig.url}
          title={webViewConfig.title}
          onBack={() => setCurrentView(AppView.DASHBOARD)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AdminProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AdminProvider>
  );
}

export default App;
