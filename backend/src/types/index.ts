import { z } from "zod";

// Schemas de validação com Zod
const EnderecoSchema = z.object({
  rua: z.string().min(1, "Rua é obrigatória"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
  cep: z.string().min(8, "CEP deve ter pelo menos 8 caracteres"),
  complemento: z.string().optional(),
}).optional();

const ContatoSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  telefoneSecundario: z.string().optional(),
}).optional();

export const CreateFornecedorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  documento: z
    .string()
    .min(11, "Documento deve ter pelo menos 11 caracteres")
    .max(18, "Documento muito longo"),
  endereco: EnderecoSchema,
  contato: ContatoSchema,
  fazenda: z.string().optional(),
  observacoes: z.string().optional(),
  saldo: z.number().optional(),
});

export const UpdateFornecedorSchema = CreateFornecedorSchema.partial();

export const CreateTicketSchema = z.object({
  fornecedorId: z.string().uuid("ID do fornecedor inválido"),
  pesoBruto: z.number().positive("Peso bruto deve ser positivo"),
  pesoLiquido: z.number().positive("Peso líquido deve ser positivo"),
  observacoes: z.string().optional(),
});

export const UpdateTicketSchema = CreateTicketSchema.partial();

export const CreateCompraSchema = z.object({
  ticketId: z.string().uuid("ID do ticket inválido"),
  precoPorArroba: z.number().positive("Preço por arroba deve ser positivo"),
  observacoes: z.string().optional(),
});

export const CreatePagamentoSchema = z.object({
  compraId: z.string().uuid("ID da compra inválido"),
  valorPago: z.number().positive("Valor pago deve ser positivo"),
  metodoPagamento: z.enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"]).nullable().optional(),
  observacoes: z.string().nullable().optional(),
});

// Schemas para queries
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const FornecedorQuerySchema = PaginationSchema.extend({
  nome: z.string().optional(),
  documento: z.string().optional(),
});

export const TicketQuerySchema = PaginationSchema.extend({
  fornecedorId: z.string().uuid().optional(),
  status: z.enum(["PENDENTE", "CONVERTIDO"]).optional(),
  dataInicio: z.string().datetime().optional(),
  dataFim: z.string().datetime().optional(),
});

export const CompraQuerySchema = PaginationSchema.extend({
  fornecedorId: z.string().uuid().optional(),
  statusPagamento: z.enum(["PENDENTE", "PARCIAL", "PAGO"]).optional(),
  dataInicio: z.string().datetime().optional(),
  dataFim: z.string().datetime().optional(),
});

export const RelatorioQuerySchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  fornecedorId: z.string().uuid().optional(),
  statusPagamento: z.enum(["PENDENTE", "PARCIAL", "PAGO"]).optional(),
  formato: z.enum(["json", "csv", "pdf"]).default("json"),
});

export const ParamsIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
  precokg: z.number().positive("Preço por kg deve ser positivo").optional(),
});

// Tipos inferidos
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

// Interfaces para responses
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

// Tipos para relatórios
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
