import { Router } from "express";
import { TicketController } from "../controllers/ticket.controller";

const router = Router();

// GET /api/tickets - Listar tickets
router.get("/", TicketController.findAll);

// GET /api/tickets/available - Listar tickets disponíveis para compra
router.get("/available", TicketController.findAvailable);

// GET /api/tickets/pendentes - Listar tickets pendentes
//router.get('/pendentes', TicketController.);

// GET /api/tickets/estatisticas - Obter estatísticas
//router.get('/estatisticas', TicketController.obterEstatisticas);

// POST /api/tickets/validar-pesos - Validar pesos
//router.post('/validar-pesos', TicketController.);

// GET /api/tickets/:id - Buscar ticket por ID
router.get("/:id", TicketController.findById);

// POST /api/tickets - Criar ticket
router.post("/", TicketController.create);

// PUT /api/tickets/:id - Atualizar ticket
router.put("/:id", TicketController.update);

// DELETE /api/tickets/:id - Deletar ticket
router.delete("/:id", TicketController.delete);

export default router;
