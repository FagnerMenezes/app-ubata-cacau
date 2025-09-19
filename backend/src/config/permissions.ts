// Sistema simples de permissões baseado em módulos
export const MODULE_ACCESS = {
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

export function canAccessModule(userRole: string, module: string): boolean {
  const allowedModules = MODULE_ACCESS[userRole as keyof typeof MODULE_ACCESS];
  return allowedModules ? allowedModules.includes(module) : false;
}
