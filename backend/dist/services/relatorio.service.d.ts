export declare class RelatorioService {
    static relatorioCompras(params: {
        dataInicio?: string | undefined;
        dataFim?: string | undefined;
        fornecedorId?: string | undefined;
        statusPagamento?: "PENDENTE" | "PARCIAL" | "PAGO" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }): Promise<{
        compras: {
            valorTotal: number;
            precoPorKg: number;
            totalPagamentos: number;
            id: any;
            createdAt: any;
            statusPagamento: any;
            fornecedor: {
                id: any;
                nome: any;
                documento: any;
            }[];
            ticket: {
                id: any;
                pesoLiquido: any;
            }[];
            pagamentos: {
                id: any;
            }[];
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        resumo: {
            totalCompras: number;
            valorTotal: number;
            precoMedio: number;
        };
    }>;
    static relatorioFornecedores(params: {
        dataInicio?: string | undefined;
        dataFim?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }): Promise<{
        fornecedores: {
            id: any;
            nome: any;
            documento: any;
            contato: any;
            endereco: any;
            saldo: number;
            estatisticas: {
                totalCompras: number;
                valorTotalCompras: number;
                pesoTotal: number;
                ticketsPendentes: number;
                precoMedio: number;
            };
        }[];
        resumo: {
            totalFornecedores: number;
            totalCompras: number;
            valorTotal: number;
        };
        paginacao: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static dashboard(params?: {
        dataInicio?: string | undefined;
        dataFim?: string | undefined;
    }): Promise<{
        metricas: {
            totalFornecedores: number;
            totalTickets: number;
            totalCompras: number;
            totalPagamentos: number;
            valorTotalCompras: number;
            valorTotalPago: number;
            precoMedio: number;
        };
        distribuicoes: {
            comprasPorStatus: {
                status: string;
                quantidade: any;
                valor: any;
            }[];
            ticketsPorStatus: {
                status: string;
                quantidade: any;
                peso: any;
            }[];
        };
    }>;
    static relatorioPagamentos(params: {
        dataInicio?: string | undefined;
        dataFim?: string | undefined;
        fornecedorId?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }): Promise<{
        pagamentos: {
            id: any;
            data: any;
            valor: number;
            metodo: any;
            fornecedor: {
                nome: any;
                documento: any;
            };
            compra: {
                id: any;
                valorTotal: number;
            };
        }[];
        resumo: {
            totalPagamentos: number;
            valorTotal: number;
            pagamentosPorMes: {
                mes: string;
                totalPagamentos: any;
                valorTotal: any;
            }[];
        };
        paginacao: {
            pagina: number;
            limite: number;
            total: number;
            totalPaginas: number;
        };
    }>;
    static relatorioFluxoCaixa(params: {
        dataInicio?: string | undefined;
        dataFim?: string | undefined;
        fornecedorId?: string | undefined;
        agrupamento?: "dia" | "semana" | "mes" | undefined;
        formato?: "json" | "csv" | undefined;
    }): Promise<{
        movimentacoes: {
            data: string;
            historico: string;
            credito: number;
            debito: number;
            saldo: number;
        }[];
        totais: {
            credito: number;
            debito: number;
            saldo: number;
        };
        periodo: {
            inicio: string;
            fim: string;
        };
    }>;
    static relatorioUnificadoFornecedor(params: {
        dataInicio?: string | undefined;
        dataFim?: string | undefined;
        fornecedorId: string;
        formato?: "json" | "pdf" | undefined;
    }): Promise<{
        fornecedor: {
            id: any;
            nome: any;
            documento: any;
            endereco: any;
        };
        periodo: {
            inicio: string;
            fim: string;
        };
        dataEmissao: string;
        movimentacaoCacau: {
            movimentacoes: {
                data: any;
                historico: any;
                credito: any;
                debito: any;
                saldo: number;
            }[];
            totais: {
                credito: any;
                debito: any;
                saldo: number;
            };
        };
        movimentacaoFinanceira: {
            movimentacoes: {
                data: any;
                historico: any;
                credito: any;
                debito: any;
                saldo: any;
            }[];
            totais: {
                credito: any;
                debito: any;
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
                totalCompras: any;
                totalPagamentos: any;
            };
        };
    }>;
}
//# sourceMappingURL=relatorio.service.d.ts.map