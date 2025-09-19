"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.AuthController.register);
router.post("/login", auth_controller_1.AuthController.login);
router.get("/profile", auth_middleware_1.authenticateToken, auth_controller_1.AuthController.getProfile);
router.put("/profile", auth_middleware_1.authenticateToken, auth_controller_1.AuthController.updateProfile);
router.get("/users", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, auth_controller_1.AuthController.listUsers);
router.get("/users/:id", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, auth_controller_1.AuthController.getUserById);
router.put("/users/:id", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, auth_controller_1.AuthController.updateUser);
router.put("/users/:id/deactivate", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, auth_controller_1.AuthController.deactivateUser);
router.put("/users/:id/activate", auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, auth_controller_1.AuthController.activateUser);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map