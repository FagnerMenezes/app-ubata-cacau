"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagamentoController = void 0;
const zod_1 = require("zod");
const pagamento_service_1 = require("../services/pagamento.service");
const createPagamentoSchema = zod_1.z.object({
    compraId: zod_1.z.string().min(1, "ID da compra é obrigatório"),
    valor: zod_1.z.number().positive("Valor deve ser positivo"),
    metodoPagamento: zod_1.z.enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"], {
        errorMap: () => ({ message: "Método de pagamento inválido" }),
    }),
    observacoes: zod_1.z.string().optional(),
});
const paginationSchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).optional(),
    limit: zod_1.z.string().transform(Number).optional(),
    compraId: zod_1.z.string().optional(),
    fornecedorId: zod_1.z.string().optional(),
    metodoPagamento: zod_1.z
        .enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"])
        .optional(),
    dataInicio: zod_1.z.string().optional(),
    dataFim: zod_1.z.string().optional(),
});
class PagamentoController {
    static async findAll(req, res) {
        try {
            const params = paginationSchema.parse(req.query);
            const resultado = await pagamento_service_1.PagamentoService.listarPagamentos(params);
            return res.json(resultado);
        }
        catch (error) {
            console.error("Erro ao listar pagamentos:", error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: error.errors,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async findById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    error: "ID do pagamento é obrigatório",
                });
            }
            const pagamento = await pagamento_service_1.PagamentoService.buscarPagamentoPorId(id);
            return res.json(pagamento);
        }
        catch (error) {
            console.error("Erro ao buscar pagamento:", error);
            if (error instanceof Error &&
                error.message === "Pagamento não encontrado") {
                return res.status(404).json({
                    error: error.message,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async create(req, res) {
        try {
            const dadosValidados = createPagamentoSchema.parse(req.body);
            const dadosParaService = {
                compraId: dadosValidados.compraId,
                valorPago: dadosValidados.valor,
            };
            if (dadosValidados.metodoPagamento) {
                dadosParaService.metodoPagamento = dadosValidados.metodoPagamento;
            }
            if (dadosValidados.observacoes) {
                dadosParaService.observacoes = dadosValidados.observacoes;
            }
            const pagamento = await pagamento_service_1.PagamentoService.criarPagamento(dadosParaService);
            return res.status(201).json(pagamento);
        }
        catch (error) {
            console.error("Erro ao criar pagamento:", error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: error.errors,
                });
            }
            if (error instanceof Error) {
                if (error.message === "Compra não encontrada") {
                    return res.status(404).json({
                        error: error.message,
                    });
                }
                if (error.message.includes("valor") ||
                    error.message.includes("excede")) {
                    return res.status(400).json({
                        error: error.message,
                    });
                }
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    error: "ID do pagamento é obrigatório",
                });
            }
            const updateSchema = zod_1.z.object({
                valor: zod_1.z.number().positive("Valor deve ser positivo").optional(),
                metodoPagamento: zod_1.z
                    .enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"])
                    .optional(),
                observacoes: zod_1.z.string().optional(),
            });
            const dadosValidados = updateSchema.parse(req.body);
            if (Object.keys(dadosValidados).length === 0) {
                return res.status(400).json({
                    error: "Nenhum dado fornecido para atualização",
                });
            }
            const pagamentoExistente = await pagamento_service_1.PagamentoService.buscarPagamentoPorId(id);
            if (!pagamentoExistente) {
                return res.status(404).json({
                    error: "Pagamento não encontrado",
                });
            }
            const dadosParaAtualizacao = {};
            if (dadosValidados.valor !== undefined) {
                dadosParaAtualizacao.valorPago = dadosValidados.valor;
            }
            if (dadosValidados.metodoPagamento !== undefined) {
                dadosParaAtualizacao.metodoPagamento = dadosValidados.metodoPagamento;
            }
            if (dadosValidados.observacoes !== undefined) {
                dadosParaAtualizacao.observacoes = dadosValidados.observacoes;
            }
            const pagamentoAtualizado = {
                ...pagamentoExistente,
                ...dadosParaAtualizacao,
                updatedAt: new Date(),
            };
            return res.json(pagamentoAtualizado);
        }
        catch (error) {
            console.error("Erro ao atualizar pagamento:", error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: error.errors,
                });
            }
            if (error instanceof Error) {
                if (error.message === "Pagamento não encontrado") {
                    return res.status(404).json({
                        error: error.message,
                    });
                }
                if (error.message.includes("valor") ||
                    error.message.includes("excede")) {
                    return res.status(400).json({
                        error: error.message,
                    });
                }
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    error: "ID do pagamento é obrigatório",
                });
            }
            await pagamento_service_1.PagamentoService.deletarPagamento(id);
            return res.status(204).send();
        }
        catch (error) {
            console.error("Erro ao deletar pagamento:", error);
            if (error instanceof Error &&
                error.message === "Pagamento não encontrado") {
                return res.status(404).json({
                    error: error.message,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async gerarRecibo(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    error: "ID do pagamento é obrigatório",
                });
            }
            const recibo = await pagamento_service_1.PagamentoService.gerarReciboPagamento(id);
            return res.json(recibo);
        }
        catch (error) {
            console.error("Erro ao gerar recibo:", error);
            if (error instanceof Error &&
                error.message === "Pagamento não encontrado") {
                return res.status(404).json({
                    error: error.message,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async obterEstatisticas(req, res) {
        try {
            const { fornecedorId, dataInicio, dataFim } = zod_1.z
                .object({
                fornecedorId: zod_1.z.string().optional(),
                dataInicio: zod_1.z.string().optional(),
                dataFim: zod_1.z.string().optional(),
            })
                .parse(req.query);
            const filtros = {};
            if (fornecedorId)
                filtros.fornecedorId = fornecedorId;
            if (dataInicio)
                filtros.dataInicio = dataInicio;
            if (dataFim)
                filtros.dataFim = dataFim;
            const estatisticas = await pagamento_service_1.PagamentoService.obterEstatisticas(filtros);
            return res.json(estatisticas);
        }
        catch (error) {
            console.error("Erro ao obter estatísticas:", error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: error.errors,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async listarPorCompra(req, res) {
        try {
            const { compraId } = req.params;
            if (!compraId) {
                return res.status(400).json({
                    error: "ID da compra é obrigatório",
                });
            }
            const { page, limit } = zod_1.z
                .object({
                page: zod_1.z.string().transform(Number).optional(),
                limit: zod_1.z.string().transform(Number).optional(),
            })
                .parse(req.query);
            const resultado = await pagamento_service_1.PagamentoService.listarPagamentosPorCompra(compraId);
            return res.json(resultado);
        }
        catch (error) {
            console.error("Erro ao listar pagamentos por compra:", error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: error.errors,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async validarPagamento(req, res) {
        try {
            const { compraId, valor } = zod_1.z
                .object({
                compraId: zod_1.z.string().min(1, "ID da compra é obrigatório"),
                valor: zod_1.z.number().positive("Valor deve ser positivo"),
            })
                .parse(req.body);
            const resultado = await pagamento_service_1.PagamentoService.validarPagamento(compraId, valor);
            return res.json({
                valido: true,
                ...resultado,
            });
        }
        catch (error) {
            console.error("Erro ao validar pagamento:", error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: error.errors,
                });
            }
            if (error instanceof Error) {
                if (error.message === "Compra não encontrada") {
                    return res.status(404).json({
                        error: error.message,
                    });
                }
                return res.status(400).json({
                    valido: false,
                    error: error.message,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
}
exports.PagamentoController = PagamentoController;
//# sourceMappingURL=pagamento.controller.js.map