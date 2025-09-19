import { Request, Response } from "express";
import { z } from "zod";
import { RelatorioService } from "../services/relatorio.service";

// Schemas de validação simplificados
const baseFilterSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

const relatorioComprasSchema = baseFilterSchema.extend({
  fornecedorId: z.string().optional(),
  statusPagamento: z.enum(["PENDENTE", "PARCIAL", "PAGO"]).optional(),
  formato: z.enum(["json", "csv", "pdf"]).default("json"),
});

const relatorioFornecedoresSchema = baseFilterSchema.extend({
  incluirInativos: z.boolean().default(false),
  formato: z.enum(["json", "csv", "pdf"]).default("json"),
});

const relatorioPagamentosSchema = baseFilterSchema.extend({
  fornecedorId: z.string().optional(),
  statusPagamento: z.enum(["PENDENTE", "PARCIAL", "PAGO"]).optional(),
  formato: z.enum(["json", "csv", "pdf"]).default("json"),
});

const dashboardSchema = baseFilterSchema.extend({
  periodo: z.enum(["7d", "30d", "90d", "1y"]).optional(),
});

const fluxoCaixaSchema = baseFilterSchema.extend({
  agrupamento: z.enum(["dia", "semana", "mes"]).default("dia"),
  formato: z.enum(["json", "csv"]).default("json"),
});

const relatorioUnificadoFornecedorSchema = baseFilterSchema.extend({
  fornecedorId: z.string().min(1, "ID do fornecedor é obrigatório"),
  formato: z.enum(["json", "pdf"]).default("json"),
});

export class RelatorioController {
  // Método auxiliar para tratamento de erros
  private static handleError(error: unknown, res: Response) {
    console.error("Erro no controller de relatórios:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: "Erro interno do servidor",
    });
  }

  // Método auxiliar para headers de download
  private static setDownloadHeaders(
    res: Response,
    formato: string,
    filename: string
  ) {
    if (formato === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${filename}.csv`
      );
    } else if (formato === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${filename}.pdf`
      );
    }
  }

  static async relatorioCompras(req: Request, res: Response) {
    try {
      const params = relatorioComprasSchema.parse(req.query);

      const relatorio = await RelatorioService.relatorioCompras(params);

      if (params.formato !== "json") {
        RelatorioController.setDownloadHeaders(
          res,
          params.formato,
          "relatorio-compras"
        );
        return res.send(relatorio.compras);
      }

      return res.json(relatorio);
    } catch (error) {
      return RelatorioController.handleError(error, res);
    }
  }

  static async relatorioFornecedores(req: Request, res: Response) {
    try {
      const params = relatorioFornecedoresSchema.parse(req.query);

      const relatorio = await RelatorioService.relatorioFornecedores(params);

      if (params.formato !== "json") {
        RelatorioController.setDownloadHeaders(
          res,
          params.formato,
          "relatorio-fornecedores"
        );
        return res.send(relatorio.fornecedores);
      }

      return res.json(relatorio);
    } catch (error) {
      return RelatorioController.handleError(error, res);
    }
  }

  static async relatorioPagamentos(req: Request, res: Response) {
    try {
      const params = relatorioPagamentosSchema.parse(req.query);

      const relatorio = await RelatorioService.relatorioPagamentos(params);

      if (params.formato !== "json") {
        RelatorioController.setDownloadHeaders(
          res,
          params.formato,
          "relatorio-pagamentos"
        );
        return res.send(relatorio.pagamentos);
      }

      return res.json(relatorio);
    } catch (error) {
      return RelatorioController.handleError(error, res);
    }
  }

  static async dashboard(req: Request, res: Response) {
    try {
      const params = dashboardSchema.parse(req.query);

      const dashboard = await RelatorioService.dashboard(params);
      return res.json(dashboard);
    } catch (error) {
      return RelatorioController.handleError(error, res);
    }
  }

  static async fluxoCaixa(req: Request, res: Response) {
    try {
      const params = fluxoCaixaSchema.parse(req.query);
      const fluxoCaixa = await RelatorioService.relatorioFluxoCaixa(params);

      if (params.formato === "csv") {
        RelatorioController.setDownloadHeaders(
          res,
          params.formato,
          "fluxo-caixa"
        );
        return res.send(fluxoCaixa.movimentacoes);
      }

      return res.json(fluxoCaixa);
    } catch (error) {
      return RelatorioController.handleError(error, res);
    }
  }

  static async resumoFinanceiro(req: Request, res: Response) {
    try {
      // ✅ CORREÇÃO: Usar baseFilterSchema com fornecedorId opcional
      const params = baseFilterSchema
        .extend({
          fornecedorId: z.string().optional(),
        })
        .parse(req.query);

      // Buscar dados de forma paralela
      const [compras, fornecedores, dashboard] = await Promise.all([
        RelatorioService.relatorioCompras(params),

        RelatorioService.relatorioFornecedores(params),

        RelatorioService.dashboard(params),
      ]);

      // Estrutura simplificada do resumo - CORRIGIDA
      const resumo = {
        periodo: {
          dataInicio: params.dataInicio || "Início dos registros",
          dataFim: params.dataFim || "Hoje",
        },
        metricas: {
          // Métricas de compras - usando campos corretos
          totalCompras: compras.resumo.totalCompras,
          valorTotalCompras: compras.resumo.valorTotal, // ✅ Campo correto
          precoMedioKg: compras.resumo.precoMedio, // ✅ Campo correto

          // Métricas de fornecedores
          totalFornecedores: fornecedores.fornecedores.length,

          // Métricas do dashboard
          totalTickets: dashboard.metricas.totalTickets,
          totalPagamentos: dashboard.metricas.totalPagamentos,
          valorTotalPago: dashboard.metricas.valorTotalPago, // ✅ Vem do dashboard
          saldoTotal: dashboard.metricas.valorTotalPago, // ✅ Vem do dashboard
          percentualPago: dashboard.metricas.totalCompras, // ✅ Vem do dashboard
        },
        distribuicoes: dashboard.distribuicoes,
        rankings: dashboard.metricas,
      };

      return res.json(resumo);
    } catch (error) {
      return RelatorioController.handleError(error, res);
    }
  }

  static async relatorioUnificadoFornecedor(req: Request, res: Response) {
    try {
      const params = relatorioUnificadoFornecedorSchema.parse(req.query);
      const relatorio = await RelatorioService.relatorioUnificadoFornecedor(params);

      if (params.formato === "pdf") {
        RelatorioController.setDownloadHeaders(
          res,
          "pdf",
          "relatorio-unificado-fornecedor"
        );
        return res.send(relatorio);
      }

      return res.json(relatorio);
    } catch (error) {
      return RelatorioController.handleError(error, res);
    }
  }
}
