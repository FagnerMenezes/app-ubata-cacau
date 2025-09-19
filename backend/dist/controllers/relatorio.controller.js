"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatorioController = void 0;
const zod_1 = require("zod");
const relatorio_service_1 = require("../services/relatorio.service");
const baseFilterSchema = zod_1.z.object({
    dataInicio: zod_1.z.string().optional(),
    dataFim: zod_1.z.string().optional(),
});
const relatorioComprasSchema = baseFilterSchema.extend({
    fornecedorId: zod_1.z.string().optional(),
    statusPagamento: zod_1.z.enum(["PENDENTE", "PARCIAL", "PAGO"]).optional(),
    formato: zod_1.z.enum(["json", "csv", "pdf"]).default("json"),
});
const relatorioFornecedoresSchema = baseFilterSchema.extend({
    incluirInativos: zod_1.z.boolean().default(false),
    formato: zod_1.z.enum(["json", "csv", "pdf"]).default("json"),
});
const relatorioPagamentosSchema = baseFilterSchema.extend({
    fornecedorId: zod_1.z.string().optional(),
    statusPagamento: zod_1.z.enum(["PENDENTE", "PARCIAL", "PAGO"]).optional(),
    formato: zod_1.z.enum(["json", "csv", "pdf"]).default("json"),
});
const dashboardSchema = baseFilterSchema.extend({
    periodo: zod_1.z.enum(["7d", "30d", "90d", "1y"]).optional(),
});
const fluxoCaixaSchema = baseFilterSchema.extend({
    agrupamento: zod_1.z.enum(["dia", "semana", "mes"]).default("dia"),
    formato: zod_1.z.enum(["json", "csv"]).default("json"),
});
const relatorioUnificadoFornecedorSchema = baseFilterSchema.extend({
    fornecedorId: zod_1.z.string().min(1, "ID do fornecedor é obrigatório"),
    formato: zod_1.z.enum(["json", "pdf"]).default("json"),
});
class RelatorioController {
    static handleError(error, res) {
        console.error("Erro no controller de relatórios:", error);
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
    static setDownloadHeaders(res, formato, filename) {
        if (formato === "csv") {
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename=${filename}.csv`);
        }
        else if (formato === "pdf") {
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=${filename}.pdf`);
        }
    }
    static async relatorioCompras(req, res) {
        try {
            const params = relatorioComprasSchema.parse(req.query);
            const relatorio = await relatorio_service_1.RelatorioService.relatorioCompras(params);
            if (params.formato !== "json") {
                RelatorioController.setDownloadHeaders(res, params.formato, "relatorio-compras");
                return res.send(relatorio.compras);
            }
            return res.json(relatorio);
        }
        catch (error) {
            return RelatorioController.handleError(error, res);
        }
    }
    static async relatorioFornecedores(req, res) {
        try {
            const params = relatorioFornecedoresSchema.parse(req.query);
            const relatorio = await relatorio_service_1.RelatorioService.relatorioFornecedores(params);
            if (params.formato !== "json") {
                RelatorioController.setDownloadHeaders(res, params.formato, "relatorio-fornecedores");
                return res.send(relatorio.fornecedores);
            }
            return res.json(relatorio);
        }
        catch (error) {
            return RelatorioController.handleError(error, res);
        }
    }
    static async relatorioPagamentos(req, res) {
        try {
            const params = relatorioPagamentosSchema.parse(req.query);
            const relatorio = await relatorio_service_1.RelatorioService.relatorioPagamentos(params);
            if (params.formato !== "json") {
                RelatorioController.setDownloadHeaders(res, params.formato, "relatorio-pagamentos");
                return res.send(relatorio.pagamentos);
            }
            return res.json(relatorio);
        }
        catch (error) {
            return RelatorioController.handleError(error, res);
        }
    }
    static async dashboard(req, res) {
        try {
            const params = dashboardSchema.parse(req.query);
            const dashboard = await relatorio_service_1.RelatorioService.dashboard(params);
            return res.json(dashboard);
        }
        catch (error) {
            return RelatorioController.handleError(error, res);
        }
    }
    static async fluxoCaixa(req, res) {
        try {
            const params = fluxoCaixaSchema.parse(req.query);
            const fluxoCaixa = await relatorio_service_1.RelatorioService.relatorioFluxoCaixa(params);
            if (params.formato === "csv") {
                RelatorioController.setDownloadHeaders(res, params.formato, "fluxo-caixa");
                return res.send(fluxoCaixa.movimentacoes);
            }
            return res.json(fluxoCaixa);
        }
        catch (error) {
            return RelatorioController.handleError(error, res);
        }
    }
    static async resumoFinanceiro(req, res) {
        try {
            const params = baseFilterSchema
                .extend({
                fornecedorId: zod_1.z.string().optional(),
            })
                .parse(req.query);
            const [compras, fornecedores, dashboard] = await Promise.all([
                relatorio_service_1.RelatorioService.relatorioCompras(params),
                relatorio_service_1.RelatorioService.relatorioFornecedores(params),
                relatorio_service_1.RelatorioService.dashboard(params),
            ]);
            const resumo = {
                periodo: {
                    dataInicio: params.dataInicio || "Início dos registros",
                    dataFim: params.dataFim || "Hoje",
                },
                metricas: {
                    totalCompras: compras.resumo.totalCompras,
                    valorTotalCompras: compras.resumo.valorTotal,
                    precoMedioKg: compras.resumo.precoMedio,
                    totalFornecedores: fornecedores.fornecedores.length,
                    totalTickets: dashboard.metricas.totalTickets,
                    totalPagamentos: dashboard.metricas.totalPagamentos,
                    valorTotalPago: dashboard.metricas.valorTotalPago,
                    saldoTotal: dashboard.metricas.valorTotalPago,
                    percentualPago: dashboard.metricas.totalCompras,
                },
                distribuicoes: dashboard.distribuicoes,
                rankings: dashboard.metricas,
            };
            return res.json(resumo);
        }
        catch (error) {
            return RelatorioController.handleError(error, res);
        }
    }
    static async relatorioUnificadoFornecedor(req, res) {
        try {
            const params = relatorioUnificadoFornecedorSchema.parse(req.query);
            const relatorio = await relatorio_service_1.RelatorioService.relatorioUnificadoFornecedor(params);
            if (params.formato === "pdf") {
                RelatorioController.setDownloadHeaders(res, "pdf", "relatorio-unificado-fornecedor");
                return res.send(relatorio);
            }
            return res.json(relatorio);
        }
        catch (error) {
            return RelatorioController.handleError(error, res);
        }
    }
}
exports.RelatorioController = RelatorioController;
//# sourceMappingURL=relatorio.controller.js.map