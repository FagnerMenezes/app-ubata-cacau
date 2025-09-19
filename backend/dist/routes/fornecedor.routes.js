"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fornecedor_controller_1 = require("../controllers/fornecedor.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permissions_middleware_1 = require("../middleware/permissions.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.use((0, permissions_middleware_1.requireModuleAccess)("fornecedores"));
router.get("/", fornecedor_controller_1.FornecedorController.findAll);
router.get("/:id", fornecedor_controller_1.FornecedorController.findById);
router.post("/", fornecedor_controller_1.FornecedorController.create);
router.put("/:id", fornecedor_controller_1.FornecedorController.update);
router.delete("/:id", fornecedor_controller_1.FornecedorController.delete);
exports.default = router;
//# sourceMappingURL=fornecedor.routes.js.map