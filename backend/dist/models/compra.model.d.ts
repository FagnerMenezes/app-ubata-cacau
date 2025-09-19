import { Prisma } from '@prisma/client';
export declare class CompraModel {
    static findMany(params: {
        skip?: number;
        take?: number;
        where?: Prisma.CompraWhereInput;
        orderBy?: Prisma.CompraOrderByWithRelationInput;
        include?: Prisma.CompraInclude;
    }): Promise<{
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
    }[]>;
    static findUnique(params: {
        where: Prisma.CompraWhereUniqueInput;
        include?: Prisma.CompraInclude;
    }): Promise<{
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
    } | null>;
    static create(data: Prisma.CompraCreateInput): Promise<{
        fornecedor: {
            id: string;
            nome: string;
            documento: string;
        };
        ticket: {
            id: string;
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
    }>;
    static update(params: {
        where: Prisma.CompraWhereUniqueInput;
        data: Prisma.CompraUpdateInput;
    }): Promise<{
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
    }>;
    static delete(where: Prisma.CompraWhereUniqueInput): Promise<{
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
    }>;
    static count(params?: {
        where?: Prisma.CompraWhereInput;
    }): Promise<number>;
}
//# sourceMappingURL=compra.model.d.ts.map