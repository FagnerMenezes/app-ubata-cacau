import { NextFunction, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../types/auth";

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Token de acesso necessário" });
    }

    // Verificar e decodificar o token
    const decoded = AuthService.verifyToken(token);

    // Buscar usuário no banco para garantir que ainda existe e está ativo
    const user = await AuthService.getUserById(decoded.userId);

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ error: "Usuário não encontrado ou inativo" });
    }

    // Adicionar usuário ao request
    req.user = user;

    return next();
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return res.status(401).json({ error: "Token inválido" });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Acesso negado. Permissão insuficiente." });
    }

    return next();
  };
};

export const requireAdmin = requireRole(["ADMIN"]);
export const requireUser = requireRole(["USER", "ADMIN"]);
