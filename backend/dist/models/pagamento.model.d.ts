import { Prisma } from "@prisma/client";
import { CreatePagamentoInput } from "../types";
export declare class PagamentoModel {
    static findMany(params: {
        skip?: number;
        take?: number;
        where?: Prisma.PagamentoWhereInput;
        orderBy?: Prisma.PagamentoOrderByWithRelationInput;
        include?: Prisma.PagamentoInclude;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        observacoes: string | null;
        compraId: string;
        valorPago: Prisma.Decimal;
        metodoPagamento: import(".prisma/client").$Enums.MetodoPagamento | null;
    }[]>;
    static findUnique<T extends Prisma.PagamentoInclude>(params: {
        where: Prisma.PagamentoWhereUniqueInput;
        include?: T;
    }): Promise<Prisma.PagamentoGetPayload<{
        include: T;
    }> | null>;
    static create(data: CreatePagamentoInput): Promise<{
        compra: {
            fornecedor: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                nome: string;
                documento: string;
                endereco: Prisma.JsonValue | null;
                contato: Prisma.JsonValue | null;
                fazenda: string | null;
                observacoes: string | null;
                saldo: Prisma.Decimal;
            };
            ticket: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.TicketStatus;
                observacoes: string | null;
                fornecedorId: string;
                pesoBruto: Prisma.Decimal;
                pesoLiquido: Prisma.Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            observacoes: string | null;
            fornecedorId: string;
            ticketId: string;
            precoPorArroba: Prisma.Decimal;
            statusPagamento: import(".prisma/client").$Enums.StatusPagamento;
            precoPorKg: Prisma.Decimal;
            valorTotal: Prisma.Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        observacoes: string | null;
        compraId: string;
        valorPago: Prisma.Decimal;
        metodoPagamento: import(".prisma/client").$Enums.MetodoPagamento | null;
    }>;
    static delete(where: Prisma.PagamentoWhereUniqueInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        observacoes: string | null;
        compraId: string;
        valorPago: Prisma.Decimal;
        metodoPagamento: import(".prisma/client").$Enums.MetodoPagamento | null;
    }>;
    static count(where?: Prisma.PagamentoWhereInput): Promise<number>;
    static findByCompraId(compraId: string): Promise<({
        compra: {
            fornecedor: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                nome: string;
                documento: string;
                endereco: Prisma.JsonValue | null;
                contato: Prisma.JsonValue | null;
                fazenda: string | null;
                observacoes: string | null;
                saldo: Prisma.Decimal;
            };
            ticket: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.TicketStatus;
                observacoes: string | null;
                fornecedorId: string;
                pesoBruto: Prisma.Decimal;
                pesoLiquido: Prisma.Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            observacoes: string | null;
            fornecedorId: string;
            ticketId: string;
            precoPorArroba: Prisma.Decimal;
            statusPagamento: import(".prisma/client").$Enums.StatusPagamento;
            precoPorKg: Prisma.Decimal;
            valorTotal: Prisma.Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        observacoes: string | null;
        compraId: string;
        valorPago: Prisma.Decimal;
        metodoPagamento: import(".prisma/client").$Enums.MetodoPagamento | null;
    })[]>;
    static findUltimoPagamento(compraId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        observacoes: string | null;
        compraId: string;
        valorPago: Prisma.Decimal;
        metodoPagamento: import(".prisma/client").$Enums.MetodoPagamento | null;
    } | null>;
    static aggregate(params: {
        where?: Prisma.PagamentoWhereInput;
        _sum?: Prisma.PagamentoSumAggregateInputType;
        _count?: Prisma.PagamentoCountAggregateInputType;
    }): Promise<Prisma.GetPagamentoAggregateType<{
        where?: Prisma.PagamentoWhereInput;
        _sum?: Prisma.PagamentoSumAggregateInputType;
        _count?: Prisma.PagamentoCountAggregateInputType;
    }>>;
    static calcularTotalPorCompra(compraId: string): Promise<number>;
    static findPagamentosAnteriores(compraId: string, dataReferencia: Date): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        observacoes: string | null;
        compraId: string;
        valorPago: Prisma.Decimal;
        metodoPagamento: import(".prisma/client").$Enums.MetodoPagamento | null;
    }[]>;
    static findComDetalhesCompletos(pagamentoId: string): Promise<({
        compra: {
            fornecedor: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                nome: string;
                documento: string;
                endereco: Prisma.JsonValue | null;
                contato: Prisma.JsonValue | null;
                fazenda: string | null;
                observacoes: string | null;
                saldo: Prisma.Decimal;
            };
            ticket: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.TicketStatus;
                observacoes: string | null;
                fornecedorId: string;
                pesoBruto: Prisma.Decimal;
                pesoLiquido: Prisma.Decimal;
            };
            pagamentos: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                observacoes: string | null;
                compraId: string;
                valorPago: Prisma.Decimal;
                metodoPagamento: import(".prisma/client").$Enums.MetodoPagamento | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            observacoes: string | null;
            fornecedorId: string;
            ticketId: string;
            precoPorArroba: Prisma.Decimal;
            statusPagamento: import(".prisma/client").$Enums.StatusPagamento;
            precoPorKg: Prisma.Decimal;
            valorTotal: Prisma.Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        observacoes: string | null;
        compraId: string;
        valorPago: Prisma.Decimal;
        metodoPagamento: import(".prisma/client").$Enums.MetodoPagamento | null;
    }) | null>;
}
//# sourceMappingURL=pagamento.model.d.ts.map