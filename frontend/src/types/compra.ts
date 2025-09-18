export interface Compra {
  id: string
  ticketId: string
  fornecedorId: string
  fornecedor: {
    id: string
    nome: string
    documento: string
  }
  ticket: {
    id: string
    pesoBruto: number
    pesoLiquido: number
    observacoes?: string
  }
  dataCompra: string
  precoPorArroba: number
  precoPorKg: number
  valorTotal: number
  qualidade: number // 1-10
  observacoes?: string
  status: 'pendente' | 'confirmada' | 'entregue' | 'cancelada'
  statusPagamento: 'PENDENTE' | 'PARCIAL' | 'PAGO'
  numeroNota?: string
  dataEntrega?: string
  createdAt: string
  updatedAt: string
}

export interface CreateCompraData {
  ticketId: string
  precoPorArroba: number
  qualidade: number
  observacoes?: string
  numeroNota?: string
  dataEntrega?: string
}

export interface UpdateCompraData extends Partial<CreateCompraData> {
  status?: 'pendente' | 'confirmada' | 'entregue' | 'cancelada'
}

export interface CompraFilters {
  search?: string
  fornecedorId?: string
  ticketId?: string
  status?: 'pendente' | 'confirmada' | 'entregue' | 'cancelada'
  dataInicio?: string
  dataFim?: string
  qualidadeMin?: number
  qualidadeMax?: number
  page?: number
  limit?: number
  sortBy?: 'dataCompra' | 'precoPorKg' | 'valorTotal' | 'qualidade'
  sortOrder?: 'asc' | 'desc'
}

export interface CompraStats {
  totalCompras: number
  pesoTotal: number
  valorTotal: number
  qualidadeMedia: number
  comprasPorMes: Array<{
    mes: string
    quantidade: number
    peso: number
    valor: number
    qualidadeMedia: number
  }>
}