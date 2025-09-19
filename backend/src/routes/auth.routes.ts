import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Rotas públicas
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Rotas protegidas - requerem autenticação
router.get("/profile", authenticateToken, AuthController.getProfile);
router.put("/profile", authenticateToken, AuthController.updateProfile);

// Rotas administrativas - requerem role ADMIN
router.get("/users", authenticateToken, requireAdmin, AuthController.listUsers);
router.get(
  "/users/:id",
  authenticateToken,
  requireAdmin,
  AuthController.getUserById
);
router.put(
  "/users/:id",
  authenticateToken,
  requireAdmin,
  AuthController.updateUser
);
router.put(
  "/users/:id/deactivate",
  authenticateToken,
  requireAdmin,
  AuthController.deactivateUser
);
router.put(
  "/users/:id/activate",
  authenticateToken,
  requireAdmin,
  AuthController.activateUser
);

export default router;
