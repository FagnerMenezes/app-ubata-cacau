import { Router } from "express";
import { RelatorioController } from "../controllers/relatorio.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireModuleAccess } from "../middleware/permissions.middleware";

const router = Router();

// Aplicar autenticação e permissões em todas as rotas
router.use(authenticateToken);
router.use(requireModuleAccess("relatorios"));

// GET /api/relatorios/compras - Relatório de compras
router.get("/compras", RelatorioController.relatorioCompras);

// GET /api/relatorios/fornecedores - Relatório de fornecedores
router.get("/fornecedores", RelatorioController.relatorioFornecedores);

// GET /api/relatorios/pagamentos - Relatório de pagamentos
router.get("/pagamentos", RelatorioController.relatorioPagamentos);

// GET /api/relatorios/dashboard - Dashboard
router.get("/dashboard", RelatorioController.dashboard);

// GET /api/relatorios/fluxo-caixa - Fluxo de caixa
router.get("/fluxo-caixa", RelatorioController.fluxoCaixa);

// GET /api/relatorios/resumo-financeiro - Resumo financeiro
router.get("/resumo-financeiro", RelatorioController.resumoFinanceiro);

// GET /api/relatorios/unificado-fornecedor - Relatório unificado do fornecedor
router.get(
  "/unificado-fornecedor",
  RelatorioController.relatorioUnificadoFornecedor
);

export default router;
