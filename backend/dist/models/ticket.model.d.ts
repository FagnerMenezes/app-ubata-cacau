import { Prisma } from "@prisma/client";
export declare class TicketModel {
    static findMany(params: {
        skip?: number;
        take?: number;
        where?: Prisma.TicketWhereInput;
        orderBy?: Prisma.TicketOrderByWithRelationInput;
        include?: Prisma.TicketInclude;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        observacoes: string | null;
        fornecedorId: string;
        pesoBruto: Prisma.Decimal;
        pesoLiquido: Prisma.Decimal;
    }[]>;
    static findUnique(params: {
        where: Prisma.TicketWhereUniqueInput;
        include?: Prisma.TicketInclude;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        observacoes: string | null;
        fornecedorId: string;
        pesoBruto: Prisma.Decimal;
        pesoLiquido: Prisma.Decimal;
    } | null>;
    static create(data: any): Promise<{
        fornecedor: {
            id: string;
            nome: string;
            documento: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        observacoes: string | null;
        fornecedorId: string;
        pesoBruto: Prisma.Decimal;
        pesoLiquido: Prisma.Decimal;
    }>;
    static update(params: {
        where: Prisma.TicketWhereUniqueInput;
        data: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        observacoes: string | null;
        fornecedorId: string;
        pesoBruto: Prisma.Decimal;
        pesoLiquido: Prisma.Decimal;
    }>;
    static delete(where: Prisma.TicketWhereUniqueInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        observacoes: string | null;
        fornecedorId: string;
        pesoBruto: Prisma.Decimal;
        pesoLiquido: Prisma.Decimal;
    }>;
    static count(where?: Prisma.TicketWhereInput): Promise<number>;
    static findPendentes(): Promise<({
        fornecedor: {
            id: string;
            nome: string;
            documento: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        observacoes: string | null;
        fornecedorId: string;
        pesoBruto: Prisma.Decimal;
        pesoLiquido: Prisma.Decimal;
    })[]>;
    static updateStatus(id: string, status: "PESADO" | "CONVERTIDO"): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        observacoes: string | null;
        fornecedorId: string;
        pesoBruto: Prisma.Decimal;
        pesoLiquido: Prisma.Decimal;
    }>;
    static aggregate(params: {
        where?: Prisma.TicketWhereInput;
        _sum?: Prisma.TicketSumAggregateInputType;
        _count?: Prisma.TicketCountAggregateInputType;
    }): Promise<Prisma.GetTicketAggregateType<{
        where?: Prisma.TicketWhereInput;
        _sum?: Prisma.TicketSumAggregateInputType;
        _count?: Prisma.TicketCountAggregateInputType;
    }>>;
}
//# sourceMappingURL=ticket.model.d.ts.map