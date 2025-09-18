import { Router } from "express";
import { RelatorioController } from "../controllers/relatorio.controller";

const router = Router();

// GET /api/relatorios/compras - Relatório de compras
router.get("/compras", RelatorioController.relatorioCompras);

// GET /api/relatorios/fornecedores - Relatório de fornecedores
router.get("/fornecedores", RelatorioController.relatorioFornecedores);

// GET /api/relatorios/dashboard - Dashboard
router.get("/dashboard", RelatorioController.dashboard);

// GET /api/relatorios/fluxo-caixa - Fluxo de caixa
router.get("/fluxo-caixa", RelatorioController.fluxoCaixa);

// GET /api/relatorios/resumo-financeiro - Resumo financeiro
router.get("/resumo-financeiro", RelatorioController.resumoFinanceiro);

export default router;
