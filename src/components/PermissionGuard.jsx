import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { canAccess } from "@/config/permissions";
export const PermissionGuard = ({ action, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) return fallback;

  const hasPermission = canAccess(user.role, action);

  if (!hasPermission) return fallback;

  return children;
};
