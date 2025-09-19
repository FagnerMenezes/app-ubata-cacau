import { Router } from "express";
import { FornecedorController } from "../controllers/fornecedor.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireModuleAccess } from "../middleware/permissions.middleware";

const router = Router();

// Aplicar autenticação e permissões em todas as rotas
router.use(authenticateToken);
router.use(requireModuleAccess("fornecedores"));

// GET /api/fornecedores - Listar fornecedores
router.get("/", FornecedorController.findAll);

// GET /api/fornecedores/:id - Buscar fornecedor por ID
router.get("/:id", FornecedorController.findById);

// POST /api/fornecedores - Criar fornecedor
router.post("/", FornecedorController.create);

// PUT /api/fornecedores/:id - Atualizar fornecedor
router.put("/:id", FornecedorController.update);

// DELETE /api/fornecedores/:id - Deletar fornecedor
router.delete("/:id", FornecedorController.delete);

export default router;
