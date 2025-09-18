export type TicketStatus = "PENDENTE" | "CONVERTIDO";

export interface Ticket {
  id: string;
  fornecedorId: string;
  pesoBruto: number;
  pesoLiquido: number;
  observacoes?: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos
  fornecedor?: {
    id: string;
    nome: string;
    documento: string;
  };
  compra?: {
    id: string;
    precoPorKg: number;
    valorTotal: number;
  };
}

export interface CreateTicketInput {
  fornecedorId: string;
  pesoBruto: number;
  pesoLiquido: number;
  observacoes?: string;
}

export interface UpdateTicketInput {
  fornecedorId?: string;
  pesoBruto?: number;
  pesoLiquido?: number;
  observacoes?: string;
}

export interface TicketQuery {
  page?: number;
  limit?: number;
  fornecedorId?: string;
  status?: TicketStatus;
  dataInicio?: string;
  dataFim?: string;
}

export interface TicketResponse {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
