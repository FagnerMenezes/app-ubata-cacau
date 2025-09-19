"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const pagamento_controller_1 = require("../controllers/pagamento.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permissions_middleware_1 = require("../middleware/permissions.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.use((0, permissions_middleware_1.requireModuleAccess)("pagamentos"));
const createPagamentoSchema = zod_1.z.object({
    body: zod_1.z.object({
        compraId: zod_1.z.string().uuid(),
        valor: zod_1.z.number().positive(),
        dataPagamento: zod_1.z.string().datetime().optional(),
        metodoPagamento: zod_1.z
            .enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"])
            .optional(),
        observacoes: zod_1.z.string().optional(),
    }),
});
const updatePagamentoSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        valor: zod_1.z.number().positive().optional(),
        dataPagamento: zod_1.z.string().datetime().optional(),
        metodoPagamento: zod_1.z
            .enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"])
            .optional(),
        observacoes: zod_1.z.string().optional(),
    }),
});
const getPagamentoSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
});
const listPagamentosSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().transform(Number).optional(),
        limit: zod_1.z.string().transform(Number).optional(),
        compraId: zod_1.z.string().uuid().optional(),
        metodoPagamento: zod_1.z
            .enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"])
            .optional(),
        dataInicio: zod_1.z.string().datetime().optional(),
        dataFim: zod_1.z.string().datetime().optional(),
    }),
});
router.get("/", (0, validation_middleware_1.validateRequest)(listPagamentosSchema), pagamento_controller_1.PagamentoController.findAll);
router.get("/:id", (0, validation_middleware_1.validateRequest)(getPagamentoSchema), pagamento_controller_1.PagamentoController.findById);
router.post("/", (0, validation_middleware_1.validateRequest)(createPagamentoSchema), pagamento_controller_1.PagamentoController.create);
router.put("/:id", (0, validation_middleware_1.validateRequest)(updatePagamentoSchema), pagamento_controller_1.PagamentoController.update);
router.delete("/:id", (0, validation_middleware_1.validateRequest)(getPagamentoSchema), pagamento_controller_1.PagamentoController.delete);
router.get("/:id/recibo", (0, validation_middleware_1.validateRequest)(getPagamentoSchema), pagamento_controller_1.PagamentoController.gerarRecibo);
router.get("/estatisticas", pagamento_controller_1.PagamentoController.obterEstatisticas);
router.get("/compra/:compraId", pagamento_controller_1.PagamentoController.listarPorCompra);
router.post("/validar", pagamento_controller_1.PagamentoController.validarPagamento);
exports.default = router;
//# sourceMappingURL=pagamento.routes.js.map