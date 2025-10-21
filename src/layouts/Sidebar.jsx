import React from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  LogOut,
  BarChart3,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PERMISSIONS } from "@/config/permissions";

export const Sidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    signOut();
    toast.success("Sesión cerrada");
    navigate("/login");
  };

  console.log(" Sidebar - User role:", user?.role, "User object:", user);

  const baseNavigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: PERMISSIONS.PAGES.DASHBOARD,
    },
  ];

  const adminNavigation = [
    {
      name: "Productos",
      href: "/products",
      icon: Package,
      roles: PERMISSIONS.PAGES.PRODUCTS,
    },
    {
      name: "Categorías",
      href: "/categories",
      icon: FolderTree,
      roles: PERMISSIONS.PAGES.CATEGORIES,
    },
    {
      name: "Clientes",
      href: "/customers",
      icon: Users,
      roles: PERMISSIONS.PAGES.CUSTOMERS,
    },
    {
      name: "Pedidos",
      href: "/orders",
      icon: ShoppingCart,
      roles: PERMISSIONS.PAGES.ORDERS,
    },
    {
      name: "Reportes",
      href: "/reports",
      icon: BarChart3,
      roles: ["ADMIN"],
    },
  ];

  const navigation = [
    ...baseNavigation,
    ...adminNavigation.filter((item) => {
      const rolesArray = Array.isArray(item.roles) ? item.roles : [item.roles];
      const hasAccess = rolesArray.includes(user?.role);
      console.log(
        ` Checking access for ${item.name}: role=${user?.role}, required=${rolesArray.join(",")}, hasAccess=${hasAccess}`,
      );
      return hasAccess;
    }),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Card className="flex h-full flex-col justify-between rounded-xl border p-4">
      <div>
        <div className="mb-6">
          <p className="font-bold capitalize">{user?.nombre || "Usuario"}</p>
          <hr className="my-2" />
          <p className="text-primary font-semibold">
            {user?.role === "ADMIN"
              ? "Administrador"
              : user?.role === "USER"
                ? "Usuario"
                : "Sin rol"}
          </p>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <Button
        variant="ghost"
        className="mt-auto justify-start text-muted-foreground hover:text-foreground"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </Button>
    </Card>
  );
};
