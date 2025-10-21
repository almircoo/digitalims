import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { canAccess } from "@/config/permissions";
export const PermissionGuard = ({
  action,
  children,
  fallback = null,
  debug = false,
}) => {
  const { user } = useAuth();

  if (!user) {
    if (debug) console.warn("[PermissionGuard] usuario no encontrado ");
    return fallback;
  }

  const hasPermission = canAccess(user.role, action);

  if (debug) {
    console.log(
      `[PermissionGuard] Action: ${action}, Role: ${user.role}, Allowed: ${hasPermission}`,
    );
  }

  if (!hasPermission) {
    if (debug)
      console.warn(
        `[PermissionGuard] Acceso denegado para esta accion: ${action}`,
      );
    return fallback;
  }

  return children;
};
