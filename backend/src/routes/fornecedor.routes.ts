import { Router } from "express";
import { FornecedorController } from "../controllers/fornecedor.controller";

const router = Router();

// GET /api/fornecedores - Listar fornecedores
router.get("/", FornecedorController.findAll);

// GET /api/fornecedores/estatisticas - Obter estatísticas
//router.get('/estatisticas', FornecedorController.);

// GET /api/fornecedores/:id - Buscar fornecedor por ID
router.get("/:id", FornecedorController.findById);

// POST /api/fornecedores - Criar fornecedor
router.post("/", FornecedorController.create);

// PUT /api/fornecedores/:id - Atualizar fornecedor
router.put("/:id", FornecedorController.update);

// PATCH /api/fornecedores/:id/saldo - Atualizar saldo do fornecedor
//router.patch("/:id/saldo", FornecedorController.);

// DELETE /api/fornecedores/:id - Deletar fornecedor
router.delete("/:id", FornecedorController.delete);

export default router;
