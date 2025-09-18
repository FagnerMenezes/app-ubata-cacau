import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";

// Configuração base da API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Criar instância do Axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log da requisição em desenvolvimento
    if (import.meta.env.DEV) {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log da resposta em desenvolvimento
    if (import.meta.env.DEV) {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Tratamento de erros globais
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expirado ou inválido
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          break;
        case 403:
          console.error("❌ Acesso negado");
          break;
        case 404:
          console.error("❌ Recurso não encontrado");
          break;
        case 500:
          console.error("❌ Erro interno do servidor");
          break;
        default:
          console.error("❌ Erro na API:", data?.message || error.message);
      }
    } else if (error.request) {
      console.error("❌ Erro de rede:", error.message);
    } else {
      console.error("❌ Erro:", error.message);
    }

    return Promise.reject(error);
  }
);

// Tipos para as respostas da API
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Tipos para respostas paginadas
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Funções auxiliares para requisições
export const apiClient = {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    api.get<ApiResponse<T>>(url, config),
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.post<ApiResponse<T>>(url, data, config),
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.put<ApiResponse<T>>(url, data, config),
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.patch<ApiResponse<T>>(url, data, config),
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    api.delete<ApiResponse<T>>(url, config),
};

export default api;
