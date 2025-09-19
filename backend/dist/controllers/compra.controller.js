"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompraController = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const compra_service_1 = require("../services/compra.service");
class CompraController {
    static async findAll(req, res) {
        try {
            const resultado = await compra_service_1.CompraService.listarCompras(req.query);
            return res.json(resultado);
        }
        catch (error) {
            console.error("Erro ao listar compras:", error);
            if (error && typeof error.statusCode === "number") {
                return res.status(error.statusCode).json({
                    error: error.message,
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
            const compra = await compra_service_1.CompraService.buscarPorId(id);
            return res.json(compra);
        }
        catch (error) {
            console.error("Erro ao buscar compra:", error);
            if (error instanceof error_middleware_1.CustomError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async converterTicket(req, res) {
        try {
            const compra = await compra_service_1.CompraService.converterTicket(req.body);
            return res.status(201).json(compra);
        }
        catch (error) {
            console.error("Erro ao converter ticket:", error);
            if (error instanceof error_middleware_1.CustomError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const compraAtualizada = await compra_service_1.CompraService.atualizar(id, req.body);
            return res.json(compraAtualizada);
        }
        catch (error) {
            console.error("Erro ao atualizar compra:", error);
            if (error instanceof error_middleware_1.CustomError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const resultado = await compra_service_1.CompraService.deletar(id);
            return res.json(resultado);
        }
        catch (error) {
            console.error("Erro ao deletar compra:", error);
            if (error instanceof error_middleware_1.CustomError) {
                return res.status(error.statusCode).json({
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
            const { periodo } = req.query;
            const estatisticas = await compra_service_1.CompraService.obterEstatisticas(periodo);
            return res.json(estatisticas);
        }
        catch (error) {
            console.error("Erro ao obter estatísticas:", error);
            if (error instanceof error_middleware_1.CustomError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async listarPorFornecedor(req, res) {
        try {
            const { fornecedorId } = req.params;
            const resultado = await compra_service_1.CompraService.listarCompras({
                fornecedorId,
                ...req.query,
            });
            return res.json(resultado);
        }
        catch (error) {
            console.error("Erro ao listar compras por fornecedor:", error);
            if (error instanceof error_middleware_1.CustomError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async calcularStatusPagamento(req, res) {
        try {
            const { id } = req.params;
            const compra = await compra_service_1.CompraService.buscarPorId(id);
            if (!compra) {
                return res.status(404).json({
                    error: "Compra não encontrada",
                });
            }
            const totalPago = compra.pagamentos?.reduce((sum, pag) => sum + pag.valorPago.toNumber(), 0) || 0;
            const valorTotal = Number(compra.valorTotal);
            let statusPagamento = "PENDENTE";
            if (totalPago >= valorTotal) {
                statusPagamento = "PAGO";
            }
            else if (totalPago > 0) {
                statusPagamento = "PARCIAL";
            }
            return res.json({
                compraId: id,
                valorTotal,
                totalPago,
                statusPagamento,
                saldoRestante: valorTotal - totalPago,
            });
        }
        catch (error) {
            console.error("Erro ao calcular status de pagamento:", error);
            if (error instanceof error_middleware_1.CustomError) {
                return res.status(error.statusCode).json({
                    error: error.message,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
}
exports.CompraController = CompraController;
//# sourceMappingURL=compra.controller.js.map