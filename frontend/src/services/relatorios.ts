import { apiClient } from "@/lib/api";

export interface RelatorioFilters {
  dataInicio?: string;
  dataFim?: string;
  fornecedorId?: string;
  statusPagamento?: "PENDENTE" | "PARCIAL" | "PAGO";
  formato?: "json" | "csv" | "pdf";
  agrupamento?: "dia" | "semana" | "mes";
  page?: number;
  limit?: number;
}

export interface RelatorioCompras {
  compras: Array<{
    id: string;
    data: string;
    fornecedor: {
      id: string;
      nome: string;
      documento: string;
    };
    ticket: {
      id: string;
      pesoLiquido: number;
    };
    valorTotal: number;
    precoPorKg: number;
    statusPagamento: string;
    totalPagamentos: number;
  }>;
  resumo: {
    totalCompras: number;
    valorTotal: number;
    precoMedio: number;
  };
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export interface RelatorioFornecedores {
  fornecedores: Array<{
    id: string;
    nome: string;
    documento: string;
    totalCompras: number;
    valorTotalCompras: number;
    precoMedio: number;
    ultimaCompra: string;
    status: string;
    estatisticas?: {
      totalCompras: number;
      valorTotalCompras: number;
      precoMedio: number;
    };
  }>;
  resumo: {
    totalFornecedores: number;
    totalCompras: number;
    valorTotal: number;
  };
}

export interface RelatorioPagamentos {
  pagamentos: Array<{
    id: string;
    data: string;
    valor: number;
    metodo: string;
    fornecedor: {
      nome: string;
      documento: string;
    };
    compra: {
      id: string;
      valorTotal: number;
    };
  }>;
  resumo: {
    totalPagamentos: number;
    valorTotal: number;
    pagamentosPorMes: Array<{
      mes: string;
      totalPagamentos: number;
      valorTotal: number;
    }>;
  };
  paginacao?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RelatorioFluxoCaixa {
  movimentacoes: Array<{
    data: string;
    historico: string;
    credito: number;
    debito: number;
    saldo: number;
  }>;
  totais: {
    credito: number;
    debito: number;
    saldo: number;
  };
  periodo: {
    inicio: string;
    fim: string;
  };
}

export interface ResumoFinanceiro {
  periodo: {
    dataInicio: string;
    dataFim: string;
  };
  metricas: {
    totalCompras: number;
    valorTotalCompras: number;
    precoMedioKg: number;
    totalFornecedores: number;
    totalTickets: number;
    totalPagamentos: number;
    valorTotalPago: number;
    saldoTotal: number;
    percentualPago: number;
  };
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  distribuicoes: any | undefined;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  rankings: any | undefined;
}

export interface RelatorioUnificadoFornecedor {
  fornecedor: {
    id: string;
    nome: string;
    documento: string;
    endereco: string | {
      cep?: string;
      rua?: string;
      cidade?: string;
      estado?: string;
    };
  };
  periodo: {
    inicio: string;
    fim: string;
  };
  dataEmissao: string;
  movimentacaoCacau: {
    movimentacoes: Array<{
      data: string;
      historico: string;
      credito: number;
      debito: number;
      saldo: number;
    }>;
    totais: {
      credito: number;
      debito: number;
      saldo: number;
    };
  };
  movimentacaoFinanceira: {
    movimentacoes: Array<{
      data: string;
      historico: string;
      credito: number;
      debito: number;
      saldo: number;
    }>;
    totais: {
      credito: number;
      debito: number;
      saldo: number;
    };
  };
  resumo: {
    cacau: {
      total: number;
      precoMedio: number;
      sacarias: number;
    };
    financeiro: {
      saldo: number;
      totalCompras: number;
      totalPagamentos: number;
    };
  };
}

export const relatoriosService = {
  // Relatório de Compras
  async getRelatorioCompras(
    filters: RelatorioFilters = {}
  ): Promise<RelatorioCompras> {
    const response = await apiClient.get<RelatorioCompras>(
      "/relatorios/compras",
      {
        params: filters,
      }
    );
    //@ts-expect-error error api
    return response.data as RelatorioCompras;
  },

  // Relatório de Fornecedores
  async getRelatorioFornecedores(
    filters: RelatorioFilters = {}
  ): Promise<RelatorioFornecedores> {
    const response = await apiClient.get<RelatorioFornecedores>(
      "/relatorios/fornecedores",
      {
        params: filters,
      }
    );
    //@ts-expect-error error api
    return response.data as RelatorioFornecedores;
  },

  // Relatório de Pagamentos
  async getRelatorioPagamentos(
    filters: RelatorioFilters = {}
  ): Promise<RelatorioPagamentos> {
    const response = await apiClient.get<RelatorioPagamentos>(
      "/relatorios/pagamentos",
      {
        params: filters,
      }
    );
    //@ts-expect-error error api
    return response.data as RelatorioPagamentos;
  },

  // Relatório de Fluxo de Caixa
  async getFluxoCaixa(
    filters: RelatorioFilters = {}
  ): Promise<RelatorioFluxoCaixa> {
    const response = await apiClient.get<RelatorioFluxoCaixa>(
      "/relatorios/fluxo-caixa",
      {
        params: filters,
      }
    );
    //@ts-expect-error error api
    return response.data as RelatorioFluxoCaixa;
  },

  // Resumo Financeiro
  async getResumoFinanceiro(
    filters: RelatorioFilters = {}
  ): Promise<ResumoFinanceiro> {
    const response = await apiClient.get<ResumoFinanceiro>(
      "/relatorios/resumo-financeiro",
      {
        params: filters,
      }
    );
    //@ts-expect-error error api
    return response.data as ResumoFinanceiro;
  },

  // Relatório Unificado do Fornecedor
  async getRelatorioUnificadoFornecedor(
    filters: RelatorioFilters = {}
  ): Promise<RelatorioUnificadoFornecedor> {
    const response = await apiClient.get<RelatorioUnificadoFornecedor>(
      "/relatorios/unificado-fornecedor",
      {
        params: filters,
      }
    );
    //@ts-expect-error error api
    return response.data as RelatorioUnificadoFornecedor;
  },

  // Exportar relatório em CSV
  async exportarCSV(
    tipo: string,
    filters: RelatorioFilters = {}
  ): Promise<Blob> {
    const response = await apiClient.get(`/relatorios/${tipo}`, {
      params: { ...filters, formato: "csv" },
      responseType: "blob",
    });
    //@ts-expect-error error api
    return response.data as Blob;
  },

  // Exportar relatório em PDF
  async exportarPDF(
    tipo: string,
    filters: RelatorioFilters = {}
  ): Promise<Blob> {
    const response = await apiClient.get(`/relatorios/${tipo}`, {
      params: { ...filters, formato: "pdf" },
      responseType: "blob",
    });
    //@ts-expect-error error api
    return response.data as Blob;
  },
};
