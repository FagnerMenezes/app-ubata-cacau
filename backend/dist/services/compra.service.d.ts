import { CreateCompraInput } from "../types";
export declare class CompraService {
    static listarCompras(params: {
        page?: number;
        limit?: number;
        fornecedorId?: string;
        statusPagamento?: "PENDENTE" | "PARCIAL" | "PAGO";
        dataInicio?: string;
        dataFim?: string;
    }): Promise<{
        compras: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static buscarPorId(id: string): Promise<any>;
    static converterTicket(data: CreateCompraInput): Promise<any>;
    static atualizar(id: string, data: Partial<CreateCompraInput>): Promise<any>;
    static deletar(id: string): Promise<{
        message: string;
    }>;
    static obterEstatisticas(periodo?: string): Promise<{
        totalCompras: number;
        valorTotal: number;
        comprasPendentes: number;
        comprasPagas: number;
    }>;
}
//# sourceMappingURL=compra.service.d.ts.map