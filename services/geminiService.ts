
import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { APIService } from './apiService';

const BASE_INSTRUCTION = `
Você é o "Assistente Virtual CITmax", um especialista em suporte técnico e financeiro.
Seu tom deve ser amigável, técnico (mas acessível) e resolutivo.

DIRETRIZES CRÍTICAS SOBRE STATUS DO CONTRATO:
1. STATUS "REDUZIDO": Significa que o cliente tem faturas em atraso. A internet FUNCIONA, mas a velocidade é REDUZIDA propositalmente. 
   - NÃO trate como defeito técnico ou sinal fraco.
   - Explique que a lentidão é devido ao débito pendente.
   - Sugira o pagamento via Pix ou use a ferramenta 'unlockTrust' se o cliente pedir.
2. STATUS "SUSPENSO": Significa bloqueio total por inadimplência longa. A internet NÃO FUNCIONA.
   - O foco é 100% regularização financeira.
   - Encaminhe para o pagamento de faturas ou use 'unlockTrust'.

FERRAMENTAS DISPONÍVEIS (USE QUANDO NECESSÁRIO):
- 'checkInvoices': Para verificar faturas pendentes, valores e códigos Pix.
- 'checkConnection': Para ver se o cliente está ONLINE/OFFLINE e histórico de quedas.
- 'checkTraffic': Para ver consumo de internet.
- 'unlockTrust': Para liberar a internet por confiança (promessa de pagamento) por 3 dias.
- 'openSupportTicket': Para abrir chamado técnico quando não conseguir resolver.

DIRETRIZES GERAIS:
1. Use os DADOS DO CLIENTE fornecidos no contexto para responder diretamente.
2. Se o status da conexão for "OFFLINE" (e o contrato estiver ATIVO), sugira reiniciar a ONU/Roteador.
3. Se houver faturas em aberto, informe o valor e a data de vencimento.
4. TENTE RESOLVER O PROBLEMA PRIMEIRO. Se o problema persistir ou o cliente solicitar expressamente um técnico/visita, ofereça ABRIR UM CHAMADO.
5. CLASSIFICAÇÃO DE OCORRÊNCIA (ID) para abrir chamado:
   - 13: Mudança de Endereço, 23: Mudança de Plano, 3: Mudança de senha do Wi-Fi, 206: Mudança de Titular
   - 4: Novo ponto, 40: Ativação de Streaming, 22: Problema na fatura, 14: Relocação do Roteador, 200: Reparo
6. Responda sempre em português do Brasil. Seja conciso.
`;

// --- TOOL DEFINITIONS ---

const openTicketTool: FunctionDeclaration = {
  name: 'openSupportTicket',
  description: 'Abre um chamado técnico ou solicitação para o provedor quando o problema não pode ser resolvido pela IA.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      conteudo: { type: Type.STRING, description: 'Descrição detalhada do problema ou solicitação.' },
      contato: { type: Type.STRING, description: 'Nome da pessoa para contato.' },
      contato_numero: { type: Type.STRING, description: 'Número de telefone para contato (obrigatório).' },
      ocorrenciatipo: { type: Type.STRING, description: 'ID do tipo de ocorrência conforme lista (ex: "200" para reparo, "22" para financeiro).' }
    },
    required: ['conteudo', 'contato', 'contato_numero', 'ocorrenciatipo']
  }
};

const unlockTrustTool: FunctionDeclaration = {
  name: 'unlockTrust',
  description: 'Realiza o desbloqueio de confiança (liberação temporária) da internet por 3 dias para clientes bloqueados ou reduzidos.',
  parameters: {
    type: Type.OBJECT,
    properties: {}, // No params needed, uses session context
  }
};

const checkInvoicesTool: FunctionDeclaration = {
  name: 'checkInvoices',
  description: 'Consulta faturas em aberto, valores, vencimentos e códigos Pix.',
  parameters: {
    type: Type.OBJECT,
    properties: {}, // Uses session context
  }
};

const checkConnectionTool: FunctionDeclaration = {
  name: 'checkConnection',
  description: 'Verifica status técnico atual da conexão (Online/Offline), IP, MAC e histórico de quedas recente.',
  parameters: {
    type: Type.OBJECT,
    properties: {}, // Uses session context
  }
};

const checkTrafficTool: FunctionDeclaration = {
  name: 'checkTraffic',
  description: 'Consulta o consumo de internet (download/upload) de um mês específico.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      mes: { type: Type.NUMBER, description: 'Mês numérico (1-12). Se não informado, usa o atual.' },
      ano: { type: Type.NUMBER, description: 'Ano com 4 dígitos. Se não informado, usa o atual.' }
    },
  }
};

const allTools: Tool[] = [{
  functionDeclarations: [
    openTicketTool, 
    unlockTrustTool, 
    checkInvoicesTool, 
    checkConnectionTool, 
    checkTrafficTool
  ]
}];

