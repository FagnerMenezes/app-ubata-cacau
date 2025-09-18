import { Router } from "express";
import { z } from "zod";
import { PagamentoController } from "../controllers/pagamento.controller";
import { validateRequest } from "../middleware/validation.middleware";

const router = Router();
// ✅ Remover esta linha - não precisamos de instância para métodos estáticos
// const pagamentoController = new PagamentoController();

// Schemas de validação
const createPagamentoSchema = z.object({
  body: z.object({
    compraId: z.string().uuid(),
    valor: z.number().positive(),
    dataPagamento: z.string().datetime().optional(),
    metodoPagamento: z.enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"]).optional(),
    observacoes: z.string().optional(),
  }),
});

const updatePagamentoSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    valor: z.number().positive().optional(),
    dataPagamento: z.string().datetime().optional(),
    metodoPagamento: z
      .enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"])
      .optional(),
    observacoes: z.string().optional(),
  }),
});

const getPagamentoSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const listPagamentosSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    compraId: z.string().uuid().optional(),
    metodoPagamento: z
      .enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"])
      .optional(),
    dataInicio: z.string().datetime().optional(),
    dataFim: z.string().datetime().optional(),
  }),
});

// ✅ Rotas corrigidas - usando métodos estáticos diretamente
router.get(
  "/",
  validateRequest(listPagamentosSchema),
  PagamentoController.findAll
);
router.get(
  "/:id",
  validateRequest(getPagamentoSchema),
  PagamentoController.findById
);
router.post(
  "/",
  validateRequest(createPagamentoSchema),
  PagamentoController.create
);
router.put(
  "/:id",
  validateRequest(updatePagamentoSchema),
  PagamentoController.update
);
router.delete(
  "/:id",
  validateRequest(getPagamentoSchema),
  PagamentoController.delete
);

// ✅ Rotas adicionais disponíveis no controller
router.get(
  "/:id/recibo",
  validateRequest(getPagamentoSchema),
  PagamentoController.gerarRecibo
);

router.get("/estatisticas", PagamentoController.obterEstatisticas);

router.get("/compra/:compraId", PagamentoController.listarPorCompra);

router.post("/validar", PagamentoController.validarPagamento);

export default router;
