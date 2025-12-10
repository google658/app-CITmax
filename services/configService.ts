
import { AppConfig } from '../types';

const STORAGE_KEY = 'citmax_app_config';
// URL onde o arquivo backend estará hospedado.
// Se estiver na mesma pasta do build, use caminhos relativos.
const API_ENDPOINT_CONFIG = '/api/config.php'; 
const API_ENDPOINT_UPLOAD = '/api/upload.php';

export const ConfigService = {
  /**
   * Loads the configuration from the SERVER first, falling back to local if offline/error.
   */
  loadConfig: async (): Promise<AppConfig | null> => {
    try {
      // Tenta buscar do servidor (com timestamp para evitar cache)
      const response = await fetch(`${API_ENDPOINT_CONFIG}?t=${Date.now()}`);
      
      if (response.ok) {
        const data = await response.json();
        // Salva backup localmente
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.warn("Servidor de config offline, usando cache local.", error);
    }

    // Fallback: LocalStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  },

  /**
   * Saves the configuration globally to the SERVER.
   */
  saveConfig: async (config: AppConfig): Promise<boolean> => {
    try {
      // Salva localmente primeiro (otimismo)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

      // Envia para o servidor
      const response = await fetch(API_ENDPOINT_CONFIG, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar no servidor');
      }
      return true;

    } catch (e) {
      console.error("Falha ao persistir configuração global:", e);
      // Retorna false, mas o app continua funcionando localmente
      return false;
    }
  },

  /**
   * Uploads an image file to the server root/images folder.
   * Returns the public URL of the uploaded image.
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(API_ENDPOINT_UPLOAD, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erro no upload da imagem');
        }

        const data = await response.json();
        // Espera que o PHP retorne { "url": "https://site.com/uploads/imagem.png" }
        if (data && data.url) {
            return data.url;
        }
        throw new Error('Resposta inválida do servidor');
    } catch (error) {
        console.error("Erro upload:", error);
        // Fallback: Converte para Base64 se o servidor de upload falhar
        // Isso permite que o admin continue funcionando mesmo sem o backend de upload configurado
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
    }
  }
};