export class GeminiService {
  private ai: GoogleGenAI;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.API_KEY || ''; 
    this.ai = new GoogleGenAI({ apiKey });
  }

  async sendMessage(
    history: {role: 'user' | 'model', text: string}[], 
    newMessage: string, 
    context?: string,
    userCredentials?: { cpfCnpj: string, password?: string, contractId: string | number }
  ): Promise<string> {
    try {
      if (!process.env.API_KEY) {
        return "⚠️ Configuração de API Key ausente. O chat não pode responder no momento.";
      }

      if (!userCredentials?.password) {
          return "Erro de autenticação: Senha do usuário não disponível para executar ações.";
      }

      const finalSystemInstruction = context 
        ? `${BASE_INSTRUCTION}\n\n=== DADOS DO CLIENTE EM TEMPO REAL ===\n${context}`
        : BASE_INSTRUCTION;

      const chat = this.ai.chats.create({
        model: this.modelName,
        config: {
          systemInstruction: finalSystemInstruction,
          temperature: 0.4,
          tools: allTools,
        },
        history: history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        })),
      });

      // Send initial message
      let response = await chat.sendMessage({ message: newMessage });
      
      // Loop to handle multiple function calls if necessary
      // Note: In simple implementations, we handle one turn. Recursion can be added for multi-step.
      
      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const functionResponses: any[] = [];

        for (const call of functionCalls) {
          const args = call.args as any;
          let result: any;

          console.log(`[AI Action] Executing tool: ${call.name}`);

          try {
            switch (call.name) {
              case 'openSupportTicket':
                result = await APIService.openSupportTicket(
                  userCredentials.cpfCnpj,
                  userCredentials.password,
                  userCredentials.contractId,
                  args.conteudo,
                  args.contato,
                  args.contato_numero,
                  args.ocorrenciatipo
                );
                break;

              case 'unlockTrust':
                result = await APIService.unlockService(
                  userCredentials.cpfCnpj,
                  userCredentials.password,
                  userCredentials.contractId
                );
                break;

              case 'checkInvoices':
                if (!userCredentials.contractId) {
                    result = "Erro: ID do contrato não identificado no contexto.";
                    break;
                }
                result = await APIService.getInvoices(
                  userCredentials.cpfCnpj,
                  userCredentials.password,
                  userCredentials.contractId
                );
                // Filter specifically for relevant info to save tokens
                if (Array.isArray(result)) {
                    result = result.filter((inv: any) => !inv.situacao?.toLowerCase().includes('pago')).map((inv: any) => ({
                        vencimento: inv.vencimento,
                        valor: inv.valor,
                        status: inv.situacao,
                        pix: inv.codigo_pix,
                        linha_digitavel: inv.linha_digitavel
                    }));
                    if (result.length === 0) result = "Nenhuma fatura em aberto encontrada.";
                }
                break;

              case 'checkConnection':
                if (!userCredentials.password) {
                   result = "Senha não disponível para diagnóstico.";
                   break;
                }
                const allConns = await APIService.getConnectionDiagnostics(
                    userCredentials.cpfCnpj, 
                    userCredentials.password, 
                    userCredentials.contractId
                );
                
                const relevantConn = allConns.find((c: any) => c.online) || (allConns.length > 0 ? allConns[0] : null);
                
                if (relevantConn) {
                    result = {
                        online: relevantConn.online,
                        ip: relevantConn.ip,
                        login: relevantConn.pppoe_login,
                        inicio_sessao: new Date(relevantConn.acctstarttime).toLocaleString('pt-BR'),
                        consumo_sessao: `Down ${APIService.bytesToGB(relevantConn.acctoutputoctets)}`
                    };
                } else {
                    result = "Nenhuma conexão encontrada para este contrato.";
                }
                break;

              case 'checkTraffic':
                const now = new Date();
                const m = args.mes || (now.getMonth() + 1);
                const y = args.ano || now.getFullYear();
                result = await APIService.getTrafficExtract(
                    userCredentials.cpfCnpj,
                    userCredentials.password,
                    userCredentials.contractId,
                    m,
                    y
                );
                break;

              default:
                result = { error: "Ferramenta não implementada." };
            }
          } catch (err: any) {
            console.error(`Error executing ${call.name}:`, err);
            result = { error: err.message || "Falha na execução da ferramenta." };
          }

          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: { result: result },
              id: call.id
            }
          });
        }

        // Send function results back to the model
        const finalResponse = await chat.sendMessage({
          message: functionResponses
        });

        return finalResponse.text || "Ação processada.";
      }

      return response.text || "Desculpe, não entendi.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Desculpe, estou tendo dificuldades técnicas no momento.";
    }
  }
}
