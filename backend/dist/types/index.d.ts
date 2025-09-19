import { z } from "zod";
export declare const CreateFornecedorSchema: z.ZodObject<{
    nome: z.ZodString;
    documento: z.ZodString;
    endereco: z.ZodOptional<z.ZodObject<{
        rua: z.ZodString;
        cidade: z.ZodString;
        estado: z.ZodString;
        cep: z.ZodString;
        complemento: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        rua?: string;
        cidade?: string;
        estado?: string;
        cep?: string;
        complemento?: string;
    }, {
        rua?: string;
        cidade?: string;
        estado?: string;
        cep?: string;
        complemento?: string;
    }>>;
    contato: z.ZodOptional<z.ZodObject<{
        email: z.ZodOptional<z.ZodString>;
        telefone: z.ZodOptional<z.ZodString>;
        whatsapp: z.ZodOptional<z.ZodString>;
        telefoneSecundario: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email?: string;
        telefone?: string;
        whatsapp?: string;
        telefoneSecundario?: string;
    }, {
        email?: string;
        telefone?: string;
        whatsapp?: string;
        telefoneSecundario?: string;
    }>>;
    fazenda: z.ZodOptional<z.ZodString>;
    observacoes: z.ZodOptional<z.ZodString>;
    saldo: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    nome?: string;
    documento?: string;
    endereco?: {
        rua?: string;
        cidade?: string;
        estado?: string;
        cep?: string;
        complemento?: string;
    };
    contato?: {
        email?: string;
        telefone?: string;
        whatsapp?: string;
        telefoneSecundario?: string;
    };
    fazenda?: string;
    observacoes?: string;
    saldo?: number;
}, {
    nome?: string;
    documento?: string;
    endereco?: {
        rua?: string;
        cidade?: string;
        estado?: string;
        cep?: string;
        complemento?: string;
    };
    contato?: {
        email?: string;
        telefone?: string;
        whatsapp?: string;
        telefoneSecundario?: string;
    };
    fazenda?: string;
    observacoes?: string;
    saldo?: number;
}>;
export declare const UpdateFornecedorSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    documento: z.ZodOptional<z.ZodString>;
    endereco: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        rua: z.ZodString;
        cidade: z.ZodString;
        estado: z.ZodString;
        cep: z.ZodString;
        complemento: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        rua?: string;
        cidade?: string;
        estado?: string;
        cep?: string;
        complemento?: string;
    }, {
        rua?: string;
        cidade?: string;
        estado?: string;
        cep?: string;
        complemento?: string;
    }>>>;
    contato: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        email: z.ZodOptional<z.ZodString>;
        telefone: z.ZodOptional<z.ZodString>;
        whatsapp: z.ZodOptional<z.ZodString>;
        telefoneSecundario: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email?: string;
        telefone?: string;
        whatsapp?: string;
        telefoneSecundario?: string;
    }, {
        email?: string;
        telefone?: string;
        whatsapp?: string;
        telefoneSecundario?: string;
    }>>>;
    fazenda: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    observacoes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    saldo: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    nome?: string;
    documento?: string;
    endereco?: {
        rua?: string;
        cidade?: string;
        estado?: string;
        cep?: string;
        complemento?: string;
    };
    contato?: {
        email?: string;
        telefone?: string;
        whatsapp?: string;
        telefoneSecundario?: string;
    };
    fazenda?: string;
    observacoes?: string;
    saldo?: number;
}, {
    nome?: string;
    documento?: string;
    endereco?: {
        rua?: string;
        cidade?: string;
        estado?: string;
        cep?: string;
        complemento?: string;
    };
    contato?: {
        email?: string;
        telefone?: string;
        whatsapp?: string;
        telefoneSecundario?: string;
    };
    fazenda?: string;
    observacoes?: string;
    saldo?: number;
}>;
export declare const CreateTicketSchema: z.ZodObject<{
    fornecedorId: z.ZodString;
    pesoBruto: z.ZodNumber;
    pesoLiquido: z.ZodNumber;
    observacoes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    observacoes?: string;
    fornecedorId?: string;
    pesoBruto?: number;
    pesoLiquido?: number;
}, {
    observacoes?: string;
    fornecedorId?: string;
    pesoBruto?: number;
    pesoLiquido?: number;
}>;
export declare const UpdateTicketSchema: z.ZodObject<{
    fornecedorId: z.ZodOptional<z.ZodString>;
    pesoBruto: z.ZodOptional<z.ZodNumber>;
    pesoLiquido: z.ZodOptional<z.ZodNumber>;
    observacoes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    observacoes?: string;
    fornecedorId?: string;
    pesoBruto?: number;
    pesoLiquido?: number;
}, {
    observacoes?: string;
    fornecedorId?: string;
    pesoBruto?: number;
    pesoLiquido?: number;
}>;
export declare const CreateCompraSchema: z.ZodObject<{
    ticketId: z.ZodString;
    precoPorArroba: z.ZodNumber;
    observacoes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    observacoes?: string;
    ticketId?: string;
    precoPorArroba?: number;
}, {
    observacoes?: string;
    ticketId?: string;
    precoPorArroba?: number;
}>;
export declare const CreatePagamentoSchema: z.ZodObject<{
    compraId: z.ZodString;
    valorPago: z.ZodNumber;
    metodoPagamento: z.ZodOptional<z.ZodNullable<z.ZodEnum<["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"]>>>;
    observacoes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    observacoes?: string;
    compraId?: string;
    valorPago?: number;
    metodoPagamento?: "DINHEIRO" | "PIX" | "TRANSFERENCIA" | "CHEQUE";
}, {
    observacoes?: string;
    compraId?: string;
    valorPago?: number;
    metodoPagamento?: "DINHEIRO" | "PIX" | "TRANSFERENCIA" | "CHEQUE";
}>;
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page?: number;
    limit?: number;
}, {
    page?: number;
    limit?: number;
}>;
export declare const FornecedorQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
} & {
    nome: z.ZodOptional<z.ZodString>;
    documento: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nome?: string;
    documento?: string;
    page?: number;
    limit?: number;
}, {
    nome?: string;
    documento?: string;
    page?: number;
    limit?: number;
}>;
export declare const TicketQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
} & {
    fornecedorId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDENTE", "CONVERTIDO"]>>;
    dataInicio: z.ZodOptional<z.ZodString>;
    dataFim: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDENTE" | "CONVERTIDO";
    fornecedorId?: string;
    page?: number;
    limit?: number;
    dataInicio?: string;
    dataFim?: string;
}, {
    status?: "PENDENTE" | "CONVERTIDO";
    fornecedorId?: string;
    page?: number;
    limit?: number;
    dataInicio?: string;
    dataFim?: string;
}>;
export declare const CompraQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
} & {
    fornecedorId: z.ZodOptional<z.ZodString>;
    statusPagamento: z.ZodOptional<z.ZodEnum<["PENDENTE", "PARCIAL", "PAGO"]>>;
    dataInicio: z.ZodOptional<z.ZodString>;
    dataFim: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fornecedorId?: string;
    page?: number;
    limit?: number;
    dataInicio?: string;
    dataFim?: string;
    statusPagamento?: "PENDENTE" | "PARCIAL" | "PAGO";
}, {
    fornecedorId?: string;
    page?: number;
    limit?: number;
    dataInicio?: string;
    dataFim?: string;
    statusPagamento?: "PENDENTE" | "PARCIAL" | "PAGO";
}>;
export declare const RelatorioQuerySchema: z.ZodObject<{
    dataInicio: z.ZodOptional<z.ZodString>;
    dataFim: z.ZodOptional<z.ZodString>;
    fornecedorId: z.ZodOptional<z.ZodString>;
    statusPagamento: z.ZodOptional<z.ZodEnum<["PENDENTE", "PARCIAL", "PAGO"]>>;
    formato: z.ZodDefault<z.ZodEnum<["json", "csv", "pdf"]>>;
}, "strip", z.ZodTypeAny, {
    fornecedorId?: string;
    dataInicio?: string;
    dataFim?: string;
    statusPagamento?: "PENDENTE" | "PARCIAL" | "PAGO";
    formato?: "json" | "csv" | "pdf";
}, {
    fornecedorId?: string;
    dataInicio?: string;
    dataFim?: string;
    statusPagamento?: "PENDENTE" | "PARCIAL" | "PAGO";
    formato?: "json" | "csv" | "pdf";
}>;
export declare const ParamsIdSchema: z.ZodObject<{
    id: z.ZodString;
    precokg: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    precokg?: number;
}, {
    id?: string;
    precokg?: number;
}>;
export type CreateFornecedorInput = z.infer<typeof CreateFornecedorSchema>;
export type UpdateFornecedorInput = z.infer<typeof UpdateFornecedorSchema>;
export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;
export type CreateCompraInput = z.infer<typeof CreateCompraSchema>;
export type CreatePagamentoInput = z.infer<typeof CreatePagamentoSchema>;
export type FornecedorQuery = z.infer<typeof FornecedorQuerySchema>;
export type TicketQuery = z.infer<typeof TicketQuerySchema>;
export type CompraQuery = z.infer<typeof CompraQuerySchema>;
export type RelatorioQuery = z.infer<typeof RelatorioQuerySchema>;
export type ParamsId = z.infer<typeof ParamsIdSchema>;
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface RelatorioCompras {
    periodo: {
        inicio: string;
        fim: string;
    };
    totalCompras: number;
    valorTotal: number;
    pesoTotal: number;
    comprasPorFornecedor: {
        fornecedor: string;
        totalCompras: number;
        valorTotal: number;
        pesoTotal: number;
    }[];
}
export interface ReciboData {
    id: string;
    compra: {
        id: string;
        valorTotal: number;
        precoPorKg: number;
        ticket: {
            pesoLiquido: number;
        };
    };
    fornecedor: {
        nome: string;
        documento: string;
    };
    valorPago: number;
    saldoAnterior: number;
    novoSaldo: number;
    dataEmissao: string;
}
//# sourceMappingURL=index.d.ts.map