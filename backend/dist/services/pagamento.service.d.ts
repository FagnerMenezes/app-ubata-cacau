import { CreatePagamentoInput } from "../types";
export declare class PagamentoService {
    static listarPagamentos(params: {
        page?: number;
        limit?: number;
        compraId?: string;
        fornecedorId?: string;
        dataInicio?: string;
        dataFim?: string;
    }): Promise<{
        pagamentos: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static buscarPagamentoPorId(id: string): Promise<any>;
    static criarPagamento(data: CreatePagamentoInput): Promise<any>;
    static deletarPagamento(id: string): Promise<{
        message: string;
    }>;
    static gerarReciboPagamento(id: string): Promise<{
        recibo: {
            id: any;
            numeroPagamento: number;
            data: any;
            valor: number;
            observacoes: any;
            compra: {
                id: any;
                valorTotal: number;
                precoKg: number;
                ticket: {
                    numeroTicket: any;
                    pesoLiquido: number;
                };
            };
            fornecedor: {
                nome: any;
                documento: any;
            };
            resumo: {
                valorTotalCompra: number;
                valorTotalPago: any;
                saldoRestante: number;
                percentualPago: number;
            };
        };
    }>;
    static obterEstatisticas(params?: {
        fornecedorId?: string;
        dataInicio?: string;
        dataFim?: string;
    }): Promise<{
        totalPagamentos: number;
        valorTotalPago: number;
        pagamentosPorMes: any[];
    }>;
    static listarPagamentosPorCompra(compraId: string): Promise<{
        compra: {
            id: any;
            valorTotal: number;
            statusPagamento: any;
        };
        pagamentos: any[];
        resumo: {
            totalPagamentos: number;
            valorTotalPago: any;
            saldoRestante: number;
            percentualPago: number;
        };
    }>;
    static validarPagamento(compraId: string, valor: number): Promise<{
        valorTotalCompra: number;
        valorJaPago: any;
        saldoRestante: number;
        valorPagamento: number;
        novoSaldo: number;
        statusAposPaymento: string;
    }>;
}
//# sourceMappingURL=pagamento.service.d.ts.map