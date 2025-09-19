import { NextFunction, Response } from "express";
import { canAccessModule } from "../config/permissions";
import { AuthRequest } from "../types/auth";

export const requireModuleAccess = (module: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    if (!canAccessModule(req.user.role, module)) {
      return res.status(403).json({ error: "Acesso negado a este módulo" });
    }

    return next();
  };
};
