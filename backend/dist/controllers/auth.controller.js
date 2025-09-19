"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email inválido"),
    password: zod_1.z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    name: zod_1.z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    role: zod_1.z.enum(["ADMIN", "USER"]).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email inválido"),
    password: zod_1.z.string().min(1, "Senha é obrigatória"),
});
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
    email: zod_1.z.string().email("Email inválido").optional(),
    password: zod_1.z
        .string()
        .min(6, "Senha deve ter pelo menos 6 caracteres")
        .optional(),
    role: zod_1.z.enum(["ADMIN", "USER"]).optional(),
});
class AuthController {
    static async register(req, res) {
        try {
            const validatedData = createUserSchema.parse(req.body);
            const user = await auth_service_1.AuthService.createUser(validatedData);
            return res.status(201).json({
                message: "Usuário criado com sucesso",
                user,
            });
        }
        catch (error) {
            console.error("Erro ao criar usuário:", error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: error.errors,
                });
            }
            if (error instanceof Error &&
                error.message === "Usuário já existe com este email") {
                return res.status(409).json({
                    error: error.message,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async login(req, res) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const authResponse = await auth_service_1.AuthService.login(validatedData);
            return res.json({
                message: "Login realizado com sucesso",
                ...authResponse,
            });
        }
        catch (error) {
            console.error("Erro no login:", error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: error.errors,
                });
            }
            if (error instanceof Error &&
                (error.message === "Credenciais inválidas" ||
                    error.message === "Usuário inativo")) {
                return res.status(401).json({
                    error: error.message,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async getProfile(req, res) {
        try {
            const user = req.user;
            return res.json({
                user,
            });
        }
        catch (error) {
            console.error("Erro ao buscar perfil:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const validatedData = updateUserSchema.parse(req.body);
            const updateData = {};
            if (validatedData.name !== undefined)
                updateData.name = validatedData.name;
            if (validatedData.email !== undefined)
                updateData.email = validatedData.email;
            if (validatedData.password !== undefined)
                updateData.password = validatedData.password;
            if (validatedData.role !== undefined)
                updateData.role = validatedData.role;
            const user = await auth_service_1.AuthService.updateUser(userId, updateData);
            return res.json({
                message: "Perfil atualizado com sucesso",
                user,
            });
        }
        catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: error.errors,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async listUsers(req, res) {
        try {
            const users = await auth_service_1.AuthService.listUsers();
            return res.json({
                users,
            });
        }
        catch (error) {
            console.error("Erro ao listar usuários:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    error: "ID do usuário é obrigatório",
                });
            }
            const user = await auth_service_1.AuthService.getUserById(id);
            if (!user) {
                return res.status(404).json({
                    error: "Usuário não encontrado",
                });
            }
            return res.json({
                user,
            });
        }
        catch (error) {
            console.error("Erro ao buscar usuário:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const validatedData = updateUserSchema.parse(req.body);
            if (!id) {
                return res.status(400).json({
                    error: "ID do usuário é obrigatório",
                });
            }
            const updateData = {};
            if (validatedData.name !== undefined)
                updateData.name = validatedData.name;
            if (validatedData.email !== undefined)
                updateData.email = validatedData.email;
            if (validatedData.password !== undefined)
                updateData.password = validatedData.password;
            if (validatedData.role !== undefined)
                updateData.role = validatedData.role;
            const user = await auth_service_1.AuthService.updateUser(id, updateData);
            return res.json({
                message: "Usuário atualizado com sucesso",
                user,
            });
        }
        catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: error.errors,
                });
            }
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async deactivateUser(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    error: "ID do usuário é obrigatório",
                });
            }
            await auth_service_1.AuthService.deactivateUser(id);
            return res.json({
                message: "Usuário desativado com sucesso",
            });
        }
        catch (error) {
            console.error("Erro ao desativar usuário:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
    static async activateUser(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    error: "ID do usuário é obrigatório",
                });
            }
            await auth_service_1.AuthService.activateUser(id);
            return res.json({
                message: "Usuário ativado com sucesso",
            });
        }
        catch (error) {
            console.error("Erro ao ativar usuário:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map