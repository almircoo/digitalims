import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  LogOut,
  LogIn,
  UserPlus,
  Store,
  Search,
  User,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Navbar = () => {
  const navigate = useNavigate();
  const { token, user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success("Cierre de sesión exitoso");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Main Navbar Container: Logo, Search, and Buttons/Menu */}
      <div className="container flex items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold whitespace-nowrap">
          Digital IMS
        </Link>

        {/* Search Bar - Visible on all screen sizes, taking up available space */}
        <div className="flex-1 max-w-lg hidden sm:block">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search productos..."
              className="w-full rounded-full pl-10 pr-4 h-10"
            />
          </div>
        </div>

        {/* Desktop Buttons (Hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            onClick={() => navigate("/dashboard")}
          >
            <Store className="h-5 w-5" />
          </Button>

          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-full bg-transparent"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.email || "Usuario"}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-semibold">{user?.nombre}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rol: {user?.role === "ADMIN" ? "Administrador" : "Usuario"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-full bg-transparent"
                onClick={() => navigate("/login")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
              <Button
                className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                onClick={() => navigate("/register")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Registrarse
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle (Hidden on desktop) */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden ml-auto"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Search Bar - Only show on extra-small mobile (optional, but addresses the mobile search) */}
      <div className="w-full px-4 pb-3 sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search productos..."
            className="w-full rounded-full pl-10 pr-4 h-10"
          />
        </div>
      </div>

      {/* Mobile Menu Content (Drawer) */}
      {isMenuOpen && (
        <div className="absolute top-[59px] left-0 w-full bg-background border-b shadow-md lg:hidden">
          <div className="container flex flex-col gap-4 py-4 px-4">
            {/* The Places/Store Button is now in the mobile menu */}
            <Button
              variant="outline"
              className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => {
                navigate("/dashboard");
                setIsMenuOpen(false);
              }}
            >
              <Store className="mr-2 h-5 w-5" />
              Dashboard
            </Button>

            {token ? (
              <div className="flex flex-col gap-2">
                <div className="px-3 py-2 text-sm border rounded-lg">
                  <p className="font-semibold">{user?.nombre}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-full bg-transparent"
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMenuOpen(false);
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-full bg-transparent"
                  onClick={() => {
                    navigate("/settings");
                    setIsMenuOpen(false);
                  }}
                >
                  Configuración
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-full bg-transparent"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-full bg-transparent"
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  className="w-full justify-start rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={() => {
                    navigate("/register");
                    setIsMenuOpen(false);
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
