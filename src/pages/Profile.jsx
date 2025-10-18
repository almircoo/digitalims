import React from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Shield, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    toast.success("Sesión cerrada");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="space-y-3">
        {/* User Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm capitalize">{user.nombre}</p>
            <p className="text-xs text-muted-foreground">
              {user.role === "ADMIN" ? "Administrador" : "Usuario"}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground truncate">{user.email}</span>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              user.role === "ADMIN"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {user.role}
          </span>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 bg-transparent"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </Card>
  );
};
