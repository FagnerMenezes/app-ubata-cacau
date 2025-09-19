"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModuleAccess = void 0;
const permissions_1 = require("../config/permissions");
const requireModuleAccess = (module) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }
        if (!(0, permissions_1.canAccessModule)(req.user.role, module)) {
            return res.status(403).json({ error: "Acesso negado a este módulo" });
        }
        return next();
    };
};
exports.requireModuleAccess = requireModuleAccess;
//# sourceMappingURL=permissions.middleware.js.map