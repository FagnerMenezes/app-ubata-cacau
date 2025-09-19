"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const relatorio_controller_1 = require("../controllers/relatorio.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permissions_middleware_1 = require("../middleware/permissions.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.use((0, permissions_middleware_1.requireModuleAccess)("relatorios"));
router.get("/compras", relatorio_controller_1.RelatorioController.relatorioCompras);
router.get("/fornecedores", relatorio_controller_1.RelatorioController.relatorioFornecedores);
router.get("/pagamentos", relatorio_controller_1.RelatorioController.relatorioPagamentos);
router.get("/dashboard", relatorio_controller_1.RelatorioController.dashboard);
router.get("/fluxo-caixa", relatorio_controller_1.RelatorioController.fluxoCaixa);
router.get("/resumo-financeiro", relatorio_controller_1.RelatorioController.resumoFinanceiro);
router.get("/unificado-fornecedor", relatorio_controller_1.RelatorioController.relatorioUnificadoFornecedor);
exports.default = router;
//# sourceMappingURL=relatorio.routes.js.map