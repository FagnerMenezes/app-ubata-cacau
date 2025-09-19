import { Prisma } from "@prisma/client";
export declare class FornecedorModel {
    static findMany(params: {
        skip?: number;
        take?: number;
        where?: Prisma.FornecedorWhereInput;
        orderBy?: Prisma.FornecedorOrderByWithRelationInput;
        include?: Prisma.FornecedorInclude;
    }): Promise<{
        nome: string;
        documento: string;
        endereco: Prisma.JsonValue | null;
        contato: Prisma.JsonValue | null;
        fazenda: string | null;
        observacoes: string | null;
        saldo: Prisma.Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    static findUnique(params: {
        where: Prisma.FornecedorWhereUniqueInput;
        include?: Prisma.FornecedorInclude;
    }): Promise<{
        nome: string;
        documento: string;
        endereco: Prisma.JsonValue | null;
        contato: Prisma.JsonValue | null;
        fazenda: string | null;
        observacoes: string | null;
        saldo: Prisma.Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    static create(data: Prisma.FornecedorCreateInput): Promise<{
        nome: string;
        documento: string;
        endereco: Prisma.JsonValue | null;
        contato: Prisma.JsonValue | null;
        fazenda: string | null;
        observacoes: string | null;
        saldo: Prisma.Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static update(params: {
        where: Prisma.FornecedorWhereUniqueInput;
        data: Prisma.FornecedorUpdateInput;
    }): Promise<{
        nome: string;
        documento: string;
        endereco: Prisma.JsonValue | null;
        contato: Prisma.JsonValue | null;
        fazenda: string | null;
        observacoes: string | null;
        saldo: Prisma.Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static delete(where: Prisma.FornecedorWhereUniqueInput): Promise<{
        nome: string;
        documento: string;
        endereco: Prisma.JsonValue | null;
        contato: Prisma.JsonValue | null;
        fazenda: string | null;
        observacoes: string | null;
        saldo: Prisma.Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static count(where?: Prisma.FornecedorWhereInput): Promise<number>;
    static findByDocumento(documento: string): Promise<{
        nome: string;
        documento: string;
        endereco: Prisma.JsonValue | null;
        contato: Prisma.JsonValue | null;
        fazenda: string | null;
        observacoes: string | null;
        saldo: Prisma.Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    static updateSaldo(id: string, novoSaldo: number): Promise<{
        nome: string;
        documento: string;
        endereco: Prisma.JsonValue | null;
        contato: Prisma.JsonValue | null;
        fazenda: string | null;
        observacoes: string | null;
        saldo: Prisma.Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static aggregate(params: {
        where?: Prisma.FornecedorWhereInput;
        _sum?: Prisma.FornecedorSumAggregateInputType;
        _count?: Prisma.FornecedorCountAggregateInputType;
    }): Promise<Prisma.GetFornecedorAggregateType<{
        where?: Prisma.FornecedorWhereInput;
        _sum?: Prisma.FornecedorSumAggregateInputType;
        _count?: Prisma.FornecedorCountAggregateInputType;
    }>>;
}
//# sourceMappingURL=fornecedor.model.d.ts.map