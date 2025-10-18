import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export const AccessDenied = ({ requiredRole = "ADMIN" }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acceso Denegado</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">
            No tienes permisos para acceder a esta sección. Se requiere rol de{" "}
            <strong>{requiredRole}</strong>.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            Volver al Dashboard
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};
