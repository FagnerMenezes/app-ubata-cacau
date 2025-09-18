export type StatusPagamento = 'PENDENTE' | 'PARCIAL' | 'PAGO'

export type MetodoPagamento = 'DINHEIRO' | 'PIX' | 'TRANSFERENCIA' | 'CHEQUE'

export interface Pagamento {
  id: string
  compraId: string
  valorPago: number
  metodoPagamento?: MetodoPagamento
  observacoes?: string
  createdAt: string
  updatedAt: string
  compra?: {
    id: string
    valorTotal: number
    statusPagamento: StatusPagamento
    fornecedor: {
      id: string
      nome: string
      documento: string
    }
    ticket: {
      id: string
      pesoLiquido: number
    }
  }
}

export interface CreatePagamentoData {
  compraId: string
  valorPago: number
  metodoPagamento?: MetodoPagamento
  observacoes?: string
}

export interface UpdatePagamentoData {
  valorPago?: number
  metodoPagamento?: MetodoPagamento
  observacoes?: string
}

export interface PagamentoFilters {
  page?: number
  limit?: number
  compraId?: string
  fornecedorId?: string
  metodoPagamento?: MetodoPagamento
  dataInicio?: string
  dataFim?: string
}

export interface PagamentoStats {
  totalPagamentos: number
  valorTotalPago: number
  pagamentosPorMes: Array<{
    mes: string
    totalPagamentos: number
    valorTotal: number
  }>
}

export interface ResumoPagamento {
  compra: {
    id: string
    valorTotal: number
    statusPagamento: StatusPagamento
  }
  pagamentos: Pagamento[]
  resumo: {
    totalPagamentos: number
    valorTotalPago: number
    saldoRestante: number
    percentualPago: number
  }
}

export interface ValidacaoPagamento {
  valido: boolean
  valorTotalCompra: number
  valorJaPago: number
  saldoRestante: number
  valorPagamento: number
  novoSaldo: number
  statusAposPaymento: StatusPagamento
  error?: string
}

export interface ReciboPagamento {
  id: string
  numeroPagamento: number
  data: string
  valor: number
  observacoes?: string
  compra: {
    id: string
    valorTotal: number
    precoKg: number
    ticket: {
      numeroTicket: string
      pesoLiquido: number
    }
  }
  fornecedor: {
    nome: string
    documento: string
  }
  resumo: {
    valorTotalCompra: number
    valorTotalPago: number
    saldoRestante: number
    percentualPago: number
  }
}