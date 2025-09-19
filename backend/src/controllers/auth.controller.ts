import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import { CreateUserData, LoginData } from "../types/auth";

// Schemas de validação
const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const updateUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validatedData = createUserSchema.parse(req.body);

      const user = await AuthService.createUser(
        validatedData as CreateUserData
      );

      return res.status(201).json({
        message: "Usuário criado com sucesso",
        user,
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      if (
        error instanceof Error &&
        error.message === "Usuário já existe com este email"
      ) {
        return res.status(409).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);

      const authResponse = await AuthService.login(validatedData as LoginData);

      return res.json({
        message: "Login realizado com sucesso",
        ...authResponse,
      });
    } catch (error) {
      console.error("Erro no login:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      if (
        error instanceof Error &&
        (error.message === "Credenciais inválidas" ||
          error.message === "Usuário inativo")
      ) {
        return res.status(401).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      // O usuário já está disponível através do middleware de autenticação
      const user = (req as any).user;

      return res.json({
        user,
      });
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const validatedData = updateUserSchema.parse(req.body);

      // Filtrar apenas propriedades definidas
      const updateData: Partial<CreateUserData> = {};
      if (validatedData.name !== undefined)
        updateData.name = validatedData.name;
      if (validatedData.email !== undefined)
        updateData.email = validatedData.email;
      if (validatedData.password !== undefined)
        updateData.password = validatedData.password;
      if (validatedData.role !== undefined)
        updateData.role = validatedData.role;

      const user = await AuthService.updateUser(userId, updateData);

      return res.json({
        message: "Perfil atualizado com sucesso",
        user,
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);

      if (error instanceof z.ZodError) {
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

  static async listUsers(req: Request, res: Response) {
    try {
      const users = await AuthService.listUsers();

      return res.json({
        users,
      });
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "ID do usuário é obrigatório",
        });
      }

      const user = await AuthService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado",
        });
      }

      return res.json({
        user,
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateUserSchema.parse(req.body);

      if (!id) {
        return res.status(400).json({
          error: "ID do usuário é obrigatório",
        });
      }

      // Filtrar apenas propriedades definidas
      const updateData: Partial<CreateUserData> = {};
      if (validatedData.name !== undefined)
        updateData.name = validatedData.name;
      if (validatedData.email !== undefined)
        updateData.email = validatedData.email;
      if (validatedData.password !== undefined)
        updateData.password = validatedData.password;
      if (validatedData.role !== undefined)
        updateData.role = validatedData.role;

      const user = await AuthService.updateUser(id, updateData);

      return res.json({
        message: "Usuário atualizado com sucesso",
        user,
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);

      if (error instanceof z.ZodError) {
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

  static async deactivateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "ID do usuário é obrigatório",
        });
      }

      await AuthService.deactivateUser(id);

      return res.json({
        message: "Usuário desativado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao desativar usuário:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  static async activateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "ID do usuário é obrigatório",
        });
      }

      await AuthService.activateUser(id);

      return res.json({
        message: "Usuário ativado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao ativar usuário:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }
}
