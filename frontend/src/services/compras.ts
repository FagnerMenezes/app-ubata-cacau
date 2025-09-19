import type { PaginatedResponse } from "@/lib/api";
import { apiClient } from "@/lib/api";
import type {
  Compra,
  CompraFilters,
  CompraStats,
  CreateCompraData,
  UpdateCompraData,
} from "@/types/compra";

// Serviços de Compras
export const comprasService = {
  // Listar compras com filtros e paginação
  async getAll(filters?: CompraFilters): Promise<PaginatedResponse<Compra>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<Compra>>(
      `/compras?${params.toString()}`
    );
    return response.data.data || response.data;
  },

  // Buscar compra por ID
  async getById(id: string): Promise<Compra> {
    const response = await apiClient.get<Compra>(`/compras/${id}`);
    return response.data.data;
  },

  // Criar nova compra
  async create(data: CreateCompraData): Promise<Compra> {
    console.log(data);
    const response = await apiClient.post<Compra>(
      "/compras/converter-ticket",
      data
    );
    return response.data.data;
  },

  // Atualizar compra
  async update(id: string, data: UpdateCompraData): Promise<Compra> {
    const response = await apiClient.put<Compra>(`/compras/${id}`, data);
    return response.data.data || response.data;
  },

  // Deletar compra
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/compras/${id}`);
  },

  // Confirmar compra
  async confirmar(id: string): Promise<Compra> {
    const response = await apiClient.patch<Compra>(`/compras/${id}/confirmar`);
    return response.data.data;
  },

  // Marcar como entregue
  async marcarEntregue(id: string, dataEntrega?: string): Promise<Compra> {
    const response = await apiClient.patch<Compra>(`/compras/${id}/entregar`, {
      dataEntrega: dataEntrega || new Date().toISOString(),
    });
    return response.data.data;
  },

  // Cancelar compra
  async cancelar(id: string, motivo?: string): Promise<Compra> {
    const response = await apiClient.patch<Compra>(`/compras/${id}/cancelar`, {
      motivo,
    });
    return response.data.data;
  },

  // Estatísticas de compras
  async getStats(periodo?: "mes" | "trimestre" | "ano"): Promise<CompraStats> {
    const params = periodo ? `?periodo=${periodo}` : "";
    const response = await apiClient.get<CompraStats>(
      `/compras/stats${params}`
    );
    return response.data.data;
  },

  // Relatório de compras por fornecedor
  async getRelatorioFornecedor(fornecedorId: string, periodo?: string) {
    const params = periodo ? `?periodo=${periodo}` : "";
    const response = await apiClient.get(
      `/compras/relatorio/fornecedor/${fornecedorId}${params}`
    );
    return response.data.data;
  },

  // Relatório de qualidade
  async getRelatorioQualidade(periodo?: string) {
    const params = periodo ? `?periodo=${periodo}` : "";
    const response = await apiClient.get(
      `/compras/relatorio/qualidade${params}`
    );
    return response.data.data;
  },
};
