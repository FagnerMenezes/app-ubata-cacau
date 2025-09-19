"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUser = exports.requireAdmin = exports.requireRole = exports.authenticateToken = void 0;
const auth_service_1 = require("../services/auth.service");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Token de acesso necessário" });
        }
        const decoded = auth_service_1.AuthService.verifyToken(token);
        const user = await auth_service_1.AuthService.getUserById(decoded.userId);
        if (!user || !user.isActive) {
            return res
                .status(401)
                .json({ error: "Usuário não encontrado ou inativo" });
        }
        req.user = user;
        return next();
    }
    catch (error) {
        console.error("Erro na autenticação:", error);
        return res.status(401).json({ error: "Token inválido" });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)(["ADMIN"]);
exports.requireUser = (0, exports.requireRole)(["USER", "ADMIN"]);
//# sourceMappingURL=auth.middleware.js.map