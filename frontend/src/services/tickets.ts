import { apiClient } from "@/lib/api";
import type {
  CreateTicketInput,
  Ticket,
  TicketQuery,
  TicketResponse,
  UpdateTicketInput,
} from "@/types/ticket";

// Serviços de Tickets
export const ticketsService = {
  // Listar tickets com filtros e paginação
  async getAll(query?: TicketQuery): Promise<TicketResponse> {
    const params = new URLSearchParams();

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<TicketResponse>(
      `/tickets?${params.toString()}`
    );
    return response.data;
  },

  // Buscar ticket por ID
  async getById(id: string): Promise<Ticket> {
    const response = await apiClient.get<Ticket>(`/tickets/${id}`);
    return response.data.data;
  },

  // Buscar tickets disponíveis para compra (status PENDENTE)
  async getAvailableForPurchase(): Promise<Ticket[]> {
    const response = await apiClient.get<Ticket[]>("/tickets/available");
    return response.data.data || response.data;
  },

  // Criar novo ticket
  async create(data: CreateTicketInput): Promise<Ticket> {
    const response = await apiClient.post<Ticket>("/tickets", data);
    return response.data.data;
  },

  // Atualizar ticket
  async update(id: string, data: UpdateTicketInput): Promise<Ticket> {
    const response = await apiClient.put<Ticket>(`/tickets/${id}`, data);
    return response.data.data;
  },

  // Deletar ticket
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tickets/${id}`);
  },

  // Converter ticket em compra
  async convertToCompra(
    ticketId: string,
    compraData: {
      precoPorKg: number;
      observacoes?: string;
    }
  ): Promise<Ticket> {
    const response = await apiClient.post<Ticket>(
      `/tickets/${ticketId}/convert`,
      compraData
    );
    return response.data.data;
  },

  // Buscar tickets por fornecedor
  async getByFornecedor(
    fornecedorId: string,
    query?: Omit<TicketQuery, "fornecedorId">
  ): Promise<TicketResponse> {
    const params = new URLSearchParams();

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<TicketResponse>(
      `/fornecedores/${fornecedorId}/tickets?${params.toString()}`
    );
    return response.data;
  },

  // Estatísticas de tickets
  async getStats(fornecedorId?: string) {
    const params = fornecedorId ? `?fornecedorId=${fornecedorId}` : "";
    const response = await apiClient.get(`/tickets/stats${params}`);
    return response.data.data;
  },
};
