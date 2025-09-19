"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticket_controller_1 = require("../controllers/ticket.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permissions_middleware_1 = require("../middleware/permissions.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.use((0, permissions_middleware_1.requireModuleAccess)("tickets"));
router.get("/", ticket_controller_1.TicketController.findAll);
router.get("/available", ticket_controller_1.TicketController.findAvailable);
router.get("/:id", ticket_controller_1.TicketController.findById);
router.post("/", ticket_controller_1.TicketController.create);
router.put("/:id", ticket_controller_1.TicketController.update);
router.delete("/:id", ticket_controller_1.TicketController.delete);
exports.default = router;
//# sourceMappingURL=ticket.routes.js.map