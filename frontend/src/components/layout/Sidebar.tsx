import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  BarChart3,
  DollarSign,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Ticket,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, role: "ADMIN" },
  { name: "Tickets", href: "/tickets", icon: Ticket, role: "ALL" },
  { name: "Fornecedores", href: "/fornecedores", icon: Users, role: "ADMIN" },
  { name: "Compras", href: "/compras", icon: ShoppingCart, role: "ADMIN" },
  { name: "Estoque", href: "/estoque", icon: Package, role: "ADMIN" },
  { name: "Pagamentos", href: "/pagamentos", icon: DollarSign, role: "ADMIN" },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3, role: "ADMIN" },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    role: "ADMIN",
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [isExpanded] = useState(false);
  const { user } = useAuthStore();

  // Filtrar navegação baseada no role do usuário
  const filteredNavigation = navigation.filter((item) => {
    if (item.role === "ALL") return true;
    return user?.role === item.role;
  });

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-card/98 via-card/95 to-card/90",
        " backdrop-blur-2xl",
        "shadow-2xl shadow-primary/10",
        isExpanded ? "w-16" : "w-16"
      )}
      // onMouseEnter={() => setIsExpanded(true)}
      // onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center  bg-gradient-to-r from-primary/8 via-accent/5 to-primary/8">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          {/* {!isExpanded && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                Ubatan
              </h1>
              <p className="text-xs text-muted-foreground/80 -mt-1 font-medium">
                Cacau
              </p>
            </div>
          )} */}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 px-3 ">
        <ul className="space-y-3 ">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li
                key={item.name}
                className={cn(
                  "border rounded-lg flex items-center",
                  isExpanded ? "justify-start" : "justify-center",
                  isActive && "bg-blue-500 text-white"
                )}
              >
                <Link
                  to={item.href}
                  className={cn(
                    "w-full h-full hover:bg-blue-300 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out"
                  )}
                  title={item.name}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center rounded-xl transition-all duration-300",
                      isExpanded ? "justify-start" : "justify-center",
                      isActive
                        ? "bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground shadow-lg shadow-primary/40"
                        : "group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-accent/20 group-hover:text-primary group-hover:shadow-md group-hover:scale-110"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>

                  {/* {isExpanded && (
                    <span className="ml-3 truncate font-semibold">
                      {item.name}
                    </span>
                  )} */}

                  {/* Tooltip para modo compacto */}
                  {!isExpanded && (
                    <div className="absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-xl bg-gradient-to-br from-popover/98 to-popover/95 px-4 py-2.5 text-sm text-popover-foreground shadow-2xl shadow-primary/20 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 border border-border/30 backdrop-blur-xl">
                      <span className="font-semibold">{item.name}</span>
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-popover/95"></div>
                    </div>
                  )}

                  {/* Indicador de item ativo */}
                  {isActive && (
                    <div className="absolute right-3 h-2.5 w-2.5 rounded-full bg-gradient-to-r  shadow-lg animate-pulse from-primary to-accent"></div>
                  )}

                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer com gradiente sutil */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent shadow-sm"></div>
        {/* {isExpanded && (
          <div className="mt-6 text-center">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground/90">
                Sistema Ubatan Cacau
              </p>
              <p className="text-xs text-muted-foreground/70 font-medium">
                v1.0.0
              </p>
            </div>
            <div className="mt-3 h-1 w-full rounded-full bg-gradient-to-r from-primary/20 via-accent/30 to-primary/20"></div>
          </div>
        )} */}
      </div>
    </div>
  );
}
