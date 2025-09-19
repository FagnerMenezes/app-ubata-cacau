import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { Bell, LogOut, Moon, Search, Settings, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  sidebarExpanded: boolean;
}

export default function Header({ sidebarExpanded }: HeaderProps) {
  const { setTheme, theme } = useTheme();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className={`fixed top-0 z-40 h-16 transition-all duration-300 ease-in-out ${
        sidebarExpanded ? "left-64" : "left-16"
      } right-0 bg-white from-background/98 via-card/95 to-background/98 backdrop-blur-2xl shadow-lg shadow-primary/5`}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Search Section */}
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            <input
              type="text"
              placeholder="Buscar no sistema..."
              className="h-10 w-80 rounded-xl border border-border/40 bg-gradient-to-r from-card/80 to-card/60 pl-10 pr-4 text-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300 hover:border-border/60 hover:shadow-md"
            />
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative h-10 w-10 rounded-xl hover:bg-gradient-to-br hover:from-accent/30 hover:to-accent/20 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 group"
          >
            <Bell className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg animate-pulse">
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-red-500 animate-ping opacity-75"></span>
              <span className="relative flex h-full w-full items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
              </span>
            </span>
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-xl hover:bg-gradient-to-br hover:from-accent/30 hover:to-accent/20 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 group"
          >
            <Settings className="h-4 w-4 group-hover:rotate-90 group-hover:scale-110 transition-all duration-300" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-10 w-10 rounded-xl hover:bg-gradient-to-br hover:from-primary/20 hover:to-accent/20 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 group-hover:scale-110" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 group-hover:scale-110" />
            <span className="sr-only">Alternar tema</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-xl hover:bg-gradient-to-br hover:from-primary/20 hover:to-accent/20 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
              >
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-lg flex items-center justify-center group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:scale-105 transition-all duration-300">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-2xl border border-border/30 shadow-2xl shadow-primary/10 rounded-2xl"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">
                        {user?.name || "Usuário"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {user?.email || "email@exemplo.com"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.role === "ADMIN" ? "Administrador" : "Usuário"}
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-border/50 to-transparent mx-2" />
              <div className="p-2 space-y-1">
                <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/10 transition-all duration-200 rounded-lg cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/10 transition-all duration-200 rounded-lg cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/10 transition-all duration-200 rounded-lg cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  Suporte
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-border/50 to-transparent mx-2" />
              <div className="p-2">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="hover:bg-gradient-to-r hover:from-destructive/20 hover:to-destructive/10 hover:text-destructive transition-all duration-200 rounded-lg cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
