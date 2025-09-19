"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODULE_ACCESS = void 0;
exports.canAccessModule = canAccessModule;
exports.MODULE_ACCESS = {
    ADMIN: [
        "fornecedores",
        "tickets",
        "compras",
        "pagamentos",
        "relatorios",
        "usuarios",
        "dashboard",
    ],
    USER: ["tickets", "fornecedores"],
};
function canAccessModule(userRole, module) {
    const allowedModules = exports.MODULE_ACCESS[userRole];
    return allowedModules ? allowedModules.includes(module) : false;
}
//# sourceMappingURL=permissions.js.map