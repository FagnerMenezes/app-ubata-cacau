import type { PaginatedResponse } from "@/lib/api";
import { apiClient } from "@/lib/api";
import type {
  CreateFornecedorData,
  Fornecedor,
  FornecedorFilters,
  UpdateFornecedorData,
} from "@/types/fornecedor";

// Serviços de Fornecedores
export const fornecedoresService = {
  // Listar fornecedores com filtros e paginação
  async getAll(
    filters?: FornecedorFilters
  ): Promise<PaginatedResponse<Fornecedor>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<Fornecedor>>(
      `/fornecedores?${params.toString()}`
    );
    //@ts-expect-error err
    return response.data;
  },

  // Buscar fornecedor por ID
  async getById(id: string): Promise<Fornecedor> {
    const response = await apiClient.get<Fornecedor>(`/fornecedores/${id}`);
    //@ts-expect-error err
    return response.data;
  },

  // Criar novo fornecedor
  async create(data: CreateFornecedorData): Promise<Fornecedor> {
    const response = await apiClient.post<Fornecedor>("/fornecedores", data);
    //@ts-expect-error err
    return response.data;
  },

  // Atualizar fornecedor
  async update(id: string, data: UpdateFornecedorData): Promise<Fornecedor> {
    const response = await apiClient.put<Fornecedor>(
      `/fornecedores/${id}`,
      data
    );
    //@ts-expect-error err
    return response.data;
  },

  // Deletar fornecedor
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/fornecedores/${id}`);
  },

  // Ativar/Desativar fornecedor
  async toggleStatus(id: string): Promise<Fornecedor> {
    const response = await apiClient.patch<Fornecedor>(
      `/fornecedores/${id}/toggle-status`
    );
    //@ts-expect-error err
    return response.data;
  },

  // Buscar histórico de compras do fornecedor
  async getCompras(id: string, page = 1, limit = 10) {
    const response = await apiClient.get(
      `/fornecedores/${id}/compras?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Estatísticas do fornecedor
  async getStats(id: string) {
    const response = await apiClient.get(`/fornecedores/${id}/stats`);
    return response.data;
  },
};
