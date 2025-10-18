import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const RoleGuard = ({
  children,
  requiredRole = "ADMIN",
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user) {
    return (
      fallback || (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Usuario no autenticado</AlertDescription>
        </Alert>
      )
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      fallback || (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta funcionalidad. Se requiere
            rol de {requiredRole}
          </AlertDescription>
        </Alert>
      )
    );
  }

  return children;
};
