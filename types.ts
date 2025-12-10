

// Type definitions for the SGP API response
export interface SGPContract {
  id_contrato: number | string;
  id_cliente?: number | string;
  razao_social: string; // Mapped from nome/cliente/razao_social
  nome_fantasia?: string;
  cnpj_cpf?: string;
  contrato?: string; // Sometimes redundant with id_contrato
  status: string; // e.g., "A", "I", "Ativo"
  data_cadastro?: string;
  endereco: string;
  numero?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep?: string;
  plano: string;
  valor: string | number;
}

export interface SGPInvoice {
  id: string | number;
  vencimento: string;
  vencimento_atualizado?: string;
  valor: string | number;
  valor_corrigido?: string | number; // For overdue updates
  valor_pago?: string | number;
  data_pagamento?: string;
  situacao?: string; // "Pago", "Aberto", "Pendente", "Gerado"
  linha_digitavel?: string;
  codigo_pix?: string; // Pix Copy Paste
  link_boleto?: string; // PDF Link
  link_recibo?: string; // Receipt Link
  descricao?: string;
}

export interface SGPFiscalInvoice {
  numero: number;
  serie: string;
  data_emissao: string;
  valor_total: number;
  link_pdf: string;
  empresa_razao_social: string;
  status: number; // 2 usually means emitted
  descricao?: string;
}

export interface SGPTrafficSession {
  data: string; // Date "YYYY-MM-DD"
  dataini: string; // ISO datetime
  datafim?: string | null;
  download: number; // bytes
  upload: number; // bytes
  total: number; // bytes
  tempo: string;
  ip: string;
  mac: string;
}

export interface SGPTrafficResponse {
  ano: string;
  mes: string;
  plano: string;
  login: string;
  total: number;
  list: SGPTrafficSession[];
}

export interface SGPRadiusSession {
  username: string;
  acctstarttime: string; // ISO Date
  acctstoptime: string | null; // ISO Date or null if online
  acctinputoctets: number; // Upload (usually)
  acctoutputoctets: number; // Download (usually)
  acctterminatecause: string | null; // e.g. "User-Request", "Lost-Carrier"
  nasipaddress: string;
  framedipaddress: string; // IP
  callingstationid: string; // MAC
  acctsessionid: string;
}

export interface SGPRadiusResult extends SGPRadiusSession {
  pppoe_login: string;
  pppoe_senha?: string;
  online: boolean;
  ip: string;
  mac: string; // Sometimes at root, sometimes in radacct
  plano?: string;
  endereco_logradouro?: string;
  endereco_numero?: number | string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  radacct?: SGPRadiusSession[];
  servico_id?: number | string;
}

export interface SGPUnlockResponse {
  status: number; // 1 = success, 0 = fail
  razaosocial: string;
  protocolo: string;
  liberado: boolean;
  msg: string;
}

export interface SGPTicketResponse {
  status: number;
  msg: string;
  protocolo?: string;
  id_chamado?: string | number;
}

export interface UserSession {
  cpfCnpj: string;
  password?: string; // Required for subsequent API calls in this specific integration
  token?: string; 
  contracts: SGPContract[];
}

export enum AppView {
  LOGIN = 'LOGIN',
  CONTRACT_SELECTION = 'CONTRACT_SELECTION',
  DASHBOARD = 'DASHBOARD',
  INVOICES = 'INVOICES',
  INVOICE_DETAIL = 'INVOICE_DETAIL',
  FISCAL_INVOICES = 'FISCAL_INVOICES',
  TRAFFIC_EXTRACT = 'TRAFFIC_EXTRACT',
  CONNECTION_HISTORY = 'CONNECTION_HISTORY',
  UNLOCK_SERVICE = 'UNLOCK_SERVICE',
  WEBVIEW = 'WEBVIEW',
  WIFI_MANAGER = 'WIFI_MANAGER',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_PANEL = 'ADMIN_PANEL'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// --- ADMIN TYPES ---

export interface BannerConfig {
  id: number;
  src: string;
  alt: string;
  fallbackColor: string;
  fallbackText: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  sent: boolean;
}

export interface AppConfig {
  logoUrl: string; // Base64 or URL
  iconUrl: string; // Base64 or URL
  banners: BannerConfig[];
  notifications: Notification[];
}
