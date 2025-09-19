import { Router } from "express";
import { CompraController } from "../controllers/compra.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireModuleAccess } from "../middleware/permissions.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation.middleware";
import {
  CompraQuerySchema,
  CreateCompraSchema,
  ParamsIdSchema,
} from "../types";

const router = Router();

// Aplicar autenticação e permissões em todas as rotas
router.use(authenticateToken);
router.use(requireModuleAccess("compras"));

// Rotas específicas (devem vir antes das rotas com parâmetros)
router.get("/estatisticas", CompraController.obterEstatisticas);
router.get(
  "/fornecedor/:fornecedorId",
  validateParams(ParamsIdSchema),
  CompraController.listarPorFornecedor
);
router.post(
  "/:id/calcular-status",
  validateParams(ParamsIdSchema),
  CompraController.calcularStatusPagamento
);

// Rotas principais
router.get("/", validateQuery(CompraQuerySchema), CompraController.findAll);
router.get("/:id", validateParams(ParamsIdSchema), CompraController.findById);
router.post(
  "/converter-ticket",
  validateBody(CreateCompraSchema),
  CompraController.converterTicket
);
router.put("/:id", validateParams(ParamsIdSchema), CompraController.update);
router.delete("/:id", validateParams(ParamsIdSchema), CompraController.delete);

export default router;
