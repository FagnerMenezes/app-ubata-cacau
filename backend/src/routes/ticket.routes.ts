import { Router } from "express";
import { TicketController } from "../controllers/ticket.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireModuleAccess } from "../middleware/permissions.middleware";

const router = Router();

// Aplicar autenticação e permissões em todas as rotas
router.use(authenticateToken);
router.use(requireModuleAccess("tickets"));

// GET /api/tickets - Listar tickets
router.get("/", TicketController.findAll);

// GET /api/tickets/available - Listar tickets disponíveis para compra
router.get("/available", TicketController.findAvailable);

// GET /api/tickets/:id - Buscar ticket por ID
router.get("/:id", TicketController.findById);

// POST /api/tickets - Criar ticket
router.post("/", TicketController.create);

// PUT /api/tickets/:id - Atualizar ticket
router.put("/:id", TicketController.update);

// DELETE /api/tickets/:id - Deletar ticket
router.delete("/:id", TicketController.delete);

export default router;
