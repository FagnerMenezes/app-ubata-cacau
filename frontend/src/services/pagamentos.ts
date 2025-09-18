import type { PaginatedResponse } from "@/lib/api";
import { apiClient } from "@/lib/api";
import type {
  CreatePagamentoData,
  Pagamento,
  PagamentoFilters,
  PagamentoStats,
  ReciboPagamento,
  ResumoPagamento,
  UpdatePagamentoData,
  ValidacaoPagamento,
} from "@/types/pagamento";

export const pagamentosService = {
  // Listar pagamentos com filtros e paginação
  async getAll(
    filters?: PagamentoFilters
  ): Promise<PaginatedResponse<Pagamento>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<Pagamento>>(
      `/pagamentos?${params.toString()}`
    );
    //@ts-expect-error err
    return response.data;
  },

  // Buscar pagamento por ID
  async getById(id: string): Promise<Pagamento> {
    const response = await apiClient.get<Pagamento>(`/pagamentos/${id}`);
    //@ts-expect-error err
    return response.data;
  },

  // Criar novo pagamento
  async create(data: CreatePagamentoData): Promise<Pagamento> {
    const response = await apiClient.post<Pagamento>("/pagamentos", {
      compraId: data.compraId,
      valor: data.valorPago,
      metodoPagamento: data.metodoPagamento,
      observacoes: data.observacoes,
    });
    //@ts-expect-error err
    return response.data;
  },

  // Atualizar pagamento
  async update(id: string, data: UpdatePagamentoData): Promise<Pagamento> {
    const response = await apiClient.put<Pagamento>(`/pagamentos/${id}`, {
      valor: data.valorPago,
      metodoPagamento: data.metodoPagamento,
      observacoes: data.observacoes,
    });
    //@ts-expect-error err
    return response.data;
  },

  // Deletar pagamento
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/pagamentos/${id}`);
  },

  // Listar pagamentos por compra
  async getByCompra(compraId: string): Promise<ResumoPagamento> {
    const response = await apiClient.get<ResumoPagamento>(
      `/pagamentos/compra/${compraId}`
    );
    //@ts-expect-error err
    return response.data;
  },

  // Validar pagamento antes de criar
  async validate(compraId: string, valor: number): Promise<ValidacaoPagamento> {
    const response = await apiClient.post<ValidacaoPagamento>(
      "/pagamentos/validar",
      {
        compraId,
        valor,
      }
    );
    //@ts-expect-error err
    return response.data;
  },

  // Gerar recibo de pagamento
  async generateRecibo(id: string): Promise<{ recibo: ReciboPagamento }> {
    const response = await apiClient.get<{ recibo: ReciboPagamento }>(
      `/pagamentos/${id}/recibo`
    );
    //@ts-expect-error err
    return response.data;
  },

  // Estatísticas de pagamentos
  async getStats(params?: {
    fornecedorId?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<PagamentoStats> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PagamentoStats>(
      `/pagamentos/estatisticas?${searchParams.toString()}`
    );
    //@ts-expect-error err
    return response.data;
  },

  // Calcular valor restante de uma compra
  async getSaldoRestante(compraId: string): Promise<{
    valorTotal: number;
    valorPago: number;
    saldoRestante: number;
    statusPagamento: string;
  }> {
    const resumo = await this.getByCompra(compraId);
    return {
      valorTotal: resumo.compra.valorTotal,
      valorPago: resumo.resumo.valorTotalPago,
      saldoRestante: resumo.resumo.saldoRestante,
      statusPagamento: resumo.compra.statusPagamento,
    };
  },
};
