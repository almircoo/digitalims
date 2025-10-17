import React from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Success logout");
    navigate("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Productos", href: "/products", icon: Package },
    { name: "Categorías", href: "/categories", icon: FolderTree },
    { name: "Clientes", href: "/customers", icon: Users },
    { name: "Pedidos", href: "/orders", icon: ShoppingCart },
  ];

  // const isActive = (path) => location.pathname === path;
  return (
    <Card className="flex h-full flex-col justify-between rounded-xl border p-4">
      <div>
        <div className="mb-6">
          <p className="font-bold capitalize">{user?.nombre}</p>
          <hr className="my-2" />
          <p className="text-primary font-semibold">
            {user?.role === "USER" ? "Usuario" : "ADMIN"}
          </p>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                location.pathname === item.href
                  ? "bg-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      <Button
        variant="ghost"
        className="mt-auto justify-start text-muted-foreground"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </Button>
    </Card>
  );
};
