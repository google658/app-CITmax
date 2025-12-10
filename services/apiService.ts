
import { SGPContract, SGPInvoice, SGPFiscalInvoice, SGPTrafficResponse, SGPUnlockResponse, SGPRadiusResult, SGPTicketResponse } from '../types';

const BASE_URL = 'https://citrn.sgp.net.br/api/central';
// Token provided for the Fiscal Invoice API and URA API
const FISCAL_APP_NAME = 'apicitmax';
const FISCAL_APP_TOKEN = '032ae0e7-7ce0-4391-a509-650573057d34';

// --- CONFIGURAÇÃO DE TESTE DE VELOCIDADE ---
const SPEEDTEST_PING_URL_PRIMARY = 'https://speedtest.citmax.com.br'; 
const SPEEDTEST_PING_URL_FALLBACK = 'https://www.google.com/generate_204'; 
const SPEEDTEST_DOWNLOAD_URL = 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Snake_River_%285mb%29.jpg'; 
const SPEEDTEST_FILE_SIZE_BITS = 5 * 1024 * 1024 * 8; 

export class APIService {
  
  /**
   * Authenticates the user and retrieves their contracts.
   */
  static async login(cpfcnpj: string, senha: string): Promise<SGPContract[]> {
    const formData = new FormData();
    formData.append('cpfcnpj', cpfcnpj);
    formData.append('senha', senha);

    try {
      const response = await fetch(`${BASE_URL}/contratos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro na conexão: ${response.statusText}`);
      }

      const jsonResponse = await response.json();
      let rawContracts: any[] = [];

      if (jsonResponse.data && Array.isArray(jsonResponse.data.contratos)) {
        rawContracts = jsonResponse.data.contratos;
      } else if (jsonResponse.contratos && Array.isArray(jsonResponse.contratos)) {
        rawContracts = jsonResponse.contratos;
      } else if (Array.isArray(jsonResponse)) {
        rawContracts = jsonResponse;
      } else if (jsonResponse.id_contrato || jsonResponse.contrato) {
        rawContracts = [jsonResponse];
      } else if (jsonResponse.erro || jsonResponse.error) {
         throw new Error(jsonResponse.erro || jsonResponse.error);
      }

      if (rawContracts.length === 0) {
        return [];
      }

      return rawContracts.map(item => {
        const getStr = (val: any) => (val !== undefined && val !== null) ? String(val).trim() : '';

        const id = getStr(item.contrato || item.id_contrato || item.id || item.cod_contrato || '0');
        
        const razaoSocial = getStr(
          item.razaosocial || item.razao_social || item.nome || item.cliente || item.nome_cliente || 'Cliente CITmax'
        );

        let enderecoData = item.endereco_instalacao || {};
        if (!item.endereco_instalacao && item.logradouro) {
             enderecoData = item;
        }

        const logradouro = getStr(enderecoData.logradouro || item.endereco || item.rua || item.endereco_res || 'Endereço não informado');
        const numero = getStr(enderecoData.numero || item.numero || item.numero_res || 'S/N');
        const bairro = getStr(enderecoData.bairro || item.bairro || item.bairro_res);
        const cidade = getStr(enderecoData.cidade || item.cidade || item.cidade_res);
        const estado = getStr(enderecoData.uf || item.estado || item.uf_res);
        const cep = getStr(enderecoData.cep || item.cep || item.cep_res);

        let planParts: string[] = [];
        let totalValue = 0;

        if (item.planointernet) {
            planParts.push(item.planointernet);
            totalValue += parseFloat(item.planointernet_valor || 0);
        }
        if (item.planotv) {
            planParts.push(item.planotv);
            totalValue += parseFloat(item.planotv_valor || 0);
        }
        if (item.planotelefonia) {
            planParts.push(item.planotelefonia);
            totalValue += parseFloat(item.planotelefonia_valor || 0);
        }
        if (item.planomultimidia) {
            planParts.push(item.planomultimidia);
            totalValue += parseFloat(item.planomultimidia_valor || 0);
        }

        if (planParts.length === 0) {
            const genericPlan = getStr(item.plano || item.descricao_plano || item.nome_plano || item.pacote);
            if (genericPlan) planParts.push(genericPlan);
            
            const genericValue = parseFloat(item.valor || item.valor_mensal || item.valor_contrato || item.preco || 0);
            if (totalValue === 0) totalValue = genericValue;
        }

        const finalPlanName = planParts.join(' + ') || 'Plano Personalizado';
        const statusRaw = getStr(item.status || item.status_internet || item.situacao || 'Ativo');

        return {
          id_contrato: id,
          id_cliente: getStr(item.id_cliente || item.cliente_id),
          razao_social: razaoSocial,
          cnpj_cpf: getStr(item.cpfcnpj || item.cnpj_cpf || item.cpf || item.cnpj || cpfcnpj),
          contrato: id,
          status: statusRaw,
          data_cadastro: getStr(item.data_cadastro || item.data_ativacao),
          endereco: logradouro,
          numero: numero,
          bairro: bairro,
          cidade: cidade,
          estado: estado,
          cep: cep,
          plano: finalPlanName,
          valor: totalValue
        };
      }) as SGPContract[];

    } catch (error: any) {
      console.error("API Login Error:", error);
      throw error;
    }
  }

  /**
   * Fetches invoices (faturas) for a specific contract.
   */
  static async getInvoices(cpfcnpj: string, senha: string, contratoId: string | number): Promise<SGPInvoice[]> {
    if (!contratoId || String(contratoId) === '0') return [];

    const formData = new FormData();
    formData.append('cpfcnpj', cpfcnpj);
    formData.append('senha', senha);
    formData.append('contrato', String(contratoId));

    try {
      const response = await fetch(`${BASE_URL}/titulos/`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Falha ao buscar faturas: ${response.statusText}`);

      const data = await response.json();
      let rawInvoices: any[] = [];

      if (data && data.data && Array.isArray(data.data.faturas)) {
          rawInvoices = data.data.faturas;
      } else if (Array.isArray(data)) {
        rawInvoices = data;
      } else if (data && Array.isArray(data.titulos)) {
        rawInvoices = data.titulos;
      } else if (data && Array.isArray(data.faturas)) {
        rawInvoices = data.faturas;
      }

      return rawInvoices.map((item: any) => ({
        id: item.id || item.id_titulo || item.numero_documento || Math.random(),
        vencimento: item.vencimento || item.data_vencimento || '',
        vencimento_atualizado: item.vencimento_atualizado,
        valor: item.valor || item.valor_titulo || item.valor_total || 0,
        valor_corrigido: item.valorcorrigido || item.valor_corrigido || item.valor,
        valor_pago: item.valor_pago || item.pago || 0,
        data_pagamento: item.data_pagamento || item.pagamento || null,
        situacao: item.status || item.situacao || (item.data_pagamento ? 'Pago' : 'Aberto'),
        linha_digitavel: item.linhadigitavel || item.linha_digitavel || item.codigo_barra || '',
        codigo_pix: item.codigopix || item.qr_code_pix || '',
        link_boleto: item.link_completo || item.link || item.url_imprimir || item.url || '',
        link_recibo: item.recibo || item.link_recibo || '',
        descricao: item.descricao || item.historico || 'Fatura Mensal'
      })).sort((a, b) => new Date(b.vencimento).getTime() - new Date(a.vencimento).getTime());

    } catch (error) {
      console.error("Error fetching invoices:", error);
      return [];
    }
  }

  /**
   * Fetches fiscal invoices (Notas Fiscais).
   */
  static async getFiscalInvoices(contractId: string | number): Promise<SGPFiscalInvoice[]> {
    const formData = new FormData();
    formData.append('app', FISCAL_APP_NAME);
    formData.append('token', FISCAL_APP_TOKEN);
    formData.append('contrato', String(contractId));

    try {
      const response = await fetch(`${BASE_URL}/notafiscal/list/`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Falha ao buscar notas fiscais');

      const jsonResponse = await response.json();
      let rawData: any[] = [];

      if (jsonResponse.status === 200 && Array.isArray(jsonResponse.data)) {
        rawData = jsonResponse.data;
      } else if (Array.isArray(jsonResponse)) {
        rawData = jsonResponse;
      }

      return rawData.map((item: any) => ({
        numero: item.numero,
        serie: item.serie,
        data_emissao: item.data_emissao,
        valor_total: item.valortotal || item.valor_total || 0,
        link_pdf: item.link,
        empresa_razao_social: item.empresa_razao_social,
        status: item.status,
        descricao: item.infcomp
      })).sort((a, b) => new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime());

    } catch (error) {
      console.error("Error fetching fiscal invoices:", error);
      return [];
    }
  }

  /**
   * Fetches traffic extract (Extrato de Uso).
   */
  static async getTrafficExtract(
    cpfcnpj: string, 
    senha: string, 
    contratoId: string | number,
    month: number,
    year: number
  ): Promise<SGPTrafficResponse | null> {
    const formData = new FormData();
    formData.append('cpfcnpj', cpfcnpj);
    formData.append('senha', senha);
    formData.append('contrato', String(contratoId));
    formData.append('ano', String(year));
    formData.append('mes', String(month).padStart(2, '0'));

    try {
      const response = await fetch(`${BASE_URL}/extratouso/`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Falha ao buscar extrato de tráfego');

      const jsonResponse = await response.json();
      if (jsonResponse.status === 200 && jsonResponse.data) {
        return jsonResponse.data as SGPTrafficResponse;
      }
      return null;
    } catch (error) {
      console.error("Error fetching traffic extract:", error);
      return null;
    }
  }

  /**
   * Fetches detailed connection diagnostics using the WS Radius API.
   * REQUEST METHOD: POST JSON Body
   * URL: https://citrn.sgp.net.br/ws/radius/radacct/list/all/
   */
  static async getConnectionDiagnostics(cpfcnpj: string, senha?: string, contratoId?: string | number): Promise<SGPRadiusResult[]> {
    // 1. Prepare Payload matching the curl request exactly
    const payload = {
        app: "apicitmax",
        token: "032ae0e7-7ce0-4391-a509-650573057d34",
        tipoconexao: "ppp",
        cpfcnpj: cpfcnpj.replace(/\D/g, '')
    };

    console.log("--> API Request [getConnectionDiagnostics]:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('https://citrn.sgp.net.br/ws/radius/radacct/list/all/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Radius Response Error:", response.status, errorText);
        throw new Error(`Radius API Error: ${response.status} - ${errorText}`);
      }

      const jsonResponse = await response.json();
      console.log("<-- API Response [getConnectionDiagnostics]:", jsonResponse);
      
      let results: any[] = [];
      
      // 3. Handle specific response structure
      // Priority check: 'result' at root (matches user screenshot)
      if (jsonResponse.result && Array.isArray(jsonResponse.result)) {
          results = jsonResponse.result;
      } 
      // Secondary check: 'data.result' (matches example doc)
      else if (jsonResponse.data && Array.isArray(jsonResponse.data.result)) {
          results = jsonResponse.data.result;
      } 
      // Check for direct data array
      else if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
          results = jsonResponse.data;
      } 
      // Check for root array
      else if (Array.isArray(jsonResponse)) {
          results = jsonResponse;
      }

      // 4. Map the response (Service + nested Radacct)
      return results.map((service: any) => {
        // Find the "best" session from the radacct array
        const sessions = Array.isArray(service.radacct) ? service.radacct : [];
        
        let bestSession = sessions.find((s: any) => !s.acctstoptime) || sessions[0] || {};

        return {
          // Fields from the 'radacct' session object
          username: bestSession.username || service.pppoe_login || '',
          acctstarttime: bestSession.acctstarttime || new Date().toISOString(),
          acctstoptime: bestSession.acctstoptime || null, 
          acctinputoctets: parseInt(bestSession.acctinputoctets || 0),
          acctoutputoctets: parseInt(bestSession.acctoutputoctets || 0),
          acctterminatecause: bestSession.acctterminatecause || null,
          nasipaddress: bestSession.nasipaddress || '',
          framedipaddress: bestSession.framedipaddress || service.ip || '',
          callingstationid: bestSession.callingstationid || '', // MAC
          acctsessionid: bestSession.acctsessionid || '',
          
          // Fields from the service root object
          pppoe_login: service.pppoe_login || '',
          online: service.online === true || service.online === 'true',
          ip: service.ip || bestSession.framedipaddress || '',
          mac: bestSession.callingstationid || '',
          plano: service.plano, 
          endereco_logradouro: service.endereco_logradouro
        };
      });

    } catch (error) {
      console.error("Error fetching connection diagnostics:", error);
      throw error;
    }
  }

  /**
   * Unlock Service
   */
  static async unlockService(cpfcnpj: string, senha: string, contratoId: string | number): Promise<SGPUnlockResponse> {
    const formData = new FormData();
    formData.append('cpfcnpj', cpfcnpj);
    formData.append('senha', senha);
    formData.append('contrato', String(contratoId));

    try {
      const response = await fetch(`${BASE_URL}/promessapagamento/`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Falha na conexão ao tentar liberar serviço.');
      return await response.json();
    } catch (error) {
      console.error("Error unlocking service:", error);
      throw error;
    }
  }

  /**
   * Support Ticket
   */
  static async openSupportTicket(
    cpfcnpj: string,
    senha: string,
    contratoId: string | number,
    conteudo: string,
    contato: string,
    contatoNumero: string,
    ocorrenciaTipo: string
  ): Promise<SGPTicketResponse> {
    const payload = {
        app: FISCAL_APP_NAME,
        token: FISCAL_APP_TOKEN,
        contrato: contratoId,
        ocorrenciatipo: ocorrenciaTipo,
        conteudo: conteudo,
        observacao: `Contato: ${contato} | Tel: ${contatoNumero}`,
        notificar_cliente: 1
    };

    try {
      const response = await fetch(`https://citrn.sgp.net.br/api/ura/chamado/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Erro ao abrir chamado.');
      return await response.json();
    } catch (error) {
      console.error("Error opening ticket:", error);
      throw error;
    }
  }

  /**
   * Measure Connection Quality
   */
  static async measureConnectionQuality(): Promise<{ latency: number, downloadSpeedMbps: number, server: string }> {
    const startTime = Date.now();
    let serverUsed = 'Detectando...';
    
    try {
        await fetch(SPEEDTEST_PING_URL_PRIMARY, { mode: 'no-cors', cache: 'no-store' });
        serverUsed = 'CITmax (170.82.255.251)';
    } catch(e) {
        try {
            await fetch(SPEEDTEST_PING_URL_FALLBACK, { mode: 'no-cors', cache: 'no-store' });
            serverUsed = 'Google (Fallback)';
        } catch(e2) {
            serverUsed = 'Localhost (Erro)';
        }
    }
    
    const latency = Date.now() - startTime;
    const downloadStart = Date.now();
    
    try {
        await fetch(`${SPEEDTEST_DOWNLOAD_URL}?t=${Date.now()}`, { mode: 'cors', cache: 'no-store' });
    } catch(e) {
        await fetch(`https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_272x92dp.png?t=${Date.now()}`, { mode: 'no-cors' });
    }
    const durationSeconds = (Date.now() - downloadStart) / 1000;
    const speedMbps = (SPEEDTEST_FILE_SIZE_BITS / durationSeconds) / (1024 * 1024);

    return {
        latency,
        downloadSpeedMbps: speedMbps > 0 ? parseFloat(speedMbps.toFixed(2)) : 0,
        server: serverUsed
    };
  }

  static bytesToGB(bytes: number): string {
    if (!bytes || isNaN(bytes)) return '0,00 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2).replace('.', ',') + ' GB';
  }

  static formatCurrency(value: string | number): string {
    if (value === undefined || value === null) return 'R$ 0,00';
    let num = typeof value === 'string' ? parseFloat(value.replace('R$', '').trim().replace(/\./g, '').replace(',', '.')) : value;
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  }

  static formatDate(dateString: string): string {
    if (!dateString) return '--/--/----';
    try {
      if (dateString.includes('T')) dateString = dateString.split('T')[0];
      if (dateString.includes(' ')) dateString = dateString.split(' ')[0];
      if (dateString.includes('/')) return dateString;
      const parts = dateString.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
    } catch (e) {
      return dateString;
    }
  }

  static formatDuration(seconds: number): string {
      if (!seconds) return '0m';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
  }
}
