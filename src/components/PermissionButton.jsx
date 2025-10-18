import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export const PermissionButton = ({
  children,
  requiredRole = "ADMIN",
  onClick,
  disabled = false,
  ...props
}) => {
  const { user } = useAuth();

  const hasPermission = user && user.role === requiredRole;
  const isDisabled = disabled || !hasPermission;

  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      title={!hasPermission ? `Se requiere rol de ${requiredRole}` : ""}
      {...props}
    >
      {children}
    </Button>
  );
};
