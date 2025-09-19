"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParamsIdSchema = exports.RelatorioQuerySchema = exports.CompraQuerySchema = exports.TicketQuerySchema = exports.FornecedorQuerySchema = exports.PaginationSchema = exports.CreatePagamentoSchema = exports.CreateCompraSchema = exports.UpdateTicketSchema = exports.CreateTicketSchema = exports.UpdateFornecedorSchema = exports.CreateFornecedorSchema = void 0;
const zod_1 = require("zod");
const EnderecoSchema = zod_1.z.object({
    rua: zod_1.z.string().min(1, "Rua é obrigatória"),
    cidade: zod_1.z.string().min(1, "Cidade é obrigatória"),
    estado: zod_1.z.string().length(2, "Estado deve ter 2 caracteres"),
    cep: zod_1.z.string().min(8, "CEP deve ter pelo menos 8 caracteres"),
    complemento: zod_1.z.string().optional(),
}).optional();
const ContatoSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email inválido").optional(),
    telefone: zod_1.z.string().optional(),
    whatsapp: zod_1.z.string().optional(),
    telefoneSecundario: zod_1.z.string().optional(),
}).optional();
exports.CreateFornecedorSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
    documento: zod_1.z
        .string()
        .min(11, "Documento deve ter pelo menos 11 caracteres")
        .max(18, "Documento muito longo"),
    endereco: EnderecoSchema,
    contato: ContatoSchema,
    fazenda: zod_1.z.string().optional(),
    observacoes: zod_1.z.string().optional(),
    saldo: zod_1.z.number().optional(),
});
exports.UpdateFornecedorSchema = exports.CreateFornecedorSchema.partial();
exports.CreateTicketSchema = zod_1.z.object({
    fornecedorId: zod_1.z.string().uuid("ID do fornecedor inválido"),
    pesoBruto: zod_1.z.number().positive("Peso bruto deve ser positivo"),
    pesoLiquido: zod_1.z.number().positive("Peso líquido deve ser positivo"),
    observacoes: zod_1.z.string().optional(),
});
exports.UpdateTicketSchema = exports.CreateTicketSchema.partial();
exports.CreateCompraSchema = zod_1.z.object({
    ticketId: zod_1.z.string().uuid("ID do ticket inválido"),
    precoPorArroba: zod_1.z.number().positive("Preço por arroba deve ser positivo"),
    observacoes: zod_1.z.string().optional(),
});
exports.CreatePagamentoSchema = zod_1.z.object({
    compraId: zod_1.z.string().uuid("ID da compra inválido"),
    valorPago: zod_1.z.number().positive("Valor pago deve ser positivo"),
    metodoPagamento: zod_1.z.enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"]).nullable().optional(),
    observacoes: zod_1.z.string().nullable().optional(),
});
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
});
exports.FornecedorQuerySchema = exports.PaginationSchema.extend({
    nome: zod_1.z.string().optional(),
    documento: zod_1.z.string().optional(),
});
exports.TicketQuerySchema = exports.PaginationSchema.extend({
    fornecedorId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(["PENDENTE", "CONVERTIDO"]).optional(),
    dataInicio: zod_1.z.string().datetime().optional(),
    dataFim: zod_1.z.string().datetime().optional(),
});
exports.CompraQuerySchema = exports.PaginationSchema.extend({
    fornecedorId: zod_1.z.string().uuid().optional(),
    statusPagamento: zod_1.z.enum(["PENDENTE", "PARCIAL", "PAGO"]).optional(),
    dataInicio: zod_1.z.string().datetime().optional(),
    dataFim: zod_1.z.string().datetime().optional(),
});
exports.RelatorioQuerySchema = zod_1.z.object({
    dataInicio: zod_1.z.string().optional(),
    dataFim: zod_1.z.string().optional(),
    fornecedorId: zod_1.z.string().uuid().optional(),
    statusPagamento: zod_1.z.enum(["PENDENTE", "PARCIAL", "PAGO"]).optional(),
    formato: zod_1.z.enum(["json", "csv", "pdf"]).default("json"),
});
exports.ParamsIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("ID inválido"),
    precokg: zod_1.z.number().positive("Preço por kg deve ser positivo").optional(),
});
//# sourceMappingURL=index.js.map